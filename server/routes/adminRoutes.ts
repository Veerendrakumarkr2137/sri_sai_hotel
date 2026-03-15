import { Router } from "express";
import { getDashboardStats, getAllUsers } from "../controllers/adminController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/stats", requireAuth("admin"), getDashboardStats);
router.get("/users", requireAuth("admin"), getAllUsers);

export default router;
