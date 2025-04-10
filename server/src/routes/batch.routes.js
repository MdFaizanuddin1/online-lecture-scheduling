import { Router } from "express";
import { 
  addBatchToCourse,
  getBatchesByCourse,
  getBatchById,
} from "../controllers/batch.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Get all batches for a course
router.get("/course/:courseId", getBatchesByCourse);

// Get a single batch
router.get("/course/:courseId/batch/:batchId", getBatchById);

// Admin-only routes
router.post("/course/:courseId", authorizeRoles("admin"), addBatchToCourse);

export default router; 