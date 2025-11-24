// controllers/roomController.js
import { Room } from "../models/roomModel.js";

export const listRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll();
    res.json({ success: true, rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createRoom = async (req, res) => {
  try {
    const { room_name, description } = req.body;
    if (!room_name) return res.status(400).json({ success: false, message: "room_name is required" });

    const insertId = await Room.create({ room_name, description });
    res.status(201).json({ success: true, room_id: insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true, room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const affectedRows = await Room.update(req.params.id, req.body);
    if (!affectedRows) return res.status(404).json({ success: false, message: "Room not found or nothing to update" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const affectedRows = await Room.delete(req.params.id);
    if (!affectedRows) return res.status(404).json({ success: false, message: "Room not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
