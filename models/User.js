import { db } from "../config/db.js";

export const User = {
  findByUsernameOrEmail: async (username, email) => {
    const [rows] = await db.execute(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );
    return rows;
  },

  findByUsername: async (username) => {
    const [rows] = await db.execute(
      `SELECT user_id, username, password, email, role, approval FROM users WHERE username = ?`,
      [username]
    );
    return rows[0];
  },

  create: async ({ username, password, email, role, approval }) => {
    const [result] = await db.execute(
      `INSERT INTO users (username, password, email, role, approval) VALUES (?, ?, ?, ?, ?)`,
      [username, password, email, role, approval]
    );
    return result.insertId;
  }
};
