import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserPlus } from 'lucide-react';
import api from '../services/api'; // ✅ CRITICAL: Import your axios instance

const SewadarForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      console.log('📝 Submitting sewadar data:', data); // Debug log
      
      const response = await api.post('/sewadars', {
        firstName: data.firstName,
        lastName: data.lastName,
        age: parseInt(data.age),
        verificationType: data.verificationType,
        verificationId: data.verificationId,
        naamdanComplete: Boolean(data.naamdanComplete),
        naamdanId: data.naamdanId || null,
        badgeId: data.badgeId || null
      });

      console.log('✅ Sewadar created successfully:', response.data); // Debug log

      toast.success('Sewadar added successfully!', {
        position: "top-right",
        autoClose: 3000
      });
      
      // Reset form
      reset();
      
      // Navigate to sewadars list
      setTimeout(() => {
        navigate('/sewadars');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Submission error:', error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to add Sewadar';
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserPlus className="h-6 w-6" />
              Add New Sewadar
            </h1>
            <p className="text-gray-600 mt-1">Enter sewadar details</p>
          </div>
          <button
            onClick={() => navigate('/sewadars')}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <input
                  {...register('firstName', { required: 'First name is required' })}
                  className={`form-input ${errors.firstName ? 'error' : ''}`}
                  placeholder="First Name"
                  disabled={isSubmitting}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">Last Name *</label>
                <input
                  {...register('lastName', { required: 'Last name is required' })}
                  className={`form-input ${errors.lastName ? 'error' : ''}`}
                  placeholder="Last Name"
                  disabled={isSubmitting}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="form-label">Age *</label>
              <input
                {...register('age', { 
                  required: 'Age is required',
                  min: { value: 1, message: 'Age must be positive' },
                  max: { value: 120, message: 'Age must be realistic' }
                })}
                type="number"
                className={`form-input ${errors.age ? 'error' : ''}`}
                placeholder="Age"
                disabled={isSubmitting}
              />
              {errors.age && (
                <p className="text-red-600 text-sm mt-1">{errors.age.message}</p>
              )}
            </div>
          </div>

          {/* Verification Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Verification Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Verification Type *</label>
                <select
                  {...register('verificationType', { required: 'Verification type is required' })}
                  className={`form-input ${errors.verificationType ? 'error' : ''}`}
                  disabled={isSubmitting}
                >
                  <option value="">Select Type</option>
                  <option value="AADHAR">Aadhar Card</option>
                  <option value="PAN">PAN Card</option>
                  <option value="VOTER_ID">Voter ID</option>
                  <option value="PASSPORT">Passport</option>
                </select>
                {errors.verificationType && (
                  <p className="text-red-600 text-sm mt-1">{errors.verificationType.message}</p>
                )}
              </div>
              
              <div>
                <label className="form-label">Verification ID *</label>
                <input
                  {...register('verificationId', { required: 'Verification ID is required' })}
                  className={`form-input ${errors.verificationId ? 'error' : ''}`}
                  placeholder="Verification ID"
                  disabled={isSubmitting}
                />
                {errors.verificationId && (
                  <p className="text-red-600 text-sm mt-1">{errors.verificationId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Naamdan Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Naamdan Information</h3>
            
            <div className="flex items-center gap-2">
              <input
                {...register('naamdanComplete')}
                type="checkbox"
                id="naamdanComplete"
                className="rounded border-gray-300"
                disabled={isSubmitting}
              />
              <label htmlFor="naamdanComplete" className="text-sm font-medium text-gray-700">
                Naamdan Complete
              </label>
            </div>
            
            <div>
              <label className="form-label">Naamdan ID</label>
              <input
                {...register('naamdanId')}
                className="form-input"
                placeholder="Naamdan ID"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Badge Id */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge ID
            </label>
            <input
              {...register('badgeId')}
              type="text"
              className="form-input w-full"
              placeholder="Badge ID"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Sewadar
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={() => reset()}
              disabled={isSubmitting}
              className="btn btn-outline"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default SewadarForm;
