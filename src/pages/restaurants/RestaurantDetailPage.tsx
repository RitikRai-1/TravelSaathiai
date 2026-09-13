import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Restaurant, MenuItem, Review } from '../../types';
import { ReviewModal } from '../../components/modals/ReviewModal';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import {
  Utensils,
  Star,
  MapPin,
  Phone,
  Clock,
  Check,
  Heart,
  MessageSquarePlus,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Flame,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RestaurantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Gallery state
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Menu Category Filter
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Table Reservation Modal
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api.getRestaurantById(id)
      .then((res) => {
        if (res.success && res.data) {
          setRestaurant(res.data.restaurant);
          setMenuItems(res.data.menuItems || []);
          setReviews(res.data.reviews || []);
          setNearbyPlaces(res.data.nearbyPlaces || []);
        }
      })
      .finally(() => setLoading(false));

    if (user) {
      api.getFavorites().then((res) => {
        if (res.success && res.data?.restaurants) {
          const match = res.data.restaurants.some((r: any) => String(r.id) === String(id));
          setIsSaved(match);
        }
      });
    }
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please log in to save this restaurant');
      return;
    }
    if (!restaurant) return;

    try {
      const res = await api.toggleFavorite('RESTAURANT', restaurant.id);
      if (res.success) {
        setIsSaved(res.isFavorited);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Categories extracted from menu items
  const menuCategories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((m) => m.category || 'Specialties')));
    return ['ALL', ...cats];
  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {
    if (selectedCategory === 'ALL') return menuItems;
    return menuItems.filter((m) => (m.category || 'Specialties') === selectedCategory);
  }, [menuItems, selectedCategory]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm">Loading restaurant profile &amp; culinary gallery...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Utensils className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-[#0B192C] font-heading">Restaurant Not Found</h2>
        <Link to="/restaurants" className="inline-block px-6 py-2.5 bg-[#0F766E] hover:bg-[#0B192C] text-white rounded-xl text-sm font-semibold transition">
          Back to Restaurants
        </Link>
      </div>
    );
  }

  const photos: string[] = (restaurant.photos && restaurant.photos.length > 0)
    ? restaurant.photos
    : ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'];

  const currentPhoto = photos[activePhotoIdx] || photos[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-[#0F766E]">Home</Link>
          <span>/</span>
          <Link to="/restaurants" className="hover:text-[#0F766E]">Restaurants</Link>
          <span>/</span>
          <Link to={`/restaurants?city_id=${restaurant.city_id}`} className="hover:text-[#0F766E]">{restaurant.city_name}</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{restaurant.name}</span>
        </div>

        <button
          onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/restaurants')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-[#FAF9F6] text-xs font-semibold shadow-2xs transition"
        >
          <ChevronLeft className="w-4 h-4 text-[#0F766E]" />
          <span>Back to Restaurants / Itinerary</span>
        </button>
      </div>

      {/* Main Banner & Multi-photo Viewport */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
        <div className="relative h-80 sm:h-[420px] w-full group overflow-hidden bg-slate-950">
          <img
            src={currentPhoto}
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"></div>

          {/* Action Buttons Top Right */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            <button
              onClick={() => setLightboxOpen(true)}
              className="p-3 rounded-2xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition flex items-center space-x-1.5 text-xs font-semibold shadow-md"
              title="View full screen gallery"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">View Photos ({photos.length})</span>
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-3 rounded-2xl bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition flex items-center space-x-1.5 text-xs font-bold"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-600 fill-rose-600' : 'text-slate-500'}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Next/Prev Controls */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActivePhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100 z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Header Details */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#0F766E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                {restaurant.city_name}
              </span>
              <span className="bg-[#2DD4BF] text-[#0B192C] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                {restaurant.cuisine}
              </span>
              {restaurant.food_type === 'veg' && (
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center space-x-1">
                  <span>🥬</span>
                  <span>Pure Vegetarian</span>
                </span>
              )}
              {restaurant.food_type === 'non_veg' && (
                <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center space-x-1">
                  <span>🍗</span>
                  <span>Non-Vegetarian</span>
                </span>
              )}
              {restaurant.food_type === 'both' && (
                <span className="bg-teal-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center space-x-1">
                  <span>🥬🍗</span>
                  <span>Veg &amp; Non-Veg</span>
                </span>
              )}
              <span className="bg-[#FF6B35] text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{restaurant.rating} / 5</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-heading drop-shadow-md">{restaurant.name}</h1>
            <p className="text-slate-200 text-xs sm:text-sm">
              Average Cost: <strong className="text-[#2DD4BF]">₹{restaurant.avg_cost_for_two} for two people</strong>
            </p>
          </div>
        </div>

        {/* Thumbnail Gallery Strip */}
        {photos.length > 1 && (
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center space-x-3 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 px-2 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-[#F9C74F]" />
              <span>Photos ({photos.length}):</span>
            </span>
            {photos.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition ${
                  activePhotoIdx === idx ? 'border-[#F9C74F] ring-2 ring-[#F9C74F]/40 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Info & Timing Bar */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#1B5E20]" />
              <span>Hours: <strong>{restaurant.opening_hours}</strong></span>
            </div>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">Open Today</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                setReservationSuccess(false);
                setReservationModalOpen(true);
              }}
              className="px-6 py-3 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-sm rounded-xl shadow-md shadow-green-900/20 transition flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve a Table</span>
            </button>
            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="px-5 py-3 border border-slate-300 hover:border-[#1B5E20] hover:text-[#1B5E20] bg-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Phone className="w-4 h-4 text-[#1B5E20]" />
                <span>Call Restaurant</span>
              </a>
            )}
          </div>
        </div>

        {/* Description & Ambience */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-heading">About {restaurant.name}</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-4xl">{restaurant.description}</p>
          </div>

          {/* Popular Dishes Tags */}
          {restaurant.popular_dishes && restaurant.popular_dishes.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-heading mb-3 flex items-center space-x-1.5">
                <Flame className="w-4 h-4 text-[#F3722C]" />
                <span>Popular &amp; Must-Try Dishes</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {restaurant.popular_dishes.map((dish) => (
                  <span
                    key={dish}
                    className="px-3 py-1.5 bg-amber-50 text-amber-900 rounded-xl text-xs font-semibold border border-amber-200/80 shadow-2xs flex items-center space-x-1"
                  >
                    <span>⭐</span>
                    <span>{dish}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Culinary Specialties & Dietary Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#1B5E20] flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 font-heading">Dietary &amp; Food Quality</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            {restaurant.food_type === 'veg'
              ? '100% Pure Vegetarian dining with zero non-veg preparation. Specialized Sattvic & Jain thalis prepared upon request.'
              : restaurant.food_type === 'non_veg'
              ? 'Authentic non-vegetarian cuisine with rich gravies, succulent tandoor specials, and coastal curries.'
              : 'Multi-cuisine menu with dedicated vegetarian and non-vegetarian selections prepared according to traditional culinary standards.'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#F3722C] flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 font-heading">Atmosphere &amp; Hospitality</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Spacious family dining sections, cultural music evenings, and pleasant hospitality representative of Indian warmth.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 font-heading">Hygiene &amp; Safety Certified</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            FSSAI compliant kitchen hygiene, sanitized tableware, and temperature-controlled fresh food preparation standards.
          </p>
        </div>
      </div>

      {/* Signature Menu & Categorized Dishes */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Chef's Signature Dishes &amp; Menu</h2>
            <p className="text-xs text-slate-500">Explore authentic regional delicacies made fresh to order</p>
          </div>

          {/* Category Tabs */}
          {menuCategories.length > 2 && (
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl">
              {menuCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition capitalize ${
                    selectedCategory === cat
                      ? 'bg-[#1B5E20] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.toLowerCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-slate-50/80 border border-slate-100 hover:border-emerald-200 transition flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-xs border-2 flex items-center justify-center shrink-0 ${
                      item.is_veg ? 'border-emerald-600' : 'border-rose-600'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    ></span>
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 font-heading">{item.name}</h4>
                  {item.category && (
                    <span className="text-[10px] uppercase font-semibold text-slate-400 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {item.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
              </div>
              <span className="font-bold text-base text-slate-900 font-heading whitespace-nowrap">
                ₹{item.price}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Tourist Attractions */}
      {nearbyPlaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-heading">Attractions Near {restaurant.name}</h2>
              <p className="text-xs text-slate-500">Sightseeing highlights within convenient distance</p>
            </div>
            <Link to={`/explore?city_id=${restaurant.city_id}`} className="text-xs font-bold text-[#1B5E20] hover:underline">
              Explore City →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {nearbyPlaces.map((p) => (
              <Link
                key={p.id}
                to={`/places/${p.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs card-hover flex flex-col justify-between"
              >
                <div className="relative h-36">
                  <img src={p.cover_image} alt={p.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-[#1B5E20] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {p.category}
                  </span>
                  <span className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    ★ {p.rating}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{p.name}</h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{p.address}</p>
                  <span className="text-[11px] font-semibold text-[#1B5E20] block pt-1">
                    {p.entry_fee === 0 ? 'Free Entry' : `₹${p.entry_fee}`} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Customer Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">Rating: ★ {restaurant.rating} / 5 ({reviews.length} reviews)</p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Review Dining</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400">No food reviews yet. Share your experience at this restaurant!</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">{rev.user_name}</span>
                  <span className="text-amber-400 font-bold">★ {rev.rating}</span>
                </div>
                <p className="text-slate-600">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Screen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between text-white">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold font-heading">{restaurant.name}</h3>
              <p className="text-xs text-slate-400">Photo {activePhotoIdx + 1} of {photos.length}</p>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <img
              src={currentPhoto}
              alt={restaurant.name}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                  className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex items-center justify-center space-x-2 sm:space-x-3 overflow-x-auto py-2">
            {photos.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  activePhotoIdx === idx ? 'border-[#F9C74F] scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table Reservation Modal */}
      {reservationModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setReservationModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {reservationSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-heading">Table Reserved!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your table request at <strong>{restaurant.name}</strong> has been received. You will receive an SMS confirmation within a few minutes.
                </p>
                <button
                  onClick={() => setReservationModalOpen(false)}
                  className="mt-4 px-6 py-2.5 bg-[#1B5E20] text-white rounded-xl text-xs font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#1B5E20] uppercase tracking-wider">Dining Reservation</span>
                  <h3 className="text-2xl font-bold text-slate-900 font-heading">Book Table at {restaurant.name}</h3>
                  <p className="text-xs text-slate-500">Fast, instant booking with zero reservation fee.</p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setReservationSuccess(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Reservation Date</label>
                      <input
                        type="date"
                        required
                        defaultValue="2026-09-15"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Meal Time Slot</label>
                      <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden">
                        <option>Lunch (12:30 PM)</option>
                        <option>Lunch (1:30 PM)</option>
                        <option selected>Dinner (7:30 PM)</option>
                        <option>Dinner (8:30 PM)</option>
                        <option>Dinner (9:30 PM)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Party Size</label>
                      <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden">
                        <option>1 Person</option>
                        <option selected>2 Guests</option>
                        <option>3 - 4 Guests</option>
                        <option>5 - 8 Guests (Family Table)</option>
                        <option>8+ Guests (Large Group)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Seating Preference</label>
                      <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden">
                        <option>Standard Indoor</option>
                        <option>AC Family Section</option>
                        <option>Rooftop / Balcony View</option>
                        <option>Window Table</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Contact Mobile Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      defaultValue={user?.phone || ''}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold rounded-xl text-sm transition shadow-md shadow-green-900/20"
                  >
                    Confirm Table Reservation
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        entityType="RESTAURANT"
        entityId={restaurant.id}
        entityName={restaurant.name}
        onReviewSubmitted={(newAvg) => setRestaurant({ ...restaurant, rating: newAvg })}
      />

      {/* Skyline Footer */}
      <IndianMonumentsSkyline showTagline />
    </div>
  );
};
