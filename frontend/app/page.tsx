import Link from 'next/link';
import { 
  UtensilsCrossed, PlusCircle, ArrowRight, HeartHandshake, Sparkles, 
  DollarSign, Store, CheckCircle, Clock, MapPin, Tag, ShieldCheck, 
  Flame, ChevronRight, PackageCheck, Heart
} from 'lucide-react';
import FoodCard from '@/components/FoodCard';
import { api, Listing, ImpactStats } from '@/lib/api';

export const dynamic = 'force-dynamic';

const fallbackImpact: ImpactStats = {
  mealsRescued: 1475,
  mealsDonated: 620,
  moneySavedLKR: 285400,
  foodProviders: 42,
};

const CATEGORIES = [
  { name: 'Rice & Curry', emoji: '🍛' },
  { name: 'Prepared Meals', emoji: '🥘' },
  { name: 'Bakery', emoji: '🥖' },
  { name: 'Snacks', emoji: '🥟' },
  { name: 'Desserts', emoji: '🍰' },
  { name: 'Beverages', emoji: '🧃' },
];

const POPULAR_LOCATIONS = ['Colombo', 'Malabe', 'Kaduwela', 'Battaramulla', 'Galle Fort'];

async function getData(): Promise<{ listings: Listing[]; impact: ImpactStats }> {
  try {
    const [listingsRes, impactRes] = await Promise.all([
      api.getListings({ status: 'AVAILABLE' }),
      api.getImpact(),
    ]);
    return {
      listings: listingsRes.data || [],
      impact: impactRes.data || fallbackImpact,
    };
  } catch (err) {
    console.warn('Could not fetch server data on landing page, using defaults:', err);
    return { listings: [], impact: fallbackImpact };
  }
}

