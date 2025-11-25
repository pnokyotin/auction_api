// controllers/productController.js
import { db } from "../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// อัปเดต approval
export const approveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { approval } = req.body;

    if (approval === undefined) return res.status(400).json({ success: false, message: "approval required" });

    const [result] = await db.execute(
      "UPDATE products SET approval = ? WHERE product_id = ?",
      [Number(approval), Number(productId)]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.json({ success: true, message: "Product approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error approving product" });
  }
};

// ลบสินค้าและลบภาพ
export const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const [rows] = await db.execute("SELECT image_url FROM products WHERE product_id = ?", [productId]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Product not found" });

    const imagePath = rows[0].image_url ? path.join(__dirname, "..", "public", rows[0].image_url) : null;

    if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    await db.execute("DELETE FROM products WHERE product_id = ?", [productId]);

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};
