import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
  MapPin,
  Sparkles,
  Calendar,
  Compass,
  Star,
  Hotel,
  Utensils,
  Car,
  Clock,
  ArrowRight,
  Share2,
  Bookmark
} from 'lucide-react';
import { TaxiBookingModal } from '../../components/booking/TaxiBookingModal';
import { SafeImage } from '../../components/common/SafeImage';

export const CityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<{
    city: any;
    places: any[];
    hiddenGems: any[];
    hotels: any[];
    restaurants: any[];
    taxis: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'attractions' | 'gems' | 'hotels' | 'restaurants' | 'taxis'>('attractions');
  const [selectedTaxi, setSelectedTaxi] = useState<any | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');
    api.getCityById(id)
      .then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError('City not found');
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load destination details');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium tracking-wide">Loading destination insights...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 font-heading">Destination Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          The requested city could not be located in our curated tourism database.
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition"
        >
          Explore Other Destinations &rarr;
        </Link>
      </div>
    );
  }

  const { city, places, hiddenGems, hotels, restaurants, taxis } = data;

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Section */}
      <div className="relative h-96 sm:h-[420px] bg-slate-900 overflow-hidden">
        <SafeImage
          src={city.cover_image || 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1600&q=80'}
          alt={city.name}
          className="w-full h-full object-cover opacity-60"
          category="city"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold">
              {city.state_name}
            </span>
            {city.categories?.map((cat: string) => (
              <span key={cat} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white">
                {cat}
              </span>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight">
                {city.name}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl line-clamp-2">
                {city.description}
              </p>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={() => navigate('/planner', { state: { defaultCityId: city.id } })}
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Plan AI Trip to {city.name}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-4 sm:space-x-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('attractions')}
            className={`py-4 text-xs sm:text-sm font-bold transition border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'attractions'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Attractions ({places.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gems')}
            className={`py-4 text-xs sm:text-sm font-bold transition border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'gems'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Hidden Gems ({hiddenGems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('hotels')}
            className={`py-4 text-xs sm:text-sm font-bold transition border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'hotels'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Hotel className="w-4 h-4" />
            <span>Verified Stays ({hotels.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('restaurants')}
            className={`py-4 text-xs sm:text-sm font-bold transition border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'restaurants'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Dining & Cafes ({restaurants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('taxis')}
            className={`py-4 text-xs sm:text-sm font-bold transition border-b-2 flex items-center space-x-2 whitespace-nowrap ${
              activeTab === 'taxis'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Taxis & Cabs ({taxis.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB 1: Attractions */}
        {activeTab === 'attractions' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Must-Visit Sights & Monuments in {city.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Curated iconic landmarks and cultural attractions with verified ticket pricing
                </p>
              </div>
            </div>

            {places.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">No attractions cataloged yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {places.map((place) => (
                  <Link
                    key={place.id}
                    to={`/places/${place.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <div className="h-48 relative overflow-hidden bg-slate-100">
                      <SafeImage
                        src={place.gallery?.[0] || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        category="place"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-amber-400">
                          {place.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{place.rating || '4.8'}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition">
                          {place.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {place.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">
                          {place.entry_fee === 0 ? 'Free Entry' : `₹${place.entry_fee}`}
                        </span>
                        <div className="flex items-center space-x-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{place.ideal_duration_hours || 2}h recommended</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Hidden Gems */}
        {activeTab === 'gems' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Offbeat & Hidden Gems in {city.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Secret viewpoints, ancient alleys, and quiet spots away from mainstream crowds
              </p>
            </div>

            {hiddenGems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">No hidden gems documented yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hiddenGems.map((gem) => (
                  <div
                    key={gem.id}
                    className="bg-white rounded-2xl border border-amber-200/80 overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="h-48 relative overflow-hidden bg-slate-100">
                      <SafeImage
                        src={gem.photos?.[0] || 'https://images.unsplash.com/photo-1506461883276-594a12b11cf3?auto=format&fit=crop&w=800&q=80'}
                        alt={gem.name}
                        className="w-full h-full object-cover"
                        category="gem"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                          Hidden Gem
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{gem.name}</h3>
                        <p className="text-xs text-slate-600 mt-1">{gem.description}</p>
                        {gem.best_time_to_visit && (
                          <div className="mt-3 p-2 rounded-xl bg-amber-50 text-[11px] text-amber-900 flex items-center space-x-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            <span>Best time: {gem.best_time_to_visit}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Crowd: Low / Peaceful</span>
                        <span className="text-amber-700 font-semibold">{gem.entry_fee ? `₹${gem.entry_fee}` : 'Free Access'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Hotels */}
        {activeTab === 'hotels' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Verified Stays & Hotels in {city.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Super Admin inspected accommodations with genuine amenities
                </p>
              </div>
              <Link to="/hotels" className="text-xs text-indigo-600 font-semibold hover:underline">
                View All Stays &rarr;
              </Link>
            </div>

            {hotels.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <Hotel className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">No hotels currently listed for this city</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <Link
                    key={hotel.id}
                    to={`/hotels/${hotel.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      <SafeImage
                        src={hotel.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        category="hotel"
                      />
                      <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{hotel.rating || '4.5'}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition">
                          {hotel.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{hotel.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">
                          ₹{hotel.price_per_night?.toLocaleString('en-IN')}{' '}
                          <span className="text-xs text-slate-400 font-normal">/ night</span>
                        </span>
                        <span className="text-xs text-indigo-600 font-semibold group-hover:underline">
                          View Rooms &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Restaurants */}
        {activeTab === 'restaurants' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Culinary Heritage & Dining in {city.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Famous local eateries, traditional thalis, and fine dining
                </p>
              </div>
              <Link to="/restaurants" className="text-xs text-indigo-600 font-semibold hover:underline">
                View All Dining &rarr;
              </Link>
            </div>

            {restaurants.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <Utensils className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">No restaurants currently listed for this city</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((rest) => (
                  <Link
                    key={rest.id}
                    to={`/restaurants/${rest.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col"
                  >
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      <SafeImage
                        src={rest.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                        alt={rest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        category="restaurant"
                      />
                      <div className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{rest.rating || '4.6'}</span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base group-hover:text-rose-600 transition">
                          {rest.name}
                        </h3>
                        <p className="text-xs text-rose-600 font-medium">{rest.cuisine}</p>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rest.description}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          ₹{rest.avg_cost_for_two?.toLocaleString('en-IN')}{' '}
                          <span className="text-slate-400 font-normal">for two</span>
                        </span>
                        <span className="text-xs text-indigo-600 font-semibold group-hover:underline">
                          Menu & Location &rarr;
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: Taxis */}
        {activeTab === 'taxis' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-heading">
                  Local Cabs & Drivers in {city.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified city drivers for monument transfers, airport pickups, and full-day sightseeing
                </p>
              </div>
              <Link to="/taxi-near-me" className="text-xs text-emerald-600 font-semibold hover:underline">
                Find Cabs Near Me GPS &rarr;
              </Link>
            </div>

            {taxis.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">No taxi services registered for this city yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {taxis.map((taxi) => (
                  <div key={taxi.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {taxi.vehicle_type}
                        </span>
                        <h3 className="font-bold text-slate-900 text-base mt-1.5">{taxi.service_name}</h3>
                        <p className="text-xs text-slate-500">Driver: {taxi.driver_name}</p>
                      </div>
                      <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-900 text-xs font-bold">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span>{taxi.rating || '4.7'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Base Fare:</span>
                        <span className="font-semibold">₹{taxi.base_fare}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Rate:</span>
                        <span className="font-semibold">₹{taxi.per_km_fare} / km</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedTaxi(taxi)}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition shadow-sm"
                    >
                      Book This Cab
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Taxi Booking Modal */}
      {selectedTaxi && (
        <TaxiBookingModal
          taxi={selectedTaxi}
          isOpen={true}
          onClose={() => setSelectedTaxi(null)}
          onSuccess={() => setSelectedTaxi(null)}
        />
      )}
    </div>
  );
};
