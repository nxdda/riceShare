'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Store, ShieldCheck, Check, X, AlertCircle, Eye, EyeOff, 
  ArrowRight, Phone, Mail, Lock, Building
} from 'lucide-react';
import { validatePassword, validateSriLankanPhone, validateEmail, setStoredUser } from '@/lib/auth';
import { api } from '@/lib/api';

export default function SignUpPage() {
  const router = useRouter();

  // Form State
  const [role, setRole] = useState<'CUSTOMER' | 'PROVIDER'>('CUSTOMER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Restaurant');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validations
  const nameValid = name.trim().length >= 2;
  const phoneValid = validateSriLankanPhone(phone);
  const emailValid = validateEmail(email);
  const { isValid: passwordValid, checks: passChecks } = validatePassword(password);
  const confirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;
  const businessValid = role === 'PROVIDER' ? businessName.trim().length >= 2 : true;

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Mark all touched
    setTouched({
      name: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
      businessName: true,
    });

    if (!nameValid) {
      setFormError('Please enter a valid full name (minimum 2 characters).');
      return;
    }
    if (!phoneValid) {
      setFormError('Please enter a valid Sri Lankan phone number (e.g. 077 123 4567 or +94 77 123 4567).');
      return;
    }
    if (!emailValid) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (role === 'PROVIDER' && !businessValid) {
      setFormError('Please enter your business / kitchen name.');
      return;
    }
    if (!passwordValid) {
      setFormError('Password does not meet the security policy requirements.');
      return;
    }
    if (!confirmPasswordValid) {
      setFormError('Passwords do not match. Please re-check.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate unique mock ID or sync with backend
      const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      
      // 2. Sync to Backend REST API
      const syncRes = await api.syncUser({
        clerkUserId: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        businessName: role === 'PROVIDER' ? businessName.trim() : undefined,
        businessType: role === 'PROVIDER' ? businessType : undefined,
      });

      // 3. Save session in localStorage
      setStoredUser({
        id: syncRes?.data?.user?.id || userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        businessName: role === 'PROVIDER' ? (syncRes?.data?.provider?.businessName || businessName.trim()) : undefined,
        businessType: role === 'PROVIDER' ? (syncRes?.data?.provider?.businessType || businessType) : undefined,
        providerId: role === 'PROVIDER' ? syncRes?.data?.provider?.id : undefined,
      });

      // 4. Redirect based on role
      if (role === 'PROVIDER') {
        router.push('/provider/dashboard');
      } else {
        router.push('/customer/dashboard');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      // Fallback: still save session locally so demo testing never blocks
      const userId = `user_${Date.now()}`;
      setStoredUser({
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
      });
      router.push(role === 'PROVIDER' ? '/provider/dashboard' : '/customer/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-amber-50/50 via-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <span className="text-2xl">🍚</span>
            </div>
          </Link>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">
            Create your Rice<span className="text-amber-600">Share</span> account
          </h1>
          <p className="text-sm text-slate-600 mt-1.5">
            Join Sri Lanka&apos;s surplus-food movement — sell it, share it, save it.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
          
          {/* 1. Account Level Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select User Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Customer Option */}
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  role === 'CUSTOMER'
                    ? 'border-amber-600 bg-amber-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    role === 'CUSTOMER' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  {role === 'CUSTOMER' && (
                    <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="font-bold text-sm text-slate-900">Customer</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Reserve discounted food & request donations
                </div>
              </button>

              {/* Provider Option */}
              <button
                type="button"
                onClick={() => setRole('PROVIDER')}
                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                  role === 'PROVIDER'
                    ? 'border-amber-600 bg-amber-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    role === 'PROVIDER' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Store className="w-4 h-4" />
                  </div>
                  {role === 'PROVIDER' && (
                    <div className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="font-bold text-sm text-slate-900">Food Provider</div>
                <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  Restaurants, bakeries, hotels & caterers
                </div>
              </button>
            </div>

            {/* Admin Policy Notice */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">Admin accounts:</strong> New administrators cannot be registered publicly. Existing admins must sign in through the{' '}
                <Link href="/sign-in?role=ADMIN" className="text-amber-700 font-semibold underline hover:text-amber-800">
                  Admin Sign-In
                </Link>.
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Error Banner */}
            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Name Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g. Dilshan Madusanka"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    touched.name && !nameValid
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
              </div>
              {touched.name && !nameValid && (
                <p className="text-[11px] text-rose-600 mt-1">Name must be at least 2 characters long.</p>
              )}
            </div>

            {/* Phone Number (Sri Lanka Format) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number (Sri Lanka) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="e.g. 077 123 4567 or +94 77 123 4567"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    touched.phone && !phoneValid
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
              </div>
              {touched.phone && !phoneValid ? (
                <p className="text-[11px] text-rose-600 mt-1">
                  Enter a valid 10-digit Sri Lankan phone number (e.g. 0771234567 or +94771234567).
                </p>
              ) : (
                <p className="text-[10px] text-slate-500 mt-1">Used for pickup verification & SMS notifications.</p>
              )}
            </div>

            {/* Provider Specific: Business Name & Type */}
            {role === 'PROVIDER' && (
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Building className="w-4 h-4 text-amber-600" />
                  Provider Kitchen Details
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Business / Kitchen Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    onBlur={() => handleBlur('businessName')}
                    placeholder="e.g. Perera Bakers & Caterers"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Establishment Type
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Bakery">Bakery & Pastry Shop</option>
                    <option value="Hotel">Hotel / Banquet Hall</option>
                    <option value="Event Organizer">Event Organizer & Caterer</option>
                    <option value="Supermarket">Supermarket / Grocery</option>
                    <option value="Cafe">Cafe / Coffee Shop</option>
                  </select>
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-rose-500">*</span>
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
                  onBlur={() => handleBlur('email')}
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    touched.email && !emailValid
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
              </div>
              {touched.email && !emailValid && (
                <p className="text-[11px] text-rose-600 mt-1">Please enter a valid email address.</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
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
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    touched.password && !passwordValid
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Policy Live Requirements Checklist */}
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="font-bold text-[11px] text-slate-700 uppercase tracking-wider mb-1">
                  Password Security Policy:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  
                  {/* Min 8 chars */}
                  <div className={`flex items-center gap-1.5 ${passChecks.minLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {passChecks.minLength ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />}
                    Minimum 8 characters
                  </div>

                  {/* Capital letter */}
                  <div className={`flex items-center gap-1.5 ${passChecks.hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {passChecks.hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />}
                    Uppercase letter (A-Z)
                  </div>

                  {/* Lowercase letter */}
                  <div className={`flex items-center gap-1.5 ${passChecks.hasLowercase ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {passChecks.hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />}
                    Lowercase letter (a-z)
                  </div>

                  {/* Number */}
                  <div className={`flex items-center gap-1.5 ${passChecks.hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {passChecks.hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />}
                    At least one number (0-9)
                  </div>

                  {/* Symbol */}
                  <div className={`flex items-center gap-1.5 sm:col-span-2 ${passChecks.hasSymbol ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                    {passChecks.hasSymbol ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block" />}
                    Special symbol (!@#$%^&*...)
                  </div>

                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    touched.confirmPassword && !confirmPasswordValid
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400'
                      : confirmPasswordValid
                      ? 'border-emerald-500 bg-emerald-50/20 focus:ring-emerald-400'
                      : 'border-slate-300 focus:border-amber-500 focus:ring-amber-500/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <div className="mt-1 flex items-center gap-1 text-[11px]">
                  {confirmPasswordValid ? (
                    <span className="text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-600 font-medium flex items-center gap-1">
                      <X className="w-3 h-3 stroke-[3]" /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Register as {role === 'PROVIDER' ? 'Food Provider' : 'Customer'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <Link href="/sign-in" className="font-bold text-amber-700 hover:text-amber-800 underline">
              Sign In here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
