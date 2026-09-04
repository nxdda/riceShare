'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, ArrowLeft, AlertCircle, CheckCircle2, Tag, HeartHandshake, Sparkles, Store, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

const CATEGORIES = [
  'Rice & Curry',
  'Prepared Meals',
  'Bakery',
  'Snacks',
  'Desserts',
  'Beverages',
  'Other',
];

const LOCATIONS = [
  'Colombo',
  'Malabe',
  'Kaduwela',
  'Battaramulla',
  'Galle Fort',
  'Dehiwala',
  'Nugegoda',
  'Kandy',
];

export default function AddFoodPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (!user || (user.role !== 'PROVIDER' && user.role !== 'ADMIN')) {
      setIsAuthorized(false);
    } else {
      setIsAuthorized(true);
      if (user.businessName) {
        setProviderName(user.businessName);
      } else if (user.name) {
        setProviderName(user.name);
      }
    }
  }, []);

  // Form State
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Rice & Curry');
  const [quantity, setQuantity] = useState(10);
  const [listingType, setListingType] = useState<'SALE' | 'DONATION'>('SALE');
  const [originalPrice, setOriginalPrice] = useState(400);
  const [sellingPrice, setSellingPrice] = useState(180);
  const [location, setLocation] = useState('Malabe');
  const [providerName, setProviderName] = useState('');

  // Default times: today pickup window
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 30 * 60000).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 4 * 3600000).toISOString().slice(0, 16);

  const [pickupStart, setPickupStart] = useState(defaultStart);
  const [pickupEnd, setPickupEnd] = useState(defaultEnd);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // File Upload Handler (Base64 data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, or WEBP)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const FOOD_PRESETS = [
    { label: '🍛 Rice & Curry', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80' },
    { label: '🍚 Fried Rice', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80' },
    { label: '🥘 Kottu Roti', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80' },
    { label: '🥖 Bakery & Bread', url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80' },
    { label: '🥟 Short Eats', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
    { label: '🍰 Desserts', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' },
    { label: '🧃 Fresh Juice', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Live validation
    if (!foodName.trim()) {
      setError('Food name is required');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero');
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Description must be at least 10 characters describing ingredients/condition');
      return;
    }
    if (new Date(pickupEnd).getTime() <= new Date(pickupStart).getTime()) {
      setError('Pickup end time must be after pickup start time');
      return;
    }

    if (listingType === 'SALE') {
      if (originalPrice < 0 || sellingPrice < 0) {
        setError('Prices cannot be negative');
        return;
      }
      if (sellingPrice > originalPrice) {
        setError('Selling price cannot exceed the original price');
        return;
      }
    }

    setLoading(true);

    try {
      const user = getStoredUser();
      const currentProviderId = user?.providerId || user?.id || 'prov-abc';
      const currentProviderName = providerName.trim() || user?.businessName || user?.name || 'RiceShare Partner';

      const res = await api.createListing({
        providerId: currentProviderId,
        providerName: currentProviderName,
        foodName: foodName.trim(),
        category,
        quantity: Number(quantity),
        originalPrice: listingType === 'DONATION' ? 0 : Number(originalPrice),
        sellingPrice: listingType === 'DONATION' ? 0 : Number(sellingPrice),
        listingType,
        location,
        pickupStart: new Date(pickupStart).toISOString(),
        pickupEnd: new Date(pickupEnd).toISOString(),
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/provider/dashboard');
        }, 1500);
      } else {
        setError(res.message || 'Failed to publish listing');
      }
    } catch (err: any) {
      setError(err.message || 'Server error while publishing food listing');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthorized === false) {
    const user = getStoredUser();
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-amber-200 shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <PlusCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Food Provider Portal Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Only registered restaurants, bakeries, hotels, and food providers can list surplus food. You are currently logged in as a <strong className="text-slate-900">{user?.role || 'Guest'}</strong>.
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Provider Dashboard
        </Link>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Header */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200 block">
                Food Provider Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">
                List Safe Surplus Food
              </h1>
              <p className="text-xs text-amber-100 mt-1">
                Offer your unsold fresh buffet, bakery items, or event surplus for discounted sale or free donation.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 hidden sm:flex">
              <PlusCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            
            {/* Success Notification */}
            {success && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Listing published successfully! Redirecting to food discovery...</span>
              </div>
            )}

            {/* Error Notification */}
            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Listing Type Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Listing Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setListingType('SALE')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    listingType === 'SALE'
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Tag className={`w-5 h-5 mt-0.5 ${listingType === 'SALE' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Discount Sale</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Recoup costs with 50-70% off retail price.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('DONATION')}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    listingType === 'DONATION'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <HeartHandshake className={`w-5 h-5 mt-0.5 ${listingType === 'DONATION' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Free Donation</h4>
                    <p className="text-xs text-slate-500 mt-0.5">100% Free grant for charities &amp; individuals in need.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Food Name & Provider Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Food Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicken Rice & Curry Pack"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Provider / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Restaurant / City Bakery"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Food Image Upload & Presets */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    Food Photo (Recommended)
                  </label>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload a photo from your phone or device, paste an image link, or select a preset below.
                  </p>
                </div>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove Photo
                  </button>
                )}
              </div>

              {/* Upload or URL Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* File Upload Button */}
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-amber-400 bg-white hover:bg-amber-50/50 text-amber-900 text-xs font-bold cursor-pointer transition-colors shadow-xs">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>Choose Photo from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Direct URL Input */}
                <input
                  type="url"
                  placeholder="Or paste image web link (http...)"
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden bg-white"
                />
              </div>

              {uploadError && (
                <p className="text-[11px] text-red-600 font-semibold">{uploadError}</p>
              )}

              {/* Quick Preset Buttons */}
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400 mb-2">
                  Or Click a Sri Lankan Food Preset:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FOOD_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setImageUrl(preset.url)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        imageUrl === preset.url
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              {imageUrl && (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-slate-200 bg-black/5 shadow-inner">
                  <img
                    src={imageUrl}
                    alt="Food preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-xs">
                    Live Preview
                  </div>
                </div>
              )}
            </div>

            {/* Category & Quantity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Portions Available *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Pricing (Conditional on SALE vs DONATION) */}
            {listingType === 'SALE' ? (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Original Regular Price (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discounted Selling Price (LKR) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={sellingPrice}
                      onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden bg-white"
                    />
                  </div>
                  {originalPrice > 0 && sellingPrice <= originalPrice && (
                    <span className="text-[11px] font-bold text-emerald-600 block mt-1">
                      {Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)}% Discount for customer
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-emerald-900">Donation Price: Rs. 0 (100% Free)</h4>
                  <p className="text-xs text-emerald-700">Selling price is automatically zero for free community donations.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-extrabold text-xs rounded-full">
                  FREE
                </span>
              </div>
            )}

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pickup Location in Sri Lanka *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden bg-white"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Pickup Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Window Start *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupStart}
                  onChange={(e) => setPickupStart(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pickup Window End (Deadline) *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={pickupEnd}
                  onChange={(e) => setPickupEnd(e.target.value)}
                  className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description &amp; Food Quality Details *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe how the food was prepared, packaging type, storage temperature, and any allergen notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:outline-hidden"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Minimum 10 characters. Please be accurate so customers know what to expect.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <Link
                href="/provider/dashboard"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                {loading ? 'Publishing Listing...' : 'Publish Food Listing'}
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
