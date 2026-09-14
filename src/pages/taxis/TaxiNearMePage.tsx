import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TaxiService } from '../../types';
import { TaxiBookingModal } from '../../components/booking/TaxiBookingModal';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';
import {
  MapPin,
  Compass,
  Car,
  Star,
  Clock,
  ShieldCheck,
  AlertCircle,
  Users,
  Navigation,
} from 'lucide-react';

export const TaxiNearMePage: React.FC = () => {
  const [taxis, setTaxis] = useState<TaxiService[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState<string>('Detecting your location...');
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [manualCity, setManualCity] = useState('');
  const [sortBy, setSortBy] = useState('nearest');

  // Booking Modal
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiService | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    setLocationStatus('Requesting browser geolocation...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationStatus('GPS coordinates detected');
          fetchNearbyTaxis(pos.coords.latitude, pos.coords.longitude, '');
        },
        (err) => {
          console.warn('Geolocation denied or unavailable:', err.message);
          setLocationStatus('GPS access denied or unavailable. Using default location (New Delhi) or select your city.');
          // Fallback to Delhi coordinates
          setCurrentCoords({ lat: 28.6139, lng: 77.2090 });
          fetchNearbyTaxis(28.6139, 77.2090, 'Delhi');
        },
        { timeout: 8000 }
      );
    } else {
      setLocationStatus('Geolocation not supported by browser. Showing Delhi cabs.');
      setCurrentCoords({ lat: 28.6139, lng: 77.2090 });
      fetchNearbyTaxis(28.6139, 77.2090, 'Delhi');
    }
  };

  const fetchNearbyTaxis = (lat: number, lng: number, city: string) => {
    setLoading(true);
    api.getTaxiNearMe({
      lat,
      lng,
      city_name: city,
      sort: sortBy,
    })
      .then((res) => {
        if (res.success) {
          setTaxis(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleManualCityChange = (city: string) => {
    setManualCity(city);
    fetchNearbyTaxis(currentCoords?.lat || 28.6139, currentCoords?.lng || 77.2090, city);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    fetchNearbyTaxis(currentCoords?.lat || 28.6139, currentCoords?.lng || 77.2090, manualCity);
  };

  const handleBookTaxi = (taxi: TaxiService) => {
    setSelectedTaxi(taxi);
    setBookingModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-3">
            <Navigation className="w-3.5 h-3.5 text-[#F9C74F]" />
            <span>GPS Proximity Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-heading">Taxi Near Me</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
            Locate nearest available cabs, autos, and SUVs using your current position with honest distance estimates.
          </p>
        </div>

        <button
          onClick={detectLocation}
          className="px-5 py-3 bg-white text-[#1B5E20] hover:bg-emerald-50 font-bold text-xs rounded-2xl shadow-md transition flex items-center space-x-2 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Navigation className="w-4 h-4" />
          <span>Refresh GPS</span>
        </button>
      </div>

      {/* Geolocation Status / Manual Fallback Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">{locationStatus}</span>
            <span className="text-[10px] text-slate-400">
              {currentCoords ? `Lat: ${currentCoords.lat.toFixed(4)}, Lng: ${currentCoords.lng.toFixed(4)}` : 'Positioning...'}
            </span>
          </div>
        </div>

        {/* Manual City Dropdown Fallback */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Or Choose City:</span>
          <select
            value={manualCity}
            onChange={(e) => handleManualCityChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden"
          >
            <option value="">Auto GPS (Delhi Fallback)</option>
            <option value="Delhi">Delhi NCR</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Agra">Agra</option>
            <option value="Goa">Goa</option>
            <option value="Manali">Manali</option>
            <option value="Varanasi">Varanasi</option>
          </select>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500">
          Found <strong className="text-slate-900">{taxis.length}</strong> available vehicles
        </span>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Sort by:</span>
          {['nearest', 'cheapest', 'rating'].map((mode) => (
            <button
              key={mode}
              onClick={() => handleSortChange(mode)}
              className={`px-3 py-1.5 rounded-lg font-bold capitalize transition cursor-pointer ${
                sortBy === mode
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Transparent Disclaimer Notice */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center space-x-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Estimated Geolocation Data:</strong> Distances and arrival times are calculated via the Haversine formula based on driver service areas.
        </span>
      </div>

      {/* Nearby Taxis List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : taxis.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Car className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 font-heading">No taxis registered in this area yet</h3>
          <p className="text-xs text-slate-500">Try choosing a different city or check back soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {taxis.map((taxi) => (
            <div
              key={taxi.id}
              className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs card-hover flex flex-col sm:flex-row items-center justify-between gap-5"
            >
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                {taxi.vehicle_photos && taxi.vehicle_photos.length > 0 ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                    <SafeImage
                      src={taxi.vehicle_photos[0]}
                      alt={taxi.service_name}
                      category="taxi"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center shrink-0">
                    <Car className="w-7 h-7" />
                  </div>
                )}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-slate-900 font-heading">{taxi.service_name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {taxi.availability_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {taxi.vehicle_type} • Driver: <strong className="text-slate-700">{taxi.driver_name}</strong> • Up to {taxi.passenger_capacity} seats
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{taxi.rating}</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-600 font-medium">📍 ~{taxi.distanceKm} km away</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium">⏱️ ~{taxi.estimatedArrivalTimeMins} mins away</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Base Fare</span>
                  <span className="text-lg font-bold text-slate-900 font-heading">₹{taxi.base_fare}</span>
                  <span className="text-[10px] text-slate-500 block">+ ₹{taxi.per_km_fare}/km</span>
                </div>

                <button
                  onClick={() => handleBookTaxi(taxi)}
                  className="px-6 py-3 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/20 transition cursor-pointer"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Indian Monuments Skyline Accent */}
      <div className="pt-4">
        <IndianMonumentsSkyline className="w-full text-emerald-800/15" tagline="Bharat Ki Khoj Ab Aur Aasaan • Built in Haryana, Designed for India" />
      </div>

      {/* Taxi Booking Modal */}
      <TaxiBookingModal
        taxi={selectedTaxi}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
      />
    </div>
  );
};
