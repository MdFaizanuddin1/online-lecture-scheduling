import { Router } from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  getAllInstructors, 
  createInstructor, 
  updateInstructor 
} from "../controllers/auth.controller.js";
import { authorizeRoles, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.get("/me", verifyJWT, getCurrentUser);
router.get("/instructors", verifyJWT, authorizeRoles("admin"), getAllInstructors);
router.post("/instructors", verifyJWT, authorizeRoles("admin"), createInstructor);
router.put("/instructors/:instructorId", verifyJWT, authorizeRoles("admin"), updateInstructor);

export default router; 