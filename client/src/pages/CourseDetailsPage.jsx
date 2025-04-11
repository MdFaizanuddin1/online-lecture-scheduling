import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiArrowLeft, HiCalendar, HiClock, HiUserGroup, HiPencil, HiTrash } from 'react-icons/hi';
import { fetchCourseById, deleteCourse, clearCurrentCourse } from '../features/courses/courseSlice';
import { fetchLecturesByCourse } from '../features/lectures/lectureSlice';

const CourseDetailsPage = () => {
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentCourse, loading: courseLoading } = useSelector((state) => state.courses);
  const { lectures, loading: lecturesLoading } = useSelector((state) => state.lectures);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseById(courseId));
      dispatch(fetchLecturesByCourse(courseId));
    }
    
    // Clear current course when component unmounts
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, courseId]);

  const handleDeleteCourse = async () => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      await dispatch(deleteCourse(courseId));
      navigate('/courses');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateString) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (courseLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentCourse) {
    return (
      <div className="card bg-white p-8 text-center">
        <p className="text-text-light">Course not found or an error occurred.</p>
        <Link to="/courses" className="btn btn-primary mt-4">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back button and actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <Link to="/courses" className="flex items-center text-primary hover:text-secondary transition-colors">
          <HiArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Courses</span>
        </Link>
        
        {isAdmin && (
          <div className="flex space-x-3 mt-3 sm:mt-0">
            <Link 
              to={`/courses/${courseId}/edit`}
              className="btn btn-outline"
            >
              <HiPencil className="h-5 w-5 mr-1" />
              Edit Course
            </Link>
            <button 
              onClick={handleDeleteCourse}
              className="btn btn-error"
            >
              <HiTrash className="h-5 w-5 mr-1" />
              Delete
            </button>
          </div>
        )}
      </div>
      
      {/* Course header */}
      <div className="card bg-white overflow-hidden mb-6">
        <div className="relative">
          {currentCourse.thumbnail ? (
            <img 
              src={currentCourse.thumbnail} 
              alt={currentCourse.name} 
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
              <span className="text-text-light">No thumbnail available</span>
            </div>
          )}
          <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 text-sm font-semibold text-primary">
            {currentCourse.level.charAt(0).toUpperCase() + currentCourse.level.slice(1)} Level
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text">{currentCourse.name}</h1>
              <p className="text-lg text-primary font-medium mt-1">{currentCourse.code}</p>
            </div>
            
            {isAdmin && currentCourse.createdBy && (
              <div className="mt-4 md:mt-0 text-right">
                <p className="text-sm text-text-light">Created by</p>
                <p className="text-text font-medium">{currentCourse.createdBy.name}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-border">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-light hover:text-text hover:border-border'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('lectures')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lectures'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-light hover:text-text hover:border-border'
              }`}
            >
              Lectures
            </button>
            {currentCourse.batches && currentCourse.batches.length > 0 && (
              <button
                onClick={() => setActiveTab('batches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'batches'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-light hover:text-text hover:border-border'
                }`}
              >
                Batches
              </button>
            )}
          </nav>
        </div>
      </div>
      
      {/* Tab content */}
      <div className="card bg-white p-6">
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-xl font-bold text-text mb-4">Course Description</h2>
            <p className="text-text-light whitespace-pre-line">
              {currentCourse.description || 'No description available for this course.'}
            </p>
            
            {/* Course statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="flex items-center">
                <div className="rounded-full bg-primary/10 p-3 mr-4">
                  <HiCalendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-text-light text-sm">Total Lectures</p>
                  <p className="text-xl font-bold text-text">{lectures.length}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="rounded-full bg-secondary/10 p-3 mr-4">
                  <HiUserGroup className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-text-light text-sm">Batches</p>
                  <p className="text-xl font-bold text-text">
                    {currentCourse.batches ? currentCourse.batches.length : 0}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="rounded-full bg-accent/10 p-3 mr-4">
                  <HiClock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-text-light text-sm">Created On</p>
                  <p className="text-xl font-bold text-text">
                    {formatDate(currentCourse.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'lectures' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-xl font-bold text-text">Scheduled Lectures</h2>
              
              {isAdmin && (
                <Link 
                  to="/schedule" 
                  state={{ preselectedCourse: courseId }}
                  className="btn btn-primary mt-2 sm:mt-0"
                >
                  <HiCalendar className="h-5 w-5 mr-1" />
                  Schedule New Lecture
                </Link>
              )}
            </div>
            
            {lecturesLoading ? (
              <div className="flex justify-center my-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : lectures.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Lecture Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Instructor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Date & Time
                      </th>
                      {isAdmin && (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {lectures.map((lecture) => (
                      <tr key={lecture._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text">{lecture.title}</div>
                          {lecture.description && (
                            <div className="text-xs text-text-light mt-1 line-clamp-1">{lecture.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text">{lecture.instructor?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-text">{formatDateTime(lecture.startTime)}</div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Link 
                                to={`/lectures/${lecture._id}/edit`}
                                className="p-1.5 bg-blue-50 rounded-full text-primary hover:bg-blue-100"
                              >
                                <HiPencil className="h-4 w-4" />
                              </Link>
                              <button 
                                className="p-1.5 bg-red-50 rounded-full text-error hover:bg-red-100"
                              >
                                <HiTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-light text-center py-4">
                No lectures have been scheduled for this course yet.
              </p>
            )}
          </div>
        )}
        
        {activeTab === 'batches' && currentCourse.batches && (
          <div>
            <h2 className="text-xl font-bold text-text mb-4">Course Batches</h2>
            
            {currentCourse.batches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCourse.batches.map((batch, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h3 className="text-lg font-medium text-text">{batch.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="text-text-light">Start Date:</span>{' '}
                        <span className="text-text">{formatDate(batch.startDate)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-text-light">End Date:</span>{' '}
                        <span className="text-text">{formatDate(batch.endDate)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-light">No batches have been added to this course yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailsPage; 