export default async function HomePage() {
  const { listings, impact } = await getData();
  const featuredListings = listings.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* ===================================================
          1. HERO SECTION (2-Column Modern Layout)
         =================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/90 via-orange-50/40 to-white pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-amber-100/70">
        
        {/* Subtle Warm Background Glows */}
        <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-0 -translate-x-1/2 w-80 h-80 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline & Call To Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Tagline Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-200 shadow-xs text-xs font-bold text-amber-950">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Sri Lanka&apos;s Surplus-Food Marketplace</span>
                <span className="text-amber-400">•</span>
                <span className="text-amber-700">Sell it. Share it. Save it.</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Good food shouldn&apos;t <br />
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
                  become waste.
                </span>
              </h1>

              {/* High-Contrast Clear Subtitle */}
              <p className="text-base sm:text-xl text-slate-700 leading-relaxed font-normal max-w-2xl">
                Connect surplus meals from top restaurants, hotels, bakeries, and event organizers with people who need it. 
                <strong className="text-slate-900 font-semibold"> Sell at 50%–70% discount</strong> or <strong className="text-emerald-700 font-semibold">donate 100% free</strong>.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link
                  href="/browse"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/35 hover:-translate-y-0.5 transition-all"
                >
                  <UtensilsCrossed className="w-5 h-5" />
                  Find Food Now
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </Link>
                <Link
                  href="/provider/add"
                  className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm sm:text-base border border-slate-300 hover:border-slate-400 flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all"
                >
                  <PlusCircle className="w-5 h-5 text-orange-500" />
                  List Surplus Food
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Reserve &amp; Pay at Pickup
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  100% Free Donation Option
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  Verified Food Providers
                </span>
              </div>

              {/* Popular Locations Quick Bar */}
              <div className="pt-2 flex items-center gap-2 flex-wrap text-xs text-slate-500">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  Popular:
                </span>
                {POPULAR_LOCATIONS.map((loc) => (
                  <Link
                    key={loc}
                    href={`/browse?location=${loc}`}
                    className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white border border-slate-200 text-slate-700 hover:text-amber-600 font-medium transition-colors shadow-2xs"
                  >
                    {loc}
                  </Link>
                ))}
              </div>

            </div>

            {/* Right Column: Interactive Hero Showcase Card */}
            <div className="lg:col-span-5 relative">
              
              {/* Decorative Card Backing */}
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-4 shadow-2xl border border-slate-200/90 space-y-4">
                
                {/* Hero Showcase Food Image */}
                <div className="relative h-56 rounded-2xl overflow-hidden bg-slate-100">
                  <img
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
                    alt="Sri Lankan Chicken Rice & Curry"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-black shadow-md flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      56% OFF
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-slate-900 text-xs font-bold shadow-xs">
                      Rice &amp; Curry
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold drop-shadow-md">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      Malabe, Western Province
                    </span>
                    <span className="bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-md">
                      12 portions left
                    </span>
                  </div>
                </div>

                {/* Card Information */}
                <div className="px-2 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">
                        Chicken Rice &amp; Curry Buffet Pack
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        ABC Restaurant • Prepared Fresh Today
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900 block leading-tight">Rs. 200</span>
                      <span className="text-xs text-slate-400 line-through">Rs. 450</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Pickup deadline: <strong>8:30 PM</strong>
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Reserve &amp; Pay at Pickup
                    </span>
                  </div>
                </div>

                <Link
                  href="/listings/list-1"
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all"
                >
                  View Food Details &amp; Reserve
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

              </div>

              {/* Floating Social Proof Micro-Card 1 (Top Left) */}
              <div className="hidden sm:flex items-center gap-2.5 absolute -top-4 -left-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 text-xs font-bold text-slate-800 animate-bounce duration-1000">
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  🌱
                </div>
                <div>
                  <span className="block text-slate-900 font-black">1,475+ Meals Rescued</span>
                  <span className="text-[10px] text-slate-400 font-normal">Across Colombo &amp; Suburbs</span>
                </div>
              </div>

              {/* Floating Social Proof Micro-Card 2 (Bottom Right) */}
              <div className="hidden sm:flex items-center gap-2.5 absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200 text-xs font-bold text-slate-800">
                <div className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  🤝
                </div>
                <div>
                  <span className="block text-slate-900 font-black">Free Community Grants</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">18 Charity Care Homes</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ===================================================
          2. CATEGORY QUICK-DISCOVERY STRIP
         =================================================== */}
      <section className="py-6 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 pr-2">
              Browse Category:
            </span>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/browse?category=${encodeURIComponent(cat.name)}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:text-amber-800 border border-slate-200/80 hover:border-amber-300 text-xs font-bold text-slate-700 transition-all shrink-0 shadow-2xs hover:scale-105"
              >
                <span className="text-base">{cat.emoji}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
            <Link
              href="/browse"
              className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 shrink-0 pl-2 hover:underline"
            >
              All Categories <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>


      {/* ===================================================
          3. LIVE SURPLUS FOOD READY FOR RESCUE
         =================================================== */}
      {featuredListings.length > 0 && (
        <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Available Listings
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-1">
                  Rescuable Food Near You Right Now
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Fresh surplus food listed by local restaurants, catering houses, and bakeries.
                </p>
              </div>
              <Link
                href="/browse"
                className="text-xs sm:text-sm font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-2xs"
              >
                Explore All Listings
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((item) => (
                <FoodCard key={item.id} listing={item} />
              ))}
            </div>
          </div>
        </section>
      )}


      {/* ===================================================
          4. IMPACT STATISTICS SECTION
         =================================================== */}
      <section id="impact" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Verified Results</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              Our Food Waste Rescue Impact
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Together with Sri Lankan food providers, we turn surplus stock into social good.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Meals Rescued */}
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-6 text-center hover:shadow-lg hover:shadow-amber-500/10 transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center mb-3">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {impact.mealsRescued.toLocaleString()}+
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Meals Rescued</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Diverted from waste bins</p>
            </div>

            {/* Meals Donated */}
            <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-6 text-center hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center mb-3">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {impact.mealsDonated.toLocaleString()}+
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Meals Donated</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Granted 100% free to charities</p>
            </div>

            {/* Money Saved */}
            <div className="bg-orange-50/60 border border-orange-200/80 rounded-3xl p-6 text-center hover:shadow-lg hover:shadow-orange-500/10 transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-500/15 text-orange-700 flex items-center justify-center mb-3">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                Rs. {impact.moneySavedLKR.toLocaleString()}+
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Money Saved</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Saved by local consumers</p>
            </div>

            {/* Food Providers */}
            <div className="bg-blue-50/60 border border-blue-200/80 rounded-3xl p-6 text-center hover:shadow-lg hover:shadow-blue-500/10 transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-500/15 text-blue-700 flex items-center justify-center mb-3">
                <Store className="w-6 h-6" />
              </div>
              <div className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
                {impact.foodProviders}+
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">Food Providers</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Hotels, cafes &amp; caterers</p>
            </div>

          </div>
        </div>
      </section>


      {/* ===================================================
          5. HOW IT WORKS (5-Step Visual Workflow)
         =================================================== */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Zero Complications</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              How RiceShare Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              From commercial kitchen surplus to your pickup counter in 5 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between text-center group hover:border-amber-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-800 font-black text-lg flex items-center justify-center mb-4">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Provider Lists Food</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Restaurant or event caterer enters surplus portions, pickup hours, and photos.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-amber-600 uppercase">
                Step 1: Listing
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between text-center group hover:border-orange-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-orange-800 font-black text-lg flex items-center justify-center mb-4">
                2
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sell or Donate</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Choose a discounted selling price (e.g. Rs. 200) or mark 100% FREE for charity.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-orange-600 uppercase">
                Step 2: Pricing
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between text-center group hover:border-blue-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 text-blue-800 font-black text-lg flex items-center justify-center mb-4">
                3
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Customer Discovers</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Search by Colombo, Malabe, or Kaduwela, food category, or sale vs donation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-blue-600 uppercase">
                Step 3: Discovery
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between text-center group hover:border-purple-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 text-purple-800 font-black text-lg flex items-center justify-center mb-4">
                4
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Reserve / Request</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Confirm portions with &apos;Reserve &amp; Pay at Pickup&apos; or request community donation.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-purple-600 uppercase">
                Step 4: Reservation
              </div>
            </div>

            {/* Step 5 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between text-center group hover:border-green-400 hover:shadow-md transition-all">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-green-100 text-green-800 font-black text-lg flex items-center justify-center mb-4">
                5
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Pickup Counter</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Show reservation ID, collect safely packed warm food, and eliminate food waste!
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-green-600 uppercase">
                Step 5: Pickup
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ===================================================
          6. PROBLEM VS SOLUTION
         =================================================== */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">The Purpose</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
              Why Sri Lanka Needs RiceShare
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Transforming unnecessary organic waste into affordable meals and community nourishment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            
            {/* The Problem */}
            <div className="p-8 rounded-3xl bg-red-50/70 border border-red-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-2xl">
                  ⚠️
                </div>
                <h3 className="text-2xl font-black text-red-950">The Food Waste Reality</h3>
                <ul className="space-y-3 text-xs sm:text-sm text-red-900/90 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-black">•</span>
                    Over 3,000 tonnes of municipal waste is dumped daily in the Western Province, with organic food waste accounting for nearly 60%.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-black">•</span>
                    Hotels, wedding banquets, and bakeries prepare 20–30% surplus buffer food that ends up in municipal dumpsters untouched.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-red-600 font-black">•</span>
                    Rapid inflation has severely impacted students, daily wage earners, and elderly care institutions.
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-red-200 text-xs font-bold text-red-900">
                Discarded food harms both our economy and landfills.
              </div>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-3xl bg-emerald-50/70 border border-emerald-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-2xl">
                  🌱
                </div>
                <h3 className="text-2xl font-black text-emerald-950">The RiceShare Marketplace</h3>
                <ul className="space-y-3 text-xs sm:text-sm text-emerald-900/90 font-medium">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black">•</span>
                    <strong>Discount Sale:</strong> Food providers recoup prep costs by selling meals at 50%–70% off retail value.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black">•</span>
                    <strong>Free Donation:</strong> Catering overruns are matched with certified orphanages and care homes.
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-600 font-black">•</span>
                    <strong>Pay at Pickup:</strong> Zero barrier to entry. Anyone can reserve a hot meal with just a phone number.
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-emerald-200 text-xs font-bold text-emerald-900">
                Win-Win: Providers reduce waste, families eat affordably.
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ===================================================
          7. FINAL CALL TO ACTION BANNER
         =================================================== */}
      <section className="py-20 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold tracking-wider uppercase">
            Join the Food Rescue Movement
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Ready to Rescue Delicious Food in Sri Lanka?
          </h2>
          <p className="text-base sm:text-lg text-amber-100 max-w-2xl mx-auto font-normal">
            Whether you are looking for an affordable lunch or your restaurant has surplus portions at closing time, RiceShare is here for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              href="/browse"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-amber-800 hover:bg-slate-100 font-extrabold text-sm shadow-xl transition-all hover:scale-105"
            >
              Browse Surplus Food Now
            </Link>
            <Link
              href="/provider/add"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-900/40 hover:bg-amber-900/60 text-white font-extrabold text-sm border border-amber-300/40 transition-all hover:scale-105"
            >
              List Surplus as a Provider
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
