
export interface IDrug {
    idDrug?: number;
    name: string;
    manufacturer: string;
    api: string;
    mkb_10: string;
    prescription_only: boolean;
    price: number;
    package_size: number;
    api_per_pill: number;
    stock: number,
    unit: 'g' | 'mg' | 'μg' | 'ml';
    date_produced?: Date;
    date_modified?: Date;
}