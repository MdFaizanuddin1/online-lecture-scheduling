import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
  },
  startTime: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

// Validate that endTime is after startTime
lectureSchema.pre("validate", function(next) {
  if (this.startTime >= this.endTime) {
    this.invalidate("endTime", "End time must be after start time");
  }
  next();
});

export const Lecture = mongoose.model("Lecture", lectureSchema); 