'use client';

import { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Clock, MapPin, Store, CreditCard, ShieldCheck } from 'lucide-react';
import { Listing, api, Reservation } from '@/lib/api';

interface ReserveModalProps {
  listing: Listing;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReserveModal({ listing, onClose, onSuccess }: ReserveModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  const totalAmount = quantity * listing.sellingPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your full name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setError('Please enter a valid phone number (e.g. +94 77 123 4567)');
      return;
    }
    if (quantity <= 0 || quantity > listing.quantityRemaining) {
      setError(`Quantity must be between 1 and ${listing.quantityRemaining}`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.createReservation({
        listingId: listing.id,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        quantity,
      });

      if (res.success && res.data) {
        setConfirmedReservation(res.data);
        onSuccess();
      } else {
        setError(res.message || 'Could not complete reservation');
      }
    } catch (err: any) {
      setError(err.message || 'Server error while reserving food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
              Surplus Food Reservation
            </span>
            <h2 className="text-xl font-black">
              {confirmedReservation ? 'Reservation Confirmed! 🎉' : 'Reserve & Pay at Pickup'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {confirmedReservation ? (
            /* Confirmation Receipt View */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Your meal is safely reserved!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Show your reservation code at the counter during the pickup window.
                  </p>
                </div>
              </div>

              {/* Receipt Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs text-slate-700">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Reservation Code</span>
                  <span className="font-mono font-bold text-slate-900 text-sm bg-white px-2 py-1 rounded-md border border-slate-300">
                    {confirmedReservation.id}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Food Item</span>
                  <span className="font-bold text-slate-900">{listing.foodName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Provider</span>
                  <span className="font-semibold text-slate-900">{listing.providerName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {listing.location}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Deadline</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {new Date(listing.pickupEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Portions Reserved</span>
                  <span className="font-bold text-slate-900">{confirmedReservation.quantity} portions</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Payable at Pickup</span>
                  <span className="text-lg font-black text-amber-600">
                    Rs. {confirmedReservation.totalAmount}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="w-full py-3 text-center text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md shadow-amber-600/20"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Reservation Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Summary Pill */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{listing.foodName}</h4>
                  <p className="text-xs text-slate-500">{listing.providerName} • {listing.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900">Rs. {listing.sellingPrice}</span>
                  <span className="block text-[11px] text-amber-700 font-medium">per portion</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Portions ({listing.quantityRemaining} available)
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-slate-900 bg-white min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(listing.quantityRemaining, quantity + 1))}
                      className="px-3.5 py-2 font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500">
                    Total: <strong className="text-slate-900 text-sm">Rs. {totalAmount}</strong>
                  </span>
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dilshan Perera"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* No Payment Required Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Reserve &amp; Pay at Pickup:</strong> No online payment or card is required right now. You pay directly at the store.
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 rounded-xl transition-all shadow-md shadow-amber-600/20"
                >
                  {loading ? 'Confirming...' : `Confirm Reservation (Rs. ${totalAmount})`}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
