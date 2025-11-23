import express from "express";
import productsRoutes from "./products.js";
import customerRoutes from "./customer.js";
import employeeRoutes from "./employee.js";

const router = express.Router();

// map route modules
router.use("/products", productsRoutes);
router.use("/customer", customerRoutes);
router.use("/employee", employeeRoutes);

export default router;
