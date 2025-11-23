import { db } from "../config/db.js";

export const Employee = {
  findByUsername: async (username) => {
    const [rows] = await db.execute(
      `SELECT employee_id, username, password, name, email, role FROM employees WHERE username = ?`,
      [username]
    );
    return rows[0];
  }
};
