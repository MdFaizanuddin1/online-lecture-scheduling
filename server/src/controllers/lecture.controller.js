import { Lecture } from "../models/lecture.model.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Check for scheduling conflicts on the same day
const checkScheduleConflict = async (instructorId, startTime,  excludeLectureId = null) => {
  // Convert input times to Date objects if they aren't already
  const start = new Date(startTime);
  
  // Extract just the date portion (without time) for the start date
  const dateToCheck = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  
  // Create date for the next day (to use in range query)
  const nextDay = new Date(dateToCheck);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Find any lectures for this instructor on the same day
  const query = {
    instructor: instructorId,
    // Find lectures where startTime is on the same day (>= start of day, < start of next day)
    startTime: { 
      $gte: dateToCheck,
      $lt: nextDay
    }
  };

  // Exclude current lecture when updating
  if (excludeLectureId) {
    query._id = { $ne: excludeLectureId };
  }

  const conflictingLecture = await Lecture.findOne(query);
  return conflictingLecture;
};

// Create a new lecture
const createLecture = asyncHandler(async (req, res) => {
  const { courseId, instructorId, title, description, startTime } = req.body;

  if (!courseId || !instructorId || !title || !startTime ) {
    throw new ApiError(400, "Required fields missing");
  }

  // Validate course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  // Validate instructor exists and has instructor role
  const instructor = await User.findOne({ _id: instructorId, role: "instructor" });
  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  // Convert string dates to Date objects
  const parsedStartTime = new Date(startTime);

  // Check for scheduling conflicts
  const conflict = await checkScheduleConflict(instructorId, parsedStartTime);
  if (conflict) {
    throw new ApiError(409, "Scheduling conflict - instructor already has a lecture on this date");
  }

  const lecture = await Lecture.create({
    course: courseId,
    instructor: instructorId,
    title,
    description,
    startTime: parsedStartTime,
    createdBy: req.user._id
  });

  const populatedLecture = await Lecture.findById(lecture._id)
    .populate("course", "name code")
    .populate("instructor", "name email")
    .populate("createdBy", "name");

  return res.status(201).json(
    new ApiResponse(201, populatedLecture, "Lecture scheduled successfully")
  );
});

// Get all lectures
const getAllLectures = asyncHandler(async (req, res) => {
  const lectures = await Lecture.find()
    .populate("course", "name code")
    .populate("instructor", "name email")
    .populate("createdBy", "name")
    .sort({ startTime: 1 });

  return res.status(200).json(
    new ApiResponse(200, lectures, "Lectures fetched successfully")
  );
});
// Get lectures by course
const getLecturesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const lectures = await Lecture.find({ course: courseId })
    .populate("course", "name code description")
    .populate("instructor", "name email")
    .sort({ startTime: 1 });

  if (!lectures.length) {
    throw new ApiError(404, "No lectures found for this course");
  }

  return res.status(200).json(
    new ApiResponse(200, lectures, "Course lectures fetched successfully")
  );
});


// Get lectures by instructor
const getLecturesByInstructor = asyncHandler(async (req, res) => {
  const { instructorId } = req.params;

  const lectures = await Lecture.find({ instructor: instructorId })
    .populate("course", "name code description")
    .populate("instructor", "name email")
    .sort({ startTime: 1 });

  return res.status(200).json(
    new ApiResponse(200, lectures, "Instructor lectures fetched successfully")
  );
});

// Get lectures for current instructor (for instructor panel)
const getMyLectures = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const lectures = await Lecture.find({ instructor: instructorId })
    .populate("course", "name code description")
    .sort({ startTime: 1 });

  return res.status(200).json(
    new ApiResponse(200, lectures, "Your lectures fetched successfully")
  );
});

export {
  createLecture,
  getAllLectures,
  getLecturesByInstructor,
  getMyLectures,
  getLecturesByCourse,
}; 