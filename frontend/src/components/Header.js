import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Menu,
  User, 
  Settings, 
  LogOut, 
  Search,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = ({ onMenuClick, user }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  
  const { logout } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/sewadars?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="glass-card border-0 shadow-md sticky top-0 z-40 backdrop-blur-xl bg-white/90">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Left section */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-800 to-blue-800 bg-clip-text text-transparent">
                RSSB Portal
              </h1>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sewadars, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:shadow-lg transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">

            {/* Notifications */}
            
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-gray-900 text-sm">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-gray-500 text-xs">{user?.role?.toLowerCase()}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-card animate-scale-in">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-2">
                      {user?.role?.toLowerCase()}
                    </span>
                  </div>

                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </Link>
                  </div>

                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
