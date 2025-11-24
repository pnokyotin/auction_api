// controllers/warehouseControllers.js
import { Warehouse } from "../models/Warehouse.js";

export const listWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.findAll();
    res.json({ success: true, warehouses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const { warehouse_name, location } = req.body;
    if (!warehouse_name) return res.status(400).json({ success: false, message: "warehouse_name is required" });

    const insertId = await Warehouse.create({ warehouse_name, location });
    res.status(201).json({ success: true, warehouse_id: insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ success: false, message: "Warehouse not found" });
    res.json({ success: true, warehouse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const affectedRows = await Warehouse.update(req.params.id, req.body);
    if (!affectedRows) return res.status(404).json({ success: false, message: "Warehouse not found or nothing to update" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const affectedRows = await Warehouse.delete(req.params.id);
    if (!affectedRows) return res.status(404).json({ success: false, message: "Warehouse not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
