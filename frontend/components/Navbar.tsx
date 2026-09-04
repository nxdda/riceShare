'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { 
  UtensilsCrossed, Menu, X, PlusCircle, Shield, 
  User as UserIcon, Store, LogOut, HeartHandshake, LayoutDashboard 
} from 'lucide-react';
import { api } from '@/lib/api';
import { getStoredUser, clearStoredUser, StoredUser, UserRole } from '@/lib/auth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState<StoredUser | null>(null);
  const { user, isLoaded, isSignedIn } = useUser();

  // Load and subscribe to local user auth state
  useEffect(() => {
    const syncLocal = () => {
      const stored = getStoredUser();
      setLocalUser(stored);
    };

    syncLocal();
    window.addEventListener('riceshare_auth_change', syncLocal);
    return () => window.removeEventListener('riceshare_auth_change', syncLocal);
  }, []);

  // Sync Clerk user with backend when signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && user && !localUser) {
      api.syncUser({
        clerkUserId: user.id,
        name: user.fullName || user.firstName || 'RiceShare Member',
        email: user.primaryEmailAddress?.emailAddress || '',
      }).then(res => {
        if (res?.data?.user) {
          setLocalUser(res.data.user);
        }
      }).catch(err => console.warn('Could not sync user role:', err));
    }
  }, [isLoaded, isSignedIn, user, localUser]);

  const isLoggedIn = !!localUser || (isLoaded && isSignedIn);
  const currentRole: UserRole = localUser?.role || 'CUSTOMER';
  const displayName = localUser?.name || user?.fullName || user?.firstName || 'User';

  const handleSignOut = () => {
    clearStoredUser();
    setLocalUser(null);
    window.location.href = '/';
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-100 bg-white/95 backdrop-blur-md transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl sm:text-2xl">🍚</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Rice<span className="text-amber-600">Share</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide -mt-1 hidden sm:block">
                Sell it. Share it. Save it.
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (Rendered strictly by user type) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            
            {/* 1. ADMIN Navigation */}
            {isLoggedIn && currentRole === 'ADMIN' && (
              <>
                <Link href="/admin/dashboard" className="text-rose-700 font-bold hover:text-rose-800 transition-colors flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-rose-600" />
                  Admin Dashboard
                </Link>
                <Link href="/browse" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                  Marketplace Oversight
                </Link>
                <Link href="/#impact" className="hover:text-amber-600 transition-colors">
                  Impact Analytics
                </Link>
              </>
            )}

            {/* 2. PROVIDER Navigation */}
            {isLoggedIn && currentRole === 'PROVIDER' && (
              <>
                <Link href="/provider/add" className="text-amber-700 font-bold hover:text-amber-800 transition-colors flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-orange-500" />
                  List Surplus Food
                </Link>
                <Link href="/provider/dashboard" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-500" />
                  Provider Dashboard
                </Link>
                <Link href="/browse" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-slate-400" />
                  Browse Food
                </Link>
                <Link href="/#impact" className="hover:text-amber-600 transition-colors">
                  Impact
                </Link>
              </>
            )}

            {/* 3. CUSTOMER Navigation (Logged in) */}
            {isLoggedIn && currentRole === 'CUSTOMER' && (
              <>
                <Link href="/browse" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                  Find Food
                </Link>
                <Link href="/customer/dashboard" className="hover:text-amber-600 transition-colors flex items-center gap-1.5 font-medium">
                  <UserIcon className="w-4 h-4 text-amber-500" />
                  My Orders & Meals
                </Link>
                <Link href="/#how-it-works" className="hover:text-amber-600 transition-colors">
                  How It Works
                </Link>
                <Link href="/#impact" className="hover:text-amber-600 transition-colors">
                  Impact
                </Link>
              </>
            )}

            {/* 4. VISITOR Navigation (Not logged in) */}
            {!isLoggedIn && (
              <>
                <Link href="/browse" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-amber-500" />
                  Find Food
                </Link>
                <Link href="/sign-up" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-orange-500" />
                  List Surplus Food
                </Link>
                <Link href="/#how-it-works" className="hover:text-amber-600 transition-colors">
                  How It Works
                </Link>
                <Link href="/#impact" className="hover:text-amber-600 transition-colors">
                  Impact
                </Link>
              </>
            )}

          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Role-Specific Portal Button */}
            {isLoggedIn && currentRole === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 text-xs font-bold bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-rose-600" />
                Admin Portal
              </Link>
            )}

            {isLoggedIn && currentRole === 'PROVIDER' && (
              <Link
                href="/provider/dashboard"
                className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
              >
                <Store className="w-3.5 h-3.5 text-amber-600" />
                Provider Portal
              </Link>
            )}

            {isLoggedIn && currentRole === 'CUSTOMER' && (
              <Link
                href="/customer/dashboard"
                className="flex items-center gap-1.5 text-xs font-bold bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                My Meals
              </Link>
            )}

            {/* Profile & Sign Out (When Logged In) */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-900 leading-none">{displayName}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                    currentRole === 'ADMIN' 
                      ? 'text-rose-600' 
                      : currentRole === 'PROVIDER' 
                      ? 'text-orange-600' 
                      : 'text-amber-600'
                  }`}>
                    {currentRole}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs font-medium text-slate-500 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              /* Auth Buttons (When Logged Out) */
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="text-xs font-semibold text-slate-700 hover:text-amber-600 px-3 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-all shadow-xs hover:shadow-md hover:shadow-amber-600/20"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer (Role-Specific) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-amber-100 bg-white px-4 pt-2 pb-6 space-y-2.5 animate-in slide-in-from-top-2 duration-200">
          
          {/* Admin Mobile Links */}
          {isLoggedIn && currentRole === 'ADMIN' && (
            <>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-bold text-rose-700 hover:text-rose-800"
              >
                <Shield className="w-5 h-5 text-rose-600" />
                Admin Dashboard
              </Link>
              <Link
                href="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
              >
                Marketplace Oversight
              </Link>
            </>
          )}

          {/* Provider Mobile Links */}
          {isLoggedIn && currentRole === 'PROVIDER' && (
            <>
              <Link
                href="/provider/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-bold text-amber-800 hover:text-amber-900"
              >
                <Store className="w-5 h-5 text-amber-600" />
                Provider Dashboard
              </Link>
              <Link
                href="/provider/add"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-medium text-slate-800 hover:text-amber-600"
              >
                <PlusCircle className="w-5 h-5 text-orange-500" />
                List Surplus Food
              </Link>
              <Link
                href="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
              >
                Browse Food
              </Link>
            </>
          )}

          {/* Customer Mobile Links */}
          {isLoggedIn && currentRole === 'CUSTOMER' && (
            <>
              <Link
                href="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-medium text-slate-800 hover:text-amber-600"
              >
                <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                Find Food
              </Link>
              <Link
                href="/customer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-bold text-amber-800 hover:text-amber-900"
              >
                <UserIcon className="w-5 h-5 text-amber-600" />
                My Meals & Orders
              </Link>
            </>
          )}

          {/* Visitor Mobile Links */}
          {!isLoggedIn && (
            <>
              <Link
                href="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-medium text-slate-800 hover:text-amber-600"
              >
                <UtensilsCrossed className="w-5 h-5 text-amber-500" />
                Find Food
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-base font-medium text-slate-800 hover:text-amber-600"
              >
                <PlusCircle className="w-5 h-5 text-orange-500" />
                List Surplus Food
              </Link>
            </>
          )}

          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
          >
            How It Works
          </Link>
          <Link
            href="/#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
          >
            Impact
          </Link>

          {/* Mobile User Profile or Auth Buttons */}
          {isLoggedIn ? (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">{displayName}</span>
                <span className="text-xs text-amber-600 font-semibold">{currentRole}</span>
              </div>
              <button
                onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 py-1.5 px-3 rounded-lg border border-rose-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-slate-800 bg-slate-100 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>
      )}
    </header>
  );
}
