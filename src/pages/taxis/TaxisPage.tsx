import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TaxiService, City } from '../../types';
import { TaxiBookingModal } from '../../components/booking/TaxiBookingModal';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { Car, MapPin, Star, Users, Phone, ShieldCheck, Search, Filter } from 'lucide-react';

const VEHICLE_TYPES = ['All', 'Bike Taxi', 'Auto', 'Sedan', 'SUV', 'Premium Car', 'Van'];

export const TaxisPage: React.FC = () => {
  const [taxis, setTaxis] = useState<TaxiService[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Booking Modal
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiService | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    api.getCities().then((res) => {
      if (res.success) setCities(res.data);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, any> = {};
    if (selectedCity) params.city_id = selectedCity;
    if (selectedType !== 'All') params.vehicle_type = selectedType;
    if (searchQuery) params.search = searchQuery;

    api.getTaxis(params)
      .then((res) => {
        if (res.success) setTaxis(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedCity, selectedType, searchQuery]);

  const handleBookTaxi = (taxi: TaxiService) => {
    setSelectedTaxi(taxi);
    setBookingModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold mb-3 border border-white/15">
            <Car className="w-3.5 h-3.5 text-[#F9C74F]" />
            <span>Local Transport Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading">Book Verified Local Taxis &amp; Autos</h1>
          <p className="text-slate-300 text-sm mt-1.5 max-w-xl">
            Airport transfers, full-day sightseeing, and outstation trips with zero middleman commissions and fair transparent rates.
          </p>
        </div>

        <Link
          to="/taxis/near-me"
          className="px-6 py-3.5 bg-[#F9C74F] hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition flex items-center space-x-2 shrink-0 self-start md:self-auto"
        >
          <MapPin className="w-4 h-4" />
          <span>Use Taxi Near Me (GPS)</span>
        </Link>
      </div>

      {/* Vehicle Type Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {VEHICLE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedType === t
                ? 'bg-[#1B5E20] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search & City Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search driver name, cab service, or location..."
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
            <option value="">All Operating Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Taxi Fleets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-64 bg-slate-200 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : taxis.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 font-heading">No taxi services found</h3>
          <p className="text-xs text-slate-500">Try selecting a different city or vehicle type.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taxis.map((taxi) => (
            <div
              key={taxi.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between p-6 space-y-5"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center font-bold text-lg">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B5E20]">
                        {taxi.vehicle_type} • {taxi.city_name}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 font-heading">{taxi.service_name}</h3>
                    </div>
                  </div>

                  <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{taxi.rating}</span>
                  </span>
                </div>

                <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Driver:</span>
                    <span className="font-bold text-slate-800">{taxi.driver_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacity:</span>
                    <span className="font-bold text-slate-800 flex items-center space-x-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Up to {taxi.passenger_capacity} Passengers</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Service Coverage:</span>
                    <span className="font-medium text-slate-700 text-right">{taxi.service_area}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block">Base Pickup Fare</span>
                    <span className="font-bold text-[#1B5E20] font-heading text-sm">₹{taxi.base_fare}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-slate-400 block">Per Km Rate</span>
                    <span className="font-bold text-[#1B5E20] font-heading text-sm">₹{taxi.per_km_fare} / km</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => handleBookTaxi(taxi)}
                  className="w-full py-3 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-xs font-bold shadow-md shadow-green-900/20 transition flex items-center justify-center space-x-1.5 cursor-pointer min-h-[44px]"
                >
                  <Car className="w-4 h-4" />
                  <span>Book This Taxi</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Taxi Booking Modal */}
      <TaxiBookingModal
        taxi={selectedTaxi}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />

      {/* Skyline Footer */}
      <IndianMonumentsSkyline showTagline />
    </div>
  );
};
