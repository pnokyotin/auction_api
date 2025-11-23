import { db } from "../config/db.js";

export const Customer = {
  findByUsernameOrEmail: async (username, email) => {
    const [rows] = await db.execute(
      `SELECT * FROM Customer WHERE C_username = ? OR email = ?`,
      [username, email]
    );
    return rows;
  },
  findByUsername: async (username) => {
    const [rows] = await db.execute(
      `SELECT customer_id, C_username, password, email, first_name, last_name FROM Customer WHERE C_username = ?`,
      [username]
    );
    return rows[0];
  },
  create: async ({ username, password, email, first_name, last_name }) => {
    const [result] = await db.execute(
      `INSERT INTO Customer (C_username, password, email, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [username, password, email, first_name, last_name]
    );
    return result.insertId;
  }
};
