'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Clock, PackageCheck, Tag, HeartHandshake, ShieldCheck, AlertCircle, Share2, Sparkles } from 'lucide-react';
import ReserveModal from '@/components/ReserveModal';
import DonationModal from '@/components/DonationModal';
import { api, Listing } from '@/lib/api';

export default function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getListingById(id);
      if (res.success && res.data) {
        setListing(res.data);
      } else {
        setError('Food listing not found');
      }
    } catch (err: any) {
      setError(err.message || 'Could not load listing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading food details...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="max-w-md mx-auto text-center bg-white p-8 rounded-3xl border border-slate-200 space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold">
            ⚠️
          </div>
          <h2 className="text-xl font-bold text-slate-900">{error || 'Food Listing Not Found'}</h2>
          <p className="text-xs text-slate-500">
            This food item may have expired, sold out, or was removed by the provider.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Browse Food
          </Link>
        </div>
      </div>
    );
  }

  const isDonation = listing.listingType === 'DONATION';
  const isAvailable = listing.status === 'AVAILABLE' && listing.quantityRemaining > 0;
  const discountPercent = listing.originalPrice > 0 && listing.sellingPrice > 0
    ? Math.round(((listing.originalPrice - listing.sellingPrice) / listing.originalPrice) * 100)
    : 0;

  const pickupStartStr = new Date(listing.pickupStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const pickupEndStr = new Date(listing.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Back Link */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Food Listings
        </Link>

        {/* Main Details Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* Hero Food Image */}
          {listing.imageUrl && (
            <div className="relative w-full h-64 sm:h-80 overflow-hidden bg-slate-100">
              <img
                src={listing.imageUrl}
                alt={listing.foodName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Header Banner */}
          <div className="p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {isDonation ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <HeartHandshake className="w-3.5 h-3.5" />
                    FREE COMMUNITY DONATION
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    <Tag className="w-3.5 h-3.5 text-amber-700" />
                    SURPLUS SALE {discountPercent > 0 && `• ${discountPercent}% DISCOUNT`}
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                  {listing.category}
                </span>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  listing.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {listing.status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {listing.foodName}
              </h1>

              <p className="text-xs sm:text-sm font-semibold text-slate-600 flex items-center gap-2">
                <span>By {listing.providerName}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  {listing.location}
                </span>
              </p>
            </div>

            {/* Price block in header */}
            <div className="sm:text-right bg-white/80 backdrop-blur-xs p-4 rounded-2xl border border-slate-200/80 shrink-0">
              {isDonation ? (
                <div>
                  <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block">Charity &amp; Community</span>
                  <span className="text-3xl font-black text-emerald-700">FREE</span>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Discounted Price</span>
                  <div className="flex items-baseline sm:justify-end gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      Rs. {listing.sellingPrice}
                    </span>
                    {listing.originalPrice > listing.sellingPrice && (
                      <span className="text-sm text-slate-400 line-through font-semibold">
                        Rs. {listing.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description & Key Parameters */}
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                About this Food
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Available Portions</span>
                  <span className="text-sm font-bold text-slate-900">{listing.quantityRemaining} remaining</span>
                  <span className="text-[10px] text-slate-500 block">Out of {listing.quantity} listed</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Pickup Window</span>
                  <span className="text-sm font-bold text-slate-900">{pickupStartStr} – {pickupEndStr}</span>
                  <span className="text-[10px] text-slate-500 block">Please arrive on time</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Pickup Location</span>
                  <span className="text-sm font-bold text-slate-900">{listing.location}</span>
                  <span className="text-[10px] text-slate-500 block">{listing.providerName}</span>
                </div>
              </div>

            </div>

            {/* Action Area */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                {isDonation ? (
                  <span>For individuals, community groups, and registered care organizations.</span>
                ) : (
                  <span>Reserve now with zero advance payment. Pay Rs. {listing.sellingPrice} at pickup counter.</span>
                )}
              </div>

              <div className="w-full sm:w-auto flex items-center gap-3">
                {isDonation ? (
                  <button
                    onClick={() => setShowDonationModal(true)}
                    disabled={!isAvailable}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-sm transition-all shadow-md shadow-emerald-600/20"
                  >
                    {isAvailable ? 'Request Free Donation' : 'No Portions Available'}
                  </button>
                ) : (
                  <button
                    onClick={() => setShowReserveModal(true)}
                    disabled={!isAvailable}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-sm transition-all shadow-md shadow-amber-600/20"
                  >
                    {isAvailable ? `Reserve Food (Rs. ${listing.sellingPrice})` : 'Sold Out'}
                  </button>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modals */}
      {showReserveModal && (
        <ReserveModal
          listing={listing}
          onClose={() => setShowReserveModal(false)}
          onSuccess={() => {
            fetchListing();
          }}
        />
      )}

      {showDonationModal && (
        <DonationModal
          listing={listing}
          onClose={() => setShowDonationModal(false)}
          onSuccess={() => {
            fetchListing();
          }}
        />
      )}

    </div>
  );
}
