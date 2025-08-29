import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users,
  UserPlus,
  Shield,
  Settings,
  FileText,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      description: 'Overview and insights',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Sewadars',
      href: '/sewadars',
      icon: Users,
      roles: ['ADMIN', 'EDITOR', 'VIEWER'],
      description: 'Volunteer management',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Add Sewadar',
      href: '/sewadars/new',
      icon: UserPlus,
      roles: ['ADMIN', 'EDITOR'],
      description: 'Register new volunteer',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      name: 'User Management',
      href: '/users',
      icon: Shield,
      roles: ['ADMIN'],
      description: 'System users & roles',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      name: 'Admin Panel',
      href: '/admin',
      icon: Settings,
      roles: ['ADMIN'],
      description: 'System administration',
      gradient: 'from-slate-500 to-gray-600'
    },
    {
      name: 'Audit Logs',
      href: '/audit',
      icon: FileText,
      roles: ['ADMIN'],
      description: 'Activity monitoring',
      gradient: 'from-indigo-500 to-blue-600'
    }
    // Removed Reports from here
  ];

  const visibleItems = navigationItems.filter(item => hasRole(item.roles));

  const isCurrentPath = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case 'ADMIN': return 'from-red-500 to-pink-500';
      case 'EDITOR': return 'from-blue-500 to-indigo-500';
      case 'VIEWER': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className={`h-full w-64 transform transition-all duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 bg-white shadow-xl flex flex-col`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">RS</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">RSSB</h2>
            <p className="text-xs text-gray-500">Sewadar Portal</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getRoleBadgeColor()} rounded-xl flex items-center justify-center shadow-lg text-white font-bold text-sm`}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 bg-gradient-to-r ${getRoleBadgeColor()} text-white shadow-sm`}>
              <Sparkles className="w-3 h-3" />
              {user?.role?.toLowerCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = isCurrentPath(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] ${
                isActive
                  ? 'bg-gradient-to-r from-red-500 to-blue-600 text-white shadow-lg scale-[1.02]'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : `bg-gradient-to-br ${item.gradient} text-white shadow-sm group-hover:scale-110`
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {item.name}
                </div>
                <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                  {item.description}
                </div>
              </div>
              
              {isActive && (
                <ChevronRight className="w-4 h-4 text-white/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200/50">
        <div className="text-center">
          <div className="text-xs text-gray-500 space-y-1">
            {/* <p>© 2025 RSSB Berhampur Centre</p> */}
            <p className="font-medium">Radha Soami Satsang Beas</p>
            <p className="text-primary font-semibold mt-2">Seva • Simran • Satsang</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
