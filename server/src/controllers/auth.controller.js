import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  // Create user with specified role or default to instructor
  const user = await User.create({
    name,
    email,
    password,
    role: role || "instructor"
  });

  const createdUser = await User.findById(user._id).select("-password");

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const accessToken = user.generateAccessToken();

  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  
  return res.status(200).json(
    new ApiResponse(200, user, "User details fetched successfully")
  );
});

const getAllInstructors = asyncHandler (async(req,res)=>{
    const instructors = await User.find({role:"instructor"})
    if(!instructors) throw new ApiError(500, "No instructors found")

    return res.status(200).json(new ApiResponse(200, instructors, "All instructors fetched successfully"))
})
const createInstructor = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const instructor = await User.create({
    name,
    email,
    password,
    role: "instructor"
  });

  const createdInstructor = await User.findById(instructor._id).select("-password");

  if (!createdInstructor) {
    throw new ApiError(500, "Something went wrong while registering the instructor");
  }

  return res.status(201).json(
    new ApiResponse(201, createdInstructor, "Instructor created successfully")
  );
});

const updateInstructor = asyncHandler(async (req, res) => {
  const { instructorId } = req.params;
  const { name, email } = req.body;

  if (!name && !email) {
    throw new ApiError(400, "At least one field is required for update");
  }

  const instructor = await User.findOne({ _id: instructorId, role: "instructor" });

  if (!instructor) {
    throw new ApiError(404, "Instructor not found");
  }

  if (email && email !== instructor.email) {
    // Check if new email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new ApiError(409, "Email already in use");
    }
    instructor.email = email;
  }

  if (name) {
    instructor.name = name;
  }

  const updatedInstructor = await instructor.save();

  return res.status(200).json(
    new ApiResponse(
      200, 
      await User.findById(updatedInstructor._id).select("-password"),
      "Instructor updated successfully"
    )
  );
});

export { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser,
  getAllInstructors, 
  createInstructor, 
  updateInstructor 
}; 