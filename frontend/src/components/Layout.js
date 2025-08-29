import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      <div className="flex flex-1">
        {/* Sidebar - Fixed positioning */}
        <div className="fixed inset-y-0 left-0 z-50 w-64">
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={closeSidebar}
            currentPath={location.pathname}
          />
        </div>

        {/* Main content area - Properly offset from sidebar */}
        <div className="pl-0 lg:pl-64 flex flex-col flex-1 min-h-screen">
          {/* Header */}
          <Header 
            onMenuClick={toggleSidebar}
            user={user}
          />

          {/* Page content */}
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      {/* Footer - Now properly at bottom */}
      <footer className="pl-0 lg:pl-64 glass-card border-0 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">RS</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">RSSB Sewadar Portal</p>
                <p className="text-sm text-gray-500">Seva • Simran • Satsang</p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6 text-sm text-gray-600">
              <p>© {new Date().getFullYear()} RSSB Berhampur Centre</p>
              <div className="flex gap-6">
                <a href="/privacy" className="hover:text-red-600 transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-red-600 transition-colors">Terms</a>
                <a href="/support" className="hover:text-red-600 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
