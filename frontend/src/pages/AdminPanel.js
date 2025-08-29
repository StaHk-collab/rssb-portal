import React, { useState, useEffect } from 'react';
import { Users, Shield, UserCheck, UserX, Edit3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import usersService from '../services/users';
import { semanticColors, colorUtils } from '../styles/colors';
import toast from 'react-hot-toast';

/**
 * Admin Panel Component
 * 
 * Comprehensive admin dashboard for managing users, roles, and system settings.
 * Only accessible to users with ADMIN role.
 */
const AdminPanel = () => {
  const { user, hasRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

    useEffect(() => {
      if (!hasRole(['ADMIN'])) return;
      loadUsers();
    }, [hasRole]);

  // Redirect if not admin
  if (!hasRole(['ADMIN'])) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersService.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await usersService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadUsers();
      setShowRoleModal(false);
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Role update error:', error);
    }
  };

  const handleToggleStatus = async (userId, isActive) => {
    try {
      await usersService.toggleUserStatus(userId, isActive);
      toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      loadUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Status update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield style={{ color: semanticColors.primary.main }} className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Manage users, roles, and system settings</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Welcome back, {user?.firstName}</p>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
            </div>
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {users.length} users
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: colorUtils.getRoleColor(userItem.role) }}
                        >
                          {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.firstName} {userItem.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{userItem.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      style={{ 
                        backgroundColor: colorUtils.withOpacity(colorUtils.getRoleColor(userItem.role), 0.1),
                        color: colorUtils.getRoleColor(userItem.role)
                      }}
                    >
                      {userItem.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      userItem.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(userItem.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(userItem);
                          setShowRoleModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={userItem.id === user.id}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(userItem.id, !userItem.isActive)}
                        className={userItem.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                        disabled={userItem.id === user.id}
                      >
                        {userItem.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Update Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Update Role for {selectedUser.firstName} {selectedUser.lastName}
            </h3>
            <div className="space-y-3">
              {['ADMIN', 'EDITOR', 'VIEWER'].map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleUpdate(selectedUser.id, role)}
                  className={`w-full p-3 text-left rounded-lg border ${
                    selectedUser.role === role
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{role}</div>
                  <div className="text-sm text-gray-500">
                    {role === 'ADMIN' && 'Full system access and user management'}
                    {role === 'EDITOR' && 'Can create, edit, and delete sewadars'}
                    {role === 'VIEWER' && 'Read-only access to sewadar records'}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;