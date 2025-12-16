"use client";
import {DrugEntity} from "@/types/entities";
import {useEffect, useMemo, useState} from "react";
import {currency} from "@/lib/utils";
import DrugForm from "@/components/DrugForm";
import {useSearchParams} from "next/navigation";
import OrderStockModal from "@/components/OrderStockModal";

export default function DrugsTable({ initialRows }: { initialRows: DrugEntity[] }) {
    const [rows, setRows] = useState<DrugEntity[]>(initialRows);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<DrugEntity | null>(null);
    const [ordering, setOrdering] = useState<DrugEntity | null>(null);


    const [rxOnly, setRxOnly] = useState<null | boolean>(null); // null=all, true=Rx, false=OTC
    const manufacturers = useMemo(
        () => Array.from(new Set(rows.map(r => r.manufacturer))).sort(),
        [rows]
    );
    const [mf, setMf] = useState<string>("");
    const [sort, setSort] = useState<{key: keyof DrugEntity, dir: 'asc'|'desc'}>({ key: 'name', dir: 'asc' });

    useEffect(() => {
        setRows(initialRows.map(r => ({ ...r, prescription_only: !!(r as any).prescription_only })));
    }, [initialRows]);


    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        let list = rows.filter(r =>
            [r.name, r.manufacturer, r.api].some(v => v?.toLowerCase().includes(q))
        );
        if (rxOnly !== null) list = list.filter(r => r.prescription_only === rxOnly);

        if (mf) list = list.filter(r => r.manufacturer === mf);

        const dir = sort.dir === 'asc' ? 1 : -1;
        list.sort((a:any,b:any) => (a[sort.key] > b[sort.key] ? 1 : -1) * dir);
        return list;
    }, [rows, query, rxOnly, mf, sort]);


    async function remove(id: number) {
        const keep = rows;
        setRows(rows.filter(r => r.idDrug !== id));
        const res = await fetch(`/api/drugs/${id}`, { method: "DELETE" });
        if (!res.ok) setRows(keep); // rollback
    }


    function onSaved(drug: DrugEntity) {
        setEditing(null);
        setRows(prev => {
            const i = prev.findIndex(p => p.idDrug === drug.idDrug);
            if (i >= 0) { const copy = [...prev]; copy[i] = drug; return copy; }
            return [drug, ...prev];
        });
    }

    function SortTh({ label, k }:{label:string;k:keyof DrugEntity}) {
        const { key, dir } = sort;
        const active = key === k;
        return (
            <th
                onClick={()=> setSort(s => ({ key: k, dir: active && s.dir==='asc'?'desc':'asc' }))}
                className={`cursor-pointer px-3 py-2 text-left ${active?'text-white':'text-neutral-400'}`}
                title="Click to sort"
            >
                {label}{active ? (dir==='asc'?' ▲':' ▼') : ''}
            </th>
        );
    }

    const [dispenseFor, setDispenseFor] = useState<number | undefined>(undefined);
    const [presetDrug, setPresetDrug] = useState<DrugEntity | null>(null);


    const sp = useSearchParams();
    useEffect(()=> {
        const id = sp.get('dispenseFor');
        if (id) setDispenseFor(Number(id));
    }, [sp]);



    return (
        <div className="space-y-3 px-4">
            <div className="flex items-center gap-2">
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name / manufacturer / API" className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-700"/>
                <a href="/api/drugs/export" className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">Export CSV</a>

                <select value={mf} onChange={e=>setMf(e.target.value)}
                        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm">
                    <option value="">All manufacturers</option>
                    {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                    value={rxOnly===null? 'all' : rxOnly ? 'rx' : 'otc'}
                    onChange={e=>setRxOnly(e.target.value==='all'?null:(e.target.value==='rx'))}
                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm"
                >
                    <option value="all">All</option>
                    <option value="rx">Rx only</option>
                    <option value="otc">OTC only</option>
                </select>
                <button onClick={()=>setEditing({
                    name:"", manufacturer:"", api:"", mkb_10:"", prescription_only:false, price:0, package_size:0, api_per_pill:0, stock:0, unit:"mg"
                } as any)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500">Add</button>
            </div>


            <div className="overflow-x-auto rounded-2xl border border-neutral-800">
                <table className="w-full text-sm">
                    <thead className="bg-neutral-900 text-neutral-400">
                    <tr>
                        <SortTh label="Name" k="name" />
                        <SortTh label="Manufacturer" k="manufacturer" />
                        <SortTh label="API" k="api" />
                        <SortTh label="API per unit" k="api_per_pill" />
                        <SortTh label="Pack" k="package_size" />
                        <SortTh label="Stock" k="stock" />
                        <SortTh label="Rx" k="prescription_only" />
                        <SortTh label="Price" k="price" />
                        <Th>Actions</Th>
                    </tr>
                    </thead>

                    <tbody>
                    {filtered.map(row => (
                        <tr key={row.idDrug} className="border-t border-neutral-800 hover:bg-neutral-900/60">
                            <Td className="font-medium">{row.name}</Td>
                            <Td>{row.manufacturer}</Td>
                            <Td>{row.api}</Td>
                            <Td>{row.api_per_pill} {row.unit}</Td>
                            <Td>{row.package_size}</Td>
                            <Td>{row.stock}</Td>
                            <Td>
                                <span className={`rounded-full px-2 py-0.5 text-xs ${row.prescription_only?"bg-red-500/20 text-red-300":"bg-emerald-500/20 text-emerald-300"}`}>
                                {row.prescription_only ? "Rx" : "OTC"}
                                </span>
                            </Td>
                            <Td className="text-right">{currency(row.price)}</Td>
                            <Td>
                                <button
                                    onClick={() => setOrdering(row)}
                                    className="inline-flex items-center justify-center rounded-lg border border-neutral-800 p-2 hover:bg-neutral-900"
                                    title="Order more stock"
                                    aria-label="Order more stock"
                                >
                                    ✏️
                                </button>
                            </Td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>


            {editing && <DrugForm value={editing} onClose={()=>setEditing(null)} onSaved={onSaved} />}
            {ordering && (
                <OrderStockModal
                    drug={ordering}
                    onClose={() => setOrdering(null)}
                    onSaved={(updated) => {
                        setRows((prev) => {
                            const i = prev.findIndex((p) => p.idDrug === updated.idDrug);
                            if (i >= 0) {
                                const copy = [...prev];
                                copy[i] = updated;
                                return copy;
                            }
                            return prev;
                        });
                    }}
                />
            )}

        </div>
    );
}


function Th({ children, className="" }: any){ return <th className={`px-3 py-2 text-left ${className}`}>{children}</th>; }
function Td({ children, className="" }: any){ return <td className={`px-3 py-2 ${className}`}>{children}</td>; }