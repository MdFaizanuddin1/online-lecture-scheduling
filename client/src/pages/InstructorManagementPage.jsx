import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { HiUserAdd, HiPencil, HiUser, HiX, HiOutlineMail } from 'react-icons/hi';
import { fetchInstructors, createInstructor, updateInstructor, setCurrentInstructor, resetInstructorState } from '../features/instructors/instructorSlice';
import { toast } from 'react-hot-toast';

const InstructorManagementPage = () => {
  const dispatch = useDispatch();
  const { instructors, loading, currentInstructor } = useSelector((state) => state.instructors);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Load instructors on component mount
  useEffect(() => {
    dispatch(fetchInstructors());
  }, [dispatch]);
  
  // When currentInstructor changes, populate edit form
  useEffect(() => {
    if (currentInstructor) {
      setEditFormData({
        name: currentInstructor.name || '',
        email: currentInstructor.email || '',
      });
      setShowEditForm(true);
    } else {
      setShowEditForm(false);
      setEditFormData({
        name: '',
        email: '',
      });
    }
  }, [currentInstructor]);
  
  // Handle create form changes
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({
      ...createFormData,
      [name]: value,
    });
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  // Validate create form
  const validateCreateForm = () => {
    const errors = {};
    
    if (!createFormData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!createFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(createFormData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!createFormData.password) {
      errors.password = 'Password is required';
    } else if (createFormData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    
    if (!editFormData.name.trim()) {
      errors.editName = 'Name is required';
    }
    
    if (!editFormData.email.trim()) {
      errors.editEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(editFormData.email)) {
      errors.editEmail = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle create instructor submission
  const handleCreateInstructor = async (e) => {
    e.preventDefault();
    
    if (!validateCreateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    try {
      await dispatch(createInstructor(createFormData)).unwrap();
      setCreateFormData({
        name: '',
        email: '',
        password: '',
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create instructor:', error);
    }
  };
  
  // Handle edit instructor submission
  const handleUpdateInstructor = async (e) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    
    try {
      await dispatch(updateInstructor({
        instructorId: currentInstructor._id,
        data: editFormData,
      })).unwrap();
      cancelEdit();
    } catch (error) {
      console.error('Failed to update instructor:', error);
    }
  };
  
  // Start editing an instructor
  const startEdit = (instructor) => {
    dispatch(setCurrentInstructor(instructor));
  };
  
  // Cancel editing
  const cancelEdit = () => {
    dispatch(resetInstructorState());
    setShowEditForm(false);
  };
  
  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text">Manage Instructors</h1>
          <p className="text-text-light">
            View, add, and edit instructors
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary mt-3 sm:mt-0"
        >
          <HiUserAdd className="h-5 w-5 mr-1" />
          Add Instructor
        </button>
      </div>
      
      {/* Create Instructor Form */}
      {showCreateForm && (
        <div className="card bg-white mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text">Create New Instructor</h2>
            <button 
              className="text-text-light hover:text-text"
              onClick={() => setShowCreateForm(false)}
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleCreateInstructor} className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={createFormData.name}
                onChange={handleCreateFormChange}
                className={`form-input ${formErrors.name ? 'border-error' : ''}`}
                placeholder="Enter instructor's full name"
              />
              {formErrors.name && <p className="form-error">{formErrors.name}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={createFormData.email}
                onChange={handleCreateFormChange}
                className={`form-input ${formErrors.email ? 'border-error' : ''}`}
                placeholder="Enter instructor's email address"
              />
              {formErrors.email && <p className="form-error">{formErrors.email}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={createFormData.password}
                onChange={handleCreateFormChange}
                className={`form-input ${formErrors.password ? 'border-error' : ''}`}
                placeholder="Enter a secure password"
              />
              {formErrors.password && <p className="form-error">{formErrors.password}</p>}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-outline mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Instructor'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Edit Instructor Form */}
      {showEditForm && currentInstructor && (
        <div className="card bg-white mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-text">Edit Instructor</h2>
            <button 
              className="text-text-light hover:text-text"
              onClick={cancelEdit}
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleUpdateInstructor} className="space-y-4">
            <div className="form-group">
              <label htmlFor="editName" className="form-label">Name</label>
              <input
                type="text"
                id="editName"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                className={`form-input ${formErrors.editName ? 'border-error' : ''}`}
                placeholder="Enter instructor's full name"
              />
              {formErrors.editName && <p className="form-error">{formErrors.editName}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="editEmail" className="form-label">Email</label>
              <input
                type="email"
                id="editEmail"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                className={`form-input ${formErrors.editEmail ? 'border-error' : ''}`}
                placeholder="Enter instructor's email address"
              />
              {formErrors.editEmail && <p className="form-error">{formErrors.editEmail}</p>}
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={cancelEdit}
                className="btn btn-outline mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Instructor'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Instructors List */}
      <div className="card bg-white">
        <h2 className="text-xl font-bold text-text mb-4">Instructors</h2>
        
        {loading && !instructors.length ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : instructors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {instructors.map((instructor) => (
                  <tr key={instructor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <HiUser className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-text">{instructor.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-text-light">
                        <HiOutlineMail className="h-4 w-4 mr-1" />
                        {instructor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => startEdit(instructor)}
                        className="text-primary hover:text-secondary transition-colors"
                      >
                        <HiPencil className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-text-light">No instructors found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorManagementPage; 