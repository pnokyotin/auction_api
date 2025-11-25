// controllers/employeeController.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Employee } from "../models/Employee.js";
import { JWT_SECRET_KEY } from "../middleware/auth.js";

// POST /api/employee/login
export const loginEmployee = async (req, res) => {
  try {
    const { username, password } = req.body;
    const employee = await Employee.findByUsername(username);
    if (!employee) return res.status(401).json({ success: false, message: "Invalid username or password" });

    const match = await bcrypt.compare(password, employee.password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid username or password" });

    const token = jwt.sign(
      { employee_id: employee.employee_id, username: employee.username, role: employee.role },
      JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ success: true, token, employee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
