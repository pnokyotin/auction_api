// controllers/userController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";  // เพิ่ม import jwt
import { db } from "../config/db.js";

const JWT_SECRET = "your_secret_key"; // กำหนด secret ของ JWT

export const registerUser = async (req, res) => {
  try {
    const { username, password, email, first_name, last_name, role } = req.body;

    const validRoles = ['customer','supplier','employee','admin'];
    const roleValue = validRoles.includes(role) ? role : 'customer';

    if (!username || !password || !email || !first_name || !last_name) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ตรวจสอบ username/email ซ้ำ
    const [existing] = await db.execute(
      `SELECT * FROM users WHERE username = ? OR email = ?`,
      [username, email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      `INSERT INTO users (username, password, email, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, hashedPassword, email, first_name, last_name, roleValue]
    );

    const newUser = {
      user_id: result.insertId,
      username,
      email,
      role: roleValue,
    };

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.execute(`SELECT * FROM users WHERE username = ?`, [username]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Incorrect password" });

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
