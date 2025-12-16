"use client";
import { useState } from "react";
import { DrugEntity } from "@/types/entities";


export default function DrugForm({ value, onClose, onSaved }: { value: DrugEntity; onClose: ()=>void; onSaved: (d: DrugEntity)=>void; }) {
    const [form, setForm] = useState<DrugEntity>(value);
    const isEdit = Boolean(form.idDrug);


    function set<K extends keyof DrugEntity>(k: K, v: DrugEntity[K]) { setForm((prev:DrugEntity) => ({ ...prev, [k]: v })); }


    async function save() {
        const res = await fetch(isEdit?`/api/drugs/${form.idDrug}`:"/api/drugs", {
            method: isEdit?"PATCH":"POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
        });
        if (res.ok) {
            const d = await res.json();
            onSaved(d);
        }
    }


    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950" onClick={e=>e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-neutral-800 p-4">
                    <h3 className="text-lg font-semibold">{isEdit?"Edit Drug":"Add Drug"}</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white">✕</button>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                    <Field label="Name"><input value={form.name} onChange={e=>set("name", e.target.value)} /></Field>
                    <Field label="Manufacturer"><input value={form.manufacturer} onChange={e=>set("manufacturer", e.target.value)} /></Field>
                    <Field label="API"><input value={form.api} onChange={e=>set("api", e.target.value)} /></Field>
                    <Field label="ICD‑10 (mkb_10)"><input value={form.mkb_10} onChange={e=>set("mkb_10", e.target.value)} /></Field>
                    <Field label="Package size"><input type="number" value={form.package_size} onChange={e=>set("package_size", Number(e.target.value))} /></Field>
                    <Field label="API per unit"><input type="number" value={form.api_per_pill} onChange={e=>set("api_per_pill", Number(e.target.value))} /></Field>
                    <Field label="Unit">
                        <select value={form.unit} onChange={e=>set("unit", e.target.value as any)}>
                            {(["g","mg","μg","ml"] as const).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </Field>
                    <Field label="Stock"><input type="number" value={form.stock} onChange={e=>set("stock", Number(e.target.value))} /></Field>
                    <Field label="Price (€)"><input type="number" step="0.01" value={form.price} onChange={e=>set("price", Number(e.target.value))} /></Field>
                    <Field label="Prescription only" full>
                        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={form.prescription_only} onChange={e=>set("prescription_only", e.target.checked)} /><span>Requires prescription</span></label>
                    </Field>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-neutral-800 p-4">
                    <button onClick={onClose} className="rounded-lg border border-neutral-700 px-3 py-2 text-sm">Cancel</button>
                    <button onClick={save} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500">Save</button>
                </div>
            </div>
        </div>
    );
}


function Field({ label, children, full=false }: { label: string; children: React.ReactNode; full?: boolean }) {
    return (
        <label className={`grid gap-1 ${full?"sm:col-span-2":""}`}>
            <span className="text-xs text-neutral-400">{label}</span>
            <div className="[&>input,select]:w-full [&>input,select]:rounded-lg [&>input,select]:border [&>input,select]:border-neutral-800 [&>input,select]:bg-neutral-900 [&>input,select]:px-3 [&>input,select]:py-2 [&>input,select]:text-sm [&>input,select]:outline-none [&>input:focus,select:focus]:border-neutral-700">
                {children}
            </div>
        </label>
    );
}