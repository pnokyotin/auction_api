// routes/roomRoutes.js
import express from "express";
import {
  listRooms,
  createRoom,
  getRoom,
  updateRoom,
  deleteRoom
} from "../controllers/roomController.js";

const router = express.Router();

router.get("/", listRooms);          // GET /api/rooms
router.post("/", createRoom);        // POST /api/rooms
router.get("/:id", getRoom);         // GET /api/rooms/:id
router.put("/:id", updateRoom);      // PUT /api/rooms/:id
router.delete("/:id", deleteRoom);   // DELETE /api/rooms/:id

export default router;