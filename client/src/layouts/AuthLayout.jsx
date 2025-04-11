import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const AuthLayout = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex flex-col min-h-screen">
        <header className="bg-white shadow-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <Link to="/" className="text-primary text-xl font-bold">
                Lecture Scheduler
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white shadow-sm mt-auto py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-text-light">
              &copy; {new Date().getFullYear()} Online Lecture Scheduling System. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthLayout; 