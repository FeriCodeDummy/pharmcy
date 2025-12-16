/** @jest-environment node */

import "@testing-library/jest-dom";

/**
 * Mock DB pool used by Next route handlers.
 * IMPORTANT: define mocks inside jest.mock factory to avoid hoisting/TDZ issues.
 */
jest.mock("@/lib/db", () => {
    const query = jest.fn();
    const execute = jest.fn();
    return { pool: { query, execute } };
});

// Import AFTER jest.mock
import { GET as getDrugs, POST as postDrugs } from "@/app/api/drugs/route";
import { GET as exportDrugs } from "@/app/api/drugs/export/route";
import { PUT as putDrug } from "@/app/api/drugs/[id]/route";

// Grab mocks
const { pool } = jest.requireMock("@/lib/db") as {
    pool: { query: jest.Mock; execute: jest.Mock };
};
const { query, execute } = pool;

/**
 * Helpers to mock mysql2 return shapes.
 * mysql2 pool.query/execute return: [rows, fields]
 */
const qRows = (rows: any[] = []) => Promise.resolve([rows, []] as any);
const qResult = (result: any = {}) => Promise.resolve([result, []] as any);

const mockCryptoUUID = (uuid = "11111111-2222-3333-4444-555555555555") => {
    // @ts-ignore
    global.crypto = { randomUUID: () => uuid };
};

beforeEach(() => {
    jest.clearAllMocks();
    mockCryptoUUID();
});

describe("API /api/drugs", () => {
    test("GET: returns prescription_only normalized to boolean (1 -> true)", async () => {
        query.mockImplementationOnce(() =>
            qRows([
                {
                    idDrug: 1,
                    name: "A",
                    manufacturer: "M",
                    api: "X",
                    mkb_10: "A01",
                    prescription_only: true, // raw DB value
                    price: 1,
                    package_size: 1,
                    api_per_pill: 1,
                    unit: "mg",
                    stock: 5,
                    external_upid: "upid",
                },
            ])
        );

        const res = await getDrugs();
        expect(res.status).toBe(200);

        const json = await res.json();

        console.log("json:", json);
        console.log("Array.isArray(json):", Array.isArray(json));
        console.log("typeof json:", typeof json);

        expect(Array.isArray(json)).toBe(true);
        expect(json.length).toBeGreaterThan(0);

        expect(json[0].prescription_only).toBe(true);
    });


    test("GET: returns prescription_only normalized to boolean (0 -> false)", async () => {
        query.mockImplementationOnce(() =>
            qRows([
                {
                    idDrug: 2,
                    name: "B",
                    manufacturer: "M",
                    api: "Y",
                    mkb_10: "B01",
                    prescription_only: 0,
                    price: 1,
                    package_size: 1,
                    api_per_pill: 1,
                    unit: "mg",
                    stock: 2,
                    external_upid: "upid2",
                },
            ])
        );

        const res = await getDrugs();
        const json = await res.json();
        expect(json[0].prescription_only).toBe(false);
    });

    test("POST: inserts drug + inventory and returns created row (201)", async () => {
        // drug insert -> insertId
        execute.mockImplementationOnce(() => qResult({ insertId: 123 }));
        // inventory insert OK
        execute.mockImplementationOnce(() => qResult({}));

        // select created row (your route does a SELECT after insert)
        query.mockImplementationOnce(() =>
            qRows([
                {
                    idDrug: 123,
                    name: "Aspirin",
                    manufacturer: "Bayer",
                    api: "ASA",
                    mkb_10: "A01",
                    prescription_only: 1,
                    price: 6.99,
                    package_size: 20,
                    api_per_pill: 500,
                    unit: "mg",
                    stock: 10,
                    external_upid: "x",
                },
            ])
        );

        const req = new Request("http://test/api/drugs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Aspirin",
                manufacturer: "Bayer",
                api: "ASA",
                mkb_10: "A01",
                prescription_only: true,
                price: 6.99,
                package_size: 20,
                api_per_pill: 500,
                unit: "mg",
                stock: 10,
            }),
        });

        const res = await postDrugs(req);
        expect(res.status).toBe(201);

        const json = await res.json();
        expect(json.idDrug).toBe(123);
        expect(json.prescription_only).toBe(true);
    });

    test("POST: generates external_upid without hyphens and passes it to INSERT params", async () => {
        mockCryptoUUID("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");

        execute.mockImplementationOnce(() => qResult({ insertId: 1 }));
        execute.mockImplementationOnce(() => qResult({}));
        query.mockImplementationOnce(() => qRows([{ idDrug: 1, prescription_only: 0 }]));

        const req = new Request("http://test/api/drugs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "X",
                manufacturer: "Y",
                api: "Z",
                mkb_10: "A00",
                prescription_only: false,
                price: 1,
                package_size: 1,
                api_per_pill: 1,
                unit: "mg",
                stock: 1,
            }),
        });

        await postDrugs(req);

        // first execute is the drug insert; last param is upid in your implementation
        const params = execute.mock.calls[0][1] as any[];
        const upid = params[params.length - 1];

        expect(upid).toBe("aaaaaaaabbbbccccddddeeeeeeeeeeee");
        expect(upid.includes("-")).toBe(false);
    });

    test("POST: if inventory insert fails, still returns 201 (tolerated)", async () => {
        execute.mockImplementationOnce(() => qResult({ insertId: 77 })); // drug insert
        execute.mockImplementationOnce(() => Promise.reject(new Error("inventory fail"))); // inventory insert fails
        query.mockImplementationOnce(() => qRows([{ idDrug: 77, prescription_only: 0 }]));

        const req = new Request("http://test/api/drugs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "X",
                manufacturer: "Y",
                api: "Z",
                mkb_10: "A00",
                prescription_only: false,
                price: 1,
                package_size: 1,
                api_per_pill: 1,
                unit: "mg",
                stock: 1,
            }),
        });

        const res = await postDrugs(req);
        expect(res.status).toBe(201);
    });
});

