import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { HiArrowLeft, HiSave, HiPlus, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import { fetchCourseById, createCourse, updateCourse, clearCurrentCourse } from '../features/courses/courseSlice';
import { toast } from 'react-hot-toast';

const CourseFormPage = () => {
  const { courseId } = useParams();
  const isEditMode = Boolean(courseId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentCourse, loading } = useSelector((state) => state.courses);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: 'easy',
    thumbnail: null,
    batches: []
  });
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [newBatch, setNewBatch] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });
  const [showBatchForm, setShowBatchForm] = useState(false);
  
  // Load course data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      dispatch(fetchCourseById(courseId));
    } else {
      dispatch(clearCurrentCourse());
    }
    
    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, courseId, isEditMode]);
  
  // Update form when currentCourse changes (for edit mode)
  useEffect(() => {
    if (isEditMode && currentCourse) {
      setFormData({
        name: currentCourse.name || '',
        code: currentCourse.code || '',
        description: currentCourse.description || '',
        level: currentCourse.level || 'easy',
        thumbnail: null, // File input can't be pre-filled
        batches: currentCourse.batches || []
      });
      
      if (currentCourse.thumbnail) {
        setThumbnailPreview(currentCourse.thumbnail);
      }
    }
  }, [currentCourse, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'thumbnail' && files && files[0]) {
      const file = files[0];
      setFormData({ ...formData, thumbnail: file });
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error message when field is modified
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleBatchChange = (e) => {
    const { name, value } = e.target;
    setNewBatch({ ...newBatch, [name]: value });
  };
  
  const addBatch = () => {
    // Validate batch fields
    const batchErrors = {};
    
    if (!newBatch.name.trim()) {
      batchErrors.batchName = 'Batch name is required';
    }
    
    if (!newBatch.startDate) {
      batchErrors.batchStartDate = 'Start date is required';
    }
    
    if (!newBatch.endDate) {
      batchErrors.batchEndDate = 'End date is required';
    } else if (new Date(newBatch.startDate) >= new Date(newBatch.endDate)) {
      batchErrors.batchEndDate = 'End date must be after start date';
    }
    
    if (Object.keys(batchErrors).length > 0) {
      setErrors({ ...errors, ...batchErrors });
      return;
    }
    
    // Add the new batch to form data
    const updatedBatches = [...formData.batches, { ...newBatch }];
    setFormData({ ...formData, batches: updatedBatches });
    
    // Reset the batch form
    setNewBatch({
      name: '',
      startDate: '',
      endDate: ''
    });
    setShowBatchForm(false);
  };
  
  const removeBatch = (index) => {
    const updatedBatches = [...formData.batches];
    updatedBatches.splice(index, 1);
    setFormData({ ...formData, batches: updatedBatches });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Course code is required';
    } else if (!/^[A-Z0-9]+$/.test(formData.code.trim())) {
      newErrors.code = 'Code should contain only uppercase letters and numbers';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!thumbnailPreview && !isEditMode) {
      newErrors.thumbnail = 'Thumbnail is required';
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
      if (isEditMode) {
        await dispatch(updateCourse({
          id: courseId,
          ...formData
        })).unwrap();
        toast.success('Course updated successfully');
      } else {
        await dispatch(createCourse(formData)).unwrap();
        toast.success('Course created successfully');
      }
      navigate('/courses');
    } catch (error) {
      console.error('Course submission failed:', error);
    }
  };
  
  // Show loading spinner while fetching course data in edit mode
  if (isEditMode && loading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Don't render the form if user is not an admin
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/courses" className="flex items-center text-primary hover:text-secondary mr-4">
          <HiArrowLeft className="h-5 w-5 mr-1" />
          <span>Back to Courses</span>
        </Link>
        <h1 className="text-3xl font-bold text-text">
          {isEditMode ? 'Edit Course' : 'Create New Course'}
        </h1>
      </div>
      
      <div className="card bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">Course Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'border-error' : ''}`}
                placeholder="e.g., Introduction to React"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
            
            {/* Course Code */}
            <div className="form-group">
              <label htmlFor="code" className="form-label">Course Code</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`form-input ${errors.code ? 'border-error' : ''}`}
                placeholder="e.g., REACT101"
              />
              {errors.code && <p className="form-error">{errors.code}</p>}
            </div>
          </div>
          
          {/* Course Description */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-input h-32 ${errors.description ? 'border-error' : ''}`}
              placeholder="Provide a detailed description of the course"
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>
          
          {/* Course Level */}
          <div className="form-group">
            <label htmlFor="level" className="form-label">Difficulty Level</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="form-select"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          {/* Thumbnail Upload */}
          <div className="form-group">
            <label htmlFor="thumbnail" className="form-label">Course Thumbnail</label>
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-1">
                <input
                  type="file"
                  id="thumbnail"
                  name="thumbnail"
                  accept="image/*"
                  onChange={handleChange}
                  className={`form-input ${errors.thumbnail ? 'border-error' : ''}`}
                />
                {errors.thumbnail && <p className="form-error">{errors.thumbnail}</p>}
              </div>
              
              {thumbnailPreview && (
                <div className="mt-4 md:mt-0">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-24 w-24 object-cover rounded-md border border-border"
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Batches Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-text">Course Batches</h2>
              <button
                type="button"
                onClick={() => setShowBatchForm(true)}
                className="btn btn-outline-primary text-sm"
              >
                <HiPlus className="h-4 w-4 mr-1" />
                Add Batch
              </button>
            </div>
            
            {/* Batch Form */}
            {showBatchForm && (
              <div className="p-4 border border-border rounded-md mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-text">New Batch</h3>
                  <button
                    type="button"
                    onClick={() => setShowBatchForm(false)}
                    className="text-text-light hover:text-error"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label htmlFor="batchName" className="form-label">Batch Name</label>
                    <input
                      type="text"
                      id="batchName"
                      name="name"
                      value={newBatch.name}
                      onChange={handleBatchChange}
                      className={`form-input ${errors.batchName ? 'border-error' : ''}`}
                      placeholder="e.g., Morning Batch"
                    />
                    {errors.batchName && <p className="form-error">{errors.batchName}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="batchStartDate" className="form-label">Start Date</label>
                    <input
                      type="date"
                      id="batchStartDate"
                      name="startDate"
                      value={newBatch.startDate}
                      onChange={handleBatchChange}
                      className={`form-input ${errors.batchStartDate ? 'border-error' : ''}`}
                    />
                    {errors.batchStartDate && <p className="form-error">{errors.batchStartDate}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="batchEndDate" className="form-label">End Date</label>
                    <input
                      type="date"
                      id="batchEndDate"
                      name="endDate"
                      value={newBatch.endDate}
                      onChange={handleBatchChange}
                      className={`form-input ${errors.batchEndDate ? 'border-error' : ''}`}
                    />
                    {errors.batchEndDate && <p className="form-error">{errors.batchEndDate}</p>}
                  </div>
                </div>
                
                <div className="mt-4 text-right">
                  <button
                    type="button"
                    onClick={addBatch}
                    className="btn btn-primary"
                  >
                    Add Batch
                  </button>
                </div>
              </div>
            )}
            
            {/* Batches List */}
            {formData.batches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Batch Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        Start Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                        End Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {formData.batches.map((batch, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                          {batch.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                          {new Date(batch.startDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                          {new Date(batch.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeBatch(index)}
                            className="text-error hover:text-red-700"
                          >
                            <HiTrash className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-light italic">No batches added yet.</p>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <Link to="/courses" className="btn btn-outline mr-4">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                <span className="flex items-center">
                  {isEditMode ? (
                    <>
                      <HiPencil className="h-5 w-5 mr-1" />
                      Update Course
                    </>
                  ) : (
                    <>
                      <HiSave className="h-5 w-5 mr-1" />
                      Create Course
                    </>
                  )}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormPage; 