import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Restaurant, City } from '../../types';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { Utensils, Star, MapPin, Search, ArrowRight } from 'lucide-react';

export const RestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [selectedDiet, setSelectedDiet] = useState<'all' | 'veg' | 'non_veg'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cuisines = ['All', 'Mughlai', 'Rajasthani', 'South Indian', 'Street Food', 'Coastal', 'Italian'];

  useEffect(() => {
    api.getCities().then((res) => {
      if (res.success) setCities(res.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (selectedCity) params.city_id = selectedCity;
    if (selectedCuisine !== 'All') params.cuisine = selectedCuisine;
    if (selectedDiet !== 'all') params.food_type = selectedDiet;
    if (searchQuery) params.search = searchQuery;

    api.getRestaurants(params)
      .then((res) => {
        if (res.success) setRestaurants(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedCity, selectedCuisine, selectedDiet, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
            <Utensils className="w-3.5 h-3.5" />
            <span>Culinary Heritage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">Iconic Restaurants & Food Bazaars</h1>
          <p className="text-emerald-100 text-sm mt-1.5 max-w-xl">
            Savour authentic culinary flavours across India: Old Delhi biryanis, Mumbai Irani cafes, Jaipur thalis, and riverfront hill bistros.
          </p>
        </div>

        <Link
          to="/business/register"
          className="px-6 py-3.5 bg-[#F9C74F] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <span>List Your Restaurant →</span>
        </Link>
      </div>

      {/* Cuisines & Diet Filter Bar */}
      <div className="space-y-3">
        {/* Dietary Preference Tabs */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Diet:</span>
          <button
            onClick={() => setSelectedDiet('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedDiet === 'all'
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            All Diets
          </button>
          <button
            onClick={() => setSelectedDiet('veg')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              selectedDiet === 'veg'
                ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-400/40'
                : 'bg-emerald-50/70 border border-emerald-300 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>🥬</span>
            <span>Pure Veg Only</span>
          </button>
          <button
            onClick={() => setSelectedDiet('non_veg')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 ${
              selectedDiet === 'non_veg'
                ? 'bg-amber-700 text-white shadow-xs ring-2 ring-amber-400/40'
                : 'bg-amber-50/70 border border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>🍗</span>
            <span>Non-Veg Specialties</span>
          </button>
        </div>

        {/* Cuisines Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCuisine(c)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCuisine === c
                  ? 'bg-[#1B5E20] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Search & City Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search dish, restaurant name, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:border-[#1B5E20]"
          />
        </div>

        <div className="w-full sm:w-60">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Restaurants Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-slate-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((rest) => (
            <Link
              key={rest.id}
              to={`/restaurants/${rest.id}`}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={rest.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                    alt={rest.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {rest.city_name}
                    </span>
                    {/* Food Type Badge */}
                    {rest.food_type === 'veg' && (
                      <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                        <span>🥬</span>
                        <span>Vegetarian</span>
                      </span>
                    )}
                    {rest.food_type === 'non_veg' && (
                      <span className="bg-amber-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                        <span>🍗</span>
                        <span>Non-Veg</span>
                      </span>
                    )}
                    {rest.food_type === 'both' && (
                      <span className="bg-teal-700/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center space-x-1">
                        <span>🥬🍗</span>
                        <span>Veg & Non-Veg</span>
                      </span>
                    )}
                  </div>
                  {rest.photos && rest.photos.length > 1 && (
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span>📸</span>
                      <span>{rest.photos.length} Photos</span>
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                    ₹{rest.avg_cost_for_two} for two
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#1B5E20] uppercase tracking-wider">{rest.cuisine}</span>
                    {rest.rating && (
                      <span className="flex items-center space-x-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{rest.rating}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-slate-900 font-heading">{rest.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    Popular: {rest.popular_dishes?.join(', ')}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="w-full py-2.5 bg-emerald-50 text-[#1B5E20] font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 hover:bg-[#1B5E20] hover:text-white transition">
                  <span>View Menu &amp; Dishes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Skyline Footer */}
      <IndianMonumentsSkyline showTagline />
    </div>
  );
};
