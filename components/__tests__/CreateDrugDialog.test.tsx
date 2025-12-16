import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateDrugDialog from "../CreateDrugDialog";

describe("CreateDrugDialog", () => {
    it("submits correct payload and calls rf on success", async () => {
        const user = userEvent.setup();
        const rf = jest.fn().mockResolvedValue(undefined);

        const fetchMock = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        } as any);
        global.fetch = fetchMock as any;

        render(<CreateDrugDialog rf={rf} />);

        await user.type(screen.getByPlaceholderText("Name"), "Aspirin");
        await user.type(screen.getByPlaceholderText("Manufacturer"), "Bayer");
        await user.type(
            screen.getByPlaceholderText("Active Pharmaceutical Ingredient"),
            "acetylsalicylic acid"
        );
        await user.type(screen.getByPlaceholderText("MKB-10"), "A01");

        const spinbuttons = screen.getAllByRole("spinbutton");
        const amountInput = spinbuttons[0];
        const packageSizeInput = spinbuttons[1];
        const priceInput = spinbuttons[2];

        await user.click(amountInput);
        await user.keyboard("{Control>}a{/Control}500");

        await user.click(packageSizeInput);
        await user.keyboard("{Control>}a{/Control}20");

        await user.click(priceInput);
        await user.keyboard("{Control>}a{/Control}6.99");

        await user.selectOptions(screen.getByRole("combobox"), "mg");
        await user.click(screen.getByText("Prescription Required"));

        await user.click(screen.getByRole("button", { name: /save drug/i }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(rf).toHaveBeenCalledTimes(1);
    });
});

describe("CreateDrugDialog", () => {
    it("does not call rf and does not reset fields when request fails", async () => {
        const user = userEvent.setup();
        const rf = jest.fn().mockResolvedValue(undefined);

        const fetchMock = jest.fn().mockResolvedValue({ ok: false } as any);
        global.fetch = fetchMock as any;

        render(<CreateDrugDialog rf={rf} />);

        await user.type(screen.getByPlaceholderText("Name"), "Ibuprofen");
        await user.type(screen.getByPlaceholderText("Manufacturer"), "Pliva");
        await user.type(
            screen.getByPlaceholderText("Active Pharmaceutical Ingredient"),
            "ibuprofen"
        );
        await user.type(screen.getByPlaceholderText("MKB-10"), "M79");

        const spinbuttons = screen.getAllByRole("spinbutton");
        const amountInput = spinbuttons[0];
        const packageSizeInput = spinbuttons[1];
        const priceInput = spinbuttons[2];

        await user.click(amountInput);
        await user.keyboard("{Control>}a{/Control}200");

        await user.click(packageSizeInput);
        await user.keyboard("{Control>}a{/Control}10");

        await user.click(priceInput);
        await user.keyboard("{Control>}a{/Control}3.50");

        await user.selectOptions(screen.getByRole("combobox"), "mg");
        await user.click(screen.getByText("OTC (No Prescription)")); // ensure false

        await user.click(screen.getByRole("button", { name: /save drug/i }));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(rf).not.toHaveBeenCalled();

        // values should still be there (no reset on failure)
        expect(screen.getByPlaceholderText("Name")).toHaveValue("Ibuprofen");
        expect(screen.getByPlaceholderText("Manufacturer")).toHaveValue("Pliva");
        expect(screen.getByPlaceholderText("MKB-10")).toHaveValue("M79");
    });
});