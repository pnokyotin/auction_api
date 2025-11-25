// controllers/productController.js
import { db } from "../config/db.js";

export const approveProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const [result] = await db.execute(
      "UPDATE products SET approval = 1 WHERE product_id = ?",
      [productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product approved successfully" });
  } catch (error) {
    console.error("APPROVE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: "Error approving product" });
  }
};
