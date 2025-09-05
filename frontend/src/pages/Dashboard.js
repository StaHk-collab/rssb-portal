import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import exportService from '../services/export';

const Dashboard = () => {
  const { user } = useAuth();

  const [exporting, setExporting] = useState(false);

  const handleExportSewadars = async () => {
    try {
      setExporting(true); // Add loading state
      await exportService.exportSewadars();
      toast.success('Sewadars exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(error.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
  <div className="space-y-6 animate-fade-in">
    
    {/* Welcome Section */}
    <div className="glass-card p-6 bg-gradient-to-r from-red-50 to-blue-50">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName}! 🙏
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your sewadar management today.
          </p>
        </div>
        {/* Keep desktop buttons here */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/sewadars/new" className="btn btn-primary">
            <UserPlus className="h-4 w-4" />
            Add Sewadar
          </Link>
          <button 
            onClick={handleExportSewadars}
            disabled={exporting}
            className="btn btn-outline"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile buttons - positioned below welcome box */}
    <div className="md:hidden -mt-3 mx-6">
      <div className="flex flex-col gap-3">
        <Link 
          to="/sewadars/new" 
          className="btn btn-primary flex items-center justify-center py-3"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Sewadar
        </Link>
        <button 
          onClick={handleExportSewadars}
          disabled={exporting}
          className="btn btn-outline flex items-center justify-center py-3"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </button>
      </div>
    </div>

  </div>
);
};

export default Dashboard;
