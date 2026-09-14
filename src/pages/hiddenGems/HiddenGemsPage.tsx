import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { HiddenGem } from '../../types';
import { Eye, MapPin, Clock, Star, Compass, ArrowRight, Sparkles, Hotel, Utensils, Car } from 'lucide-react';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';

export const HiddenGemsPage: React.FC = () => {
  const [gems, setGems] = useState<HiddenGem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    setLoading(true);
    const params = selectedCategory !== 'All' ? { category: selectedCategory } : {};
    api.getHiddenGems(params)
      .then((res) => {
        if (res.success) setGems(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const categories = ['All', 'Nature', 'Heritage', 'Wildlife', 'Adventure', 'Photography', 'Culture'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-300">
            <Eye className="w-3.5 h-3.5" />
            <span>Off the Beaten Track</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold font-heading">Secret & Undiscovered Gems of India</h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed">
            Step away from overcrowded tourist hotspots. Discover quiet forest sanctuaries, ancient water step-tanks, hidden waterfalls, and secret sunset perspectives.
          </p>
        </div>

        <Link
          to="/plan-trip"
          className="px-6 py-3.5 bg-[#F9C74F] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Plan Trip with Hidden Gems</span>
        </Link>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === cat
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gems Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 bg-slate-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : gems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Eye className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">No hidden gems found for this filter</h3>
          <p className="text-xs text-slate-500">Try selecting 'All' or check back as the Super Admin publishes more offbeat gems.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gems.map((gem) => (
            <div
              key={gem.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 overflow-hidden">
                  <SafeImage
                    src={gem.photos?.[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'}
                    alt={gem.name}
                    className="w-full h-full object-cover"
                    category="gem"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {gem.city_name}, {gem.state_name}
                  </span>

                  <span className="absolute top-3 right-3 bg-[#1B5E20] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                    {gem.category}
                  </span>

                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[#F9C74F] text-xs font-bold flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{gem.rating} / 5</span>
                    </span>
                    <h3 className="text-xl font-bold font-heading mt-0.5">{gem.name}</h3>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {gem.description}
                  </p>

                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-emerald-800 font-semibold">How to Reach:</span>
                      <span className="text-slate-600 font-medium text-right max-w-[190px]">{gem.route_info}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-800 font-semibold">Distance:</span>
                      <span className="text-slate-800 font-bold">{gem.distance_from_city_km} km from city</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-800 font-semibold">Best Time:</span>
                      <span className="text-slate-800 font-bold">{gem.best_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-800 font-semibold">Entry:</span>
                      <span className="text-slate-800 font-bold">{gem.entry_fee === 0 ? 'Free' : `₹${gem.entry_fee}`}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2">
                <Link
                  to={`/plan-trip?city=${gem.city_id}`}
                  className="w-full py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-center text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F9C74F]" />
                  <span>Include in Trip Itinerary</span>
                </Link>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <Link
                    to={`/hotels?city_id=${gem.city_id}`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#1B5E20] text-[10px] font-semibold flex items-center justify-center space-x-1 transition text-center"
                    title="Nearby Stays"
                  >
                    <Hotel className="w-3 h-3 text-[#1B5E20]" />
                    <span>Hotels</span>
                  </Link>
                  <Link
                    to={`/restaurants?city_id=${gem.city_id}`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#1B5E20] text-[10px] font-semibold flex items-center justify-center space-x-1 transition text-center"
                    title="Nearby Dining"
                  >
                    <Utensils className="w-3 h-3 text-amber-600" />
                    <span>Food</span>
                  </Link>
                  <Link
                    to={`/taxis?city_id=${gem.city_id}`}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-[#1B5E20] text-[10px] font-semibold flex items-center justify-center space-x-1 transition text-center"
                    title="Nearby Cabs"
                  >
                    <Car className="w-3 h-3 text-teal-600" />
                    <span>Taxis</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Indian Monuments Skyline Accent */}
      <div className="pt-6">
        <IndianMonumentsSkyline className="w-full text-emerald-800/15" tagline="Bharat Ki Khoj Ab Aur Aasaan • Built in Haryana, Designed for India" />
      </div>
    </div>
  );
};
