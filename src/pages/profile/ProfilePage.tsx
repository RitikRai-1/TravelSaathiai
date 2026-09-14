import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TaxiBooking } from '../../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Compass,
  Car,
  BookmarkCheck,
  Shield,
  Briefcase,
  LogOut,
  Edit3,
  X,
  ExternalLink,
  Trash2,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';

export const ProfilePage: React.FC = () => {
  const { user, loading: authLoading, logout, updateUser, refreshUser, isSuperAdmin, isBusinessOwner } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'trips' | 'bookings' | 'saved' | 'security'>('trips');
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<TaxiBooking[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [user, authLoading, navigate, location]);

  // Load user data
  useEffect(() => {
    if (!user) return;
    setEditName(user.name || '');
    setEditBio(user.bio || '');
    setEditLocation(user.location || '');
    setEditPhone(user.phone || user.mobile_number || '');

    setLoadingData(true);
    Promise.all([
      api.getUserTrips().catch(() => ({ success: false, data: [] })),
      api.getMyBookings().catch(() => ({ success: false, data: [] })),
    ])
      .then(([tripsRes, bookingsRes]) => {
        if (tripsRes.success) setTrips(tripsRes.data || []);
        if (bookingsRes.success) setBookings(bookingsRes.data || []);
      })
      .finally(() => setLoadingData(false));
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-[#1B5E20] rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  const handleDeleteTrip = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) return;
    try {
      const res = await api.deleteTrip(id);
      if (res.success) {
        setTrips((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip');
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage(null);
    try {
      const res = await api.updateProfile({
        name: editName,
        bio: editBio,
        location: editLocation,
        phone: editPhone,
      });

      if (res.success) {
        updateUser({
          name: editName,
          bio: editBio,
          location: editLocation,
          phone: editPhone,
          mobile_number: editPhone || user.mobile_number,
        });
        await refreshUser();
        setEditMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          setIsEditModalOpen(false);
          setEditMessage(null);
        }, 1200);
      } else {
        setEditMessage({ type: 'error', text: res.message || 'Failed to update profile' });
      }
    } catch (err: any) {
      setEditMessage({ type: 'error', text: err.message || 'Error updating profile' });
    } finally {
      setEditLoading(false);
    }
  };

  const formattedJoinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Active Member';

  const userInitial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#07101C] py-8 sm:py-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ================= HERO PROFILE CARD ================= */}
        <div className="bg-white dark:bg-[#0B192C] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#0F766E]/40 shadow-sm relative overflow-hidden">
          {/* Subtle decorative gradient top bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1B5E20] via-[#2DD4BF] to-[#FF6B35]"></div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-[#1B5E20]/20 dark:ring-[#2DD4BF]/30 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[#1B5E20] via-[#2E7D32] to-[#0F766E] text-white flex items-center justify-center font-bold text-3xl font-heading shadow-md ring-4 ring-[#1B5E20]/20 dark:ring-[#2DD4BF]/30">
                    {userInitial}
                  </div>
                )}
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="absolute -bottom-2 -right-2 p-1.5 bg-white dark:bg-[#07101C] text-[#1B5E20] dark:text-[#2DD4BF] rounded-xl border border-slate-200 dark:border-[#0F766E]/50 shadow-md hover:scale-110 transition"
                  title="Edit Profile"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Basic Info */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
                    {user.name || 'TravelSaathi Explorer'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#0F766E]/40 text-[#1B5E20] dark:text-[#2DD4BF] border border-emerald-300 dark:border-[#2DD4BF]/40">
                    {user.role === 'SUPER_ADMIN' ? (
                      <>
                        <Shield className="w-3 h-3 text-[#1B5E20] dark:text-[#2DD4BF]" />
                        <span>Super Admin</span>
                      </>
                    ) : user.role === 'BUSINESS_OWNER' ? (
                      <>
                        <Briefcase className="w-3 h-3 text-[#F3722C]" />
                        <span>Partner Owner</span>
                      </>
                    ) : (
                      <>
                        <Compass className="w-3 h-3 text-[#1B5E20] dark:text-[#2DD4BF]" />
                        <span>Verified Traveler</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Email & Mobile Badges */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                  {user.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{user.email}</span>
                    </div>
                  )}

                  {(user.mobile_number || user.phone) && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span className="font-mono">+91 {user.mobile_number || user.phone}</span>
                      {user.mobile_verified ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded-md border border-amber-200 dark:border-amber-800">
                          <AlertCircle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          <span>Not Verified</span>
                        </span>
                      )}
                    </div>
                  )}

                  {user.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{user.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {formattedJoinDate}</span>
                  </div>
                </div>

                {user.bio && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic pt-1 max-w-2xl">
                    "{user.bio}"
                  </p>
                )}
              </div>
            </div>

            {/* Header Right Action Buttons */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 self-start md:self-center">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-[#0F766E]/50 bg-white dark:bg-[#07101C] text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#1B5E20] dark:hover:border-[#2DD4BF] hover:text-[#1B5E20] dark:hover:text-[#2DD4BF] shadow-xs transition flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-[#1E3E62]/60">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#07101C]/60 border border-slate-100 dark:border-[#0F766E]/20 text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-[#1B5E20] dark:text-[#2DD4BF] font-heading">
                {trips.length}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Saved Trips
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#07101C]/60 border border-slate-100 dark:border-[#0F766E]/20 text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-[#F3722C] font-heading">
                {bookings.length}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Taxi Bookings
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#07101C]/60 border border-slate-100 dark:border-[#0F766E]/20 text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-[#0F766E] dark:text-teal-400 font-heading">
                {user.mobile_verified ? 'Verified' : 'Pending'}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Phone Status
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#07101C]/60 border border-slate-100 dark:border-[#0F766E]/20 text-center">
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-slate-200 font-heading">
                {user.role === 'SUPER_ADMIN' ? 'Admin' : user.role === 'BUSINESS_OWNER' ? 'Partner' : 'Tourist'}
              </p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Account Tier
              </p>
            </div>
          </div>
        </div>

        {/* ================= SHORTCUT BREADCRUMBS / PORTALS ================= */}
        {(isSuperAdmin || isBusinessOwner) && (
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-orange-500/10 border border-[#0F766E]/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold">
                {isSuperAdmin ? <Shield className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {isSuperAdmin ? 'Super Administrator Access Enabled' : 'Verified Business Partner Account'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isSuperAdmin
                    ? 'Access destination management, reviews moderation, taxi approvals, and system logs'
                    : 'Manage your hotel, haveli, taxi fleet, and customer reservations'}
                </p>
              </div>
            </div>
            <Link
              to={isSuperAdmin ? '/admin' : '/business/dashboard'}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1B5E20] to-[#0F766E] text-white text-xs font-bold shadow-md hover:brightness-110 transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>{isSuperAdmin ? 'Launch Admin Panel' : 'Partner Dashboard'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* ================= MAIN TABS NAVIGATION ================= */}
        <div className="flex border-b border-slate-200 dark:border-[#1E3E62] overflow-x-auto scrollbar-none gap-2">
          <button
            onClick={() => setActiveTab('trips')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'trips'
                ? 'border-[#1B5E20] dark:border-[#2DD4BF] text-[#1B5E20] dark:text-[#2DD4BF]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>My AI Trips ({trips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-[#1B5E20] dark:border-[#2DD4BF] text-[#1B5E20] dark:text-[#2DD4BF]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Taxi Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'border-[#1B5E20] dark:border-[#2DD4BF] text-[#1B5E20] dark:text-[#2DD4BF]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookmarkCheck className="w-4 h-4" />
            <span>Saved Places & Havelis</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#1B5E20] dark:border-[#2DD4BF] text-[#1B5E20] dark:text-[#2DD4BF]'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Verification</span>
          </button>
        </div>

        {/* ================= TAB 1: MY TRIPS ================= */}
        {activeTab === 'trips' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                Generated Itineraries & Saved Trips
              </h2>
              <Link
                to="/plan-trip"
                className="px-3.5 py-1.5 rounded-xl bg-[#1B5E20] hover:bg-[#154a19] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Create New Trip</span>
              </Link>
            </div>

            {loadingData ? (
              <div className="p-8 text-center bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-[#0F766E]/40">
                <RefreshCw className="w-6 h-6 text-[#1B5E20] dark:text-[#2DD4BF] animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading trips...</p>
              </div>
            ) : trips.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-[#0B192C] rounded-3xl border border-slate-200 dark:border-[#0F766E]/40 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-[#07101C] text-[#1B5E20] dark:text-[#2DD4BF] flex items-center justify-center mx-auto text-2xl">
                  🧭
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Saved Trips Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  You haven't generated any AI itineraries yet. Choose your destination, dates, and dietary preferences to build your first personalized itinerary!
                </p>
                <Link
                  to="/plan-trip"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white text-xs font-bold shadow-md hover:brightness-110 transition mt-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Itinerary</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-[#0F766E]/40 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-[#0F766E]/40 text-[#1B5E20] dark:text-[#2DD4BF]">
                          {trip.trip_type || 'Custom Trip'}
                        </span>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition"
                          title="Delete trip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        {trip.title || trip.destination || 'Indian Journey'}
                      </h3>

                      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {trip.days && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#1B5E20] dark:text-[#2DD4BF]" />
                            <span>{trip.days} Days</span>
                          </div>
                        )}
                        {trip.budget && (
                          <div className="flex items-center gap-1">
                            <span>₹ {trip.budget}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-[#1E3E62]/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        {trip.created_at ? new Date(trip.created_at).toLocaleDateString() : 'Recent'}
                      </span>
                      <Link
                        to={`/trip/${trip.id}`}
                        className="text-xs font-bold text-[#1B5E20] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: TAXI BOOKINGS ================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                My Taxi & Cab Reservations
              </h2>
              <Link
                to="/taxis"
                className="px-3.5 py-1.5 rounded-xl bg-[#F3722C] hover:bg-[#e0621d] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                <span>Book a Ride</span>
              </Link>
            </div>

            {loadingData ? (
              <div className="p-8 text-center bg-white dark:bg-[#0B192C] rounded-2xl border border-slate-200 dark:border-[#0F766E]/40">
                <RefreshCw className="w-6 h-6 text-[#1B5E20] dark:text-[#2DD4BF] animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-[#0B192C] rounded-3xl border border-slate-200 dark:border-[#0F766E]/40 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-[#07101C] text-[#F3722C] flex items-center justify-center mx-auto text-2xl">
                  🚗
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Taxi Rides Booked</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Find verified local tourist cabs, outstation taxis, or airport transfers with upfront pricing and verified drivers across India.
                </p>
                <Link
                  to="/taxis"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F3722C] to-[#E55A1B] text-white text-xs font-bold shadow-md hover:brightness-110 transition mt-2"
                >
                  <Car className="w-4 h-4" />
                  <span>Find Available Cabs</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#0B192C] border border-slate-200 dark:border-[#0F766E]/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {booking.pickup_location} → {booking.drop_location}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : booking.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Date: {booking.travel_date} • Passengers: {booking.passengers_count || 1}
                      </p>
                      {booking.total_fare && (
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Estimated Fare: ₹{booking.total_fare}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/taxis"
                      className="text-xs font-bold text-[#1B5E20] dark:text-[#2DD4BF] hover:underline flex items-center gap-1 self-start sm:self-center"
                    >
                      <span>Taxi Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: SAVED PLACES & HAVELIS ================= */}
        {activeTab === 'saved' && (
          <div className="p-8 bg-white dark:bg-[#0B192C] rounded-3xl border border-slate-200 dark:border-[#0F766E]/40 space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-[#07101C] text-[#0F766E] dark:text-[#2DD4BF] flex items-center justify-center mx-auto text-2xl">
              🏰
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
              Your Bookmarked Stays, Havelis & Attractions
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Access all your favorited heritage hotels, royal palaces, serene ghats, and veg food trails in one unified collection.
            </p>
            <div className="pt-2">
              <Link
                to="/saved"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] text-white text-xs font-bold shadow-md hover:brightness-110 transition"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Open Full Saved Collection</span>
              </Link>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SECURITY & VERIFICATION ================= */}
        {activeTab === 'security' && (
          <div className="bg-white dark:bg-[#0B192C] rounded-3xl border border-slate-200 dark:border-[#0F766E]/40 p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-[#1E3E62]/60 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                Account Security & Verification Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your verified login credentials and authentication credentials
              </p>
            </div>

            <div className="space-y-4">
              {/* Mobile Phone Verification Status */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07101C]/60 border border-slate-200/80 dark:border-[#0F766E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-[#0F766E]/40 text-[#1B5E20] dark:text-[#2DD4BF]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">Mobile Number</h4>
                      {user.mobile_verified ? (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                          ✅ Verified via OTP
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          ⚠️ Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">
                      {user.mobile_number || user.phone ? `+91 ${user.mobile_number || user.phone}` : 'No phone linked yet'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#0F766E]/50 bg-white dark:bg-[#07101C] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#1B5E20] dark:hover:border-[#2DD4BF] transition self-start sm:self-center"
                >
                  Update Number
                </button>
              </div>

              {/* Email Address Status */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07101C]/60 border border-slate-200/80 dark:border-[#0F766E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Email Address</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{user.email || 'No email attached'}</p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-400 self-start sm:self-center">Primary Login</span>
              </div>

              {/* Account Role Permissions */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07101C]/60 border border-slate-200/80 dark:border-[#0F766E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Account Permissions & Role</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your current role is <strong className="text-slate-800 dark:text-slate-200">{user.role}</strong>.
                    </p>
                  </div>
                </div>

                {user.role === 'TOURIST' && (
                  <Link
                    to="/business/register"
                    className="px-3.5 py-1.5 rounded-xl bg-[#F3722C] hover:bg-[#e0621d] text-white text-xs font-bold transition shadow-sm self-start sm:self-center"
                  >
                    Upgrade to Partner
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= EDIT PROFILE MODAL ================= */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white dark:bg-[#0B192C] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#0F766E]/50 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E3E62] pb-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                  Edit Personal Profile
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditMessage(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    editMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                  }`}
                >
                  {editMessage.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Mobile Number (10 digits)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Jaipur, Rajasthan"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Bio / Travel Preferences
                  </label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about what you love to explore in India..."
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#1E3E62] bg-white dark:bg-[#07101C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-[#1E3E62]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditMessage(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E3E62]/50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:brightness-110 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                  >
                    {editLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Skyline Accent */}
        <div className="pt-8">
          <IndianMonumentsSkyline className="w-full text-emerald-800/15 dark:text-[#2DD4BF]/10" tagline="Discover India • TravelSaathi AI" />
        </div>
      </div>
    </div>
  );
};
