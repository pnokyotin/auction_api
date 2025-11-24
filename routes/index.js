// routes/index.js
import express from "express";
import productsRoutes from "./products.js";
import customerRoutes from "./customer.js";
import employeeRoutes from "./employee.js";
import roomRoutes from "./roomRoutes.js";
import warehouseRoutes from "./warehouse.js";

const router = express.Router();

// map route modules
router.use("/products", productsRoutes);
router.use("/customer", customerRoutes);
router.use("/employee", employeeRoutes);
router.use("/rooms", roomRoutes);
router.use("/warehouses", warehouseRoutes);

export default router;
