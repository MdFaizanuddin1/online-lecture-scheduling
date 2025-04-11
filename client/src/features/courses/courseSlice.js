import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// Async thunks for courses
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/courses');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch courses';
      return rejectWithValue(message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch course';
      return rejectWithValue(message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      // For file uploads, we need to use FormData
      const formData = new FormData();
      
      // Add basic course fields
      formData.append('name', courseData.name);
      formData.append('code', courseData.code);
      formData.append('description', courseData.description);
      formData.append('level', courseData.level);
      
      // Add thumbnail if exists
      if (courseData.thumbnail) {
        formData.append('thumbnail', courseData.thumbnail);
      }
      
      // Add batches if exists, convert to JSON string
      if (courseData.batches && courseData.batches.length > 0) {
        formData.append('batches', JSON.stringify(courseData.batches));
      }
      
      const response = await api.post('/courses', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create course';
      return rejectWithValue(message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async (courseData, { rejectWithValue }) => {
    try {
      const { id, ...data } = courseData;
      
      const formData = new FormData();
      
      // Add fields to formData
      Object.keys(data).forEach(key => {
        if (key === 'thumbnail' && data[key] instanceof File) {
          formData.append('thumbnail', data[key]);
        } else if (key === 'batches' && Array.isArray(data[key])) {
          formData.append('batches', JSON.stringify(data[key]));
        } else if (data[key] !== undefined) {
          formData.append(key, data[key]);
        }
      });
      
      const response = await api.put(`/courses/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update course';
      return rejectWithValue(message);
    }
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      await api.delete(`/courses/${courseId}`);
      return courseId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete course';
      return rejectWithValue(message);
    }
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState: {
    courses: [],
    currentCourse: null,
    status: 'idle',
    error: null,
    loading: false,
  },
  reducers: {
    resetCourseState: (state) => {
      state.status = 'idle';
      state.error = null;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all courses
      .addCase(fetchCourses.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.courses.push(action.payload);
        toast.success('Course created successfully');
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(updateCourse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        
        // Update in courses array
        const index = state.courses.findIndex(course => course._id === action.payload._id);
        if (index !== -1) {
          state.courses[index] = action.payload;
        }
        
        // Update current course if it's the one being edited
        if (state.currentCourse && state.currentCourse._id === action.payload._id) {
          state.currentCourse = action.payload;
        }
        
        toast.success('Course updated successfully');
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete course
      .addCase(deleteCourse.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(deleteCourse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.courses = state.courses.filter(course => course._id !== action.payload);
        
        // Clear current course if it's the one being deleted
        if (state.currentCourse && state.currentCourse._id === action.payload) {
          state.currentCourse = null;
        }
        
        toast.success('Course deleted successfully');
      })
      .addCase(deleteCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { resetCourseState, clearCurrentCourse } = courseSlice.actions;
export default courseSlice.reducer; 