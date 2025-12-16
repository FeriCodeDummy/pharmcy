"use client"

import { DrugEntity } from "@/types/entities";
import DrugsTable from "@/components/Table";
import {useEffect, useState} from "react";
import {IDrug} from "@/types/commons";




export default function DrugsPage() {
    const [drugs, setDrugs] = useState<DrugEntity[]>([]);
    useEffect(() => {
        fetch('/api/drugs').then((res) => res.json()).then(data => setDrugs(data));
        console.log("Drugs page loaded", drugs);
    }, [])



    return (
        <div className=" space-y-4">
            <div className="flex items-center justify-between">

                <h1 className="text-2xl font-semibold tracking-tight">Drugs</h1>
            </div>
                <DrugsTable initialRows={drugs as DrugEntity[]}/>
        </div>
    );
}