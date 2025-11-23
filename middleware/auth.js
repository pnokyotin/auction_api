// middleware/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_super_secret_key";

export function authenticateEmployee(req, res, next) {
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

export const JWT_SECRET_KEY = JWT_SECRET;
