export interface IDBSettings {
    host: string
    port: number
    user: string
    password: string
    database: string
    waitForConnections: boolean
    connectionLimit: number,
    namedPlaceholders: boolean,
}

const GetDBSettings = () => {
    const socketPath = process.env.DB_SOCKET?.trim();

    return {
        socketPath,
        user: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        database: process.env.DB_NAME!,
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: true,
    };


};
export default GetDBSettings;
