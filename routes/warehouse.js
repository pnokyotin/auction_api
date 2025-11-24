// routes/warehouse.js
import express from "express";
import {
  listWarehouses,
  createWarehouse,
  getWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "../controllers/warehouseControllers.js";

const router = express.Router();

router.get("/", listWarehouses);          // GET /api/warehouses
router.post("/", createWarehouse);        // POST /api/warehouses
router.get("/:id", getWarehouse);         // GET /api/warehouses/:id
router.put("/:id", updateWarehouse);      // PUT /api/warehouses/:id
router.delete("/:id", deleteWarehouse);   // DELETE /api/warehouses/:id

export default router;
