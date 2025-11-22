import express from "express";
import mysql from "mysql2/promise";
import multer from "multer";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(process.cwd(), "public/images")));

// ตั้งค่า multer สำหรับ upload รูป
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});
const upload = multer({ storage });

// สร้าง connection MySQL
const db = await mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pwd1234",
  database: "my_api_db",
});

// POST /api/products → เพิ่มสินค้า
app.post("/api/products", upload.single("image"), async (req, res) => {
  try {
    const {
      product_detail,
      starting_price,
      bid_increment,
      approval,
      note,
      warehouse_id,
      supplier_id,
    } = req.body;

    const image_url = req.file ? `images/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO products 
        (product_detail, starting_price, bid_increment, approval, note, warehouse_id, supplier_id, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [product_detail, starting_price, bid_increment, approval, note, warehouse_id, supplier_id, image_url]
    );

    res.status(201).json({ message: "เพิ่มสินค้าเรียบร้อย", product_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
});

// -------------------------
// GET /api/products → ดึงสินค้าทั้งหมด
// -------------------------
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT product_id, product_detail, starting_price, bid_increment, approval, note, warehouse_id, supplier_id, image_url
       FROM products ORDER BY product_id DESC`
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า", error: err.message });
  }
});




// เริ่ม server
app.listen(5000, () => console.log("Server running on port 5000"));
