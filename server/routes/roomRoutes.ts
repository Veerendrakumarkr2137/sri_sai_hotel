import { Router } from "express";
import { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } from "../controllers/roomController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getRooms);
router.get("/:id", getRoomById);

// Admin only routes
router.post("/", requireAuth("admin"), createRoom);
router.put("/:id", requireAuth("admin"), updateRoom);
router.delete("/:id", requireAuth("admin"), deleteRoom);

export default router;
