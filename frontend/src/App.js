import React from 'react';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import SewadarList from './pages/SewadarList';
import SewadarForm from './pages/SewadarForm';
import UserManagement from './pages/UserManagement';
import AuditLogs from './pages/AuditLogs';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import EditSewadar from './pages/EditSewadar';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              },
              success: {
                iconTheme: {
                  primary: 'var(--color-success)',
                  secondary: 'white',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--color-error)',
                  secondary: 'white',
                },
              },
            }}
          />

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Default redirect to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard - All authenticated users */}
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Sewadar Management - All authenticated users can view */}
              <Route path="sewadars" element={<SewadarList />} />
              
              {/* ADD NEW SEWADAR - Uses SewadarForm */}
              <Route path="sewadars/new" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
                  <SewadarForm />
                </ProtectedRoute>
              } />
              
              {/* EDIT EXISTING SEWADAR - Uses EditSewadar */}
              <Route path="sewadars/:id/edit" element={
                <ProtectedRoute requiredRoles={['ADMIN', 'EDITOR']}>
                  <EditSewadar />
                </ProtectedRoute>
              } />
              
              {/* Admin Panel - Admin only */}
              <Route path="admin" element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              
              {/* User Management - Admin only */}
              <Route path="users" element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              
              {/* Audit Logs - Admin only */}
              <Route path="audit" element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <AuditLogs />
                </ProtectedRoute>
              } />
              
              {/* Profile - All authenticated users */}
              <Route path="profile" element={<Profile />} />
              
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
