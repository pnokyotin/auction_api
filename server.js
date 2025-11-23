import express from "express";
import mysql from "mysql2/promise";
import multer from "multer";
import cors from "cors";
import path from "path";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve โฟลเดอร์ images
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ----------------- PRODUCTS -----------------
app.use("/images", express.static(path.join(__dirname, "public/images")));
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

    const room_id = req.body.room_id || null; // default null
    const image_url = req.file ? `images/${req.file.filename}` : null;

    const [result] = await db.execute(
      `INSERT INTO products 
        (product_detail, starting_price, bid_increment, approval, note, room_id, warehouse_id, supplier_id, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_detail,
        starting_price,
        bid_increment,
        approval,
        note,
        room_id,
        warehouse_id,
        supplier_id,
        image_url
      ]
    );

    res.status(201).json({
      message: "เพิ่มสินค้าเรียบร้อย",
      product_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "เกิดข้อผิดพลาด",
      error: err.message,
    });
  }
});

// GET /api/products → ดึงสินค้าทั้งหมด
app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT product_id, product_detail, starting_price, bid_increment, approval,
              note, room_id, warehouse_id, supplier_id, image_url
       FROM products
       ORDER BY product_id DESC`
    );

    // แปลง image_url เป็น relative path (ถ้าเผลอเก็บ full URL ใน DB)
    const products = rows.map(p => ({
      ...p,
      image_url: p.image_url?.replace(/^http:\/\/localhost:5000\//, "") || null
    }));

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า", error: err.message });
  }
});


// PATCH /api/products/:id/approve → approve สินค้า
function authenticateEmployee(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: "No token provided" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== "staff" && decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    req.employee = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

app.patch("/api/products/:id/approve", authenticateEmployee, async (req, res) => {
  const productId = req.params.id;

  try {
    const [result] = await db.execute(
      "UPDATE products SET approval = 1 WHERE product_id = ?",
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "สินค้าถูก approve เรียบร้อย" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});


// ----------------- CUSTOMER -----------------

// POST /register
app.post("/register", async (req, res) => {
  try {
    const { username, password, email, first_name, last_name } = req.body;
    if (!username || !password || !email || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const [existing] = await db.execute(
      `SELECT * FROM Customer WHERE C_username = ? OR email = ?`,
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
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

// POST /login → customer login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.execute(
      "SELECT customer_id, C_username, password, email, first_name, last_name FROM Customer WHERE C_username = ?",
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ success: false, message: "Invalid username or password" });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign({ customer_id: user.customer_id, username: user.C_username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// POST /login/employee → employee login
app.post("/login/employee", async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.execute(
      "SELECT employee_id, username, password, name, email, role FROM employees WHERE username = ?",
      [username]
    );
    if (rows.length === 0) return res.status(401).json({ success: false, message: "Invalid username or password" });
    const employee = rows[0];
    const match = await bcrypt.compare(password, employee.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign({ employee_id: employee.employee_id, username: employee.username, role: employee.role }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ success: true, token, employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// เริ่ม server
app.listen(5000, () => console.log("Server running on port 5000"));
