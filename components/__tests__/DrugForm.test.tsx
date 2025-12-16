import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DrugForm from "../DrugForm";
import { DrugEntity } from "@/types/entities";

const baseDrug = {
    name: "Aspirin",
    manufacturer: "Bayer",
    api: "acetylsalicylic acid",
    mkb_10: "A01",
    prescription_only: false,
    price: 6.99,
    package_size: 20,
    api_per_pill: 500,
    stock: 10,
    unit: "mg",
    external_upid: "test-upid-aspirin",
} as unknown as DrugEntity;

describe("DrugForm", () => {
    it("PATCHes existing drug and calls onSaved (edit mode)", async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        const onSaved = jest.fn();

        const drug = { ...baseDrug, idDrug: 123 } as any;
        const updated = { ...drug, name: "Aspirin Updated" } as any;

        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => updated,
        } as any);
        global.fetch = fetchMock as any;

        render(<DrugForm value={drug} onClose={onClose} onSaved={onSaved} />);

        // change the first textbox (Name)
        const nameInput = screen.getAllByRole("textbox")[0];
        await user.click(nameInput);
        await user.keyboard("{Control>}a{/Control}Aspirin Updated");

        await user.click(screen.getByRole("button", { name: /^save$/i }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/drugs/123",
            expect.objectContaining({
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: expect.any(String),
            })
        );

        // ensure payload includes the updated name
        const sentBody = JSON.parse((fetchMock.mock.calls[0][1] as any).body);
        expect(sentBody.name).toBe("Aspirin Updated");

        expect(onSaved).toHaveBeenCalledTimes(1);
        expect(onSaved).toHaveBeenCalledWith(updated);
    });

    it("POSTs new drug and calls onSaved (add mode)", async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        const onSaved = jest.fn();

        // no idDrug -> add mode
        const drug = { ...baseDrug, idDrug: undefined } as any;
        const created = { ...drug, idDrug: 999 } as any;

        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => created,
        } as any);
        global.fetch = fetchMock as any;

        render(<DrugForm value={drug} onClose={onClose} onSaved={onSaved} />);

        await user.click(screen.getByRole("button", { name: /^save$/i }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

        expect(fetchMock).toHaveBeenCalledWith(
            "/api/drugs",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: expect.any(String),
            })
        );

        expect(onSaved).toHaveBeenCalledTimes(1);
        expect(onSaved).toHaveBeenCalledWith(created);
    });
});
