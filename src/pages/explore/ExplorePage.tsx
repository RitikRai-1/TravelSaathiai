import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { City, State, TouristPlace } from '../../types';
import {
  Compass,
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  Ticket,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  Heart,
  BookmarkCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';

const ALL_CATEGORIES = [
  'All',
  'Heritage',
  'Spiritual',
  'Beach',
  'Mountain',
  'Nature',
  'Wildlife',
  'Adventure',
  'Food',
  'Shopping',
  'Culture',
  'Nightlife',
  'Photography',
  'Romantic',
  'Family',
  'Solo',
  'Scenic',
  'Camping',
  'Wellness',
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [places, setPlaces] = useState<TouristPlace[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');
  const [selectedState, setSelectedState] = useState<string>(searchParams.get('state_id') || '');
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city_id') || '');
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('search') || '');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxEntryFee, setMaxEntryFee] = useState<number>(1000);
  const [sortBy, setSortBy] = useState<'priority' | 'rating' | 'feeAsc' | 'feeDesc'>('priority');

  // Favorites tracking
  const [savedPlaceIds, setSavedPlaceIds] = useState<number[]>([]);

  // Load States & Cities
  useEffect(() => {
    Promise.all([api.getStates(), api.getCities()]).then(([statesRes, citiesRes]) => {
      if (statesRes.success) setStates(statesRes.data);
      if (citiesRes.success) setCities(citiesRes.data);
    });

    if (user) {
      api.getFavorites().then((res) => {
        if (res.success && res.data?.places) {
          setSavedPlaceIds(res.data.places.map((p: any) => p.id));
        }
      });
    }
  }, [user]);

  // Load Places whenever filters change
  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedCity) params.city_id = selectedCity;
    if (searchQuery) params.search = searchQuery;
    if (minRating > 0) params.min_rating = minRating;
    if (maxEntryFee < 1000) params.max_price = maxEntryFee;

    api.getPlaces(params)
      .then((res) => {
        if (res.success) {
          let list = res.data;
          if (sortBy === 'rating') {
            list.sort((a, b) => b.rating - a.rating);
          } else if (sortBy === 'feeAsc') {
            list.sort((a, b) => a.entry_fee - b.entry_fee);
          } else if (sortBy === 'feeDesc') {
            list.sort((a, b) => b.entry_fee - a.entry_fee);
          }
          setPlaces(list);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedCity, searchQuery, minRating, maxEntryFee, sortBy]);

  const toggleSavePlace = async (placeId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to save places to your portfolio.');
      return;
    }

    try {
      const res = await api.toggleFavorite('PLACE', placeId);
      if (res.success) {
        if (res.isFavorited) {
          setSavedPlaceIds((prev) => [...prev, placeId]);
        } else {
          setSavedPlaceIds((prev) => prev.filter((id) => id !== placeId));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCities = selectedState
    ? cities.filter((c) => String(c.state_id) === String(selectedState))
    : cities;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
            <Compass className="w-3.5 h-3.5 text-[#F9C74F]" />
            <span>Tourism Knowledge Base</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">Explore Incredible India</h1>
          <p className="text-emerald-100 text-sm mt-1.5 max-w-xl">
            Filter through verified monuments, spiritual shrines, and iconic attractions across 40+ Indian cities.
          </p>
        </div>

        <Link
          to="/plan-trip"
          className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-[#1B5E20] font-bold text-sm rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-[#1B5E20]" />
          <span>Generate AI Trip for These Places</span>
        </Link>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Content Layout: Sidebar Filters + Places Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center space-x-2 font-heading">
              <Filter className="w-4 h-4 text-[#1B5E20]" />
              <span>Filters</span>
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedState('');
                setSelectedCity('');
                setSearchQuery('');
                setMinRating(0);
                setMaxEntryFee(1000);
              }}
              className="text-xs text-[#1B5E20] font-semibold hover:underline"
            >
              Reset
            </button>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Monuments, temples, forts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
              />
            </div>
          </div>

          {/* State Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter by State/UT</label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedCity('');
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
            >
              <option value="">All States & UTs</option>
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* City Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter by City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
            >
              <option value="">All Cities ({filteredCities.length})</option>
              {filteredCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Rating</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 4.0, 4.5, 4.8].map((score) => (
                <button
                  key={score}
                  onClick={() => setMinRating(score)}
                  className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                    minRating === score
                      ? 'bg-emerald-50 border-emerald-500 text-[#1B5E20]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {score === 0 ? 'Any' : `${score}+★`}
                </button>
              ))}
            </div>
          </div>

          {/* Max Entry Fee Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
              <span>Max Entry Fee</span>
              <span className="text-[#1B5E20] font-bold">{maxEntryFee >= 1000 ? 'Any' : `₹${maxEntryFee}`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={maxEntryFee}
              onChange={(e) => setMaxEntryFee(Number(e.target.value))}
              className="w-full accent-[#1B5E20]"
            />
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
            >
              <option value="priority">AI Recommended Priority</option>
              <option value="rating">Highest Rated First</option>
              <option value="feeAsc">Entry Fee: Free to Low</option>
              <option value="feeDesc">Entry Fee: High to Low</option>
            </select>
          </div>
        </div>

        {/* Places Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900 font-bold">{places.length}</span> destinations
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-slate-200 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Compass className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-900 font-heading text-lg">No tourist spots match your filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try resetting or choosing a different city or category. All destinations are managed directly via the Super Admin.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => {
                const isSaved = savedPlaceIds.includes(place.id);
                return (
                  <Link
                    key={place.id}
                    to={`/places/${place.slug || place.id}`}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-52 overflow-hidden">
                        <SafeImage
                          src={place.cover_image}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          category="place"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {place.city_name}
                          </span>
                          {place.is_featured ? (
                            <span className="bg-[#1B5E20] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                              Featured
                            </span>
                          ) : null}
                          {place.gallery && place.gallery.length > 1 && (
                            <span className="bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                              <span>📸</span>
                              <span>{place.gallery.length}</span>
                            </span>
                          )}
                        </div>

                        {/* Favorite Heart Button */}
                        <button
                          onClick={(e) => toggleSavePlace(place.id, e)}
                          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center shadow-xs transition"
                        >
                          <Heart
                            className={`w-4 h-4 ${isSaved ? 'text-rose-600 fill-rose-600' : 'text-slate-400'}`}
                          />
                        </button>

                        {/* Bottom Tag & Rating */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md font-semibold text-[11px]">
                            {place.category}
                          </span>
                          <span className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-md flex items-center space-x-1 shadow-xs">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{place.rating}</span>
                          </span>
                        </div>
                      </div>

                      {/* Info Card */}
                      <div className="p-5 space-y-2.5">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#1B5E20] transition font-heading">
                          {place.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {place.description}
                        </p>

                        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                          <div className="flex items-center space-x-1.5">
                            <Ticket className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                            <span className="font-semibold">
                              {place.entry_fee === 0 ? 'Free Entry' : `₹${place.entry_fee}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#1B5E20] shrink-0" />
                            <span>{place.recommended_duration_hours} hrs</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <div className="w-full py-2 bg-slate-50 group-hover:bg-[#1B5E20] group-hover:text-white rounded-xl text-center text-xs font-bold text-slate-700 transition flex items-center justify-center space-x-1.5">
                        <span>View Attraction Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Indian Monuments Skyline Accent */}
      <div className="pt-8">
        <IndianMonumentsSkyline className="w-full text-emerald-800/15" tagline="Bharat Ki Khoj Ab Aur Aasaan • Built in Haryana, Designed for India" />
      </div>
    </div>
  );
};
