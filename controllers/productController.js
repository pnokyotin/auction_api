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
