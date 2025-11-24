// controllers/productController.js
import { Product } from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า", error: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productId = await Product.create(req.body, req.file);
    res.status(201).json({ message: "เพิ่มสินค้าเรียบร้อย", product_id: productId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
  }
};


// อัปเดต warehouse ของสินค้า
export const updateProductWarehouse = async (req, res) => {
  try {
    const { productId } = req.params;
    const { warehouse_id } = req.body;

    // ใช้ Model ของ Product อัปเดต warehouse
    const result = await Product.updateWarehouse(productId, warehouse_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "สินค้าไม่พบ" });
    }

    res.json({ success: true, product_id: productId, warehouse_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
