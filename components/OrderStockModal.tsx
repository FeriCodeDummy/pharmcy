"use client";

import { useMemo, useState, FormEvent } from "react";
import { DrugEntity } from "@/types/entities";

export default function OrderStockModal({drug, onClose, onSaved,}: {
    drug: DrugEntity;
    onClose: () => void;
    onSaved: (updated: DrugEntity) => void;
}) {
    const [packs, setPacks] = useState<number>(1);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string>("");

    const addUnits = useMemo(() => {
        const p = Number.isFinite(packs) ? packs : 0;
        return Math.max(0, p) ;
    }, [packs]);

    async function submit(e: FormEvent) {
        e.preventDefault();
        setErr("");
        setLoading(true);

        try {
            // OPTION A (recommended): backend endpoint that increments stock atomically
            const res = await fetch(`/api/drugs/${drug.idDrug}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ stock: packs}), // or { amount: addUnits }
            });

            if (!res.ok) {
                const txt = await res.text().catch(() => "");
                throw new Error(txt || `Request failed (${res.status})`);
            }

            const updated = (await res.json()) as DrugEntity;
            onSaved(updated);
            onClose();
        } catch (e: any) {
            setErr(e?.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Order stock</h3>
                        <p className="text-sm text-neutral-400">
                            {drug.name} • pack size {drug.package_size}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-neutral-800 px-2 py-1 text-sm text-neutral-200 hover:bg-neutral-900"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-neutral-400">How many packs to add?</label>
                        <input
                            type="number"
                            min={1}
                            step={1}
                            value={packs}
                            onChange={(e) => setPacks(parseInt(e.target.value || "0", 10))}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-white outline-none focus:border-neutral-700"
                        />
                        <div className="mt-2 text-sm text-neutral-400">
                            This will add <span className="text-white">{addUnits}</span> units to stock.
                        </div>
                    </div>

                    {err && <div className="rounded-xl border border-red-900 bg-red-900/20 p-3 text-sm text-red-200">{err}</div>}

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-neutral-800 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Add stock"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
