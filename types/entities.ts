import {RowDataPacket} from "mysql2";

export interface DrugEntity extends RowDataPacket {
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
    external_upid: string;
}

export type CreateDrug = Omit<DrugEntity, "idDrug" | "date_modified">;
export type UpdateDrug = Partial<CreateDrug> & { idDrug: number };

export interface PatientEntity extends RowDataPacket {
    idPatient?: number;
    first_name: string;
    last_name: string;
    dob?: Date | null;
    allergies?: string | null;
    phone?: string | null;
    date_created?: Date;
    date_modified?: Date;
}


export interface PrescriptionEntity extends RowDataPacket {
    idRx?: number;
    fk_patient: number;
    created_at?: Date;
    note?: string | null;
}


export interface PrescriptionItemEntity extends RowDataPacket {
    idItem?: number;
    fk_rx: number;
    fk_drug: number;
    qty: number;
    directions?: string | null;
}


export interface DrugStatBody {
    action: string;
    ts?: Date;
    details: string;
    drug_id?: number | null;
    patient_id?: number | null;
    rx_id?: number | null;
}