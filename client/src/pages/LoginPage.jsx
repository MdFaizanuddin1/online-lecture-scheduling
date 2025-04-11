import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, resetAuthState } from '../features/auth/authSlice';
import { HiExclamationCircle } from 'react-icons/hi';

// Debounce time in milliseconds
const FORM_DEBOUNCE_TIME = 1000;

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debounceTimerId, setDebounceTimerId] = useState(null);
  
  const { loading, error, status } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Clear error when component unmounts or when form changes
  useEffect(() => {
    return () => {
      dispatch(resetAuthState());
      if (debounceTimerId) {
        clearTimeout(debounceTimerId);
      }
    };
  }, [dispatch, debounceTimerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear errors when user starts typing
    if (error) {
      dispatch(resetAuthState());
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || loading) {
      return;
    }
    
    // Set submitting state to true
    setIsSubmitting(true);
    
    // Reset any previous auth errors
    dispatch(resetAuthState());
    
    // Dispatch login action
    const resultAction = await dispatch(loginUser(formData));
    
    // Redirect on success only
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/dashboard');
    } else {
      // After error, use debounce before allowing another submission
      const timerId = setTimeout(() => {
        setIsSubmitting(false);
      }, FORM_DEBOUNCE_TIME);
      
      setDebounceTimerId(timerId);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-text">Sign in to your account</h2>
        <p className="mt-2 text-sm text-text-light">
          Or{' '}
          <Link to="/register" className="font-medium text-primary hover:text-secondary">
            register if you don't have an account
          </Link>
        </p>
      </div>
      
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-error p-4 rounded-md">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <HiExclamationCircle className="h-5 w-5 text-error" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-error">Authentication failed</h3>
                  <p className="mt-1 text-sm text-error">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${error ? 'border-error focus:border-error focus:ring-error' : ''}`}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${error ? 'border-error focus:border-error focus:ring-error' : ''}`}
              placeholder="Enter your password"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className={`w-full btn ${error ? 'btn-error' : 'btn-primary'} py-2`}
            >
              {loading ? 'Signing in...' : 
               isSubmitting && !error ? 'Processing...' : 
               error ? 'Try Again' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage; 