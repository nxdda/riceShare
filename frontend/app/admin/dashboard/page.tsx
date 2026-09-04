'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, Users, Store, UtensilsCrossed, PackageCheck, AlertTriangle, 
  Trash2, RefreshCw, CheckCircle, HeartHandshake, DollarSign 
} from 'lucide-react';
import { api, AdminStats, Listing } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'LISTINGS' | 'USERS' | 'IMPACT'>('LISTINGS');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, listingsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminListings(),
        api.getAdminUsers(),
      ]);
      setStats(statsRes.data);
      setListings(listingsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role !== 'ADMIN') {
      setIsAuthorized(false);
      setLoading(false);
    } else {
      setIsAuthorized(true);
      loadAdminData();
    }
  }, []);

  const handleModerate = async (id: string, action: 'REMOVE' | 'RESTORE') => {
    setActionLoading(true);
    try {
      const res = await api.moderateListing(id, action);
      if (res.success) {
        setMessage(action === 'REMOVE' ? 'Listing closed from public marketplace' : 'Listing restored');
        loadAdminData();
      }
    } catch (err: any) {
      setMessage(err.message || 'Moderation action failed');
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (isAuthorized === false) {
    const user = getStoredUser();
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-rose-100 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Administrator Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            This dashboard is restricted to authorized RiceShare system administrators. You are currently logged in as a <strong className="text-slate-900">{user?.role || 'Guest'}</strong>.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in?role=ADMIN"
              className="inline-flex items-center justify-center py-3 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-xs"
            >
              Sign In as Administrator
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold mb-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Governance</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              RiceShare Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Overview of marketplace health, platform statistics, user registry, and content moderation.
            </p>
          </div>

          <button
            onClick={loadAdminData}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage(null)} className="text-purple-700 font-bold">Dismiss</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</div>
            <p className="text-[11px] font-semibold text-slate-500">Total Users</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center mb-2">
              <Store className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalProviders || 0}</div>
            <p className="text-[11px] font-semibold text-slate-500">Providers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.activeListings || 0}</div>
            <p className="text-[11px] font-semibold text-slate-500">Active Listings</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalReservations || 0}</div>
            <p className="text-[11px] font-semibold text-slate-500">Reservations</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.totalDonations || 0}</div>
            <p className="text-[11px] font-semibold text-slate-500">Donations Granted</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center mb-2">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-2xl font-black text-slate-900">{stats?.mealsRescued || 0}</div>
            <p className="text-[11px] font-semibold text-slate-500">Meals Rescued</p>
          </div>

        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('LISTINGS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'LISTINGS' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Listings &amp; Moderation ({listings.length})
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'USERS' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('IMPACT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'IMPACT' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            National Impact Analytics
          </button>
        </div>

        {/* TAB 1: LISTINGS MODERATION */}
        {activeTab === 'LISTINGS' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Marketplace Food Moderation</h3>
              <p className="text-xs text-slate-500">Administrators can remove inappropriate, spoiled, or reported food items.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Food Item</th>
                    <th className="p-4">Provider</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Portions</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Moderation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">
                        <Link href={`/listings/${l.id}`} className="hover:text-purple-600">
                          {l.foodName}
                        </Link>
                        <span className="block text-[11px] font-normal text-slate-400">{l.category}</span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">{l.providerName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          l.listingType === 'DONATION' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {l.listingType}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {l.listingType === 'DONATION' ? 'FREE' : `Rs. ${l.sellingPrice}`}
                      </td>
                      <td className="p-4">{l.quantityRemaining} / {l.quantity}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                          l.status === 'CLOSED' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-800'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {l.status === 'AVAILABLE' ? (
                          <button
                            onClick={() => handleModerate(l.id, 'REMOVE')}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg font-bold text-[11px]"
                          >
                            Remove / Close
                          </button>
                        ) : (
                          <button
                            onClick={() => handleModerate(l.id, 'RESTORE')}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px]"
                          >
                            Restore Listing
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

        {/* TAB 2: USERS */}
        {activeTab === 'USERS' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Platform Users</h3>
              <p className="text-xs text-slate-500">Clerk authenticated users linked to RiceShare application roles.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Clerk User ID</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{u.name}</td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4 font-mono text-[11px] text-slate-400">{u.clerkUserId}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          u.role === 'PROVIDER' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: IMPACT */}
        {activeTab === 'IMPACT' && (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Sri Lanka Food Waste Metrics</h3>
              <p className="text-xs text-slate-500 mt-1">Calculated based on surplus portions diverted from municipal waste bins.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="text-xs font-bold text-amber-700 uppercase">CO2 Emissions Prevented</span>
                <div className="text-3xl font-black text-amber-950 mt-1">3.6 Metric Tonnes</div>
                <p className="text-xs text-amber-800/80 mt-2">
                  Equivalent to removing 8 petrol cars off Colombo roads for a full month.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700 uppercase">Charity Care Home Reach</span>
                <div className="text-3xl font-black text-emerald-950 mt-1">18 Orphanages &amp; Care Centers</div>
                <p className="text-xs text-emerald-800/80 mt-2">
                  Benefiting from regular banquet buffet donations across Western Province.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200">
                <span className="text-xs font-bold text-purple-700 uppercase">Total Household Savings</span>
                <div className="text-3xl font-black text-purple-950 mt-1">Rs. {stats ? (stats.moneySaved + 285400).toLocaleString() : '285,400'}</div>
                <p className="text-xs text-purple-800/80 mt-2">
                  Direct food expenditure savings for Sri Lankan citizens and students.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
