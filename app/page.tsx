import Link from "next/link";
import {ReactNode} from "react";

export default async function Dashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="grid gap-4 sm:grid-cols-3">

            </div>
            <div><a className="underline" href="/drugs">Manage drugs →</a></div>
        </div>
    );
}



function Card({ title, value }: { title: string; value: ReactNode }) {
    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
            <div className="text-sm text-neutral-400">{title}</div>
            <div className="mt-2 text-xl">{value}</div>
        </div>
    );
}