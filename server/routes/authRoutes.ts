import { Router } from "express";
import { registerUser, loginUser, loginAdmin } from "../controllers/authController";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);

export default router;
