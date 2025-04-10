import { Router } from "express";
import { 
  createLecture, 
  getAllLectures, 
  getLecturesByInstructor, 
  getMyLectures,
  getLecturesByCourse
} from "../controllers/lecture.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Routes for both admin and instructors
router.get("/", getAllLectures);
router.get("/my-lectures", getMyLectures);
router.get("/instructor/:instructorId", getLecturesByInstructor);
router.get("/course/:courseId", getLecturesByCourse);
// Admin-only routes
router.post("/", authorizeRoles("admin"), createLecture);

export default router;