import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Heart, AlertCircle, ArrowRight, Shield, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import NamaskarLogo from '../namaskaar.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const from = location.state?.from || '/dashboard';
  if (isAuthenticated && !isLoading) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        toast.success(`Welcome back, ${result.user.firstName}!`);
      } else {
        setError('password', { 
          type: 'manual', 
          message: result.message || 'Invalid email or password' 
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('password', { 
        type: 'manual', 
        message: 'Login failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Left Panel - Enhanced Branding */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, #8B0000 0%, #A52A2A 100%)"
          }}
        ></div>

        <div className="absolute inset-0 pointer-events-none" style={{
            background: "linear-gradient(100deg, transparent 60%, rgba(255,255,255,0.10) 100%)"
          }}/>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 py-12 text-white">
          <div className="max-w-lg">
            <div className="flex items-center mb-12 animate-fade-in">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mr-4">
                {/* <Heart className="w-10 h-10 text-white" fill="currentColor" /> */}
                <img 
                  src={NamaskarLogo} 
                  alt="Namaskar" 
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">RSSB</h1>
                <p className="text-white/80 text-sm">Radha Soami Satsang Beas</p>
              </div>
            </div>

            <div className="mb-12 animate-slide-up">
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Welcome to<br />
                <span
                  style={{
                    color: "#FFE8C7", // Soft light yellow/ivory for high contrast on dark red
                    letterSpacing: "0.5px"
                  }}
                >
                  Sewadar Portal
                </span>
              </h2>
              <p className="text-xl text-white/90 leading-relaxed mb-8">
                A modern, secure platform for managing volunteer records with love and dedication. 
                Your service contributes to the spiritual journey of countless souls.
              </p>
            </div>

            <div className="space-y-4 mb-12 animate-fade-in">
              <div className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Volunteer Management</h3>
                  <p className="text-sm text-white/70">Comprehensive sewadar record keeping</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Secure & Reliable</h3>
                  <p className="text-sm text-white/70">Enterprise-grade security & privacy</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-white/80">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Analytics & Reports</h3>
                  <p className="text-sm text-white/70">Insights to improve seva coordination</p>
                </div>
              </div>
            </div>

            <blockquote className="border-l-4 border-yellow-300/50 pl-6 italic text-white/90 text-lg animate-fade-in">
              "Seva is the foundation of spiritual progress. Through selfless service, we purify our hearts and minds."
              <footer className="text-sm text-white/70 mt-3 not-italic font-medium">
                — Sant Mat Teaching
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Panel - Modern Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20">
        <div className="w-full max-w-md mx-auto">
          
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-red-600 to-blue-600 rounded-2xl flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">RSSB Sewadar Portal</h1>
            <p className="text-gray-600 mt-2">Sign in to your account</p>
          </div>

          <div className="hidden lg:block mb-8 animate-slide-up">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Sign In</h2>
            <p className="text-lg text-gray-600">
              Access your sewadar management dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-scale-in">
            <div>
              <label className="form-label">Email Address</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                disabled={isSubmitting}
              />
              {errors.email && (
                <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.email.message}
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input pr-12 ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center mt-2 text-sm text-red-600 animate-fade-in">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {errors.password.message}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-4 text-base font-semibold group"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 glass-card p-6 animate-fade-in">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Demo Accounts
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">Admin Access</span>
                  <p className="text-gray-600 text-xs">Full system permissions</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-gray-500">admin@rssb.org</p>
                  <p className="font-mono text-xs text-gray-500">admin123</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">Editor Access</span>
                  <p className="text-gray-600 text-xs">Can manage sewadars</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-gray-500">editor@rssb.org</p>
                  <p className="font-mono text-xs text-gray-500">editor123</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium text-gray-900">Viewer Access</span>
                  <p className="text-gray-600 text-xs">Read-only access</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-gray-500">viewer@rssb.org</p>
                  <p className="font-mono text-xs text-gray-500">viewer123</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in">
            <p>Need help? Contact your administrator for support.</p>
            <p className="mt-2">© 2025 RSSB Berhampur Centre. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;