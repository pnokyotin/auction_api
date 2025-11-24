// models/roomModel.js
import { db } from "../config/db.js";

export const Room = {
  findAll: async () => {
    const [rows] = await db.execute(`SELECT * FROM rooms ORDER BY room_id DESC`);
    return rows;
  },

  findById: async (room_id) => {
    const [rows] = await db.execute(`SELECT * FROM rooms WHERE room_id = ?`, [room_id]);
    return rows[0];
  },

  create: async ({ room_name, description }) => {
    const [result] = await db.execute(
      `INSERT INTO rooms (room_name, description) VALUES (?, ?)`,
      [room_name, description]
    );
    return result.insertId;
  },

  update: async (room_id, data) => {
    const fields = [];
    const values = [];

    if (data.room_name !== undefined) {
      fields.push("room_name = ?");
      values.push(data.room_name);
    }

    if (data.description !== undefined) {
      fields.push("description = ?");
      values.push(data.description);
    }

    if (fields.length === 0) return false;

    values.push(room_id);
    const [result] = await db.execute(
      `UPDATE rooms SET ${fields.join(", ")} WHERE room_id = ?`,
      values
    );
    return result.affectedRows;
  },

  delete: async (room_id) => {
    const [result] = await db.execute(`DELETE FROM rooms WHERE room_id = ?`, [room_id]);
    return result.affectedRows;
  }
};
