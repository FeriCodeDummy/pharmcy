export type LoginReturnBody = {
    id?: number
    name?: string
    surname?: string
    email?: string
    error?: string
    session_id?: string
}

export type SessionReturnBody = {
    id?: number;
    name?: string;
    surname?: string;
    accountType?: string;
    session_id?: string;
    error?: string;
}