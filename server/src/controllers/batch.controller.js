import { Course } from "../models/course.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Add a batch to a course
const addBatchToCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { name, startDate, endDate } = req.body;

  if (!name || !startDate || !endDate) {
    throw new ApiError(400, "Name, start date, and end date are required");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Validate dates
  const parsedStartDate = new Date(startDate);
  const parsedEndDate = new Date(endDate);

  if (parsedStartDate >= parsedEndDate) {
    throw new ApiError(400, "End date must be after start date");
  }

  // Add new batch
  course.batches.push({
    name,
    startDate: parsedStartDate,
    endDate: parsedEndDate,
  });

  await course.save();

  return res.status(200).json(
    new ApiResponse(200, course, "Batch added successfully")
  );
});

// Get all batches for a course
const getBatchesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res.status(200).json(
    new ApiResponse(200, course.batches, "Batches fetched successfully")
  );
});

// Get a single batch
const getBatchById = asyncHandler(async (req, res) => {
  const { courseId, batchId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const batch = course.batches.id(batchId);
  if (!batch) {
    throw new ApiError(404, "Batch not found");
  }

  return res.status(200).json(
    new ApiResponse(200, batch, "Batch fetched successfully")
  );
});

export {
  addBatchToCourse,
  getBatchesByCourse,
  getBatchById,
}; 