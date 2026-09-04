'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, Store, Shield, Lock, Mail, Eye, EyeOff, 
  ArrowRight, AlertCircle, CheckCircle2, Sparkles, KeyRound 
} from 'lucide-react';
import { setStoredUser, UserRole, validateEmail } from '@/lib/auth';
import { api } from '@/lib/api';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Role Selection: CUSTOMER | PROVIDER | ADMIN
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read initial role from query params if available (e.g. ?role=ADMIN)
  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'ADMIN' || r === 'PROVIDER' || r === 'CUSTOMER') {
      setSelectedRole(r);
    }
  }, [searchParams]);

  // Quick Demo Accounts
  const handleQuickDemo = async (role: UserRole, demoEmail: string, demoName: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword('DemoRiceShare123#');
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Authenticate via backend API
      const res = await api.loginUser({ email: demoEmail, role });
      
      setStoredUser({
        id: res?.data?.user?.id || `user_${Date.now()}`,
        name: demoName,
        email: demoEmail,
        role,
        businessName: res?.data?.provider?.businessName || (role === 'PROVIDER' ? 'ABC Restaurant' : undefined),
        businessType: res?.data?.provider?.businessType || (role === 'PROVIDER' ? 'Restaurant' : undefined),
        providerId: res?.data?.provider?.id || (role === 'PROVIDER' ? 'prov-abc' : undefined),
      });

      // Redirect to target dashboard
      if (role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'PROVIDER') {
        router.push('/provider/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      console.warn('Backend login fallback:', err);
      // Fallback local session
      setStoredUser({
        id: `demo_${role.toLowerCase()}`,
        name: demoName,
        email: demoEmail,
        role,
        providerId: role === 'PROVIDER' ? 'prov-abc' : undefined,
      });
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'PROVIDER') router.push('/provider/dashboard');
      else router.push('/customer/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.loginUser({
        email: email.trim().toLowerCase(),
        role: selectedRole,
      });

      if (!res.success) {
        setErrorMessage(res.message || 'Authentication failed. Please check your credentials.');
        setIsSubmitting(false);
        return;
      }

      const user = res.data.user;

      // Ensure Admin authorization
      if (selectedRole === 'ADMIN' && user.role !== 'ADMIN') {
        setErrorMessage('Access Denied: This account is not authorized as an Administrator.');
        setIsSubmitting(false);
        return;
      }

      setStoredUser({
        id: user.id,
        name: user.name || email.split('@')[0],
        email: user.email,
        phone: user.phone,
        role: selectedRole,
        businessName: res.data.provider?.businessName,
        businessType: res.data.provider?.businessType,
        providerId: res.data.provider?.id,
      });

      // Route to destination
      if (selectedRole === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (selectedRole === 'PROVIDER') {
        router.push('/provider/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      console.warn('Sign-in fallback:', err);
      // If server responded with error message
      if (err.message) {
        setErrorMessage(err.message);
      } else {
        // Fallback for demonstration
        setStoredUser({
          id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email: email.trim().toLowerCase(),
          role: selectedRole,
        });
        if (selectedRole === 'ADMIN') router.push('/admin/dashboard');
        else if (selectedRole === 'PROVIDER') router.push('/provider/dashboard');
        else router.push('/customer/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-amber-50/50 via-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <span className="text-2xl">🍚</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            Welcome to Rice<span className="text-amber-600">Share</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Sign in to access your surplus-food portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
          
          {/* 1. User Level Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Sign In As:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
              
              {/* Customer */}
              <button
                type="button"
                onClick={() => { setSelectedRole('CUSTOMER'); setErrorMessage(null); }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'CUSTOMER'
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <User className={`w-3.5 h-3.5 ${selectedRole === 'CUSTOMER' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Customer</span>
              </button>

              {/* Provider */}
              <button
                type="button"
                onClick={() => { setSelectedRole('PROVIDER'); setErrorMessage(null); }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'PROVIDER'
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Store className={`w-3.5 h-3.5 ${selectedRole === 'PROVIDER' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Provider</span>
              </button>

              {/* Admin */}
              <button
                type="button"
                onClick={() => { setSelectedRole('ADMIN'); setErrorMessage(null); }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                  selectedRole === 'ADMIN'
                    ? 'bg-white text-rose-950 shadow-xs border border-rose-200'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Shield className={`w-3.5 h-3.5 ${selectedRole === 'ADMIN' ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Admin</span>
              </button>

            </div>

            {/* Level Context Helper */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              {selectedRole === 'CUSTOMER' && (
                <>
                  <User className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Customer Account:</strong> Browse & reserve discounted meals or request community donations.</span>
                </>
              )}
              {selectedRole === 'PROVIDER' && (
                <>
                  <Store className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Food Provider Portal:</strong> For restaurants, bakeries, caterers & hotels to manage listings.</span>
                </>
              )}
              {selectedRole === 'ADMIN' && (
                <>
                  <Shield className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span><strong>Restricted Portal:</strong> System administrators only. (New admins cannot be registered publicly).</span>
                </>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === 'ADMIN' 
                      ? 'admin@riceshare.lk' 
                      : selectedRole === 'PROVIDER' 
                      ? 'provider@restaurant.lk' 
                      : 'customer@gmail.com'
                  }
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full mt-2 py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 ${
                selectedRole === 'ADMIN'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 shadow-rose-500/20'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-orange-500/20'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In as {selectedRole === 'ADMIN' ? 'Administrator' : selectedRole === 'PROVIDER' ? 'Food Provider' : 'Customer'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo 1-Click Fill Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Instant Demo Access
              </span>
              <span className="text-[10px] text-slate-400">1-click test</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('CUSTOMER', 'dilshan@gmail.com', 'Dilshan Madusanka')}
                className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-[11px] font-semibold text-slate-700 hover:text-amber-800 transition-all text-center truncate"
                title="Sign in as Customer (Dilshan)"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('PROVIDER', 'abc@restaurant.lk', 'ABC Restaurant')}
                className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-[11px] font-semibold text-slate-700 hover:text-amber-800 transition-all text-center truncate"
                title="Sign in as Provider (ABC Rest)"
              >
                🏪 Provider
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN', 'admin@riceshare.lk', 'Kasun Perera (Admin)')}
                className="py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-[11px] font-semibold text-slate-700 hover:text-rose-800 transition-all text-center truncate"
                title="Sign in as Admin (Kasun)"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="mt-6 pt-4 text-center text-xs text-slate-600">
            Don&apos;t have an account yet?{' '}
            <Link href="/sign-up" className="font-bold text-amber-700 hover:text-amber-800 underline">
              Sign Up as Customer or Provider
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
