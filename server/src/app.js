import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
const app = express();

// console.log("origin is", process.env.CORS_ORIGIN);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files
app.use("/public", express.static(path.join(process.cwd(), "public")));

app.use(cookieParser());

// import routes
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import courseRouter from "./routes/course.routes.js";
import lectureRouter from "./routes/lecture.routes.js";
import batchRouter from "./routes/batch.routes.js";

import { ApiError } from "./utils/apiError.js";

// routes
// healthCheck route
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/lectures", lectureRouter);
app.use("/api/v1/batches", batchRouter);

app.use((err, req, res, next) => {
  console.error(err.stack); // Log for debugging

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      // stack: process.env.NODE_ENV === "development" ?err.stack : undefined
      stack: err.stack,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export { app };
