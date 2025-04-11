import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  HiAcademicCap, 
  HiCalendar, 
  HiClock, 
  HiViewList, 
  HiPlus, 
  HiUserGroup 
} from 'react-icons/hi';
import { fetchCourses } from '../features/courses/courseSlice';
import { fetchLectures, fetchMyLectures } from '../features/lectures/lectureSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { courses } = useSelector((state) => state.courses);
  const { lectures, myLectures } = useSelector((state) => state.lectures);
  
  const isAdmin = user?.role === 'admin';
  
  useEffect(() => {
    dispatch(fetchCourses());
    
    if (isAdmin) {
      dispatch(fetchLectures());
    } else {
      dispatch(fetchMyLectures());
    }
  }, [dispatch, isAdmin]);
  
  // Calculate some stats for the dashboard
  const totalCourses = courses.length;
  const totalLectures = isAdmin ? lectures.length : myLectures.length;
  
  // Get upcoming lectures (next 7 days)
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);
  
  const upcomingLectures = (isAdmin ? lectures : myLectures)
    .filter(lecture => {
      const lectureDate = new Date(lecture.startTime);
      return lectureDate >= now && lectureDate <= nextWeek;
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 5); // Show max 5 upcoming lectures
  
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">
          Welcome, {user?.name}!
        </h1>
        <p className="text-text-light">
          {isAdmin 
            ? 'Manage courses and schedule lectures from your admin dashboard.' 
            : 'View your upcoming lectures and course details.'}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="card bg-white flex items-center">
          <div className="rounded-full bg-primary/10 p-3 mr-4">
            <HiAcademicCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-text-light text-sm">Total Courses</p>
            <p className="text-2xl font-bold text-text">{totalCourses}</p>
          </div>
        </div>
        
        <div className="card bg-white flex items-center">
          <div className="rounded-full bg-secondary/10 p-3 mr-4">
            <HiCalendar className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <p className="text-text-light text-sm">
              {isAdmin ? 'Total Lectures' : 'My Lectures'}
            </p>
            <p className="text-2xl font-bold text-text">{totalLectures}</p>
          </div>
        </div>
        
        <div className="card bg-white flex items-center">
          <div className="rounded-full bg-accent/10 p-3 mr-4">
            <HiClock className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-text-light text-sm">Upcoming Lectures</p>
            <p className="text-2xl font-bold text-text">{upcomingLectures.length}</p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="card bg-white flex items-center">
            <div className="rounded-full bg-success/10 p-3 mr-4">
              <HiUserGroup className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-text-light text-sm">Role</p>
              <p className="text-xl font-bold text-text">Administrator</p>
            </div>
          </div>
        )}
        
        {!isAdmin && (
          <div className="card bg-white flex items-center">
            <div className="rounded-full bg-success/10 p-3 mr-4">
              <HiUserGroup className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-text-light text-sm">Role</p>
              <p className="text-xl font-bold text-text">Instructor</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {isAdmin && (
          <>
            <Link to="/courses" className="card bg-white hover:shadow-md transition-shadow flex flex-col items-center p-8">
              <HiViewList className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">Manage Courses</h3>
              <p className="text-text-light text-center">View, edit, and delete existing courses</p>
            </Link>
            <Link to="/schedule" className="card bg-white hover:shadow-md transition-shadow flex flex-col items-center p-8">
              <HiCalendar className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">Schedule Lectures</h3>
              <p className="text-text-light text-center">Create and manage lecture schedules</p>
            </Link>
            {/* <Link to="/courses" className="card bg-white hover:shadow-md transition-shadow flex flex-col items-center p-8">
              <HiPlus className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">Add New Course</h3>
              <p className="text-text-light text-center">Create a new course in the system</p>
              </Link> */}
            <Link to="/instructors" className="card bg-white hover:shadow-md transition-shadow flex flex-col items-center p-8">
              <HiUserGroup className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">Manage Instructors</h3>
              <p className="text-text-light text-center">Add, edit, and view instructors</p>
            </Link>
          </>
        )}
        
        {!isAdmin && (
          <>
            <Link to="/lectures" className="card bg-white hover:shadow-md transition-shadow flex flex-col items-center p-8">
              <HiCalendar className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">My Lectures</h3>
              <p className="text-text-light text-center">View all lectures assigned to you</p>
            </Link>
            <Link to="/courses" className="card bg-white hover:shadow-md transition-shadow flex flex-col items-center p-8">
              <HiAcademicCap className="h-12 w-12 text-secondary mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">Browse Courses</h3>
              <p className="text-text-light text-center">Explore all available courses</p>
            </Link>
            <Link to="/lectures" className="card bg-white hover:shadow-md transition-shadow flex flex-col items-center p-8">
              <HiClock className="h-12 w-12 text-accent mb-4" />
              <h3 className="text-lg font-medium text-text mb-2">Upcoming Schedule</h3>
              <p className="text-text-light text-center">Check your upcoming lecture schedule</p>
            </Link>
          
          </>
        )}
      </div>
      
      {/* Upcoming Lectures */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text mb-4">Upcoming Lectures</h2>
        
        {upcomingLectures.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Course
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Title
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                      Instructor
                    </th>
                  )}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Date & Time
                  </th>
                  {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Location
                  </th> */}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {upcomingLectures.map((lecture) => (
                  <tr key={lecture._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">{lecture.course?.name || 'N/A'}</div>
                      <div className="text-xs text-text-light">{lecture.course?.code || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">{lecture.title}</div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-text">{lecture.instructor?.name || 'N/A'}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">{formatDate(lecture.startTime)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-text">{lecture.location}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card bg-white p-8 text-center">
            <p className="text-text-light">No upcoming lectures in the next 7 days.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;