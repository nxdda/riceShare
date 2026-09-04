'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import { UtensilsCrossed, Menu, X, PlusCircle, Shield, User as UserIcon, Store, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<'CUSTOMER' | 'PROVIDER' | 'ADMIN'>('CUSTOMER');
  const { user, isLoaded, isSignedIn } = useUser();

  // Sync user with backend when signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      api.syncUser({
        clerkUserId: user.id,
        name: user.fullName || user.firstName || 'RiceShare Member',
        email: user.primaryEmailAddress?.emailAddress || '',
      }).then(res => {
        if (res?.data?.user?.role) {
          setCurrentRole(res.data.user.role);
        }
      }).catch(err => console.warn('Could not sync user role:', err));
    }
  }, [isLoaded, isSignedIn, user]);

  const handleRoleSwitch = async (role: 'CUSTOMER' | 'PROVIDER' | 'ADMIN') => {
    setCurrentRole(role);
    if (user?.id) {
      try {
        await api.switchRole(user.id, role);
      } catch (err) {
        console.warn('Role switch failed:', err);
      }
    }
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

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/browse" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
              <UtensilsCrossed className="w-4 h-4 text-amber-500" />
              Find Food
            </Link>
            <Link href="/provider/add" className="hover:text-amber-600 transition-colors flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-orange-500" />
              List Surplus Food
            </Link>
            <Link href="/#how-it-works" className="hover:text-amber-600 transition-colors">
              How It Works
            </Link>
            <Link href="/#impact" className="hover:text-amber-600 transition-colors">
              Impact
            </Link>

            {/* Quick Demo Role Switcher */}
            <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-200/70 rounded-full px-2.5 py-1 text-xs text-slate-700">
              <span className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider pr-1">Demo View:</span>
              <button
                onClick={() => handleRoleSwitch('CUSTOMER')}
                className={`px-2 py-0.5 rounded-full transition-all text-xs font-semibold ${
                  currentRole === 'CUSTOMER' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                }`}
                title="Customer Perspective"
              >
                Customer
              </button>
              <button
                onClick={() => handleRoleSwitch('PROVIDER')}
                className={`px-2 py-0.5 rounded-full transition-all text-xs font-semibold ${
                  currentRole === 'PROVIDER' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                }`}
                title="Provider Perspective"
              >
                Provider
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`px-2 py-0.5 rounded-full transition-all text-xs font-semibold ${
                  currentRole === 'ADMIN' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
                }`}
                title="Admin Perspective"
              >
                Admin
              </button>
            </div>
          </nav>

          {/* User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Direct Dashboard Link Based on Selected/Synced Role */}
            {currentRole === 'PROVIDER' && (
              <Link
                href="/provider/dashboard"
                className="flex items-center gap-1.5 text-xs font-semibold bg-orange-100/70 text-orange-800 hover:bg-orange-200/70 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                Provider Portal
              </Link>
            )}
            {currentRole === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-1.5 text-xs font-semibold bg-purple-100/70 text-purple-800 hover:bg-purple-200/70 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Portal
              </Link>
            )}
            {currentRole === 'CUSTOMER' && (
              <Link
                href="/customer/dashboard"
                className="flex items-center gap-1.5 text-xs font-semibold bg-amber-100/70 text-amber-800 hover:bg-amber-200/70 px-3 py-1.5 rounded-lg transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                My Meals
              </Link>
            )}

            {isLoaded && isSignedIn && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <UserButton />
              </div>
            )}

            {isLoaded && !isSignedIn && (
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

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {isLoaded && isSignedIn && (
              <UserButton />
            )}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in fade-in">
          <Link
            href="/browse"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
          >
            🍚 Find Food
          </Link>
          <Link
            href="/provider/add"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
          >
            ➕ List Surplus Food
          </Link>
          <Link
            href="/customer/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
          >
            👤 Customer Dashboard
          </Link>
          <Link
            href="/provider/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
          >
            🏪 Provider Dashboard
          </Link>
          <Link
            href="/admin/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800 hover:text-amber-600"
          >
            🛡️ Admin Dashboard
          </Link>

          {/* Mobile Demo Role Switcher */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-400 mb-2">Switch Demo Perspective:</span>
            <div className="flex gap-2">
              <button
                onClick={() => { handleRoleSwitch('CUSTOMER'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1 text-xs font-semibold rounded-md border text-center ${
                  currentRole === 'CUSTOMER' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => { handleRoleSwitch('PROVIDER'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1 text-xs font-semibold rounded-md border text-center ${
                  currentRole === 'PROVIDER' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Provider
              </button>
              <button
                onClick={() => { handleRoleSwitch('ADMIN'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1 text-xs font-semibold rounded-md border text-center ${
                  currentRole === 'ADMIN' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {isLoaded && !isSignedIn && (
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
