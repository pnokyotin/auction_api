// models/Warehouse.js
import { db } from "../config/db.js";

export const Warehouse = {
  findAll: async () => {
    const [rows] = await db.execute(
      `SELECT warehouse_id, warehouse_name, warehouse_address FROM warehouse ORDER BY warehouse_id ASC`
    );
    return rows;
  },

  findById: async (warehouse_id) => {
    const [rows] = await db.execute(
      `SELECT warehouse_id, warehouse_name, warehouse_address FROM warehouse WHERE warehouse_id = ?`,
      [warehouse_id]
    );
    return rows[0];
  },

  create: async ({ warehouse_name, warehouse_address }) => {
    const [result] = await db.execute(
      `INSERT INTO warehouse (warehouse_name, warehouse_address) VALUES (?, ?)`,
      [warehouse_name, warehouse_address]
    );
    return result.insertId;
  },

  update: async (warehouse_id, data) => {
    const fields = [];
    const values = [];

    if (data.warehouse_name !== undefined) {
      fields.push("warehouse_name = ?");
      values.push(data.warehouse_name);
    }
    if (data.warehouse_address !== undefined) {
      fields.push("warehouse_address = ?");
      values.push(data.warehouse_address);
    }

    if (fields.length === 0) return false;

    values.push(warehouse_id);

    const [result] = await db.execute(
      `UPDATE warehouse SET ${fields.join(", ")} WHERE warehouse_id = ?`,
      values
    );
    return result.affectedRows;
  },

  delete: async (warehouse_id) => {
    const [result] = await db.execute(
      `DELETE FROM warehouse WHERE warehouse_id = ?`,
      [warehouse_id]
    );
    return result.affectedRows;
  },
};
