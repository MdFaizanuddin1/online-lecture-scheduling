import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiAcademicCap, HiCalendar, HiUserGroup, HiClock } from 'react-icons/hi';

const HomePage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const features = [
    {
      title: 'Course Management',
      description: 'Easily add, edit, and organize courses with detailed information and optional batches.',
      icon: <HiAcademicCap className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Conflict-Free Scheduling',
      description: 'Schedule lectures with intelligent conflict detection to prevent overlapping instructor assignments.',
      icon: <HiCalendar className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Role-Based Access',
      description: 'Separate admin and instructor panels with appropriate permissions and views.',
      icon: <HiUserGroup className="h-8 w-8 text-primary" />,
    },
    {
      title: 'Real-time Updates',
      description: 'View your lecture schedule in real-time with instant updates when changes are made.',
      icon: <HiClock className="h-8 w-8 text-primary" />,
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary to-secondary py-20 px-4 sm:px-6 lg:px-8 rounded-lg text-white mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">
            Online Lecture Scheduling System
          </h1>
          <p className="mt-6 text-xl max-w-2xl mx-auto">
            A modern platform for organizing courses, scheduling lectures, and managing instructor assignments without conflicts.
          </p>
          <div className="mt-10">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn bg-white text-primary hover:bg-gray-100 shadow-md px-8 py-3 text-base font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/login"
                  className="btn bg-white text-primary hover:bg-gray-100 shadow-md px-8 py-3 text-base font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn bg-accent text-white hover:bg-blue-600 shadow-md px-8 py-3 text-base font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-text sm:text-4xl">
              Key Features
            </h2>
            <p className="mt-4 text-lg text-text-light">
              Everything you need to manage your lecture scheduling efficiently.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col items-center">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-medium text-text mb-2">{feature.title}</h3>
                  <p className="text-text-light text-center">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 rounded-lg my-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-text">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-text-light">
            Join today and streamline your lecture scheduling process.
          </p>
          <div className="mt-8">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/schedule' : '/lectures'}
                className="btn btn-primary px-8 py-3 text-base font-medium"
              >
                {user?.role === 'admin' ? 'Schedule Lectures' : 'View My Lectures'}
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn btn-primary px-8 py-3 text-base font-medium"
              >
                Create an Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 