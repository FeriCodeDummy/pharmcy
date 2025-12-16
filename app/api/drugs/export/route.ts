import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { DrugEntity } from "@/types/entities";

export async function GET() {
    const [rows] = await pool.query<DrugEntity[]>("SELECT * FROM drug ORDER BY name ASC");
    const header = Object.keys(rows[0] ?? { idDrug: '', name: '' });
    const csv = [header.join(',')]
        .concat(rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(',')))
        .join('\n');
    return new NextResponse(csv, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": "attachment; filename=drugs.csv",
        },
    });
}
