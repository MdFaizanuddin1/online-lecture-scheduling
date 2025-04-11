import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiCalendar, HiClock, HiAcademicCap, HiInformationCircle } from 'react-icons/hi';
import { fetchMyLectures } from '../features/lectures/lectureSlice';

const InstructorLecturesPage = () => {
  const dispatch = useDispatch();
  const { myLectures, loading } = useSelector((state) => state.lectures);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'past', 'all'
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    dispatch(fetchMyLectures());
  }, [dispatch]);

  // Format date for display
  const formatDate = (dateString) => {
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

  // Format date for date input
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Filter lectures based on selected filter and date
  const filteredLectures = myLectures.filter(lecture => {
    const lectureDate = new Date(lecture.startTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Filter by date if selected
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      
      // Check if lecture date matches selected date (ignoring time)
      const lectureDateString = formatDateForInput(lectureDate);
      const selectedDateString = formatDateForInput(selectedDateObj);
      
      if (lectureDateString !== selectedDateString) {
        return false;
      }
    }
    
    // Filter based on upcoming/past
    if (filter === 'upcoming') {
      return lectureDate >= today;
    } else if (filter === 'past') {
      return lectureDate < today;
    }
    
    // 'all' filter
    return true;
  }).sort((a, b) => {
    const dateA = new Date(a.startTime);
    const dateB = new Date(b.startTime);
    
    // For upcoming lectures, sort by earliest first
    if (filter === 'upcoming') {
      return dateA - dateB;
    }
    
    // For past lectures, sort by most recent first
    return dateB - dateA;
  });

  // Group lectures by date
  const groupedLectures = filteredLectures.reduce((groups, lecture) => {
    const date = new Date(lecture.startTime).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(lecture);
    return groups;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text">My Lectures</h1>
        <p className="text-text-light">View all lectures assigned to you</p>
      </div>
      
      {/* Filters */}
      <div className="card bg-white mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex space-x-4">
            <button 
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'upcoming' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-text-light hover:bg-gray-200'
              }`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'past' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-text-light hover:bg-gray-200'
              }`}
            >
              Past
            </button>
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-100 text-text-light hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
          
          {/* <div className="w-full md:w-48">
            <div className="relative">
              <input
                type="date"
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              {selectedDate && (
                <button 
                  onClick={() => setSelectedDate('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-text-light hover:text-error"
                >
                  &times;
                </button>
              )}
            </div>
          </div> */}
        </div>
      </div>
      
      {/* Lectures List */}
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredLectures.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedLectures).map(([date, lectures]) => (
            <div key={date} className="card bg-white overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-border">
                {/* <h3 className="text-lg font-bold text-text">
                  {new Date(date).toLocaleDateString(undefined, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3> */}
              </div>
              
              <div className="divide-y divide-border">
                {lectures.map((lecture) => (
                  <div key={lecture._id} className="p-6 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="rounded-full bg-primary/10 p-3 mr-4">
                              <HiClock className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-text">{lecture.title}</h4>
                            
                            <div className="flex items-center mt-1 text-sm">
                              <HiCalendar className="h-4 w-4 text-text-light mr-1" />
                              <span className="text-text-light">
                                {formatDate(lecture.startTime)}
                              </span>
                            </div>
                            
                            <div className="flex items-center mt-1 text-sm">
                              <HiAcademicCap className="h-4 w-4 text-text-light mr-1" />
                              <Link 
                                to={`/courses/${lecture.course?._id}`} 
                                className="text-primary hover:text-secondary"
                              >
                                {lecture.course?.name || 'Unknown Course'} ({lecture.course?.code || 'N/A'})
                              </Link>
                            </div>
                            
                            {lecture.description && (
                              <p className="mt-2 text-text-light text-sm">
                                <span className='text-md'>Lecture Details:</span> {lecture.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-4">
                        {/* <button 
                          className="btn btn-outline text-sm"
                          onClick={() => window.alert('This functionality is not implemented yet')}
                        >
                          <HiInformationCircle className="h-4 w-4 mr-1" />
                          View Details
                        </button> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-white p-8 text-center">
          <HiCalendar className="h-12 w-12 text-text-light mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text mb-2">No lectures found</h3>
          <p className="text-text-light">
            {selectedDate 
              ? `No lectures found for the selected date. Try selecting a different date or removing the filter.`
              : filter === 'upcoming'
                ? 'You don\'t have any upcoming lectures.'
                : filter === 'past'
                  ? 'You don\'t have any past lectures.'
                  : 'You don\'t have any lectures assigned to you yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InstructorLecturesPage; 