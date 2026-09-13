import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { SafeImage } from '../../components/common/SafeImage';
import {
  Briefcase,
  Hotel,
  Utensils,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  MapPin,
  RefreshCw,
  AlertTriangle,
  User,
  Calendar,
  Edit3,
  Eye,
  TrendingUp,
  X,
} from 'lucide-react';

export const BusinessDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'listings' | 'bookings'>('listings');
  const [data, setData] = useState<{
    hotels: any[];
    restaurants: any[];
    taxis: any[];
    bookings: any[];
  }>({
    hotels: [],
    restaurants: [],
    taxis: [],
    bookings: [],
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Edit Profile Modal State
  const [editingItem, setEditingItem] = useState<{ type: 'HOTEL' | 'RESTAURANT' | 'TAXI'; data: any } | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saveLoading, setSaveLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getBusinessDashboard();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
  }, [user]);

  const handleUpdateStatus = async (bookingId: number, status: string) => {
    setActionLoading(bookingId);
    try {
      const res = await api.updateBookingStatus(bookingId, status);
      if (res.success) {
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (type: 'HOTEL' | 'RESTAURANT' | 'TAXI', item: any) => {
    setEditingItem({ type, data: item });
    setEditForm({
      name: item.name || item.service_name || '',
      description: item.description || '',
      address: item.address || item.service_location || '',
      phone: item.phone || '',
      email: item.email || '',
      price: item.price_per_night || item.avg_cost_for_two || item.base_fare || '',
      cuisine: item.cuisine || '',
      vehicle_type: item.vehicle_type || 'Sedan',
      driver_name: item.driver_name || '',
      per_km_fare: item.per_km_fare || 14,
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaveLoading(true);
    try {
      const res = await api.updateBusinessProfile(editingItem.type, editingItem.data.id, editForm);
      if (res.success) {
        setEditingItem(null);
        await loadData();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update business profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const totalListings = data.hotels.length + data.restaurants.length + data.taxis.length;
  const pendingBookings = data.bookings.filter((b) => b.booking_status === 'REQUESTED' || b.booking_status === 'PENDING').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'CONFIRMED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'PENDING':
      case 'REQUESTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 mr-1" />
            PENDING APPROVAL
          </span>
        );
      case 'REJECTED':
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 text-xs font-medium text-amber-300 mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Business Partner Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading">
            Welcome, {user?.name || 'Partner'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Manage your registered hospitality venues, fleet services, and real-time tourist booking requests from a single operational console.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/business/register"
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs transition shadow-md"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register New Business
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total Properties</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-heading">{totalListings}</div>
          <span className="text-[11px] text-slate-400">Hotels, Dining & Taxis</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Registered Hotels</span>
            <Hotel className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-heading">{data.hotels.length}</div>
          <span className="text-[11px] text-slate-400">Accommodations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Taxi Vehicles</span>
            <Car className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-heading">{data.taxis.length}</div>
          <span className="text-[11px] text-slate-400">Active drivers / cabs</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Booking Requests</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-heading">{data.bookings.length}</div>
          <span className="text-[11px] text-amber-600 font-medium">
            {pendingBookings} awaiting action
          </span>
        </div>
      </div>

      {/* Verification Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-8 flex items-start space-x-3 text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm">
          <span className="font-bold">Tourism Trust & Verification Protocol: </span>
          All newly registered businesses undergo inspection by the Super Admin moderation team. Once approved, your listings are immediately indexed in Explore, search queries, and AI Trip Planner recommendations.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-3 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            activeTab === 'listings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Registered Listings ({totalListings})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'bookings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Incoming Ride Requests ({data.bookings.length})</span>
          {pendingBookings > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
              {pendingBookings}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content: Listings */}
      {activeTab === 'listings' && (
        <div className="space-y-8">
          {totalListings === 0 && !loading && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 font-heading">No listings registered yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Start monetizing your tourism services by registering your hotel, restaurant, or taxi cab.
              </p>
              <Link
                to="/business/register"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Register Business Now
              </Link>
            </div>
          )}

          {/* Hotels Section */}
          {data.hotels.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Hotel className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900 font-heading">Hotels & Stays</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.hotels.map((hotel) => (
                  <div key={hotel.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      <SafeImage
                        src={hotel.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                        category="hotel"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(hotel.approval_status)}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{hotel.name}</h4>
                        <div className="flex items-center text-slate-500 text-xs mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span className="truncate">{hotel.address || 'Address registered'}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2">{hotel.description}</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-900">
                          ₹{hotel.price_per_night?.toLocaleString('en-IN')}{' '}
                          <span className="text-slate-400 font-normal">/ night</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => openEditModal('HOTEL', hotel)}
                            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <Link
                            to={`/hotels/${hotel.id}`}
                            className="text-xs text-indigo-600 font-semibold hover:underline"
                          >
                            View &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Restaurants Section */}
          {data.restaurants.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="w-5 h-5 text-rose-600" />
                <h3 className="text-lg font-bold text-slate-900 font-heading">Restaurants & Cafes</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.restaurants.map((rest) => (
                  <div key={rest.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      <SafeImage
                        src={rest.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                        alt={rest.name}
                        className="w-full h-full object-cover"
                        category="restaurant"
                      />
                      <div className="absolute top-3 right-3">
                        {getStatusBadge(rest.approval_status)}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{rest.name}</h4>
                        <div className="text-xs text-rose-600 font-medium mt-0.5">{rest.cuisine}</div>
                        <div className="flex items-center text-slate-500 text-xs mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span className="truncate">{rest.address || 'Location registered'}</span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs font-semibold text-slate-900">
                          ₹{rest.avg_cost_for_two?.toLocaleString('en-IN')}{' '}
                          <span className="text-slate-400 font-normal">for two</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => openEditModal('RESTAURANT', rest)}
                            className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <Link
                            to={`/restaurants/${rest.id}`}
                            className="text-xs text-indigo-600 font-semibold hover:underline"
                          >
                            View &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Taxis Section */}
          {data.taxis.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Car className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-slate-900 font-heading">Taxi & Fleet Services</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.taxis.map((taxi) => (
                  <div key={taxi.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {taxi.vehicle_type}
                        </span>
                        <h4 className="font-bold text-slate-900 text-base mt-1.5">{taxi.service_name}</h4>
                        <p className="text-xs text-slate-500">Driver: {taxi.driver_name}</p>
                      </div>
                      <div>{getStatusBadge(taxi.approval_status)}</div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Base Fare:</span>
                        <span className="font-semibold">₹{taxi.base_fare}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Per Km Rate:</span>
                        <span className="font-semibold">₹{taxi.per_km_fare} / km</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Contact:</span>
                        <span className="font-semibold">{taxi.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => openEditModal('TAXI', taxi)}
                        className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Rates</span>
                      </button>
                      <Link
                        to="/taxis"
                        className="text-xs text-indigo-600 font-semibold hover:underline"
                      >
                        Fleet View &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Bookings */}
      {activeTab === 'bookings' && (
        <div>
          {data.bookings.length === 0 && !loading ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80">
              <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800 font-heading">No taxi ride requests yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                When tourists request a cab from your registered fleet or via Taxi Near Me, their trip orders will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                        Order #{booking.id}
                      </span>
                      <span className="text-xs font-medium text-slate-600">{booking.service_name}</span>
                      {getStatusBadge(booking.booking_status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-700">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>Pickup: <strong>{booking.pickup_location}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>Drop: <strong>{booking.drop_location || 'Local Sightseeing'}</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Customer: {booking.customer_name} ({booking.customer_phone || booking.customer_email})</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Pickup Time: {booking.pickup_time || 'Immediate'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated Fare</span>
                      <span className="text-lg font-bold text-slate-900 font-heading">
                        ₹{booking.fare_estimate || 250}
                      </span>
                    </div>

                    {booking.booking_status === 'REQUESTED' || booking.booking_status === 'PENDING' ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                        >
                          Accept Ride
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                          disabled={actionLoading === booking.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-semibold transition"
                        >
                          Decline
                        </button>
                      </div>
                    ) : booking.booking_status === 'CONFIRMED' ? (
                      <button
                        onClick={() => handleUpdateStatus(booking.id, 'COMPLETED')}
                        disabled={actionLoading === booking.id}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                      >
                        Mark Completed
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Edit Listing Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold font-heading">
                  Edit {editingItem.type === 'HOTEL' ? 'Hotel' : editingItem.type === 'RESTAURANT' ? 'Restaurant' : 'Taxi Service'} Details
                </h3>
                <p className="text-xs text-slate-400">Update verified operational info &amp; pricing</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Business / Service Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {editingItem.type === 'HOTEL'
                      ? 'Price per Night (₹)'
                      : editingItem.type === 'RESTAURANT'
                      ? 'Avg Cost for Two (₹)'
                      : 'Base Fare (₹)'}
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {editingItem.type === 'RESTAURANT' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cuisine</label>
                    <input
                      type="text"
                      value={editForm.cuisine}
                      onChange={(e) => setEditForm({ ...editForm, cuisine: e.target.value })}
                      placeholder="e.g. Traditional Thali"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                ) : editingItem.type === 'TAXI' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Per Km Rate (₹)</label>
                    <input
                      type="number"
                      value={editForm.per_km_fare}
                      onChange={(e) => setEditForm({ ...editForm, per_km_fare: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Address / Landmark</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center space-x-1"
                >
                  {saveLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
