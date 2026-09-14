import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TaxiService } from '../../types';
import { X, Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaxiBookingModalProps {
  taxi: TaxiService | null;
  isOpen: boolean;
  onClose: () => void;
  defaultPickup?: string;
  defaultDrop?: string;
  onSuccess?: () => void;
}

export const TaxiBookingModal: React.FC<TaxiBookingModalProps> = ({
  taxi,
  isOpen,
  onClose,
  defaultPickup = '',
  defaultDrop = '',
  onSuccess,
}) => {
  const { user } = useAuth();
  const [pickupAddress, setPickupAddress] = useState(defaultPickup);
  const [dropAddress, setDropAddress] = useState(defaultDrop);
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState('10:00 AM');
  const [passengers, setPassengers] = useState(1);
  const [estimatedDistance, setEstimatedDistance] = useState(15);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successBooking, setSuccessBooking] = useState<any>(null);

  if (!isOpen || !taxi) return null;

  const estimatedFare = Math.round(taxi.base_fare + Number(estimatedDistance) * taxi.per_km_fare);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please log in first to confirm this booking.');
      return;
    }
    if (!pickupAddress || !dropAddress) {
      setError('Please provide pickup and drop addresses.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.createBooking({
        taxi_service_id: taxi.id,
        pickup_address: pickupAddress,
        drop_address: dropAddress,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        passengers,
        estimated_distance_km: estimatedDistance,
        notes,
      });

      if (res.success && res.booking) {
        setSuccessBooking(res.booking);
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place booking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#154a19] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-heading">Book {taxi.vehicle_type} Taxi</h3>
            <p className="text-xs text-emerald-100 mt-0.5">{taxi.service_name} • Driver: {taxi.driver_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successBooking ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-slate-900 font-heading">Booking Request Sent!</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Reference: <span className="font-mono font-bold text-[#1B5E20]">{successBooking.booking_reference}</span>
                </p>
                <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto">
                  Driver {taxi.driver_name} has received your ride request. You will be notified once accepted.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl text-left text-xs space-y-1.5 border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pick-up:</span>
                  <span className="font-bold text-slate-800">{successBooking.pickup_location || successBooking.pickup_address || pickupAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Drop-off:</span>
                  <span className="font-bold text-slate-800">{successBooking.drop_location || successBooking.drop_address || dropAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Passengers:</span>
                  <span className="font-bold text-slate-800">{successBooking.passengers_count || successBooking.passengers || passengers}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5">
                  <span className="font-bold text-slate-700">Estimated Total:</span>
                  <span className="font-bold text-[#1B5E20] text-sm font-heading">₹{successBooking.estimated_fare}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pick-up Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-[#1B5E20]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hotel Grand Haveli, Station Road"
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Drop-off Location</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amber Fort Gate / City Centre"
                    value={dropAddress}
                    onChange={(e) => setDropAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Time</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Passengers</label>
                  <div className="relative">
                    <Users className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <select
                      value={passengers}
                      onChange={(e) => setPassengers(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <option key={num} value={num} disabled={num > taxi.passenger_capacity}>
                          {num} Passenger{num > 1 ? 's' : ''} {num > taxi.passenger_capacity ? '(Exceeds cap)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Distance (km)</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={estimatedDistance}
                    onChange={(e) => setEstimatedDistance(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Special Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Flight details, child seat, luggage info"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>

              {/* Live Fare Estimation */}
              <div className="p-3.5 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#1B5E20] font-medium">Estimated Fare</span>
                  <p className="text-lg font-bold text-emerald-950 font-heading">₹{estimatedFare}</p>
                  <span className="text-[10px] text-emerald-700">Base ₹{taxi.base_fare} + ₹{taxi.per_km_fare}/km</span>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <span className="inline-block px-2 py-0.5 bg-white rounded-full border border-emerald-200 font-semibold text-[#1B5E20]">
                    Pay Driver Later
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-3 rounded-xl bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-sm shadow-md shadow-emerald-950/20 transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Confirm Ride Request'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
