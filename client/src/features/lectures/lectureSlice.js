import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// Async thunks for lectures
export const fetchLectures = createAsyncThunk(
  'lectures/fetchLectures',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/lectures');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch lectures';
      return rejectWithValue(message);
    }
  }
);

export const fetchMyLectures = createAsyncThunk(
  'lectures/fetchMyLectures',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/lectures/my-lectures');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your lectures';
      return rejectWithValue(message);
    }
  }
);

export const fetchLecturesByInstructor = createAsyncThunk(
  'lectures/fetchLecturesByInstructor',
  async (instructorId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lectures/instructor/${instructorId}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch instructor lectures';
      return rejectWithValue(message);
    }
  }
);

export const fetchLecturesByCourse = createAsyncThunk(
  'lectures/fetchLecturesByCourse',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/lectures/course/${courseId}`);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch course lectures';
      return rejectWithValue(message);
    }
  }
);

export const createLecture = createAsyncThunk(
  'lectures/createLecture',
  async (lectureData, { rejectWithValue }) => {
    try {
      const response = await api.post('/lectures', lectureData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create lecture';
      return rejectWithValue(message);
    }
  }
);

export const updateLecture = createAsyncThunk(
  'lectures/updateLecture',
  async ({ lectureId, lectureData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/lectures/${lectureId}`, lectureData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update lecture';
      return rejectWithValue(message);
    }
  }
);

export const deleteLecture = createAsyncThunk(
  'lectures/deleteLecture',
  async (lectureId, { rejectWithValue }) => {
    try {
      await api.delete(`/lectures/${lectureId}`);
      return lectureId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete lecture';
      return rejectWithValue(message);
    }
  }
);

const lectureSlice = createSlice({
  name: 'lectures',
  initialState: {
    lectures: [],
    myLectures: [],
    status: 'idle',
    error: null,
    loading: false,
  },
  reducers: {
    resetLectureState: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all lectures
      .addCase(fetchLectures.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchLectures.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.lectures = action.payload;
      })
      .addCase(fetchLectures.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch my lectures
      .addCase(fetchMyLectures.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchMyLectures.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.myLectures = action.payload;
      })
      .addCase(fetchMyLectures.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch lectures by instructor
      .addCase(fetchLecturesByInstructor.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchLecturesByInstructor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        // For admin view, we store in main lectures array
        state.lectures = action.payload;
      })
      .addCase(fetchLecturesByInstructor.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Fetch lectures by course
      .addCase(fetchLecturesByCourse.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchLecturesByCourse.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.lectures = action.payload;
      })
      .addCase(fetchLecturesByCourse.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Create lecture
      .addCase(createLecture.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(createLecture.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.lectures.push(action.payload);
        toast.success('Lecture scheduled successfully');
      })
      .addCase(createLecture.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update lecture
      .addCase(updateLecture.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(updateLecture.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        
        // Update in lectures array
        const index = state.lectures.findIndex(lecture => lecture._id === action.payload._id);
        if (index !== -1) {
          state.lectures[index] = action.payload;
        }
        
        // Update in myLectures array if present
        const myIndex = state.myLectures.findIndex(lecture => lecture._id === action.payload._id);
        if (myIndex !== -1) {
          state.myLectures[myIndex] = action.payload;
        }
        
        toast.success('Lecture updated successfully');
      })
      .addCase(updateLecture.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Delete lecture
      .addCase(deleteLecture.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(deleteLecture.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        
        // Remove from both arrays
        state.lectures = state.lectures.filter(lecture => lecture._id !== action.payload);
        state.myLectures = state.myLectures.filter(lecture => lecture._id !== action.payload);
        
        toast.success('Lecture deleted successfully');
      })
      .addCase(deleteLecture.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { resetLectureState } = lectureSlice.actions;
export default lectureSlice.reducer; 