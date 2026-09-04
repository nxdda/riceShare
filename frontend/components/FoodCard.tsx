'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Clock, PackageCheck, HeartHandshake, Tag, ArrowRight, Utensils } from 'lucide-react';
import { Listing } from '@/lib/api';

interface FoodCardProps {
  listing: Listing;
}

export default function FoodCard({ listing }: FoodCardProps) {
  const [imageError, setImageError] = useState(false);

  const isDonation = listing.listingType === 'DONATION';
  const isSoldOut = listing.status === 'SOLD_OUT' || listing.quantityRemaining <= 0;
  const isClosed = listing.status === 'CLOSED';

  // Format pickup deadline
  const pickupTimeStr = new Date(listing.pickupEnd).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Calculate discount percent
  const discountPercent = listing.originalPrice > 0 && listing.sellingPrice > 0
    ? Math.round(((listing.originalPrice - listing.sellingPrice) / listing.originalPrice) * 100)
    : 0;

  return (
    <div className={`group relative bg-white rounded-3xl border transition-all duration-200 flex flex-col overflow-hidden ${
      isSoldOut || isClosed
        ? 'border-slate-200 opacity-80 bg-slate-50/60'
        : 'border-slate-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1'
    }`}>
      
      {/* Food Photo Container */}
      <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-slate-100">
        {listing.imageUrl && !imageError ? (
          <img
            src={listing.imageUrl}
            alt={listing.foodName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-amber-100 to-orange-100 text-amber-700">
            <Utensils className="w-10 h-10 opacity-40 mb-1" />
            <span className="text-xs font-semibold opacity-60">RiceShare Food</span>
          </div>
        )}

        {/* Gradient Shadow for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {isDonation ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-600 text-white shadow-md">
                <HeartHandshake className="w-3 h-3" />
                DONATION
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-600 text-white shadow-md">
                <Tag className="w-3 h-3" />
                SALE {discountPercent > 0 && `• ${discountPercent}% OFF`}
              </span>
            )}

            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
              {listing.category}
            </span>
          </div>

          {/* Status Badge */}
          {isSoldOut ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-600 text-white shadow-md">
              SOLD OUT
            </span>
          ) : isClosed ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-700 text-white shadow-md">
              CLOSED
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white shadow-md">
              AVAILABLE
            </span>
          )}
        </div>

        {/* Bottom image overlay: Location & Remaining */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold drop-shadow-md">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-400" />
            {listing.location}
          </span>
          <span className="bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md">
            {listing.quantityRemaining} portions left
          </span>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {listing.foodName}
          </h3>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {listing.providerName || 'Local Sri Lankan Partner'}
          </p>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Pickup Time Details */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pickup until <strong>{pickupTimeStr}</strong></span>
          </div>
        </div>
      </div>

      {/* Price & Action Footer */}
      <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
        <div>
          {isDonation ? (
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Community Grant</span>
              <span className="text-xl font-black text-emerald-700">FREE</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-900">
                Rs. {listing.sellingPrice}
              </span>
              {listing.originalPrice > listing.sellingPrice && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  Rs. {listing.originalPrice}
                </span>
              )}
            </div>
          )}
        </div>

        <Link
          href={`/listings/${listing.id}`}
          className={`inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isSoldOut || isClosed
              ? 'bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none'
              : 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs hover:shadow-md hover:shadow-amber-600/20 group-hover:gap-1.5'
          }`}
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
