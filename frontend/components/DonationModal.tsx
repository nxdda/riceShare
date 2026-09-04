'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, HeartHandshake, MapPin, Building } from 'lucide-react';
import { Listing, api, DonationRequest } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

interface DonationModalProps {
  listing: Listing;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DonationModal({ listing, onClose, onSuccess }: DonationModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedRequest, setConfirmedRequest] = useState<DonationRequest | null>(null);

  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      if (user.name) setName(user.name);
      if (user.phone) setPhone(user.phone);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide your name or authorized contact');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      setError('Please enter a valid phone number');
      return;
    }
    if (quantity <= 0 || quantity > listing.quantityRemaining) {
      setError(`Quantity must be between 1 and ${listing.quantityRemaining} portions`);
      return;
    }
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Please describe your organization or distribution cause (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      const user = getStoredUser();
      const res = await api.createDonationRequest({
        listingId: listing.id,
        userId: user?.id,
        requesterName: name.trim(),
        organization: organization.trim() || undefined,
        phone: phone.trim(),
        quantity,
        reason: reason.trim(),
      });

      if (res.success && res.data) {
        setConfirmedRequest(res.data);
        onSuccess();
      } else {
        setError(res.message || 'Could not submit donation request');
      }
    } catch (err: any) {
      setError(err.message || 'Server error while submitting request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              Community Food Donation
            </span>
            <h2 className="text-xl font-black">
              {confirmedRequest ? 'Request Submitted! 🤝' : 'Request Free Donated Food'}
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
          {confirmedRequest ? (
            /* Confirmation View */
            <div className="space-y-6 animate-in zoom-in-95 duration-200">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Donation Request Sent to Provider</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    {listing.providerName} has been notified. You will be contacted at <strong>{phone}</strong> upon approval.
                  </p>
                </div>
              </div>

              {/* Summary */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-slate-500 font-semibold uppercase text-[10px]">Request ID</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded-md border border-slate-300">
                    {confirmedRequest.id}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Food Item</span>
                  <span className="font-bold text-slate-900">{listing.foodName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Portions Requested</span>
                  <span className="font-bold text-slate-900">{confirmedRequest.quantity} portions (FREE)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Location</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {listing.location}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    PENDING PROVIDER REVIEW
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md shadow-emerald-600/20"
              >
                Done
              </button>
            </div>
          ) : (
            /* Request Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Pill */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{listing.foodName}</h4>
                  <p className="text-xs text-slate-500">{listing.providerName} • {listing.location}</p>
                </div>
                <span className="text-base font-black text-emerald-700">100% FREE</span>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Requested Portions ({listing.quantityRemaining} available)
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
                  <span className="text-xs text-slate-500">Free community portions</span>
                </div>
              </div>

              {/* Requester Name & Organization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name / Contact *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rotaract / Community Care"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
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
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason / Beneficiary Purpose *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Tell the provider how the food will be distributed or who will benefit..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 focus:outline-hidden"
                />
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
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 rounded-xl transition-all shadow-md shadow-emerald-600/20"
                >
                  {loading ? 'Submitting...' : 'Submit Donation Request'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
