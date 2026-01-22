import { NextRequest, NextResponse } from "next/server";
import {pool} from "@/lib/db";

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string; }> }
) {

    const id = Number((await context.params).id);
    const body = await request.json();
    console.log(body);
    await pool.query('UPDATE inventory SET stock = stock + ? WHERE fk_Drug = ?', [body.stock, id]);

    if (!body.stock) {
        return NextResponse.json({ error: "Stock is required" }, { status: 400 });
    }


    // Fetch updated row for confirmation
    const [rows]: any = await pool.query(`SELECT drug.*, stock FROM drug JOIN inventory on fk_drug = idDrug WHERE idDrug=?`, [id]);
    const updated = rows[0];
    if (!updated)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Normalize to boolean
    updated.prescription_only =
        updated.prescription_only === 1 || updated.prescription_only === true;


    return NextResponse.json(updated);
}

export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string; }> }
) {
    const id = Number((await context.params).id);
    await pool.query(`DELETE FROM drug WHERE idDrug=?`, [id]);


    return NextResponse.json({ success: true });
}
