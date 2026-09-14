import React from 'react';
import { Link } from 'react-router-dom';
import { City, TouristPlace, HiddenGem, Hotel, Restaurant, TaxiService } from '../../types';
import { SafeImage } from '../../components/common/SafeImage';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import {
  Sparkles,
  Compass,
  Hotel as HotelIcon,
  Utensils,
  Car,
  Eye,
  MapPin,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

interface MobileHomeViewProps {
  featuredCities: City[];
  featuredPlaces: TouristPlace[];
  hiddenGems: HiddenGem[];
  featuredHotels: Hotel[];
  featuredRestaurants: Restaurant[];
  featuredTaxis: TaxiService[];
  loading: boolean;
}

export const MobileHomeView: React.FC<MobileHomeViewProps> = ({
  featuredCities,
  featuredPlaces,
  hiddenGems,
  featuredHotels,
  featuredRestaurants,
  loading,
}) => {
  return (
    <div className="space-y-6 pb-6 overflow-x-hidden">
      {/* ================= 1. HERO BRAND & PRIMARY CTA ================= */}
      <section className="relative px-4 pt-6 pb-8 bg-gradient-to-b from-[#0B192C] via-[#07101C] to-[#FAF9F6] dark:to-[#07101C] text-white rounded-b-3xl shadow-lg">
        <div className="space-y-3 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0F766E]/50 border border-[#2DD4BF]/40 text-[#2DD4BF] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>AI Travel Companion for India</span>
          </div>

          <h1 className="text-3xl font-black font-heading leading-tight tracking-tight text-white">
            Discover India.<br />
            <span className="text-[#2DD4BF]">Plan Smarter.</span><br />
            <span className="text-[#FF6B35]">Travel Better.</span>
          </h1>

          <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
            Personalized day-by-day itineraries, verified heritage stays, pure veg trails & reliable local cabs across 40+ Indian destinations.
          </p>

          {/* Primary CTA */}
          <div className="pt-2">
            <Link
              to="/plan-trip"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#EA580C] hover:brightness-110 active:scale-98 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Plan My Trip</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ================= 2. QUICK ACTION GRID ================= */}
        <div className="grid grid-cols-4 gap-2.5 pt-6 mt-4 border-t border-slate-800/80">
          <Link
            to="/explore"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0B192C]/90 border border-[#0F766E]/40 text-center shadow-xs active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#2DD4BF] flex items-center justify-center mb-1">
              <Compass className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-200">Explore</span>
          </Link>

          <Link
            to="/hotels"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0B192C]/90 border border-[#0F766E]/40 text-center shadow-xs active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
              <HotelIcon className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-200">Hotels</span>
          </Link>

          <Link
            to="/restaurants"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0B192C]/90 border border-[#0F766E]/40 text-center shadow-xs active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-200">Food</span>
          </Link>

          <Link
            to="/taxis"
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0B192C]/90 border border-[#0F766E]/40 text-center shadow-xs active:scale-95 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-[#FF6B35] flex items-center justify-center mb-1">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-200">Taxi</span>
          </Link>
        </div>
      </section>

      {/* ================= 3. POPULAR CITIES (HORIZONTAL SWIPE) ================= */}
      <section className="space-y-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Popular Cities
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Top royal, coastal & mountain destinations
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] flex items-center gap-0.5"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Horizontal Snap Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {loading && featuredCities.length === 0 ? (
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="w-48 h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl shrink-0 animate-pulse"
              />
            ))
          ) : (
            featuredCities.map((city) => (
              <Link
                key={city.id}
                to={`/city/${city.id}`}
                className="group relative w-44 h-56 rounded-2xl overflow-hidden shadow-md shrink-0 snap-start active:scale-98 transition flex flex-col justify-end p-3.5"
              >
                <SafeImage
                  src={city.cover_image}
                  alt={city.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  category="city"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative z-10 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    {city.state_name || 'India'}
                  </span>
                  <h3 className="text-base font-extrabold text-white font-heading leading-tight">
                    {city.name}
                  </h3>
                  {city.categories && city.categories.length > 0 && (
                    <span className="text-[9px] text-slate-300 line-clamp-1">
                      {city.categories.join(' • ')}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ================= 4. POPULAR PLACES (HORIZONTAL SWIPE) ================= */}
      <section className="space-y-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Popular Places & Forts
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Must-visit monuments & heritage attractions
            </p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] flex items-center gap-0.5"
          >
            <span>Explore</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {featuredPlaces.map((place) => (
            <Link
              key={place.id}
              to={`/places/${place.id}`}
              className="group relative w-48 h-60 rounded-2xl overflow-hidden shadow-md shrink-0 snap-start active:scale-98 transition flex flex-col justify-end p-3.5"
            >
              <SafeImage
                src={place.cover_image}
                alt={place.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                category="place"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="relative z-10 space-y-1">
                <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{place.city_name}</span>
                </span>
                <h3 className="text-sm font-bold text-white font-heading leading-tight line-clamp-1">
                  {place.name}
                </h3>
                {place.entry_fee !== undefined && (
                  <span className="inline-block text-[10px] font-bold text-amber-300">
                    {place.entry_fee === 0 ? 'Free Entry' : `₹${place.entry_fee} entry`}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 5. HIDDEN GEMS (HORIZONTAL SWIPE) ================= */}
      <section className="space-y-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-teal-100 dark:bg-[#0F766E]/40 text-[#0F766E] dark:text-[#2DD4BF]">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                Hidden Gems of India
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Offbeat secret viewpoints, stepwells & valleys
              </p>
            </div>
          </div>
          <Link
            to="/hidden-gems"
            className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] flex items-center gap-0.5"
          >
            <span>All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {hiddenGems.map((gem) => (
            <Link
              key={gem.id}
              to="/hidden-gems"
              className="w-56 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#0F766E]/40 overflow-hidden shadow-xs shrink-0 snap-start flex flex-col active:scale-98 transition"
            >
              <div className="relative h-32 w-full overflow-hidden">
                <SafeImage
                  src={gem.photos?.[0]}
                  alt={gem.name}
                  className="w-full h-full object-cover"
                  category="gem"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white">
                  {gem.city_name}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white font-heading truncate">
                  {gem.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {gem.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 6. VERIFIED HOTELS & HAVELIS ================= */}
      <section className="space-y-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Hotels & Havelis
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Heritage palaces & verified tourist stays
            </p>
          </div>
          <Link
            to="/hotels"
            className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] flex items-center gap-0.5"
          >
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {featuredHotels.map((hotel) => (
            <Link
              key={hotel.id}
              to={`/hotels/${hotel.id}`}
              className="w-52 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#0F766E]/40 overflow-hidden shadow-xs shrink-0 snap-start flex flex-col active:scale-98 transition"
            >
              <div className="relative h-28 w-full overflow-hidden">
                <SafeImage
                  src={hotel.photos?.[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  category="hotel"
                />
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-white dark:bg-[#07101C] text-[10px] font-bold text-slate-900 dark:text-white shadow-xs">
                  ₹{hotel.price_per_night} / n
                </span>
              </div>
              <div className="p-3 space-y-1">
                <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{hotel.rating} / 5</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate font-heading">
                  {hotel.name}
                </h3>
                <span className="text-[10px] text-slate-500 block truncate">
                  {hotel.city_name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 7. RESTAURANTS & FOOD TRAILS ================= */}
      <section className="space-y-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Restaurants & Food
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pure veg thalis & regional food bazaars
            </p>
          </div>
          <Link
            to="/restaurants"
            className="text-xs font-bold text-[#0F766E] dark:text-[#2DD4BF] flex items-center gap-0.5"
          >
            <span>Browse</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x snap-mandatory -mx-4 px-4">
          {featuredRestaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/restaurants/${restaurant.id}`}
              className="w-52 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#0F766E]/40 overflow-hidden shadow-xs shrink-0 snap-start flex flex-col active:scale-98 transition"
            >
              <div className="relative h-28 w-full overflow-hidden">
                <SafeImage
                  src={restaurant.photos?.[0]}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  category="restaurant"
                />
                <span
                  className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    restaurant.food_type === 'veg'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {restaurant.food_type === 'veg' ? '🥬 Pure Veg' : '🍗 Non-Veg'}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate font-heading">
                  {restaurant.name}
                </h3>
                <p className="text-[10px] text-slate-500 truncate">
                  {restaurant.cuisine} • {restaurant.city_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 8. WHY TRAVELSAATHI AI ================= */}
      <section className="px-4">
        <div className="bg-white dark:bg-[#0B192C] rounded-3xl p-5 border border-slate-200 dark:border-[#0F766E]/40 shadow-xs space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] dark:text-[#2DD4BF]">
              Built for India
            </span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Why TravelSaathi AI?
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-[#07101C]/60 border border-emerald-100 dark:border-[#0F766E]/20">
              <div className="p-2 rounded-xl bg-emerald-100 dark:bg-[#0F766E]/40 text-[#1B5E20] dark:text-[#2DD4BF] shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Smart Day-by-Day AI</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Optimized opening hours, shortest transit routes, and accurate rupee budgets.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50/60 dark:bg-[#07101C]/60 border border-amber-100 dark:border-amber-900/20">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 shrink-0">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Pure Veg Strict Filtering</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Select vegetarian and get 100% vegetarian culinary recommendations throughout your trip.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-teal-50/60 dark:bg-[#07101C]/60 border border-teal-100 dark:border-teal-900/20">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Direct Cabs with Fair Pricing</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Verified local drivers with transparent per-km fares and zero hidden surge costs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 9. BUSINESS PARTNER CALLOUT ================= */}
      <section className="px-4">
        <div className="bg-gradient-to-r from-[#0F766E] to-[#115E59] rounded-3xl p-5 text-white shadow-md space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-200 uppercase tracking-wider">
            <Briefcase className="w-4 h-4" />
            <span>Tourism Partner Program</span>
          </div>
          <h3 className="text-base font-bold font-heading">
            Do You Own a Hotel, Haveli or Taxi Fleet in India?
          </h3>
          <p className="text-xs text-emerald-100 leading-relaxed">
            Partner with TravelSaathi AI to reach thousands of domestic & international tourists planning itineraries daily.
          </p>
          <Link
            to="/business/register"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0F766E] text-xs font-bold shadow-md hover:bg-slate-100 active:scale-95 transition"
          >
            <span>List Your Business Free</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ================= 10. SKYLINE ACCENT ================= */}
      <div className="px-4 pt-2">
        <IndianMonumentsSkyline className="w-full text-emerald-800/15 dark:text-[#2DD4BF]/10" tagline="Discover India • TravelSaathi AI" />
      </div>
    </div>
  );
};
