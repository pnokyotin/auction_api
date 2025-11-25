// routes/products.js
import express from "express";
import multer from "multer";
import path from "path";
import { db } from "../config/db.js";
import { deleteProduct } from "../controllers/productController.js";
import { approveProduct } from "../controllers/productController.js";

const router = express.Router();

// Multer สำหรับ upload รูป
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT product_id, product_name, tracking_number, product_detail, starting_price, bid_increment, approval,
              note, room_id, warehouse_id, user_id, image_url
       FROM products
       ORDER BY product_id DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error("PRODUCT GET ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/products
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const {
      product_name,
      product_detail,
      tracking_number,
      starting_price,
      bid_increment,
      approval,
      note,
      room_id,
      warehouse_id,
      user_id
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO products
      (product_name, product_detail, tracking_number, starting_price, bid_increment, approval, note, room_id, warehouse_id, user_id, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_name ?? null,
        product_detail ?? null,
        tracking_number ?? null,
        starting_price ? Number(starting_price) : 0,
        bid_increment ? Number(bid_increment) : 0,
        approval ? Number(approval) : 0,
        note ?? null,
        room_id ? Number(room_id) : null,
        warehouse_id ? Number(warehouse_id) : null,
        user_id ? Number(user_id) : null,
        req.file ? `images/${req.file.filename}` : null
      ]
    );

    res.status(201).json({ success: true, product_id: result.insertId });
  } catch (err) {
    console.error("PRODUCT POST ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/approve/:productId
router.put("/approve/:productId", approveProduct);

// DELETE /api/products/:productId
router.delete("/:productId", deleteProduct);

export default router;
