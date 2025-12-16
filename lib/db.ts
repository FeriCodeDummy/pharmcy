import mysql from "mysql2/promise";
import GetDBSettings from "@/conf/IDB";


const settings = GetDBSettings()

export const pool = mysql.createPool(settings);

