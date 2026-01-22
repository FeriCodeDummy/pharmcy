"use client";

import { Suspense, useEffect, useState } from "react";
import { DrugEntity } from "@/types/entities";
import DrugsTable from "@/components/Table";

export default function DrugsPage() {
    const [drugs, setDrugs] = useState<DrugEntity[]>([]);

    useEffect(() => {
        fetch("/api/drugs")
            .then((res) => res.json())
            .then((data) => setDrugs(data));
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Drugs</h1>
            </div>

            <Suspense fallback={<div className="px-4">Loading…</div>}>
                <DrugsTable initialRows={drugs as DrugEntity[]} />
            </Suspense>
        </div>
    );
}
