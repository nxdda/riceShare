'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, UtensilsCrossed, HeartHandshake, DollarSign, Clock, MapPin, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import { api, Reservation, DonationRequest } from '@/lib/api';
import { getStoredUser, StoredUser } from '@/lib/auth';

export default function CustomerDashboardPage() {
  const [activeTab, setActiveTab] = useState<'RESERVATIONS' | 'DONATIONS'>('RESERVATIONS');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [donations, setDonations] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const user = getStoredUser();
      setCurrentUser(user);

      if (!user) {
        setReservations([]);
        setDonations([]);
        setLoading(false);
        return;
      }

      // Strictly filter by logged-in user ID (unless platform admin)
      const queryParam = user.role === 'ADMIN' ? undefined : { userId: user.id };

      const [resRes, donRes] = await Promise.all([
        api.getReservations(queryParam),
        api.getDonationRequests(queryParam),
      ]);
      setReservations(resRes.data || []);
      setDonations(donRes.data || []);
    } catch (err: any) {
      console.error('Could not load customer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomerData();
  }, []);

  // Summary Metrics
  const mealsReceived = reservations.reduce((s, r) => s + r.quantity, 0) +
    donations.filter(d => d.status === 'ACCEPTED').reduce((s, d) => s + d.quantity, 0);

  const moneySaved = reservations.reduce((sum, r) => {
    // Estimating average retail discount Rs. 220 per portion saved
    return sum + (r.quantity * 220);
  }, 0);

  if (!loading && !currentUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-amber-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to View Your Meals</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Track your reserved surplus meals, pick up times, and community donation requests by signing in to your RiceShare account.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in?role=CUSTOMER"
              className="inline-flex items-center justify-center py-3 px-4 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-xs"
            >
              Sign In as Customer
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-amber-300 text-amber-800 font-semibold text-xs hover:bg-amber-50 transition-colors"
            >
              Create an Account
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center justify-center py-2 px-4 text-slate-500 hover:text-slate-700 text-xs transition-colors"
            >
              Back to Browse Meals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
              <User className="w-3.5 h-3.5" />
              <span>Customer Meal Portal &bull; {currentUser?.name || 'Customer'}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              My Meals &amp; Impact
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track your food pickup reservations, community donation requests, and money saved.
            </p>
          </div>

          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition-all self-start sm:self-auto"
          >
            <UtensilsCrossed className="w-4 h-4" />
            Find More Food
          </Link>
        </div>

        {/* 4 Impact Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{reservations.length}</div>
            <p className="text-[11px] font-semibold text-slate-500">Sale Reservations</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{donations.length}</div>
            <p className="text-[11px] font-semibold text-slate-500">Donations Requested</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{mealsReceived}</div>
            <p className="text-[11px] font-semibold text-slate-500">Meals Rescued</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">Rs. {moneySaved.toLocaleString()}</div>
            <p className="text-[11px] font-semibold text-slate-500">Estimated Money Saved</p>
          </div>

        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('RESERVATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'RESERVATIONS' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Reservations ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab('DONATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'DONATIONS' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Donation Requests ({donations.length})
          </button>
        </div>

        {/* TAB 1: RESERVATIONS */}
        {activeTab === 'RESERVATIONS' && (
          <div className="space-y-4">
            {reservations.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
                <p className="text-sm font-bold text-slate-700">You have no active reservations.</p>
                <p className="text-xs text-slate-400">Discover fresh surplus food around Colombo, Malabe, and beyond.</p>
                <Link
                  href="/browse"
                  className="inline-block px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Browse Food
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reservations.map((r) => (
                  <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {r.id}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{r.foodName}</h3>
                        <p className="text-xs font-medium text-slate-500">{r.providerName}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        {r.status}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Portions Reserved:</span>
                        <strong className="text-slate-900">{r.quantity} portions</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Payable at Pickup:</span>
                        <strong className="text-amber-600 text-sm">Rs. {r.totalAmount}</strong>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-red-500" />
                          {r.location || 'Local Counter'}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3.5 h-3.5" />
                          {r.pickupEnd ? new Date(r.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Reserve &amp; Pay at Pickup</span>
                      <span className="text-emerald-700 font-bold">Confirmed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DONATIONS */}
        {activeTab === 'DONATIONS' && (
          <div className="space-y-4">
            {donations.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
                <p className="text-sm font-bold text-slate-700">No donation requests submitted.</p>
                <p className="text-xs text-slate-400">Charities and community leaders can request 100% free food.</p>
                <Link
                  href="/browse?type=DONATION"
                  className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Find Free Donated Food
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donations.map((d) => (
                  <div key={d.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          {d.id}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{d.foodName}</h3>
                        <p className="text-xs font-medium text-slate-500">{d.providerName}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        d.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        d.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Free Portions:</span>
                        <strong className="text-emerald-700">{d.quantity} (FREE)</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Distribution Cause:</span>
                        <p className="italic text-slate-700">&quot;{d.reason}&quot;</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500">
                      {d.status === 'ACCEPTED'
                        ? 'Your donation request was accepted! You can collect during the pickup window.'
                        : 'The food provider is reviewing your community request.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
