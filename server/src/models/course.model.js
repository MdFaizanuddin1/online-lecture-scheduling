import mongoose from "mongoose";

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  level:{
    type:String,
    default:"easy",
    enum:["easy","medium","hard"]
  },
  thumbnail: {
    type: String, // URL to the thumbnail image
    trim: true,
    required:true
  },
  batches: {
    type: [batchSchema],
    default: []
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });

// Validate end date is after start date for batches
courseSchema.path('batches').validate(function(batches) {
  if (!batches.length) return true; // No batches to validate
  
  return batches.every(batch => 
    new Date(batch.startDate) < new Date(batch.endDate)
  );
}, 'End date must be after start date for each batch');

export const Course = mongoose.model("Course", courseSchema); 