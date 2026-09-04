'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Store, PlusCircle, PackageCheck, HeartHandshake, UtensilsCrossed, 
  CheckCircle, XCircle, Clock, MapPin, RefreshCw, AlertCircle, Eye, Tag
} from 'lucide-react';
import { api, Listing, Reservation, DonationRequest } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function ProviderDashboardPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LISTINGS' | 'RESERVATIONS' | 'DONATIONS'>('OVERVIEW');
  const [listings, setListings] = useState<Listing[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [donations, setDonations] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const loadProviderData = async () => {
    setLoading(true);
    try {
      const [listingsRes, resRes, donRes] = await Promise.all([
        api.getListings(),
        api.getReservations(),
        api.getDonationRequests(),
      ]);
      setListings(listingsRes.data || []);
      setReservations(resRes.data || []);
      setDonations(donRes.data || []);
    } catch (err: any) {
      console.error('Failed to load provider data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getStoredUser();
    // Allow access if logged in as PROVIDER or ADMIN
    if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
      setIsAuthorized(false);
      setLoading(false);
    } else {
      setIsAuthorized(true);
      loadProviderData();
    }
  }, []);

  // Handle donation accept/reject
  const handleDonationAction = async (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    setActionLoading(true);
    try {
      const res = await api.updateDonationRequest(id, status);
      if (res.success) {
        setMessage(`Donation request marked as ${status}`);
        loadProviderData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  // Handle closing a listing
  const handleCloseListing = async (id: string) => {
    if (!confirm('Are you sure you want to close this food listing?')) return;
    try {
      await api.updateListing(id, { status: 'CLOSED' });
      loadProviderData();
    } catch (err: any) {
      alert('Could not close listing: ' + err.message);
    }
  };

  // Metrics
  const activeListingsCount = listings.filter(l => l.status === 'AVAILABLE').length;
  const totalPortionsListed = listings.reduce((sum, l) => sum + l.quantity, 0);
  const confirmedReservationsCount = reservations.filter(r => r.status !== 'CANCELLED').length;
  const acceptedDonationsCount = donations.filter(d => d.status === 'ACCEPTED').length;
  const totalMealsRescued = reservations.reduce((s, r) => s + r.quantity, 0) + 
    donations.filter(d => d.status === 'ACCEPTED').reduce((s, d) => s + d.quantity, 0);

  if (isAuthorized === false) {
    const user = getStoredUser();
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-amber-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Food Provider Portal Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This dashboard is reserved for restaurants, bakeries, hotels, and food providers to manage their surplus listings. You are currently logged in as a <strong className="text-slate-900">{user?.role || 'Guest'}</strong>.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in?role=PROVIDER"
              className="inline-flex items-center justify-center py-3 px-4 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors shadow-xs"
            >
              Sign In as Food Provider
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-amber-300 text-amber-800 font-semibold text-xs hover:bg-amber-50 transition-colors"
            >
              Register as a Food Provider
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-bold mb-2">
              <Store className="w-3.5 h-3.5" />
              <span>Provider Partner Portal</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Provider Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage your active surplus listings, customer pickup reservations, and free donation requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/provider/add"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Add Food Listing
            </Link>
          </div>
        </div>

        {/* Message Toast */}
        {message && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-amber-700 font-bold">Dismiss</button>
          </div>
        )}

        {/* 5 Key Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{activeListingsCount}</div>
            <p className="text-[11px] font-semibold text-slate-500">Active Listings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalPortionsListed}</div>
            <p className="text-[11px] font-semibold text-slate-500">Portions Listed</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{confirmedReservationsCount}</div>
            <p className="text-[11px] font-semibold text-slate-500">Sale Reservations</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{acceptedDonationsCount}</div>
            <p className="text-[11px] font-semibold text-slate-500">Donations Granted</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{totalMealsRescued}</div>
            <p className="text-[11px] font-semibold text-slate-500">Meals Rescued</p>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'OVERVIEW' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveTab('LISTINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'LISTINGS' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Listings ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('RESERVATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'RESERVATIONS' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sale Reservations ({reservations.length})
          </button>
          <button
            onClick={() => setActiveTab('DONATIONS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'DONATIONS' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Donation Requests ({donations.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Reservations */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Recent Pickup Reservations</h3>
                <button onClick={() => setActiveTab('RESERVATIONS')} className="text-xs text-amber-600 font-bold hover:underline">
                  View All
                </button>
              </div>

              {reservations.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No reservations received yet.</p>
              ) : (
                <div className="space-y-3">
                  {reservations.slice(0, 4).map((r) => (
                    <div key={r.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-slate-900">{r.foodName}</h4>
                        <p className="text-slate-500 font-medium">{r.customerName} • {r.customerPhone}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{r.quantity} portions • Rs. {r.totalAmount}</span>
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Donation Requests */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Community Donation Requests</h3>
                <button onClick={() => setActiveTab('DONATIONS')} className="text-xs text-amber-600 font-bold hover:underline">
                  View All
                </button>
              </div>

              {donations.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No donation requests yet.</p>
              ) : (
                <div className="space-y-3">
                  {donations.slice(0, 4).map((d) => (
                    <div key={d.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900">{d.foodName}</h4>
                          <p className="text-slate-500 font-medium">
                            {d.requesterName} {d.organization && `(${d.organization})`} • {d.phone}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          d.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.status}
                        </span>
                      </div>
                      <p className="text-slate-600 italic line-clamp-1">&quot;{d.reason}&quot;</p>
                      
                      {d.status === 'PENDING' && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleDonationAction(d.id, 'ACCEPTED')}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px]"
                          >
                            Accept Donation
                          </button>
                          <button
                            onClick={() => handleDonationAction(d.id, 'REJECTED')}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: MY LISTINGS */}
        {activeTab === 'LISTINGS' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">All Food Listings</h3>
              <Link href="/provider/add" className="text-xs font-bold text-amber-600 hover:underline">
                + Add New Listing
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Food Item</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Portions Left</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Pickup Deadline</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">
                        <Link href={`/listings/${l.id}`} className="hover:text-amber-600">
                          {l.foodName}
                        </Link>
                        <span className="block text-[11px] font-normal text-slate-400">{l.category} • {l.location}</span>
                      </td>
                      <td className="p-4">
                        {l.listingType === 'DONATION' ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            DONATION
                          </span>
                        ) : (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            SALE
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {l.listingType === 'DONATION' ? 'FREE' : `Rs. ${l.sellingPrice}`}
                      </td>
                      <td className="p-4 font-semibold text-slate-900">
                        {l.quantityRemaining} / {l.quantity}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(l.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Link
                          href={`/listings/${l.id}`}
                          className="px-2.5 py-1 text-slate-600 hover:text-amber-600 font-bold text-xs"
                        >
                          View
                        </Link>
                        {l.status === 'AVAILABLE' && (
                          <button
                            onClick={() => handleCloseListing(l.id)}
                            className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-md font-bold text-xs"
                          >
                            Close Listing
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: RESERVATIONS */}
        {activeTab === 'RESERVATIONS' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Customer Sale Reservations</h3>
              <p className="text-xs text-slate-500">Payment will be made in cash/counter upon customer arrival.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Food Item</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Portions</th>
                    <th className="p-4">Payable Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono font-bold text-slate-900">{r.id}</td>
                      <td className="p-4 font-bold text-slate-900">{r.foodName}</td>
                      <td className="p-4 font-semibold text-slate-800">{r.customerName}</td>
                      <td className="p-4 font-medium text-slate-600">{r.customerPhone}</td>
                      <td className="p-4 font-bold text-slate-900">{r.quantity}</td>
                      <td className="p-4 font-black text-amber-600">Rs. {r.totalAmount}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DONATIONS */}
        {activeTab === 'DONATIONS' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Community Donation Requests</h3>
              <p className="text-xs text-slate-500">Review requests from individuals and charities and accept/reject them.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Food Item</th>
                    <th className="p-4">Requester / Organization</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Portions</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{d.foodName}</td>
                      <td className="p-4 font-semibold text-slate-800">
                        {d.requesterName}
                        {d.organization && <span className="block text-[11px] font-normal text-slate-400">{d.organization}</span>}
                      </td>
                      <td className="p-4 font-medium text-slate-600">{d.phone}</td>
                      <td className="p-4 font-bold text-emerald-700">{d.quantity} (FREE)</td>
                      <td className="p-4 text-slate-600 max-w-xs">{d.reason}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          d.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {d.status === 'PENDING' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDonationAction(d.id, 'ACCEPTED')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-bold text-xs"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDonationAction(d.id, 'REJECTED')}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-bold text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
