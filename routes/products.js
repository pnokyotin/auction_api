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
              note, room_id, warehouse_id, supplier_id, image_url
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
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);

  try {
    const {
      product_detail,
      starting_price,
      bid_increment,
      approval,
      note,
      room_id,
      warehouse_id,
      supplier_id,
    } = req.body;

    // แปลง undefined/empty → null และตัวเลข
    const productValues = [
      product_detail ?? null,
      starting_price ? Number(starting_price) : null,
      bid_increment ? Number(bid_increment) : null,
      approval ? Number(approval) : 0,
      note ?? null,
      room_id ? Number(room_id) : null,
      warehouse_id ? Number(warehouse_id) : null,
      supplier_id ? Number(supplier_id) : null,
      req.file ? `images/${req.file.filename}` : null,
    ];

    const [result] = await db.execute(
      `INSERT INTO products 
        (product_detail, starting_price, bid_increment, approval, note, room_id, warehouse_id, supplier_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
       productValues
    );

    res.status(201).json({ message: "เพิ่มสินค้าเรียบร้อย", product_id: result.insertId });
  } catch (err) {
    console.error("PRODUCT POST ERROR:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
});

export default router;
