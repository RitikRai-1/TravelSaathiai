import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { City, TouristPlace, HiddenGem, Hotel, Restaurant, TaxiService } from '../../types';
import { TaxiBookingModal } from '../../components/booking/TaxiBookingModal';
import { MobileHomeView } from './MobileHomeView';
import { useLanguage } from '../../context/LanguageContext';

import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';
import {
  Compass,
  Sparkles,
  MapPin,
  Star,
  ArrowRight,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Hotel as HotelIcon,
  Utensils,
  Car,
  CheckCircle2,
  HelpCircle,
  Briefcase,
  Zap,
  Luggage,
  Bot,
  Ticket,
  Clock,
  Landmark,
} from 'lucide-react';

const HERO_SLIDES = [
  {
    title: 'Taj Mahal, Agra',
    tagline: 'Monument to Eternal Love & Mughal Splendour',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1800&q=85',
  },
  {
    title: 'Amber Fort, Jaipur',
    tagline: 'The Golden Citadel of the Pink City',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1800&q=85',
  },
  {
    title: 'Baga & Calangute, Goa',
    tagline: 'Sun-Kissed Beaches, Shacks & Coastal Bliss',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1800&q=85',
  },
  {
    title: 'Dal Lake, Kashmir',
    tagline: 'Floating Shikaras in Paradise on Earth',
    image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?auto=format&fit=crop&w=1800&q=85',
  },
  {
    title: 'Solang & Old Manali',
    tagline: 'Himalayan Snow Peaks, Pines & River Cafes',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1800&q=85',
  },
  {
    title: 'Ganga Ghats, Varanasi',
    tagline: 'Ancient Evening Aartis & Sacred Spiritual Dawn',
    image: 'https://images.unsplash.com/photo-1561361066-6b2158cb1235?auto=format&fit=crop&w=1800&q=85',
  },
  {
    title: 'Marine Drive, Mumbai',
    tagline: 'The Queen’s Necklace & Sunset Arabian Breeze',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1800&q=85',
  },
  {
    title: 'India Gate, New Delhi',
    tagline: 'Imperial Avenues, Historic Fortresses & Street Food',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1800&q=85',
  },
];

