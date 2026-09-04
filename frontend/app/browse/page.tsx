'use client';

import { useState, useEffect, useTransition } from 'react';
import { Search, Filter, MapPin, Tag, HeartHandshake, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import FoodCard from '@/components/FoodCard';
import { api, Listing } from '@/lib/api';

const CATEGORIES = [
  'All',
  'Rice & Curry',
  'Prepared Meals',
  'Bakery',
  'Snacks',
  'Desserts',
  'Beverages',
  'Other',
];

const LOCATIONS = [
  'All',
  'Colombo',
  'Malabe',
  'Kaduwela',
  'Battaramulla',
  'Galle Fort',
  'Dehiwala',
  'Nugegoda',
];

export default function BrowsePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [listingType, setListingType] = useState<'All' | 'SALE' | 'DONATION'>('All');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'PRICE_LOW' | 'EXPIRING_SOON'>('NEWEST');

  const fetchFoodListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (search.trim()) params.search = search.trim();
      if (category !== 'All') params.category = category;
      if (location !== 'All') params.location = location;
      if (listingType !== 'All') params.listingType = listingType;

      const res = await api.getListings(params);
      let data = res.data || [];

      // Sort
      if (sortBy === 'PRICE_LOW') {
        data = [...data].sort((a, b) => a.sellingPrice - b.sellingPrice);
      } else if (sortBy === 'EXPIRING_SOON') {
        data = [...data].sort((a, b) => new Date(a.pickupEnd).getTime() - new Date(b.pickupEnd).getTime());
      } else {
        // NEWEST
        data = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      setListings(data);
    } catch (err: any) {
      console.error('Fetch listings error:', err);
      setError('Could not load food listings. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodListings();
  }, [category, location, listingType, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFoodListings();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setLocation('All');
    setListingType('All');
    setSortBy('NEWEST');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-2">
            <span>🍚</span>
            <span>Live Food Discovery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Surplus Food Available in Sri Lanka
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse discounted meals from top eateries or request free meals donated by catering partners.
          </p>
        </div>

        {/* Filter Bar Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
          
          {/* Search Input & Sale/Donation Toggle */}
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food, chicken rice, kottu, bakery or restaurant name..."
                className="w-full pl-11 pr-24 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-2xl border border-slate-200 text-sm focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-slate-900 placeholder-slate-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Sale / Donation Pills */}
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
              <button
                onClick={() => setListingType('All')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  listingType === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Food
              </button>
              <button
                onClick={() => setListingType('SALE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  listingType === 'SALE' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                Discount Sale
              </button>
              <button
                onClick={() => setListingType('DONATION')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  listingType === 'DONATION' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Free Donation
              </button>
            </div>

          </div>

          {/* Secondary Filters: Location, Category & Sort */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">Category:</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-amber-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">Location:</span>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-amber-500"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-amber-500"
              >
                <option value="NEWEST">Newest Listings</option>
                <option value="PRICE_LOW">Lowest Price</option>
                <option value="EXPIRING_SOON">Ending Soon</option>
              </select>
            </div>

            {(category !== 'All' || location !== 'All' || listingType !== 'All' || search) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-amber-700 hover:text-amber-800 font-bold underline ml-auto cursor-pointer"
              >
                Reset Filters
              </button>
            )}

          </div>

        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
          <span>Showing {listings.length} food listing{listings.length === 1 ? '' : 's'}</span>
          <button
            onClick={fetchFoodListings}
            className="flex items-center gap-1 hover:text-amber-600 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchFoodListings}
              className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse p-4 space-y-4">
                <div className="h-4 bg-slate-200 rounded-sm w-1/3" />
                <div className="h-6 bg-slate-200 rounded-sm w-3/4" />
                <div className="h-16 bg-slate-100 rounded-sm" />
                <div className="h-8 bg-slate-200 rounded-sm" />
              </div>
            ))}
          </div>
        )}

        {/* Listings Grid */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => (
              <FoodCard key={item.id} listing={item} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && listings.length === 0 && (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-100 text-amber-800 text-2xl flex items-center justify-center">
              🍚
            </div>
            <h3 className="text-xl font-bold text-slate-900">No food found matching your filters</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Try adjusting your search query, changing locations, or switching between Discount Sale and Free Donations.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
