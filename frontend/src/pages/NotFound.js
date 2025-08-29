import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Heart } from 'lucide-react';
import { semanticColors } from '../styles/colors';

/**
 * 404 Not Found Page Component
 * 
 * Displays when user navigates to a non-existent route.
 * Includes navigation options and maintains RSSB branding.
 */
const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        
        {/* RSSB Logo */}
        <div 
          className="w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center text-white shadow-lg"
          style={{ backgroundColor: semanticColors.primary.main }}
        >
          <Heart className="w-12 h-12" fill="currentColor" />
        </div>

        {/* 404 Error */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary opacity-20">404</h1>
          <h2 className="text-3xl font-bold text-text-primary mb-4 -mt-4">
            Page Not Found
          </h2>
          <p className="text-lg text-text-secondary leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on the right path.
          </p>
        </div>

        {/* Navigation Options */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline w-full sm:w-auto inline-flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          
          <Link
            to="/dashboard"
            className="btn btn-primary w-full sm:w-auto inline-flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Dashboard
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 pt-8 border-t border-border-light">
          <h3 className="font-semibold text-text-primary mb-4">Need Help?</h3>
          <div className="space-y-2 text-sm text-text-secondary">
            <p>Try these popular pages:</p>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <Link 
                to="/sewadars" 
                className="text-secondary hover:text-secondary-dark font-medium"
              >
                Sewadars
              </Link>
              <Link 
                to="/dashboard" 
                className="text-secondary hover:text-secondary-dark font-medium"
              >
                Dashboard
              </Link>
              <Link 
                to="/profile" 
                className="text-secondary hover:text-secondary-dark font-medium"
              >
                Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-text-secondary">
          <p>© 2024 Radha Soami Satsang Beas</p>
          <p className="mt-1" style={{ color: semanticColors.primary.main }}>
            In loving service to the divine
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;