const CATEGORIES = [
  { name: 'Heritage', count: '120+ Forts & Palaces', icon: '🏰', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'Spiritual', count: '85+ Temples & Ghats', icon: '🛕', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { name: 'Beach', count: '40+ Tropical Beaches', icon: '🏖️', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { name: 'Mountain', count: '60+ Himalayan Towns', icon: '🏔️', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { name: 'Nature', count: '45+ Lakes & Falls', icon: '🌿', color: 'bg-teal-50 text-teal-800 border-teal-200' },
  { name: 'Wildlife', count: '30+ Tiger Reserves', icon: '🐅', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  { name: 'Adventure', count: 'Rafting, Trekking, Skiing', icon: '🧗‍♂️', color: 'bg-rose-50 text-rose-800 border-rose-200' },
  { name: 'Food', count: 'Iconic Street Bazaars', icon: '🍛', color: 'bg-red-50 text-red-800 border-red-200' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCities, setFeaturedCities] = useState<City[]>([]);
  const [featuredPlaces, setFeaturedPlaces] = useState<TouristPlace[]>([]);
  const [hiddenGems, setHiddenGems] = useState<HiddenGem[]>([]);
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState<Restaurant[]>([]);
  const [featuredTaxis, setFeaturedTaxis] = useState<TaxiService[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiService | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Automatic hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dynamic CMS data from database
  useEffect(() => {
    api.getHomepageCms()
      .then((res) => {
        if (res.success && res.data) {
          setFeaturedCities(res.data.featuredCities || []);
          setFeaturedPlaces(res.data.featuredPlaces || []);
          setHiddenGems(res.data.hiddenGems || []);
          setFeaturedHotels(res.data.featuredHotels || []);
          setFeaturedRestaurants(res.data.featuredRestaurants || []);
          setFeaturedTaxis(res.data.featuredTaxis || []);
        }
      })
      .catch((err) => console.error('Failed to load homepage CMS:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const openBooking = (taxi: TaxiService) => {
    setSelectedTaxi(taxi);
    setBookingModalOpen(true);
  };

  return (
    <>
      {/* Mobile-Only Dedicated Homepage (<= 767px) */}
      <div className="block md:hidden">
        <MobileHomeView
          featuredCities={featuredCities}
          featuredPlaces={featuredPlaces}
          hiddenGems={hiddenGems}
          featuredHotels={featuredHotels}
          featuredRestaurants={featuredRestaurants}
          featuredTaxis={featuredTaxis}
          loading={loading}
        />
      </div>

      {/* Desktop-Only Homepage (>= 768px) - 100% untouched */}
      <div className="hidden md:block space-y-16 pb-20">
        {/* 0. TOP GREETING & QUICK ACTIONS BAR */}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-[#FAF9F6] rounded-3xl p-6 sm:p-8 border border-[#0F766E]/20 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-[#2DD4BF]/15 px-3.5 py-1 rounded-full border border-[#2DD4BF]/30 inline-flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>{t('builtInHaryana')}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] font-heading">
              {t('namasteGreeting')}
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              {t('whereToGoToday')}
            </p>
          </div>

          {/* 4 Quick Category Action Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
            <Link
              to="/plan-trip"
              className="p-3.5 rounded-2xl bg-[#FF6B35]/10 hover:bg-[#FF6B35]/20 border border-[#FF6B35]/30 text-center flex flex-col items-center justify-center transition card-hover group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-[#FF6B35]">{t('planTrip')}</span>
              <span className="text-[10px] text-slate-500 font-medium">AI Architect</span>
            </Link>

            <Link
              to="/explore"
              className="p-3.5 rounded-2xl bg-[#0F766E]/10 hover:bg-[#0F766E]/20 border border-[#0F766E]/30 text-center flex flex-col items-center justify-center transition card-hover group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition">
                <Compass className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <span className="text-xs font-bold text-[#0F766E]">{t('exploreIndia')}</span>
              <span className="text-[10px] text-slate-500 font-medium">16+ Cities</span>
            </Link>

            <Link
              to="/hotels"
              className="p-3.5 rounded-2xl bg-[#0B192C]/5 hover:bg-[#0B192C]/10 border border-[#0B192C]/15 text-center flex flex-col items-center justify-center transition card-hover group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0B192C] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition">
                <HotelIcon className="w-5 h-5 text-[#2DD4BF]" />
              </div>
              <span className="text-xs font-bold text-[#0B192C]">Hotels</span>
              <span className="text-[10px] text-slate-500 font-medium">Stays & Havelis</span>
            </Link>

            <Link
              to="/dashboard"
              className="p-3.5 rounded-2xl bg-[#2DD4BF]/15 hover:bg-[#2DD4BF]/25 border border-[#2DD4BF]/40 text-center flex flex-col items-center justify-center transition card-hover group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition">
                <Luggage className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-bold text-[#0B192C]">{t('myTrips')}</span>
              <span className="text-[10px] text-slate-500 font-medium">Portfolio</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 1. HERO SECTION WITH DESTINATION IMAGE SLIDER */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 mx-4 sm:mx-6 lg:mx-8 rounded-3xl shadow-2xl">
        {/* Background Slider Images */}
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.title}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentHeroSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            style={{
              transition: 'opacity 1.2s ease-in-out, transform 8s ease-out',
            }}
          >
            <SafeImage
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center"
              category="city"
            />
            {/* Atmospheric Indian Dusk & Midnight Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-900/40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/40 via-transparent to-emerald-950/30"></div>
          </div>
        ))}

        {/* Hero Slider Dots & Controls */}
        <div className="absolute bottom-8 right-8 z-20 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <button
            onClick={() => setCurrentHeroSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            className="text-white/80 hover:text-white p-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#F9C74F] font-mono">
            {currentHeroSlide + 1} / {HERO_SLIDES.length}
          </span>
          <button
            onClick={() => setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="text-white/80 hover:text-white p-1"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Slide Location Indicator Badge */}
        <div className="absolute top-8 left-8 z-20 hidden md:flex items-center space-x-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-white text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#F9C74F]" />
          <span className="font-semibold">{HERO_SLIDES[currentHeroSlide].title}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-300">{HERO_SLIDES[currentHeroSlide].tagline}</span>
        </div>

        {/* Hero Central Content */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center text-white space-y-6 pt-12 pb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#0F766E]/60 border border-[#2DD4BF]/40 backdrop-blur-md text-[#2DD4BF] text-xs sm:text-sm font-semibold shadow-md">
            <Sparkles className="w-4 h-4 text-[#FF6B35]" />
            <span>AI-Driven India Tourism Companion</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight font-heading text-white">
            TRAVELSAATHI AI
          </h1>

          <p className="text-lg sm:text-2xl text-[#FAF9F6] font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
            A smart AI-powered travel companion for exploring India.
          </p>

          <p className="text-sm sm:text-base text-slate-300 font-light max-w-2xl mx-auto">
            Personalized day-by-day itineraries, handpicked stays, authentic regional dining, and verified local taxis across 16+ iconic Indian destinations.
          </p>

          {/* Primary CTA + Functional Options Prominently Displayed */}
          <div className="pt-2 space-y-4">
            {/* Primary CTA Button */}
            <div className="flex justify-center">
              <Link
                to="/plan-trip"
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#E85D04] text-white font-extrabold text-lg shadow-2xl shadow-orange-950/60 hover:scale-105 transition transform flex items-center justify-center space-x-3 border border-white/20"
              >
                <Sparkles className="w-6 h-6 text-[#FAF9F6]" />
                <span>Plan My Trip</span>
                <ArrowRight className="w-5 h-5 text-[#FAF9F6]" />
              </Link>
            </div>

            {/* Prominent Functional Options Alongside */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/hotels"
                className="px-5 py-3 rounded-xl bg-[#0F766E]/85 hover:bg-[#0F766E] border border-[#2DD4BF]/40 text-[#FAF9F6] text-sm font-bold backdrop-blur-md transition flex items-center space-x-2 shadow-lg shadow-black/20 hover:scale-105"
              >
                <HotelIcon className="w-4 h-4 text-[#2DD4BF]" />
                <span>Hotels</span>
              </Link>

              <Link
                to="/restaurants"
                className="px-5 py-3 rounded-xl bg-[#0F766E]/85 hover:bg-[#0F766E] border border-[#2DD4BF]/40 text-[#FAF9F6] text-sm font-bold backdrop-blur-md transition flex items-center space-x-2 shadow-lg shadow-black/20 hover:scale-105"
              >
                <Utensils className="w-4 h-4 text-[#2DD4BF]" />
                <span>Restaurants</span>
              </Link>

              <Link
                to="/taxis"
                className="px-5 py-3 rounded-xl bg-[#0F766E]/85 hover:bg-[#0F766E] border border-[#2DD4BF]/40 text-[#FAF9F6] text-sm font-bold backdrop-blur-md transition flex items-center space-x-2 shadow-lg shadow-black/20 hover:scale-105"
              >
                <Car className="w-4 h-4 text-[#2DD4BF]" />
                <span>Taxi</span>
              </Link>

              <Link
                to="/business/register"
                className="px-5 py-3 rounded-xl bg-[#0B192C]/80 hover:bg-[#0B192C] border border-white/25 text-[#FAF9F6] text-sm font-bold backdrop-blur-md transition flex items-center space-x-2 shadow-lg shadow-black/20 hover:scale-105"
              >
                <Briefcase className="w-4 h-4 text-[#FF6B35]" />
                <span>Advertise Your Business</span>
              </Link>
            </div>
          </div>

          {/* Quick Search Floating Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto mt-6 bg-[#FAF9F6]/95 backdrop-blur-md p-2 rounded-2xl shadow-2xl flex items-center border border-white/40"
          >
            <div className="flex items-center pl-3 pr-2 text-slate-400">
              <Search className="w-5 h-5 text-[#0F766E]" />
            </div>
            <input
              type="text"
              placeholder="Search destination, city, or monument (e.g. Jaipur, Taj Mahal, Goa)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-3 text-[#0B192C] text-sm focus:outline-hidden bg-transparent placeholder:text-slate-400 font-medium"
            />
            <button
              type="submit"
              className="bg-[#0B192C] hover:bg-[#0F766E] text-white px-6 py-3 rounded-xl font-semibold text-sm transition shrink-0 shadow-sm"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* 2. EXPLORE BY CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Categories</span>
            <h2 className="text-3xl font-bold text-[#0B192C] mt-1 font-heading">Explore by Travel Theme</h2>
            <p className="text-slate-600 text-sm mt-1">Discover India through the lenses of history, spirituality, mountains, and culinary heritage.</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-[#0F766E] hover:text-[#0B192C] flex items-center space-x-1">
            <span>View all themes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/explore?category=${cat.name}`}
              className="group p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-[#2DD4BF] shadow-xs hover:shadow-md transition text-center card-hover"
            >
              <span className="text-3xl block mb-2 transform group-hover:scale-110 transition">{cat.icon}</span>
              <h4 className="font-bold text-sm text-slate-800 group-hover:text-[#0F766E] transition">{cat.name}</h4>
              <p className="text-[10px] text-slate-400 mt-1">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 2.5 EXPERIENCE THE REAL INDIA (Reference Screen 7) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B192C] via-[#0F766E] to-[#0B192C] rounded-3xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden shadow-xl shadow-black/20">
          <div className="max-w-xl space-y-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF]">
              Rural &amp; Cultural Immersion
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              {t('experienceRealIndia')}
            </h2>
            <p className="text-[#FAF9F6]/90 text-sm">
              {t('experienceSub')}
            </p>
          </div>
          {/* Decorative tractor / rural motif */}
          <div className="absolute right-6 bottom-2 text-7xl opacity-20 select-none pointer-events-none">
            🚜
          </div>
        </div>

        {/* 3 Real Experience Cards (Reference Screen 7) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Traditional Food Tour */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <SafeImage
                  src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80"
                  alt="Traditional Food Tour"
                  className="w-full h-full object-cover"
                  category="food"
                />
                <span className="absolute top-3 left-3 bg-[#0F766E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Food &amp; Dhaba Trail
                </span>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F766E] flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35]" />
                    <span>4.8</span>
                  </span>
                  <span className="text-slate-400">⏱️ 2h duration</span>
                  <span className="font-bold text-[#0B192C] font-heading">₹800</span>
                </div>
                <h3 className="font-bold text-base text-[#0B192C] font-heading">{t('foodTourTitle')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t('foodTourDesc')}</p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/restaurants"
                className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0B192C] text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
              >
                <span>Explore Local Food</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Folk Dance & Music Show */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <SafeImage
                  src="https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80"
                  alt="Folk Dance Show"
                  className="w-full h-full object-cover"
                  category="place"
                />
                <span className="absolute top-3 left-3 bg-[#0F766E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Folk &amp; Cultural Heritage
                </span>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F766E] flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35]" />
                    <span>4.7</span>
                  </span>
                  <span className="text-slate-400">⏱️ 2h evening</span>
                  <span className="font-bold text-[#0B192C] font-heading">₹600</span>
                </div>
                <h3 className="font-bold text-base text-[#0B192C] font-heading">{t('folkShowTitle')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t('folkShowDesc')}</p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/explore"
                className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0B192C] text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
              >
                <span>View Cultural Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Village Homestay */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
            <div>
              <div className="h-48 overflow-hidden relative">
                <SafeImage
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                  alt="Village Homestay"
                  className="w-full h-full object-cover"
                  category="hotel"
                />
                <span className="absolute top-3 left-3 bg-[#FF6B35] text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Farm &amp; Heritage Stay
                </span>
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0F766E] flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35]" />
                    <span>4.9</span>
                  </span>
                  <span className="text-slate-400">⏱️ 1 Day / Night</span>
                  <span className="font-bold text-[#0B192C] font-heading">₹1,500</span>
                </div>
                <h3 className="font-bold text-base text-[#0B192C] font-heading">{t('villageHomestayTitle')}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{t('villageHomestayDesc')}</p>
              </div>
            </div>
            <div className="p-5 pt-0">
              <Link
                to="/hotels"
                className="w-full py-2.5 bg-[#0F766E] hover:bg-[#0B192C] text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
              >
                <span>Book Farm Homestay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR DESTINATIONS (CITIES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Featured Destinations</span>
            <h2 className="text-3xl font-bold text-[#0B192C] mt-1 font-heading">Top Indian Cities to Visit</h2>
            <p className="text-slate-600 text-sm mt-1">Curated royal capitals, coastal heavens, and Himalayan retreats.</p>
          </div>
          <Link to="/explore" className="text-sm font-semibold text-[#0F766E] hover:text-[#0B192C] flex items-center space-x-1">
            <span>See all 16+ Cities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCities.slice(0, 8).map((city) => (
            <Link
              key={city.id}
              to={`/city/${city.slug || city.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col"
            >
              <div className="relative h-56 overflow-hidden">
                <SafeImage
                  src={city.cover_image}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  category="city"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-black/30 to-transparent"></div>
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#0B192C] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {city.state_name || 'India'}
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-xl font-bold font-heading">{city.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {city.categories?.slice(0, 2).map((cat) => (
                      <span key={cat} className="text-[10px] bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-sm text-white">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {city.description}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0F766E]">
                  <span>Explore City Guide</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. MUST-VISIT TOURIST PLACES & HERITAGE */}
      {featuredPlaces.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Iconic Sights &amp; Heritage</span>
              <h2 className="text-3xl font-bold text-[#0B192C] mt-1 font-heading">Must-Visit Monuments &amp; Attractions</h2>
              <p className="text-slate-600 text-sm mt-1">Discover world-renowned heritage wonders, royal forts, and spiritual river ghats.</p>
            </div>
            <Link to="/explore" className="text-sm font-semibold text-[#0F766E] hover:text-[#0B192C] flex items-center space-x-1">
              <span>View all attractions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPlaces.slice(0, 4).map((place) => (
              <Link
                key={place.id}
                to={`/places/${place.slug || place.id}`}
                className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <SafeImage
                      src={place.cover_image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      category="place"
                    />
                    <span className="absolute top-3 left-3 bg-[#0B192C]/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {place.city_name}
                    </span>
                    {place.gallery && place.gallery.length > 1 && (
                      <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                        <span>📸</span>
                        <span>{place.gallery.length} Photos</span>
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 bg-white text-[#0B192C] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                      {place.entry_fee === 0 ? 'Free Entry' : `₹${place.entry_fee}`}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <span className="text-[10px] font-bold text-[#0F766E] uppercase tracking-wider">{place.category}</span>
                    <h3 className="font-bold text-base text-[#0B192C] group-hover:text-[#0F766E] transition font-heading">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{place.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span className="text-[#FF6B35] font-bold flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35]" />
                      <span>{place.rating}</span>
                    </span>
                    <span>{place.recommended_duration_hours}h duration</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. CURATED HIDDEN GEMS (USP 1) */}
      <section className="bg-[#FAF9F6] py-16 border-y border-[#2DD4BF]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] bg-[#2DD4BF]/20 px-2.5 py-1 rounded-full">
                Offbeat Discoveries
              </span>
              <h2 className="text-3xl font-bold text-[#0B192C] mt-2 font-heading">India’s Secret Hidden Gems</h2>
              <p className="text-slate-600 text-sm mt-1">Escape the crowds. Explore secluded waterfalls, geometric stepwells, and sacred forests.</p>
            </div>
            <Link to="/hidden-gems" className="text-sm font-semibold text-[#0F766E] hover:text-[#0B192C] flex items-center space-x-1">
              <span>View all hidden gems</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {hiddenGems.slice(0, 3).map((gem) => (
              <div
                key={gem.id}
                className="bg-white rounded-3xl overflow-hidden border border-emerald-100 shadow-sm card-hover flex flex-col"
              >
                <div className="relative h-52 overflow-hidden">
                  <SafeImage
                    src={gem.photos?.[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                    alt={gem.name}
                    className="w-full h-full object-cover"
                    category="gem"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    {gem.city_name}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-[#FF6B35] text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{gem.rating}</span>
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#0F766E] uppercase tracking-wider">{gem.category}</span>
                    <h4 className="text-lg font-bold text-[#0B192C] mt-1 font-heading">{gem.name}</h4>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{gem.description}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <div className="flex justify-between">
                      <span>Best Visiting Time:</span>
                      <span className="font-semibold text-slate-800">{gem.best_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Distance:</span>
                      <span className="font-semibold text-slate-800">{gem.distance_from_city_km} km from city</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. RECOMMENDED HOTELS & STAYS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Stays &amp; Havelis</span>
            <h2 className="text-3xl font-bold text-[#0B192C] mt-1 font-heading">Recommended Heritage &amp; Luxury Hotels</h2>
            <p className="text-slate-600 text-sm mt-1">Rest in authentic royal havelis, luxury palaces, and cozy hill cottages.</p>
          </div>
          <Link to="/hotels" className="text-sm font-semibold text-[#0F766E] hover:text-[#0B192C] flex items-center space-x-1">
            <span>View all hotels</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredHotels.slice(0, 3).map((hotel) => (
            <Link
              key={hotel.id}
              to={`/hotels/${hotel.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <SafeImage
                  src={hotel.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  category="hotel"
                />
                <span className="absolute top-3 left-3 bg-[#0B192C]/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {hotel.city_name}
                </span>
                {hotel.photos && hotel.photos.length > 1 && (
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <span>📸</span>
                    <span>{hotel.photos.length} Photos</span>
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-white text-[#0B192C] text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  ₹{hotel.price_per_night} / night
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#0B192C] group-hover:text-[#0F766E] transition font-heading">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{hotel.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[#FF6B35] font-bold flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35]" />
                    <span>{hotel.rating}</span>
                  </span>
                  <span className="text-slate-400">{hotel.facilities?.slice(0, 2).join(' • ')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. AUTHENTIC DINING & RESTAURANTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Culinary Journeys</span>
            <h2 className="text-3xl font-bold text-[#0B192C] mt-1 font-heading">Iconic Flavours &amp; Dining</h2>
            <p className="text-slate-600 text-sm mt-1">From pure vegetarian thalis and heritage dhabas to Mughlai tandoor and coastal curries.</p>
          </div>
          <Link to="/restaurants" className="text-sm font-semibold text-[#0F766E] hover:text-[#0B192C] flex items-center space-x-1">
            <span>View all restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRestaurants.slice(0, 3).map((restaurant) => (
            <Link
              key={restaurant.id}
              to={`/restaurants/${restaurant.id}`}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <SafeImage
                  src={restaurant.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                  alt={restaurant.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  category="restaurant"
                />
                <span className="absolute top-3 left-3 bg-[#0B192C]/80 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {restaurant.city_name}
                </span>
                {restaurant.photos && restaurant.photos.length > 1 && (
                  <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <span>📸</span>
                    <span>{restaurant.photos.length} Photos</span>
                  </span>
                )}
                <span className="absolute bottom-3 right-3 bg-[#0F766E] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                  ₹{restaurant.avg_cost_for_two} for two
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#0F766E]">{restaurant.cuisine}</span>
                  <h3 className="font-bold text-base text-[#0B192C] group-hover:text-[#0F766E] transition font-heading mt-0.5">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    Famous for: {restaurant.popular_dishes?.join(', ')}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[#FF6B35] font-bold flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF6B35] text-[#FF6B35]" />
                    <span>{restaurant.rating}</span>
                  </span>
                  <span className="text-[#0F766E] font-semibold">View Menu →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 8. TAXI & LOCAL TRANSPORT (WITH TAXI NEAR ME CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B192C] rounded-3xl p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-[#0F766E]/25 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0F766E]/50 border border-[#2DD4BF]/40 text-xs font-semibold text-[#2DD4BF]">
                <Car className="w-3.5 h-3.5" />
                <span>Verified Local Fleets</span>
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
                Reliable City &amp; Outstation Taxis at Fair Rates
              </h2>
              <p className="text-[#FAF9F6]/80 text-sm leading-relaxed">
                Connect directly with verified local taxi drivers, autos, and SUVs. No hidden surge pricing. Check driver ratings, estimated fares, and book seamlessly.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/taxis/near-me"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#E85D04] hover:from-[#E85D04] hover:to-[#FF6B35] font-bold text-sm text-white shadow-lg shadow-orange-950/40 transition flex items-center space-x-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Find Taxi Near Me (GPS)</span>
                </Link>
                <Link
                  to="/taxis"
                  className="px-6 py-3.5 rounded-xl bg-[#0F766E]/60 hover:bg-[#0F766E] border border-[#2DD4BF]/40 font-semibold text-sm text-white transition"
                >
                  Browse Taxi Fleet
                </Link>
              </div>
            </div>

            {/* Quick Preview of Taxi Cards */}
            <div className="space-y-3">
              {featuredTaxis.slice(0, 3).map((taxi) => (
                <div
                  key={taxi.id}
                  className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between hover:bg-white/15 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F766E]/40 text-[#2DD4BF] flex items-center justify-center font-bold text-sm border border-[#2DD4BF]/30">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{taxi.service_name}</h4>
                      <p className="text-xs text-slate-300">{taxi.vehicle_type} • Driver: {taxi.driver_name} • {taxi.city_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-300 block">Base ₹{taxi.base_fare}</span>
                    <button
                      onClick={() => openBooking(taxi)}
                      className="mt-1 px-3 py-1 rounded-lg bg-[#0F766E] hover:bg-[#2DD4BF] hover:text-[#0B192C] text-xs font-bold text-white transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 9. WHY TRAVELSAATHI AI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0B192C] via-[#0F766E] to-[#07101C] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-[#2DD4BF]/30">
          <div className="max-w-2xl mb-10 space-y-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF] bg-[#2DD4BF]/15 px-3 py-1 rounded-full border border-[#2DD4BF]/30 inline-block">
              Why Choose TravelSaathi AI
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Smarter Trips. Authentic India. Zero Backtracking.
            </h2>
            <p className="text-[#FAF9F6]/80 text-sm">
              Discover India without the chaos. Our algorithms balance time, budget, diet, and local transport so you can focus on the wonder.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {/* Value Prop 1 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 hover:bg-white/15 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center font-bold text-xl shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white">Intelligent Route Sequencing</h3>
              <p className="text-xs text-[#FAF9F6]/80 leading-relaxed">
                No crisscrossing the city. We group sights by geo-proximity, crowd timings, and daylight so you spend time exploring, not stuck in traffic.
              </p>
            </div>

            {/* Value Prop 2 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 hover:bg-white/15 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#2DD4BF] text-[#0B192C] flex items-center justify-center font-bold text-xl shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white">Mathematical Budget Guard</h3>
              <p className="text-xs text-[#FAF9F6]/80 leading-relaxed">
                Hotel + Meals + Transport + Entry Fees = Transparent Total. If plans exceed your budget, 1-click &ldquo;Optimize My Trip&rdquo; resets costs safely.
              </p>
            </div>

            {/* Value Prop 3 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 hover:bg-white/15 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#0F766E] text-[#2DD4BF] flex items-center justify-center font-bold text-xl shadow-md border border-[#2DD4BF]/40">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white">Strict Diet Integrity</h3>
              <p className="text-xs text-[#FAF9F6]/80 leading-relaxed">
                Pure Veg filters mean 100% vegetarian dhabas and restaurants. Non-veg and Both options curated cleanly with zero cross-contamination.
              </p>
            </div>

            {/* Value Prop 4 */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/15 hover:bg-white/15 transition space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl shadow-md">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-heading text-white">Verified Fleets &amp; Fair Rates</h3>
              <p className="text-xs text-[#FAF9F6]/80 leading-relaxed">
                Zero surprise surge fees. Transparent per-km driver rates, direct local contacts, and instant GPS cab hailing across 16+ cities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW TRAVELSAATHI AI WORKS */}
      <section className="bg-[#FAF9F6] py-16 border-y border-[#0F766E]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">The Technology</span>
            <h2 className="text-3xl font-bold text-[#0B192C] mt-1 font-heading">How TravelSaathi AI Works</h2>
            <p className="text-slate-600 text-sm mt-2">
              Combining a dynamic Indian tourism database with intelligent itinerary logic to generate personalized trips in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/15 text-[#0F766E] flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h4 className="font-bold text-base text-[#0B192C] font-heading">Set Preferences</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Choose your target city, budget bracket, trip duration, transport mode, and specific interests.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/15 text-[#FF6B35] flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h4 className="font-bold text-base text-[#0B192C] font-heading">Multi-Factor AI Scoring</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Matches traveller profile with monument hours, crowd patterns, ratings, and Super Admin priorities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-[#2DD4BF]/25 text-[#0F766E] flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h4 className="font-bold text-base text-[#0B192C] font-heading">Smart Route &amp; Budget</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Arranges sequence to prevent backtracking, calculates entry fees + hotel + meals, and warns if budget is exceeded.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs relative">
              <div className="w-12 h-12 rounded-2xl bg-[#0B192C]/10 text-[#0B192C] flex items-center justify-center font-bold text-lg mb-4">
                04
              </div>
              <h4 className="font-bold text-base text-[#0B192C] font-heading">Instant Travel &amp; Taxi</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Book verified local taxis with 1-click directly from the itinerary or hail nearest cabs in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ADVERTISE YOUR BUSINESS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0B192C] via-[#0F766E] to-[#0B192C] rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 border border-[#2DD4BF]/30">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/15 text-[#2DD4BF] border border-[#2DD4BF]/30 px-3 py-1 rounded-full">
              Business Partnership
            </span>
            <h2 className="text-3xl font-bold font-heading text-white">Do you run a Hotel, Restaurant, or Taxi Service?</h2>
            <p className="text-[#FAF9F6]/90 text-sm leading-relaxed">
              Register your business on TravelSaathi AI. Gain direct exposure to thousands of verified tourists planning trips to your city. Receive bookings with 0% middleman cut.
            </p>
          </div>
          <Link
            to="/business/register"
            className="px-8 py-4 bg-gradient-to-r from-[#FF6B35] to-[#E85D04] hover:from-[#E85D04] hover:to-[#FF6B35] text-white font-bold text-sm rounded-2xl shadow-xl shadow-orange-950/40 transition shrink-0 transform hover:scale-105"
          >
            Register Your Business Free →
          </Link>
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">Got Questions?</span>
          <h2 className="text-3xl font-bold text-[#0B192C] mt-1 font-heading">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does TravelSaathi AI create personalized itineraries?',
              a: 'Our recommendation engine matches your chosen destination, travel days, budget, traveller group type, and selected interests with verified attractions in our India Tourism Database. It automatically orders stops geographically to minimize transit time.',
            },
            {
              q: 'Can the Software Owner update tourism data without touching code?',
              a: 'Yes! The Super Admin Control Panel provides full dynamic CMS control. When an admin adds a new tourist place, updates hotel room prices, or edits taxi fares, the public site and AI trip generator immediately reflect the new data.',
            },
            {
              q: 'How does Taxi Booking work on TravelSaathi AI?',
              a: 'Tourists can find nearby taxis using geolocation or browse by city. Once you submit a ride request, the taxi owner receives an instant alert in their business portal to Accept or Reject, and you are notified immediately.',
            },
            {
              q: 'What happens if my generated trip exceeds my budget?',
              a: 'Our Smart Budget Calculator automatically flags the exceeded amount and provides a 1-click "Optimize My Trip" feature that swaps expensive stays with high-rated budget accommodations and free monuments.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 text-left font-bold text-sm text-[#0B192C] flex items-center justify-between hover:bg-slate-50 transition"
              >
                <span>{faq.q}</span>
                <span className="text-[#FF6B35] text-lg font-bold">{openFaq === idx ? '−' : '+'}</span>
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      </div>

      {/* Taxi Booking Modal */}
      <TaxiBookingModal
        taxi={selectedTaxi}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </>
  );
};

