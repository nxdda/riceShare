import Link from 'next/link';
import { Heart, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                <span className="text-xl">🍚</span>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Rice<span className="text-amber-500">Share</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Sri Lanka&apos;s leading surplus-food marketplace. We connect hotels, restaurants, bakeries, and event organizers with people and community charities.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
              <span>Sell it. Share it. Save it.</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Colombo, Malabe, Kaduwela &amp; Islandwide
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Marketplace</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/browse" className="hover:text-amber-400 transition-colors">
                  Find Surplus Food
                </Link>
              </li>
              <li>
                <Link href="/browse?type=DONATION" className="hover:text-amber-400 transition-colors">
                  Free Community Donations
                </Link>
              </li>
              <li>
                <Link href="/provider/add" className="hover:text-amber-400 transition-colors">
                  List Your Surplus Food
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-amber-400 transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Portals</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/customer/dashboard" className="hover:text-amber-400 transition-colors">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/provider/dashboard" className="hover:text-amber-400 transition-colors">
                  Provider Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/dashboard" className="hover:text-amber-400 transition-colors">
                  Admin Platform
                </Link>
              </li>
              <li>
                <Link href="/#impact" className="hover:text-amber-400 transition-colors">
                  Sri Lanka Food Waste Impact
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} RiceShare Sri Lanka. Built for SEF Hackathon.</p>
          <div className="flex items-center gap-2">
            <span>Powered by Next.js, Clerk &amp; Gemini AI</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> to end hunger
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
