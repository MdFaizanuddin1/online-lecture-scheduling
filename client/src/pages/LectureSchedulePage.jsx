import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiCalendar, HiClock, HiAcademicCap, HiUser } from 'react-icons/hi';
import { fetchCourses } from '../features/courses/courseSlice';
import { createLecture } from '../features/lectures/lectureSlice';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const LectureSchedulePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, loading: coursesLoading } = useSelector((state) => state.courses);
  const { loading: lectureLoading } = useSelector((state) => state.lectures);
  const { user } = useSelector((state) => state.auth);
  
  // Get preselected course from location state if available
  const preselectedCourseId = location.state?.preselectedCourse || '';
  
  const [instructors, setInstructors] = useState([]);
  const [formData, setFormData] = useState({
    courseId: preselectedCourseId,
    instructorId: '',
    title: '',
    description: '',
    startTime: getTomorrowDate(),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Helper function to get tomorrow's date formatted for the date input
  function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Default to 9 AM
    return tomorrow.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
  }
  
  useEffect(() => {
    dispatch(fetchCourses());
    
    // Fetch instructors when component mounts
    const fetchInstructors = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/instructors');
        setInstructors(response.data.data || []);
      } catch (error) {
        console.error('Error fetching instructors:', error);
        toast.error('Failed to load instructors. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInstructors();
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when it changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.courseId) {
      newErrors.courseId = 'Please select a course';
    }
    
    if (!formData.instructorId) {
      newErrors.instructorId = 'Please select an instructor';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    } else {
      const startDate = new Date(formData.startTime);
      const now = new Date();
      
      if (startDate <= now) {
        newErrors.startTime = 'Start time must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    try {
      const resultAction = await dispatch(createLecture(formData));
      
      if (createLecture.fulfilled.match(resultAction)) {
        toast.success('Lecture scheduled successfully');
        
        // Navigate back to course details if we came from there
        if (preselectedCourseId) {
          navigate(`/courses/${preselectedCourseId}`);
        } else {
          // Reset form
          setFormData({
            courseId: '',
            instructorId: '',
            title: '',
            description: '',
            startTime: getTomorrowDate(),
          });
        }
      }
    } catch (error) {
      console.error('Error creating lecture:', error);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">Schedule a New Lecture</h1>
        <p className="text-text-light">
          Create a new lecture and assign it to an instructor
        </p>
      </div>
      
      <div className="card bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <div className="form-group">
            <label htmlFor="courseId" className="form-label flex items-center">
              <HiAcademicCap className="h-5 w-5 mr-1 text-primary" />
              Select Course
            </label>
            <select
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className={`form-select ${errors.courseId ? 'border-error' : ''}`}
              disabled={coursesLoading}
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.code})
                </option>
              ))}
            </select>
            {errors.courseId && <p className="form-error">{errors.courseId}</p>}
          </div>
          
          {/* Instructor Selection */}
          <div className="form-group">
            <label htmlFor="instructorId" className="form-label flex items-center">
              <HiUser className="h-5 w-5 mr-1 text-primary" />
              Assign Instructor
            </label>
            <select
              id="instructorId"
              name="instructorId"
              value={formData.instructorId}
              onChange={handleChange}
              className={`form-select ${errors.instructorId ? 'border-error' : ''}`}
              disabled={loading}
            >
              <option value="">Select an instructor</option>
              {instructors.map((instructor) => (
                <option key={instructor._id} value={instructor._id}>
                  {instructor.name} ({instructor.email})
                </option>
              ))}
            </select>
            {errors.instructorId && <p className="form-error">{errors.instructorId}</p>}
          </div>
          
          {/* Lecture Title */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Lecture Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className={`form-input ${errors.title ? 'border-error' : ''}`}
              placeholder="Enter the lecture title"
            />
            {errors.title && <p className="form-error">{errors.title}</p>}
          </div>
          
          {/* Lecture Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input h-24"
              placeholder="Enter a description for the lecture"
            />
          </div>
          
          {/* Lecture Date and Time */}
          <div className="form-group">
            <label htmlFor="startTime" className="form-label flex items-center">
              <HiCalendar className="h-5 w-5 mr-1 text-primary" />
              Date and Time
            </label>
            <input
              id="startTime"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleChange}
              className={`form-input ${errors.startTime ? 'border-error' : ''}`}
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.startTime && <p className="form-error">{errors.startTime}</p>}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={lectureLoading}
              className="btn btn-primary px-8"
            >
              {lectureLoading ? (
                <>
                  <HiClock className="animate-spin h-5 w-5 mr-2" />
                  Scheduling...
                </>
              ) : (
                <>
                  <HiCalendar className="h-5 w-5 mr-2" />
                  Schedule Lecture
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureSchedulePage; 