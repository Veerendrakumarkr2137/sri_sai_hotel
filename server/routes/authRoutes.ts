import { Router } from "express";
import {
  registerUser,
  loginUser,
  loginAdmin,
  loginWithGoogle,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/admin/login", loginAdmin);
router.post("/google", loginWithGoogle);

router.get("/me", requireAuth("user"), getCurrentUser);
router.put("/me", requireAuth("user"), updateProfile);
router.post("/change-password", requireAuth("user"), changePassword);

export default router;
