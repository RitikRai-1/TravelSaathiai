import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Hotel, City } from '../../types';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';
import { Hotel as HotelIcon, Star, MapPin, Search, Filter, ArrowRight } from 'lucide-react';

export const HotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCity, setSelectedCity] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(20000);
  const [searchQuery, setSearchQuery] = useState('');

  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    api.getCities().then((res) => {
      if (res.success) setCities(res.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (selectedCity) params.city_id = selectedCity;
    if (maxPrice < 20000) params.max_price = maxPrice;
    if (minRating > 0) params.min_rating = minRating;
    if (searchQuery) params.search = searchQuery;

    api.getHotels(params)
      .then((res) => {
        if (res.success) setHotels(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedCity, maxPrice, minRating, searchQuery]);

  const priceTiers = [
    { label: 'All', value: 20000 },
    { label: 'Under ₹2,500', value: 2500 },
    { label: '₹2,500 – ₹5,000', value: 5000 },
    { label: 'Above ₹5,000', value: 20000, min: 5001 },
  ];

  const ratingOptions = [
    { label: 'All Ratings', value: 0 },
    { label: '4.0+ ★', value: 4.0 },
    { label: '4.5+ ★', value: 4.5 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
            <HotelIcon className="w-3.5 h-3.5" />
            <span>Verified Hospitality Stays</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading">Heritage Havelis & Luxury Stays</h1>
          <p className="text-emerald-100 text-sm mt-1.5 max-w-xl">
            From palace suites overlooking the Taj Mahal to tranquil tea estate bungalows and backpacker hostels.
          </p>
        </div>

        <Link
          to="/business/register"
          className="px-6 py-3.5 bg-[#F9C74F] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <span>List Your Hotel Property →</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search hotel name, location, or facility..."
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

        {/* Price Tier Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Price:</span>
          {priceTiers.map((tier, idx) => (
            <button
              key={idx}
              onClick={() => setMaxPrice(tier.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                maxPrice === tier.value
                  ? 'bg-[#1B5E20] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier.label}
            </button>
          ))}

          <span className="text-slate-300 mx-1">|</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Rating:</span>
          {ratingOptions.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setMinRating(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                minRating === opt.value
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {/* Hotels Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-slate-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <HotelIcon className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">No hotels match your query</h3>
          <p className="text-xs text-slate-500">Try resetting filters or choosing another destination.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <Link
              key={hotel.id}
              to={`/hotels/${hotel.id}`}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 overflow-hidden">
                  <SafeImage
                    src={hotel.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    category="hotel"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {hotel.city_name}
                  </span>

                  {hotel.photos && hotel.photos.length > 1 && (
                    <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span>📸</span>
                      <span>{hotel.photos.length} Photos</span>
                    </span>
                  )}

                  <span className="absolute bottom-3 right-3 bg-white text-slate-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                    ₹{hotel.price_per_night} / night
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{hotel.rating} / 5</span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 font-heading">{hotel.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{hotel.description}</p>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {hotel.facilities?.slice(0, 3).map((f) => (
                      <span key={f} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <div className="w-full py-2.5 bg-emerald-50 text-[#1B5E20] font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 hover:bg-[#1B5E20] hover:text-white transition">
                  <span>View Rooms & Availability</span>
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

