import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from "@testing-library/user-event";
import DrugsTable from "@/components/Table";
import {DrugEntity} from "@/types/entities";
jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: () => null, // no dispenseFor param in tests
    }),
}));

const rows = [
    {
        idDrug: 1,
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
        external_upid: "upid-aspirin",
    },
    {
        idDrug: 2,
        name: "Ibuprofen",
        manufacturer: "Pliva",
        api: "ibuprofen",
        mkb_10: "M79",
        prescription_only: true,
        price: 3.5,
        package_size: 10,
        api_per_pill: 200,
        stock: 5,
        unit: "mg",
        external_upid: "upid-ibuprofen",
    },
] as unknown as DrugEntity[];


describe('DrugsTable', () => {
    it('renders drug name in table', () => {
        render(<DrugsTable initialRows={rows} />);

        expect(screen.getByText('Aspirin')).toBeInTheDocument();
        expect(screen.getByText('acetylsalicylic acid')).toBeInTheDocument();
    });

    it("filters rows by search query", async () => {
        const user = userEvent.setup();

        render(<DrugsTable initialRows={rows} />);

        // both rows visible initially
        expect(screen.getByText("Aspirin")).toBeInTheDocument();
        expect(screen.getByText("Ibuprofen")).toBeInTheDocument();

        const search = screen.getByPlaceholderText(/search name/i);
        await user.type(search, "asp");

        // Aspirin stays, Ibuprofen should disappear
        expect(screen.getByText("Aspirin")).toBeInTheDocument();
        expect(screen.queryByText("Ibuprofen")).not.toBeInTheDocument();
    });

    it('opens DrugForm modal when clicking "Add"', async () => {
        const user = userEvent.setup();

        render(<DrugsTable initialRows={rows} />);

        await user.click(screen.getByRole("button", { name: /^add$/i }));

        // DrugForm renders with heading "Add Drug" when idDrug is falsy
        expect(await screen.findByText("Add Drug")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();
    });
});
