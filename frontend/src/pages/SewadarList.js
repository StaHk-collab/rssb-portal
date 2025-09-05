import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Download, Edit3, Trash2,
  CheckCircle, Clock, User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import sewadarService from '../services/sewadar';
import { semanticColors, colorUtils } from '../styles/colors';
import toast from 'react-hot-toast';
import exportService from '../services/export';

const SewadarList = () => {
  const { canEdit, isAdmin } = useAuth();
  const [sewadars, setSewadars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  // --- key fix: split searchInput for input, and filters.search for actual filter ---
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    naamdanStatus: '',
    verificationType: '',
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, sewadar: null });

  const [exporting, setExporting] = useState(false);

  // Debounce effect using useEffect (keeps input always focused)
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput,
      }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const loadSewadars = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sewadarService.getSewadars({
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      });

      setSewadars(response.data);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      }));
    } catch (error) {
      toast.error('Failed to load sewadars');
      console.error('Load sewadars error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  useEffect(() => {
    loadSewadars();
  }, [loadSewadars]);

  const handleDelete = async (sewadarId) => {
    try {
      await sewadarService.deleteSewadar(sewadarId);
      toast.success('Sewadar deleted successfully');
      loadSewadars();
      setDeleteModal({ show: false, sewadar: null });
    } catch (error) {
      toast.error('Failed to delete sewadar');
      console.error('Delete error:', error);
    }
  };

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

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <User style={{ color: semanticColors.primary.main }} className="h-6 w-6 sm:h-8 sm:w-8" />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Sewadar Management</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage volunteer records and information</p>
            </div>
          </div>
          {canEdit() && (
            <Link
              to="/sewadars/new"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: semanticColors.primary.main }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Sewadar
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <select
            value={filters.naamdanStatus}
            onChange={(e) => handleFilterChange('naamdanStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">All Naamdan Status</option>
            <option value="true">Complete</option>
            <option value="false">Pending</option>
          </select>
          <select
            value={filters.verificationType}
            onChange={(e) => handleFilterChange('verificationType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            <option value="">All Verification Types</option>
            <option value="AADHAR">Aadhar Card</option>
            <option value="PAN">PAN Card</option>
            <option value="VOTER_ID">Voter ID</option>
            <option value="PASSPORT">Passport</option>
          </select>
          <button
            onClick={handleExportSewadars}
            disabled={exporting}
            className="btn btn-outline flex items-center justify-center gap-2 w-full"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sewadars List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badge ID
                  </th>
                  <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  {canEdit() && (
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sewadars.map((sewadar) => (
                  <tr key={sewadar.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <div
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm"
                            style={{ backgroundColor: semanticColors.primary.main }}
                          >
                            {sewadar.firstName?.charAt(0)}{sewadar.lastName?.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {sewadar.firstName} {sewadar.lastName}
                          </div>
                          <div className="sm:hidden text-xs text-gray-500">Age: {sewadar.age || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sewadar.age || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor: colorUtils.withOpacity(colorUtils.getVerificationColor(sewadar.verificationType), 0.1),
                          color: colorUtils.getVerificationColor(sewadar.verificationType)
                        }}
                      >
                        {sewadar.verificationType}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        sewadar.naamdanStatus
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {sewadar.naamdanStatus ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sewadar.badgeId || 'N/A'}
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sewadar.createdAt).toLocaleDateString()}
                    </td>
                    {canEdit() && (
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/sewadars/${sewadar.id}/edit`}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            style={{ 
                              touchAction: 'manipulation',
                              WebkitTapHighlightColor: 'transparent'
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          {isAdmin() && (
                            <button
                              onClick={() => setDeleteModal({ show: true, sewadar })}
                              className="text-red-600 hover:text-red-900 p-1"
                              style={{ 
                                touchAction: 'manipulation',
                                WebkitTapHighlightColor: 'transparent'
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      } ${page === 1 ? 'rounded-l-md' : ''} ${
                        page === pagination.totalPages ? 'rounded-r-md' : ''
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.sewadar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delete Sewadar
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-medium">
                {deleteModal.sewadar.firstName} {deleteModal.sewadar.lastName}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ show: false, sewadar: null })}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModal.sewadar.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SewadarList;
