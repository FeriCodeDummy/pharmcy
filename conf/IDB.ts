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

const GetDBSettings = (): IDBSettings => {
    /*return {
        host: process.env.host!,
        port: parseInt(process.env.port!),
        user: process.env.user!,
        password: process.env.password ?? '',
        database: process.env.database!,
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: true,
    }*/
    return {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'pharmacy',
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: true,
    }
}

export default GetDBSettings;
