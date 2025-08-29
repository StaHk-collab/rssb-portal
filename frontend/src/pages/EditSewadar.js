import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import sewadarService from '../services/sewadar';

const EditSewadar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    console.log('EditSewadar mounted with ID:', id); // Debug log
    
    const fetchSewadar = async () => {
      if (!id) {
        toast.error('Invalid sewadar ID');
        navigate('/sewadars');
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching sewadar data...'); // Debug log
        
        const response = await sewadarService.getSewadar(id);
        console.log('API Response:', response); // Debug log
        
        // Handle the response data structure
        const sewadarData = response.data || response;
        
        // Pre-populate form with existing data
        reset({
          firstName: sewadarData.firstName || '',
          lastName: sewadarData.lastName || '',
          age: sewadarData.age || '',
          verificationType: sewadarData.verificationType || '',
          verificationId: sewadarData.verificationId || '',
          naamdanStatus: sewadarData.naamdanStatus || false,
          naamdanId: sewadarData.naamdanId || '',
          badgeId: sewadarData.badgeId || ''
        });
        
      } catch (error) {
        console.error('Error fetching sewadar:', error);
        toast.error(error.message || 'Failed to load sewadar data');
        navigate('/sewadars');
      } finally {
        setLoading(false);
      }
    };

    fetchSewadar();
  }, [id, reset, navigate]);

  const onSubmit = async (data) => {
    try {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        age: parseInt(data.age) || null,
        verificationType: data.verificationType,
        verificationId: data.verificationId,
        naamdanStatus: Boolean(data.naamdanStatus),
        naamdanId: data.naamdanId || null,
        badgeId: data.badgeId || null
      };

      await sewadarService.updateSewadar(id, updateData);
      toast.success('Sewadar updated successfully!');
      navigate('/sewadars');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update sewadar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Loading sewadar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass-card p-8">
        <h1 className="text-2xl font-bold mb-6">Edit Sewadar</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                {...register('firstName', { required: 'First name is required' })}
                type="text"
                className="form-input w-full"
                placeholder="First Name"
              />
              {errors.firstName && (
                <p className="text-red-600 text-sm mt-1">{errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                {...register('lastName', { required: 'Last name is required' })}
                type="text"
                className="form-input w-full"
                placeholder="Last Name"
              />
              {errors.lastName && (
                <p className="text-red-600 text-sm mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              {...register('age')}
              type="number"
              className="form-input w-full"
              placeholder="Age"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Type
              </label>
              <select {...register('verificationType')} className="form-input w-full">
                <option value="">Select Type</option>
                <option value="AADHAR">Aadhar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="VOTER_ID">Voter ID</option>
                <option value="PASSPORT">Passport</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification ID
              </label>
              <input
                {...register('verificationId')}
                type="text"
                className="form-input w-full"
                placeholder="Verification ID"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              {...register('naamdanStatus')}
              type="checkbox"
              id="naamdanStatus"
            />
            <label htmlFor="naamdanStatus" className="text-sm font-medium text-gray-700">
              Naamdan Complete
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naamdan ID
            </label>
            <input
              {...register('naamdanId')}
              type="text"
              className="form-input w-full"
              placeholder="Naamdan ID"
            />
          </div>

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

          <div className="flex items-center gap-4 pt-6">
            <button type="submit" className="btn btn-primary">
              Update Sewadar
            </button>
            <button 
              type="button" 
              onClick={() => navigate('/sewadars')}
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSewadar;
