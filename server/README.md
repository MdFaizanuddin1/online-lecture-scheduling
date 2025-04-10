# Online Lecture Scheduling System API

This is the backend API for an online lecture scheduling system built with the MERN stack. The system allows administrators to add courses, schedule lectures, and assign them to instructors, while ensuring no scheduling conflicts occur.

## Features

- User authentication and authorization with JWT
- Role-based access control (admin and instructor roles)
- Course management with thumbnails using Cloudinary
- Optional batch management for courses
- Lecture scheduling with conflict prevention
- Instructor panel to view assigned lectures
- Admin panel for complete system management

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login a user
- `POST /api/v1/auth/logout` - Logout the current user

### Courses

- `GET /api/v1/courses` - Get all courses
- `GET /api/v1/courses/:courseId` - Get a specific course
- `POST /api/v1/courses` - Create a new course (admin only)
- `PUT /api/v1/courses/:courseId` - Update a course (admin only)
- `DELETE /api/v1/courses/:courseId` - Delete a course (admin only)

### Batches

- `GET /api/v1/batches/course/:courseId` - Get all batches for a course
- `GET /api/v1/batches/course/:courseId/batch/:batchId` - Get a specific batch
- `POST /api/v1/batches/course/:courseId` - Add a batch to a course (admin only)
- `PUT /api/v1/batches/course/:courseId/batch/:batchId` - Update a batch (admin only)
- `DELETE /api/v1/batches/course/:courseId/batch/:batchId` - Delete a batch (admin only)

### Lectures

- `GET /api/v1/lectures` - Get all lectures
- `GET /api/v1/lectures/my-lectures` - Get lectures for the logged-in instructor
- `GET /api/v1/lectures/instructor/:instructorId` - Get lectures for a specific instructor
- `POST /api/v1/lectures` - Create a new lecture (admin only)
- `PUT /api/v1/lectures/:lectureId` - Update a lecture (admin only)
- `DELETE /api/v1/lectures/:lectureId` - Delete a lecture (admin only)

## Scheduling Conflict Prevention

The system prevents scheduling conflicts by ensuring that no instructor can be assigned more than one lecture on the same day. When creating or updating a lecture, the system checks for any existing lectures assigned to the same instructor on the same date.

## Course Thumbnails

Courses can have thumbnail images. The system uses Cloudinary for image storage. When creating or updating a course, you can upload a thumbnail image, which will be stored in Cloudinary and the URL will be saved in the database.

## Course Batches

Courses can optionally have batches. Each batch has a name, start date, end date, and capacity. Batches can be added, updated, or removed from a course.

## Setup Instructions

1. Clone the repository
2. Install dependencies with `npm install`
3. Configure environment variables in `.env` file
4. Run the development server with `npm run dev`

## Environment Variables

```
PORT=8001
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_jwt_secret
ACCESS_TOKEN_EXPIRY=1d
CORS_ORIGIN=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Testing the API

Use the included `test-api.http` file to test the API endpoints. You can use tools like VSCode's REST Client extension or Postman to execute these requests. 