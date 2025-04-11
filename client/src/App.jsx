import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailsPage from './pages/CourseDetailsPage';
import CourseFormPage from './pages/CourseFormPage';
import LectureSchedulePage from './pages/LectureSchedulePage';
import InstructorLecturesPage from './pages/InstructorLecturesPage';
import InstructorManagementPage from './pages/InstructorManagementPage';
import NotFoundPage from './pages/NotFoundPage';
import { getCurrentUser } from './features/auth/authSlice';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, token, status, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  useEffect(() => {
    // If token exists but no user data, fetch user data
    if (token && !user && status !== 'loading') {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user, status]);
  
  // Show loading state while checking authentication
  if ((token && !user) || loading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      
      {/* Auth routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="courses" element={<CourseListPage />} />
        <Route path="courses/new" element={
          <ProtectedRoute requiredRole="admin">
            <CourseFormPage />
          </ProtectedRoute>
        } />
        <Route path="courses/:courseId/edit" element={
          <ProtectedRoute requiredRole="admin">
            <CourseFormPage />
          </ProtectedRoute>
        } />
        <Route path="courses/:courseId" element={<CourseDetailsPage />} />
        <Route path="lectures" element={<InstructorLecturesPage />} />
        <Route path="schedule" element={
          <ProtectedRoute requiredRole="admin">
            <LectureSchedulePage />
          </ProtectedRoute>
        } />
        <Route path="instructors" element={
          <ProtectedRoute requiredRole="admin">
            <InstructorManagementPage />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Not found route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App; 