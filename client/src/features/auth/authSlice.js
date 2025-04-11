import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Save token to localStorage only on success
      if (response.data && response.data.data && response.data.data.accessToken) {
        localStorage.setItem('token', response.data.data.accessToken);
      }
      
      return response.data.data;
    } catch (error) {
      // Get specific error message from response if available
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status (4xx, 5xx)
        if (error.response.status === 401) {
          errorMessage = error.response.data?.message || 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.response.status === 404) {
          errorMessage = 'User not found. Please check your email address.';
        } else if (error.response.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your internet connection and try again.';
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      return null;
    } catch (error) {
      const message = error.response?.data?.message || 'Logout failed';
      return rejectWithValue(message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data.data;
    } catch (error) {
      // If we get an error, the token might be invalid
      localStorage.removeItem('token');
      const message = error.response?.data?.message || 'Failed to fetch user profile';
      return rejectWithValue(message);
    }
  }
);

// Check if user is already logged in
const getInitialState = () => {
  const token = localStorage.getItem('token');
  return {
    user: null,
    token,
    isAuthenticated: !!token,
    status: token ? 'loading' : 'idle', // Set initial status to loading if token exists
    error: null,
    loading: token ? true : false, // Start with loading if token exists
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    resetAuthState: (state) => {
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        toast.success('Login successful');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'succeeded';
        state.loading = false;
        toast.success('Registration successful. Please login.');
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })
      
      // Logout cases
      .addCase(logoutUser.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = 'idle';
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        toast.success('Logged out successfully');
      })
      .addCase(logoutUser.rejected, (state, action) => {
        // Even if logout fails on the server, we clear the local state
        state.status = 'idle';
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        toast.error(action.payload);
      })
      
      // Get current user cases
      .addCase(getCurrentUser.pending, (state) => {
        state.status = 'loading';
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        // If getting the user fails, we clear the auth state
        state.status = 'idle';
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer; 