import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { TaxiBooking, NotificationItem } from '../../types';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import {
  Compass,
  Sparkles,
  Car,
  Bell,
  Trash2,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  BookmarkCheck,
  Globe,
  Settings as SettingsIcon,
  HelpCircle,
  Info,
  Award,
  Luggage,
} from 'lucide-react';

export const TouristDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, currentLanguageOption } = useLanguage();
  const [activeTab, setActiveTab] = useState<'trips' | 'bookings' | 'notifications'>('trips');
  const [trips, setTrips] = useState<any[]>([]);
  const [bookings, setBookings] = useState<TaxiBooking[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      api.getUserTrips(),
      api.getMyBookings(),
      api.getNotifications(),
    ])
      .then(([tripsRes, bookingsRes, notifsRes]) => {
        if (tripsRes.success) setTrips(tripsRes.data || []);
        if (bookingsRes.success) setBookings(bookingsRes.data || []);
        if (notifsRes.success) setNotifications(notifsRes.data || []);
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleDeleteTrip = async (id: number) => {
    if (!confirm('Are you sure you want to delete this saved trip?')) return;
    try {
      const res = await api.deleteTrip(id);
      if (res.success) {
        setTrips((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate dynamic stats
  const tripsCount = trips.length;
  const uniqueDestinations = trips.length > 0
    ? new Set(trips.map((t) => t.city_name)).size
    : 0;
  const uniqueStates = trips.length > 0
    ? Math.max(1, Math.ceil(uniqueDestinations / 2))
    : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* 1. TOP PROFILE & USER CARD (Reference Screen 8) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#1B5E20] to-[#2E7D32] text-white flex items-center justify-center font-bold text-2xl font-heading shadow-md shadow-[#1B5E20]/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading">
                {user?.name || 'Traveler'}
              </h1>
              <p className="text-xs text-slate-500">{user?.email || (user?.mobile_number ? `+91 ${user.mobile_number}` : '')}</p>
              <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-[#1B5E20]">
                {user?.role || 'TOURIST'}
              </span>
            </div>
          </div>


          <Link
            to="/settings"
            className="p-3 text-slate-400 hover:text-[#1B5E20] hover:bg-emerald-50 rounded-2xl transition"
            title="Settings & Preferences"
          >
            <SettingsIcon className="w-6 h-6" />
          </Link>
        </div>

        {/* 2. YOUR TRAVEL STATS (Reference Screen 8) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            {t('tripStats')}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-center flex flex-col items-center justify-center">
              <Luggage className="w-5 h-5 text-[#1B5E20] mb-1" />
              <span className="text-2xl font-black text-[#1B5E20] font-heading">{tripsCount}</span>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">{t('tripsPlanned')}</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-center flex flex-col items-center justify-center">
              <MapPin className="w-5 h-5 text-[#B27B08] mb-1" />
              <span className="text-2xl font-black text-[#B27B08] font-heading">{uniqueDestinations}</span>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">{t('destinations')}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3722C]/10 border border-[#F3722C]/20 text-center flex flex-col items-center justify-center">
              <Award className="w-5 h-5 text-[#F3722C] mb-1" />
              <span className="text-2xl font-black text-[#F3722C] font-heading">{uniqueStates}</span>
              <span className="text-[10px] font-bold text-slate-600 mt-0.5">{t('states')}</span>
            </div>
          </div>
        </div>

        {/* 3. PROFILE ACTION LIST (Reference Screen 8) */}
        <div className="space-y-1 divide-y divide-slate-100 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('trips')}
            className="w-full flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-slate-50 transition text-left"
          >
            <div className="flex items-center space-x-3 text-slate-700">
              <Luggage className="w-4 h-4 text-[#1B5E20]" />
              <span className="text-sm font-semibold">{t('myTrips')}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <span className="font-bold text-slate-800">{trips.length}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>

          <Link
            to="/saved"
            className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3 text-slate-700">
              <BookmarkCheck className="w-4 h-4 text-[#1B5E20]" />
              <span className="text-sm font-semibold">{t('saved')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <Link
            to="/plan-trip"
            className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3 text-slate-700">
              <Sparkles className="w-4 h-4 text-[#F3722C]" />
              <span className="text-sm font-semibold">{t('aiAssistant')}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-[#1B5E20] font-semibold">
              <span>{t('planTrip')} ✨</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>

          <Link
            to="/settings"
            className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3 text-slate-700">
              <Globe className="w-4 h-4 text-[#1B5E20]" />
              <span className="text-sm font-semibold">{t('language')}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs font-bold text-slate-600">
              <span>{currentLanguageOption.nativeName}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </Link>

          <Link
            to="/settings"
            className="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-slate-50 transition"
          >
            <div className="flex items-center space-x-3 text-slate-700">
              <SettingsIcon className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold">{t('settings')} & Preferences</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>

          <div className="flex items-center justify-between py-3.5 px-3 text-slate-700">
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold">{t('helpAndSupport')}</span>
            </div>
            <span className="text-xs text-slate-400">namaste@travelsaathi.ai</span>
          </div>

          <div className="flex items-center justify-between py-3.5 px-3 text-slate-700">
            <div className="flex items-center space-x-3">
              <Info className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-semibold">{t('aboutApp')}</span>
            </div>
            <span className="text-xs font-semibold text-[#1B5E20]">v2.4.0 (Haryana)</span>
          </div>
        </div>
      </div>

      {/* 4. DASHBOARD TABS (Trips, Bookings, Notifications) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('trips')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'trips'
                ? 'border-[#1B5E20] text-[#1B5E20]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('myTrips')} ({trips.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'bookings'
                ? 'border-[#1B5E20] text-[#1B5E20]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>Taxi Bookings ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center space-x-2 cursor-pointer ${
              activeTab === 'notifications'
                ? 'border-[#1B5E20] text-[#1B5E20]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications ({notifications.filter((n) => !n.is_read).length})</span>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">Loading dashboard data...</div>
        ) : (
          <div>
            {/* TRIPS TAB */}
            {activeTab === 'trips' && (
              <div className="space-y-4">
                {trips.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-3">
                    <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="font-bold text-slate-900 font-heading">No saved trips yet</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Generate an itinerary with our AI engine and save it to your portfolio for easy access.
                    </p>
                    <Link
                      to="/plan-trip"
                      className="inline-block px-5 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold mt-2 hover:bg-[#144818] shadow-sm"
                    >
                      {t('generateTripBtn')}
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trips.map((t) => (
                      <div key={t.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between">
                        <div className="p-6 space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B5E20]">
                                {t.city_name} • {t.days_count} Days
                              </span>
                              <h3 className="text-lg font-bold text-slate-900 font-heading mt-0.5">{t.title}</h3>
                            </div>
                            <button
                              onClick={() => handleDeleteTrip(t.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                              title="Delete Trip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 text-[10px] block">Estimated Cost</span>
                              <span className="font-bold text-slate-900 font-heading">₹{t.estimated_total_cost}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] block">Target Budget</span>
                              <span className="font-bold text-[#1B5E20] font-heading">₹{t.budget_target}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {t.interests?.map((i: string) => (
                              <span key={i} className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                                {i}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                          <span className="text-xs text-slate-400">Created: {new Date(t.created_at).toLocaleDateString()}</span>
                          <Link
                            to={`/trip/${t.id}`}
                            className="px-4 py-2 bg-[#1B5E20] hover:bg-[#144818] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <span>View Itinerary</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8 space-y-3">
                    <Car className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="font-bold text-slate-900 font-heading">No taxi bookings yet</h3>
                    <p className="text-xs text-slate-500">Book local autos, sedans, or SUVs across any city.</p>
                    <Link to="/taxis" className="inline-block px-5 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold mt-2">
                      Browse Taxi Fleets
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#1B5E20]">
                            <Car className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{b.service_name}</h4>
                            <p className="text-xs text-slate-500">Pickup: {b.pickup_address || b.pickup_location} → Drop: {b.drop_address || b.drop_location}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            {b.status}
                          </span>
                          <span className="block text-sm font-bold text-slate-900 mt-1">₹{b.estimated_fare}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 p-8">
                    <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.is_read && handleMarkNotificationRead(n.id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between ${
                        n.is_read ? 'bg-white border-slate-200' : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                        <p className="text-xs text-slate-600">{n.message}</p>
                        <span className="text-[10px] text-slate-400 block">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      {!n.is_read && (
                        <span className="w-2.5 h-2.5 bg-[#1B5E20] rounded-full shrink-0 mt-1"></span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. BOTTOM WATERMARK & SKYLINE SILHOUETTE (Reference Screen 8) */}
      <div className="pt-6 border-t border-slate-200/70">
        <IndianMonumentsSkyline fillColor="#1B5E20" showTagline={true} />
      </div>
    </div>
  );
};
