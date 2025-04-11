import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import courseReducer from '../features/courses/courseSlice';
import lectureReducer from '../features/lectures/lectureSlice';
import instructorReducer from '../features/instructors/instructorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    lectures: lectureReducer,
    instructors: instructorReducer,
  },
  devTools: import.meta.env.DEV,
}); 