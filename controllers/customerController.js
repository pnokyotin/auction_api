import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Customer } from "../models/Customer.js";
import { JWT_SECRET_KEY } from "../middleware/auth.js";

export const registerCustomer = async (req, res) => {
  try {
    const { username, password, email, first_name, last_name } = req.body;
    if (!username || !password || !email || !first_name || !last_name)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existing = await Customer.findByUsernameOrEmail(username, email);
    if (existing.length > 0) return res.status(400).json({ success: false, message: "Username or email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertId = await Customer.create({ username, password: hashedPassword, email, first_name, last_name });

    res.json({ success: true, customer_id: insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const loginCustomer = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Customer.findByUsername(username);
    if (!user) return res.status(401).json({ success: false, message: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign({ customer_id: user.customer_id, username: user.C_username }, JWT_SECRET_KEY, { expiresIn: "1h" });
    res.json({ success: true, token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
