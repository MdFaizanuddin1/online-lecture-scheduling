import { Course } from "../models/course.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// Create a new course
const createCourse = asyncHandler(async (req, res) => {
  const { name, code, description, level, batches } = req.body;

  if (!name || !code || !description || !level) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if course code already exists
  const existingCourse = await Course.findOne({ code });
  if (existingCourse) {
    throw new ApiError(409, "Course with this code already exists");
  }

  // Create course data object
  const courseData = {
    name,
    code,
    description,
    level,
    createdBy: req.user._id
  };

  // Parse and add batches if provided
  if (batches) {
    try {
      const parsedBatches = JSON.parse(batches);
      if (Array.isArray(parsedBatches) && parsedBatches.length > 0) {
        courseData.batches = parsedBatches;
      }
    } catch (error) {
      console.error("Error parsing batches:", error);
    }
  }

  // Handle thumbnail upload
  if (req.file) {
    try {
    //   console.log("File received:", req.file);
      const thumbnailLocalPath = req.file.path;
    //   console.log("Local path:", thumbnailLocalPath);
      
      const uploadResponse = await uploadOnCloudinary(thumbnailLocalPath);
      
      if (uploadResponse) {
        // console.log("Cloudinary response:", uploadResponse);
        courseData.thumbnail = uploadResponse.url;
      } else {
        console.error("Cloudinary upload failed but didn't throw error");
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      // Continue without thumbnail if upload fails
    }
  } else {
    console.log("No file received in request");
  }

  const course = await Course.create(courseData);

  if(!course){
    throw new ApiError(500, 'course creation failed')
  }

  return res.status(201).json(
    new ApiResponse(201, course, "Course created successfully")
  );
});

// Get all courses
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate("createdBy", "name email");

  return res.status(200).json(
    new ApiResponse(200, courses, "Courses fetched successfully")
  );
});

// Get single course
const getCourseById = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId)
    .populate("createdBy", "name email");
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res.status(200).json(
    new ApiResponse(200, course, "Course fetched successfully")
  );
});

// Delete course
const deleteCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Delete thumbnail from cloudinary if exists
  if (course.thumbnail) {
    await deleteFromCloudinary(course.thumbnail);
  }

  await Course.findByIdAndDelete(courseId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Course deleted successfully")
  );
});

// Update course
const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { name, code, description, level, batches } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Prepare update data
  const updateData = {};
  
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (level) updateData.level = level;
  
  // Check if code is being changed and is unique
  if (code && code !== course.code) {
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      throw new ApiError(409, "Course with this code already exists");
    }
    updateData.code = code;
  }

  // Process batches if provided
  if (batches) {
    try {
      const parsedBatches = JSON.parse(batches);
      if (Array.isArray(parsedBatches)) {
        updateData.batches = parsedBatches;
      }
    } catch (error) {
      console.error("Error parsing batches:", error);
    }
  }

  // Handle thumbnail upload
  if (req.file) {
    try {
      const thumbnailLocalPath = req.file.path;
      const uploadResponse = await uploadOnCloudinary(thumbnailLocalPath);
      
      if (uploadResponse) {
        // Delete old thumbnail if exists
        if (course.thumbnail) {
          await deleteFromCloudinary(course.thumbnail);
        }
        updateData.thumbnail = uploadResponse.url;
      }
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
    }
  }

  // Update the course
  const updatedCourse = await Course.findByIdAndUpdate(
    courseId, 
    updateData, 
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedCourse, "Course updated successfully")
  );
});

export {
  createCourse,
  getAllCourses,
  getCourseById,
  deleteCourse,
  updateCourse
}; 
