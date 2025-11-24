// models/Product.js
import { db } from "../config/db.js";

export const Product = {
  getAll: async () => {
    const [rows] = await db.execute(
      `SELECT * FROM products ORDER BY product_id DESC`
    );
    return rows.map(p => ({
      ...p,
      image_url: p.image_url?.replace(/^http:\/\/localhost:5000\//, "") || null
    }));
  },

  create: async (body, file) => {
    const {
      product_detail, starting_price, bid_increment, approval,
      note, room_id, warehouse_id, supplier_id
    } = body;

    const productValues = [
      product_detail ?? null,
      starting_price ? Number(starting_price) : null,
      bid_increment ? Number(bid_increment) : null,
      approval ? Number(approval) : 0,
      note ?? null,
      room_id ? Number(room_id) : null,
      warehouse_id ? Number(warehouse_id) : null,
      supplier_id ? Number(supplier_id) : null,
      file ? `images/${file.filename}` : null,
    ];

    const [result] = await db.execute(
      `INSERT INTO products 
       (product_detail, starting_price, bid_increment, approval, note, room_id, warehouse_id, supplier_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
       productValues
    );
    return result.insertId;
  },

  updateWarehouse: async (productId, warehouse_id) => {
    const [result] = await db.execute(
      `UPDATE products SET warehouse_id = ? WHERE product_id = ?`,
      [warehouse_id ?? 0, productId]
    );
    return result;
  },

  // เพิ่มฟังก์ชันอัปเดต room และ warehouse พร้อมกัน
  updateRoomAndWarehouse: async (productId, room_id, warehouse_id) => {
    const [result] = await db.execute(
      `UPDATE products SET room_id = ?, warehouse_id = ? WHERE product_id = ?`,
      [room_id ?? null, warehouse_id ?? 0, productId]
    );
    return result;
  }
};
