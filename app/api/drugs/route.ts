import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { CreateDrug, DrugEntity } from "@/types/entities";


function normalize(row: any) {
    return { ...row, prescription_only: row.prescription_only === 1 || row.prescription_only === true };
}

export async function GET() {
    const [rows] = await pool.query<any[]>("SELECT drug.*, stock FROM drug JOIN Inventory ON fk_drug = idDrug ORDER BY name");
    console.log(rows.map(normalize));
    return NextResponse.json(rows.map(normalize));
}

export async function POST(req: Request) {
    const body = (await req.json()) as CreateDrug;
    const upid = crypto.randomUUID().replace(/-/g, "");

    const {name, manufacturer, api, mkb_10, prescription_only, price, package_size, api_per_pill, unit, stock} = body
    const params = [name, manufacturer, api, mkb_10, prescription_only, price, package_size, api_per_pill, unit, upid]
    const [res] = await pool.execute(
        `INSERT INTO drug (name, manufacturer, api, mkb_10, prescription_only, price, package_size, api_per_pill, unit, external_upid)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params
    );
// @ts-ignore
    const id = res.insertId as number;

    try {
        const sql = "INSERT INTO Inventory (`idInventory`, `stock`, `fk_drug`) VALUES (NULL, ?, ?);"
        let _params = [stock, id]
        const [res] = await pool.execute(sql, _params);
    } catch (e){
        console.error(e);
    }

    const [rows] = await pool.query<DrugEntity[]>("SELECT drug.*m, quantity FROM drug JOIN Inventory ON idDrug = fk_drug WHERE idDrug = ?", [id]);
    return NextResponse.json(normalize(rows[0]), { status: 201 });
}

