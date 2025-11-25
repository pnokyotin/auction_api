// routes/products.js
import express from "express";
import multer from "multer";
import path from "path";
import { db } from "../config/db.js";

const router = express.Router();

// ตั้งค่า multer สำหรับ upload รูป
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET /api/products → ดึงสินค้าทั้งหมด
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT product_id, product_detail, starting_price, bid_increment, approval,
              note, room_id, warehouse_id, user_id, image_url
       FROM products
       ORDER BY product_id DESC`
    );

    const products = rows.map(p => ({
      ...p,
      image_url: p.image_url?.replace(/^http:\/\/localhost:5000\//, "") || null
    }));

    res.json(products);
  } catch (err) {
    console.error("PRODUCT GET ERROR:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า", error: err.message });
  }
});

// POST /api/products → เพิ่มสินค้า
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      product_detail,
      starting_price,
      bid_increment,
      approval,
      note,
      room_id,
      warehouse_id,
      user_id,
    } = req.body;

    if (!user_id) return res.status(400).json({ success: false, message: "user_id is required" });

    const productValues = [
      product_detail ?? null,
      starting_price ? Number(starting_price) : null,
      bid_increment ? Number(bid_increment) : null,
      approval ? Number(approval) : 0,
      note ?? null,
      room_id ? Number(room_id) : null,
      warehouse_id ? Number(warehouse_id) : null,
      Number(user_id), // ต้องมีค่า
      req.file ? `images/${req.file.filename}` : null,
    ];

    const [result] = await db.execute(
      `INSERT INTO products
      (product_detail, starting_price, bid_increment, approval, note, room_id, warehouse_id, user_id, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      productValues
    );

    res.status(201).json({ success: true, product_id: result.insertId });
  } catch (err) {
    console.error("PRODUCT POST ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// PUT /api/products/:productId/warehouse → อัปเดต warehouse
router.put("/:productId/warehouse", async (req, res) => {
  const { productId } = req.params;
  const { warehouse_id } = req.body;

  try {
    const warehouseIdValue = warehouse_id ? Number(warehouse_id) : 0;
    const [result] = await db.execute(
      `UPDATE products SET warehouse_id = ? WHERE product_id = ?`,
      [warehouseIdValue, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบสินค้านี้" });
    }

    res.json({ success: true, product_id: productId, warehouse_id: warehouseIdValue });
  } catch (err) {
    console.error("UPDATE WAREHOUSE ERROR:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: err.message });
  }
});

// PUT /api/products/:productId/room → อัปเดต room
router.put("/:productId/room", async (req, res) => {
  const { productId } = req.params;
  const { room_id } = req.body;

  try {
    const roomIdValue = room_id ? Number(room_id) : null;
    const [result] = await db.execute(
      `UPDATE products SET room_id = ? WHERE product_id = ?`,
      [roomIdValue, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบสินค้านี้" });
    }

    res.json({ success: true, product_id: productId, room_id: roomIdValue });
  } catch (err) {
    console.error("UPDATE ROOM ERROR:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: err.message });
  }
});


// PUT /api/products/approve/:productId → อัปเดต approval
router.put("/approve/:productId", async (req, res) => {
  const { productId } = req.params;
  const { approval } = req.body;

  if (approval === undefined) {
    return res.status(400).json({ success: false, message: "approval is required" });
  }

  try {
    const [result] = await db.execute(
      `UPDATE products SET approval = ? WHERE product_id = ?`,
      [Number(approval), Number(productId)]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "ไม่พบสินค้านี้" });
    }

    // ดึงข้อมูลสินค้าที่อัปเดตกลับมา
    const [rows] = await db.execute(
      `SELECT * FROM products WHERE product_id = ?`,
      [Number(productId)]
    );

    res.json({
      success: true,
      message: `Product ${productId} approval updated to ${approval}`,
      product: rows[0]
    });
  } catch (err) {
    console.error("APPROVE PRODUCT ERROR:", err);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาด", error: err.message });
  }
});

export default router;
