import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OrderStockModal from "../OrderStockModal";
import { DrugEntity } from "@/types/entities";

const drug = {
    idDrug: 7,
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

describe("OrderStockModal", () => {
    it("submits PUT and calls onSaved + onClose on success", async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        const onSaved = jest.fn();

        const updated = { ...drug, stock: 15 } as any;

        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => updated,
        } as any);
        global.fetch = fetchMock as any;

        render(<OrderStockModal drug={drug} onClose={onClose} onSaved={onSaved} />);

        // Change packs to 5 (avoid user.clear -> would temporarily create empty string states)
        const packsInput = screen.getByRole("spinbutton");
        await user.click(packsInput);
        await user.keyboard("{Control>}a{/Control}5");

        await user.click(screen.getByRole("button", { name: /add stock/i }));

        await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

        expect(fetchMock).toHaveBeenCalledWith(
            `/api/drugs/${drug.idDrug}/`,
            expect.objectContaining({
                method: "PUT",
                headers: expect.objectContaining({
                    "Content-Type": "application/json",
                    Accept: "application/json",
                }),
                body: JSON.stringify({ stock: 5 }),
            })
        );

        expect(onSaved).toHaveBeenCalledTimes(1);
        expect(onSaved).toHaveBeenCalledWith(updated);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("shows error and does not call onSaved/onClose when request fails", async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        const onSaved = jest.fn();

        const fetchMock = jest.fn().mockResolvedValue({
            ok: false,
            status: 500,
            text: async () => "DB exploded",
        } as any);
        global.fetch = fetchMock as any;

        render(<OrderStockModal drug={drug} onClose={onClose} onSaved={onSaved} />);

        await user.click(screen.getByRole("button", { name: /add stock/i }));

        // error rendered
        expect(await screen.findByText(/db exploded/i)).toBeInTheDocument();

        expect(onSaved).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });
});
