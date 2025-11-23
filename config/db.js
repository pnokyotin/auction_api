// config/db.js
import mysql from "mysql2/promise";

export const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pwd1234",
  database: "my_api_db",
});
