import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Search, MapPin, Hotel, Utensils, Sparkles, Star, ArrowRight, Compass, Filter } from 'lucide-react';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CITIES' | 'PLACES' | 'HOTELS' | 'RESTAURANTS' | 'GEMS'>('ALL');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    cities: any[];
    places: any[];
    hotels: any[];
    restaurants: any[];
    hiddenGems: any[];
  }>({
    cities: [],
    places: [],
    hotels: [],
    restaurants: [],
    hiddenGems: [],
  });

  const performSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const res = await api.search(searchTerm);
      if (res.success && res.data) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  const totalResults =
    results.cities.length +
    results.places.length +
    results.hotels.length +
    results.restaurants.length +
    results.hiddenGems.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Search Banner */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F9C74F]">Omni Search Engine</span>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">Explore All of India</h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Find destinations, monuments, verified hotels, regional dining spots, and offbeat hidden gems across India.
          </p>

          <form onSubmit={handleSearchSubmit} className="pt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Jaipur, Dal Baati, Palace Hotel, Amber..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-hidden shadow-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#F9C74F] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-md transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'ALL', label: `All Results (${totalResults})` },
            { key: 'CITIES', label: `Cities (${results.cities.length})` },
            { key: 'PLACES', label: `Attractions (${results.places.length})` },
            { key: 'HOTELS', label: `Hotels (${results.hotels.length})` },
            { key: 'RESTAURANTS', label: `Restaurants (${results.restaurants.length})` },
            { key: 'GEMS', label: `Hidden Gems (${results.hiddenGems.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeFilter === tab.key
                  ? 'bg-[#1B5E20] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {initialQuery && (
          <span className="text-xs text-slate-500">
            Showing results for <strong className="text-slate-900">"{initialQuery}"</strong>
          </span>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500">Searching destinations, stays, and flavors...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && totalResults === 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#1B5E20] flex items-center justify-center mx-auto">
            <Compass className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-heading">No matching results</h3>
          <p className="text-xs text-slate-500">
            We couldn't find any exact matches for "{query || initialQuery}". Try searching for popular destinations like Jaipur, Delhi, Goa, or Manali.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {['Jaipur', 'Agra', 'Goa', 'Delhi', 'Manali', 'Udaipur'].map((quick) => (
              <button
                key={quick}
                onClick={() => {
                  setQuery(quick);
                  setSearchParams({ q: quick });
                  performSearch(quick);
                }}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-[#1B5E20] text-xs font-semibold text-slate-700 transition"
              >
                {quick}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Content */}
      {!loading && totalResults > 0 && (
        <div className="space-y-10">
          {/* CITIES */}
          {(activeFilter === 'ALL' || activeFilter === 'CITIES') && results.cities.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#1B5E20]" />
                  <span>Destinations &amp; Cities ({results.cities.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {results.cities.map((city) => (
                  <Link
                    key={city.id}
                    to={`/explore/${city.id}`}
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <SafeImage
                        src={city.cover_image}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        category="city"
                      />
                      <div className="absolute top-3 left-3 bg-[#1B5E20] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        City
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-base text-slate-900 font-heading group-hover:text-[#1B5E20] transition">
                        {city.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{city.description}</p>
                      <div className="pt-2 flex items-center justify-between text-xs font-bold text-[#1B5E20]">
                        <span>Explore Itinerary &amp; Sights</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* PLACES */}
          {(activeFilter === 'ALL' || activeFilter === 'PLACES') && results.places.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Tourist Attractions ({results.places.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {results.places.map((place) => (
                  <Link
                    key={place.id}
                    to={`/places/${place.id}`}
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <SafeImage
                        src={place.cover_image}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        category="place"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {place.category || 'Attraction'}
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center space-x-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{place.rating || 4.7}</span>
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-base text-slate-900 font-heading group-hover:text-[#1B5E20] transition">
                        {place.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{place.description}</p>
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">{place.city_name}</span>
                        <span className="text-emerald-700 font-bold">
                          {place.entry_fee ? `₹${place.entry_fee} entry` : 'Free entry'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* HOTELS */}
          {(activeFilter === 'ALL' || activeFilter === 'HOTELS') && results.hotels.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
                  <Hotel className="w-4 h-4 text-purple-700" />
                  <span>Verified Hotels &amp; Stays ({results.hotels.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {results.hotels.map((hotel) => (
                  <Link
                    key={hotel.id}
                    to={`/hotels/${hotel.id}`}
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <SafeImage
                        src={JSON.parse(hotel.photos_json || '[""]')[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        category="hotel"
                      />
                      <div className="absolute top-3 left-3 bg-purple-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Verified Stay
                      </div>
                      <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        ₹{hotel.price_per_night} / night
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-base text-slate-900 font-heading group-hover:text-purple-700 transition">
                        {hotel.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{hotel.description}</p>
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{hotel.city_name}</span>
                        <span className="text-purple-700 font-bold flex items-center space-x-1">
                          <span>View Rooms</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* RESTAURANTS */}
          {(activeFilter === 'ALL' || activeFilter === 'RESTAURANTS') && results.restaurants.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
                  <Utensils className="w-4 h-4 text-amber-600" />
                  <span>Dining &amp; Regional Delicacies ({results.restaurants.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {results.restaurants.map((rest) => (
                  <Link
                    key={rest.id}
                    to={`/restaurants/${rest.id}`}
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <SafeImage
                        src={JSON.parse(rest.photos_json || '[""]')[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                        alt={rest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        category="restaurant"
                      />
                      <div className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {rest.cuisine || 'Regional'}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                        ₹{rest.avg_cost_for_two} for two
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-base text-slate-900 font-heading group-hover:text-amber-600 transition">
                        {rest.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{rest.description}</p>
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{rest.city_name}</span>
                        <span className="text-amber-700 font-bold flex items-center space-x-1">
                          <span>View Menu</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* HIDDEN GEMS */}
          {(activeFilter === 'ALL' || activeFilter === 'GEMS') && results.hiddenGems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Hidden Gems &amp; Secret Spots ({results.hiddenGems.length})</span>
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {results.hiddenGems.map((gem) => (
                  <Link
                    key={gem.id}
                    to="/hidden-gems"
                    className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="relative h-44 w-full overflow-hidden">
                      <SafeImage
                        src={JSON.parse(gem.photos_json || '[""]')[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                        alt={gem.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        category="gem"
                      />
                      <div className="absolute top-3 left-3 bg-teal-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Offbeat Spot
                      </div>
                    </div>
                    <div className="p-5 space-y-2">
                      <h4 className="font-bold text-base text-slate-900 font-heading group-hover:text-teal-700 transition">
                        {gem.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{gem.description}</p>
                      <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                        <span>{gem.city_name}</span>
                        <span className="text-teal-700 font-bold flex items-center space-x-1">
                          <span>Explore Details</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Skyline */}
      <div className="pt-10">
        <IndianMonumentsSkyline tagline="Bharat Ki Khoj Ab Aur Aasaan • Built in Haryana, Designed for India" />
      </div>
    </div>
  );
};
