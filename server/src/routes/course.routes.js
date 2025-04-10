import { Router } from "express";
import { 
  createCourse, 
  getAllCourses, 
  getCourseById,
  deleteCourse 
} from "../controllers/course.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Public routes for both admin and instructors
router.get("/", getAllCourses);
router.get("/:courseId", getCourseById);

// Admin-only routes
router.post("/", 
  authorizeRoles("admin"), 
  upload.single("thumbnail"),
  createCourse
);

router.delete("/:courseId", authorizeRoles("admin"), deleteCourse);

export default router; 