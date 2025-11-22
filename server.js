import express from "express";
import mysql from "mysql2/promise";
import multer from "multer";
import cors from "cors";
import path from "path";
import bcrypt from 'bcrypt';  // ถ้าใช้ bcrypt
import jwt from "jsonwebtoken";


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

const JWT_SECRET = "your_super_secret_key";


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

// POST /register
app.post("/register", async (req, res) => {
  try {
    const { username, password, email, first_name, last_name } = req.body;

    // ตรวจสอบ field ว่าง
    if (!username || !password || !email || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ตรวจสอบ username/email ซ้ำ
    const [existing] = await db.execute(
      `SELECT * FROM Customer WHERE C_username = ? OR email = ?`,
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const [result] = await db.execute(
      `INSERT INTO Customer (C_username, password, email, first_name, last_name)
       VALUES (?, ?, ?, ?, ?)`,
      [username, hashedPassword, email, first_name, last_name]
    );

    res.json({ success: true, customer_id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// -------------------------
// POST /login → ตรวจสอบ username/password
// -------------------------
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.execute(
      "SELECT customer_id, C_username, password, email, first_name, last_name FROM Customer WHERE C_username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid username or password" });
    }

    // สร้าง JWT token
    const token = jwt.sign(
      { customer_id: user.customer_id, username: user.C_username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ส่ง response ให้ frontend
    res.json({
      success: true,
      token,
      user: {
        customer_id: user.customer_id,
        username: user.C_username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});



// เริ่ม server
app.listen(5000, () => console.log("Server running on port 5000"));
