import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// Get all instructors
export const fetchInstructors = createAsyncThunk(
  'instructors/fetchInstructors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/instructors');
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch instructors';
      return rejectWithValue(message);
    }
  }
);

// Create a new instructor
export const createInstructor = createAsyncThunk(
  'instructors/createInstructor',
  async (instructorData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/instructors', instructorData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create instructor';
      return rejectWithValue(message);
    }
  }
);

// Update an instructor
export const updateInstructor = createAsyncThunk(
  'instructors/updateInstructor',
  async ({ instructorId, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/auth/instructors/${instructorId}`, data);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update instructor';
      return rejectWithValue(message);
    }
  }
);

const initialState = {
  instructors: [],
  currentInstructor: null,
  loading: false,
  error: null,
  status: 'idle',
};

const instructorSlice = createSlice({
  name: 'instructors',
  initialState,
  reducers: {
    resetInstructorState: (state) => {
      state.currentInstructor = null;
      state.error = null;
      state.status = 'idle';
    },
    setCurrentInstructor: (state, action) => {
      state.currentInstructor = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch instructors
      .addCase(fetchInstructors.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.instructors = action.payload;
      })
      .addCase(fetchInstructors.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Create instructor
      .addCase(createInstructor.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(createInstructor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.instructors.push(action.payload);
        toast.success('Instructor created successfully');
      })
      .addCase(createInstructor.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Update instructor
      .addCase(updateInstructor.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(updateInstructor.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.instructors = state.instructors.map(instructor => 
          instructor._id === action.payload._id ? action.payload : instructor
        );
        state.currentInstructor = null;
        toast.success('Instructor updated successfully');
      })
      .addCase(updateInstructor.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { resetInstructorState, setCurrentInstructor } = instructorSlice.actions;
export default instructorSlice.reducer; 