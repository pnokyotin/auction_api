import express from "express";
import { loginEmployee } from "../controllers/employeeController.js";

const router = express.Router();

router.post("/login", loginEmployee);

export default router;