describe("API /api/drugs/[id] (PUT)", () => {
    test("PUT: returns 400 when stock is missing", async () => {
        const req = { json: async () => ({}) } as any;

        const res = await putDrug(req, {
            params: Promise.resolve({ id: "1" }),
        } as any);

        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toMatch(/stock is required/i);
    });

    test("PUT: returns 400 when stock is 0 (falsy)", async () => {
        const req = { json: async () => ({ stock: 0 }) } as any;

        const res = await putDrug(req, {
            params: Promise.resolve({ id: "1" }),
        } as any);

        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toMatch(/stock is required/i);
    });

    test("PUT: returns 404 when updated row not found", async () => {
        // UPDATE query (your code likely uses pool.query)
        query.mockImplementationOnce(() => qRows([]));
        // SELECT updated row returns empty
        query.mockImplementationOnce(() => qRows([]));

        const req = { json: async () => ({ stock: 5 }) } as any;

        const res = await putDrug(req, {
            params: Promise.resolve({ id: "999" }),
        } as any);

        expect(res.status).toBe(404);
        const json = await res.json();
        expect(json.error).toMatch(/not found/i);
    });

    test("PUT: succeeds, returns updated row and normalizes prescription_only", async () => {
        // UPDATE
        query.mockImplementationOnce(() => qRows([]));
        // SELECT updated row
        query.mockImplementationOnce(() =>
            qRows([
                {
                    idDrug: 2,
                    name: "Ibuprofen",
                    prescription_only: 1,
                    stock: 15,
                },
            ])
        );

        const req = { json: async () => ({ stock: 3 }) } as any;

        const res = await putDrug(req, {
            params: Promise.resolve({ id: "2" }),
        } as any);

        expect(res.status).toBe(200);
        const json = await res.json();

        expect(json.prescription_only).toBe(true);
        expect(json.stock).toBe(15);
    });
});

describe("API /api/drugs/export (GET)", () => {
    test("export: returns CSV with Content-Type text/csv and header from first row keys", async () => {
        query.mockImplementationOnce(() =>
            qRows([
                { idDrug: 1, name: "Aspirin" },
                { idDrug: 2, name: "Ibuprofen" },
            ])
        );

        const res = await exportDrugs();
        expect(res.status).toBe(200);
        expect(res.headers.get("Content-Type")).toBe("text/csv");

        const text = await res.text();
        expect(text.split("\n")[0]).toBe("idDrug,name");
        expect(text).toContain("Aspirin");
        expect(text).toContain("Ibuprofen");
    });

    test("export: when no rows, returns CSV with fallback header idDrug,name", async () => {
        query.mockImplementationOnce(() => qRows([]));

        const res = await exportDrugs();
        const text = await res.text();

        expect(text.split("\n")[0]).toBe("idDrug,name");
    });
});
