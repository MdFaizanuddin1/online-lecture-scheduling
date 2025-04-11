import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiPencil, HiTrash, HiPlus, HiSearch } from 'react-icons/hi';
import { fetchCourses, deleteCourse } from '../features/courses/courseSlice';
import { toast } from 'react-hot-toast';

const CourseListPage = () => {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  
  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);
  
  // Log user info for debugging
  useEffect(() => {
    // console.log('Current user:', user);
    // console.log('Is admin:', isAdmin);
  }, [user, isAdmin]);
  
  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      await dispatch(deleteCourse(courseId));
    }
  };
  
  // Filter courses based on search term and level
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = selectedLevel ? course.level === selectedLevel : true;
    
    return matchesSearch && matchesLevel;
  });
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text">Courses</h1>
          <p className="text-text-light">Browse and manage all available courses</p>
        </div>
        
        {user && user.role === 'admin' && (
          <Link to="/courses/new" className="btn btn-primary mt-4 md:mt-0">
            <HiPlus className="h-5 w-5 mr-2" />
            Add New Course
          </Link>
        )}
      </div>
      
      {/* Filters */}
      <div className="card bg-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <HiSearch className="h-5 w-5 text-text-light" />
              </div>
              <input
                type="text"
                placeholder="Search courses by name, code, or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </div>
          
          <div className="w-full md:w-48">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="form-select"
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Course Grid */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="card bg-white hover:shadow-md transition-shadow">
              <div className="relative">
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.name} 
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-text-light">No thumbnail</span>
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 text-xs font-semibold text-primary">
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-text">{course.name}</h3>
                    <p className="text-sm text-primary font-medium">{course.code}</p>
                  </div>
                  
                  {user && user.role === 'admin' && (
                    <div className="flex space-x-2">
                      <Link 
                        to={`/courses/${course._id}/edit`}
                        className="p-1.5 bg-blue-50 rounded-full text-primary hover:bg-blue-100"
                      >
                        <HiPencil className="h-4 w-4" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-1.5 bg-red-50 rounded-full text-error hover:bg-red-100"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <p className="text-text-light mt-2 line-clamp-2">
                  {course.description || 'No description available'}
                </p>
                
                {course.batches && course.batches.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-text-light">Batches: {course.batches.length}</p>
                  </div>
                )}
                
                <Link 
                  to={`/courses/${course._id}`}
                  className="btn btn-outline w-full mt-4 text-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white p-8 text-center">
          <p className="text-text-light">
            {searchTerm || selectedLevel 
              ? 'No courses match your search criteria. Try adjusting your filters.'
              : 'No courses available yet.'}
          </p>
          {user && user.role === 'admin' && (
            <Link to="/courses/new" className="btn btn-primary mt-4">
              Add Your First Course
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseListPage; 