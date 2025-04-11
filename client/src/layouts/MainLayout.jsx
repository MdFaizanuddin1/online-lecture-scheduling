import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiOutlineMenu, HiX, HiOutlineLogout } from 'react-icons/hi';
import { logoutUser, getCurrentUser } from '../features/auth/authSlice';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch current user if token exists but user data doesn't
  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user]);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-primary text-xl font-bold">
                  Lecture Scheduler
                </Link>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link to="/" className="border-transparent text-text-light hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </Link>
                {isAuthenticated && (
                  <>
                    <Link to="/dashboard" className="border-transparent text-text-light hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link to="/courses" className="border-transparent text-text-light hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Courses
                    </Link>
                    {user?.role === 'instructor' && (
                      <Link to="/lectures" className="border-transparent text-text-light hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        My Lectures
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/schedule" className="border-transparent text-text-light hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        Schedule Lectures
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link to="/instructors" className="border-transparent text-text-light hover:border-primary hover:text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        Instructors
                      </Link>
                    )}
                  </>
                )}
              </nav>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* <span className="text-text-light">
                    {user?.name} ({user?.role})
                  </span> */}
                  <button
                    onClick={handleLogout}
                    className="text-text-light hover:text-primary flex items-center space-x-1"
                  >
                    <HiOutlineLogout className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="btn btn-outline text-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary text-sm">
                    Register
                  </Link>
                </div>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-text-light hover:text-primary hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <HiX className="block h-6 w-6" />
                ) : (
                  <HiOutlineMenu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link to="/" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text-light hover:bg-gray-50 hover:border-primary hover:text-primary">
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/dashboard" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text-light hover:bg-gray-50 hover:border-primary hover:text-primary">
                    Dashboard
                  </Link>
                  <Link to="/courses" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text-light hover:bg-gray-50 hover:border-primary hover:text-primary">
                    Courses
                  </Link>
                  {user?.role === 'instructor' && (
                    <Link to="/lectures" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text-light hover:bg-gray-50 hover:border-primary hover:text-primary">
                      My Lectures
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/schedule" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text-light hover:bg-gray-50 hover:border-primary hover:text-primary">
                      Schedule Lectures
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <Link to="/instructors" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-text-light hover:bg-gray-50 hover:border-primary hover:text-primary">
                      Instructors
                    </Link>
                  )}
                </>
              )}
            </div>
            <div className="pt-4 pb-3 border-t border-border">
              {isAuthenticated ? (
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-text">{user?.name}</div>
                    <div className="text-sm font-medium text-text-light">{user?.email}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-auto bg-white flex-shrink-0 p-1 rounded-full text-text-light hover:text-primary focus:outline-none"
                  >
                    <HiOutlineLogout className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 px-4">
                  <Link to="/login" className="btn btn-outline text-sm w-full">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary text-sm w-full">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-sm mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-text-light">
            &copy; {new Date().getFullYear()} Online Lecture Scheduling System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout; 