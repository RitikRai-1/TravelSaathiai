import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { TouristPlace, Hotel, Restaurant, TaxiService, Review } from '../../types';
import { TaxiBookingModal } from '../../components/booking/TaxiBookingModal';
import { ReviewModal } from '../../components/modals/ReviewModal';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Clock,
  Ticket,
  Star,
  Sparkles,
  Car,
  Hotel as HotelIcon,
  Utensils,
  Share2,
  BookmarkCheck,
  Heart,
  MessageSquarePlus,
  Compass,
  Camera,
  ShieldCheck,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Landmark,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const PlaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [place, setPlace] = useState<TouristPlace | null>(null);
  const [nearbyHotels, setNearbyHotels] = useState<Hotel[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [nearbyTaxis, setNearbyTaxis] = useState<TaxiService[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Gallery & Lightbox state
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Modals
  const [selectedTaxi, setSelectedTaxi] = useState<TaxiService | null>(null);
  const [taxiModalOpen, setTaxiModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api.getPlaceById(id)
      .then((res) => {
        if (res.success && res.data) {
          setPlace(res.data.place);
          setNearbyHotels(res.data.nearbyHotels || []);
          setNearbyRestaurants(res.data.nearbyRestaurants || []);
          setNearbyTaxis(res.data.nearbyTaxis || []);
          setReviews(res.data.reviews || []);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    if (user) {
      api.getFavorites().then((res) => {
        if (res.success && res.data?.places) {
          const match = res.data.places.some((p: any) => String(p.id) === String(id) || p.slug === id);
          setIsSaved(match);
        }
      });
    }
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please log in to save this place');
      return;
    }
    if (!place) return;

    try {
      const res = await api.toggleFavorite('PLACE', place.id);
      if (res.success) {
        setIsSaved(res.isFavorited);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookTaxiToPlace = (taxi?: TaxiService) => {
    const targetTaxi = taxi || (nearbyTaxis.length > 0 ? nearbyTaxis[0] : null);
    if (!targetTaxi) {
      alert('No taxis available in this city right now.');
      return;
    }
    setSelectedTaxi(targetTaxi);
    setTaxiModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Loading attraction details &amp; gallery...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Compass className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 font-heading">Tourist Place Not Found</h2>
        <p className="text-xs text-slate-500">This destination may have been unpublished by Super Admin.</p>
        <Link to="/explore" className="inline-block px-6 py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-sm font-semibold">
          Back to Explore India
        </Link>
      </div>
    );
  }

  // Combine cover image with gallery photos into a unified, deduplicated list
  const allPhotos: string[] = [
    place.cover_image,
    ...(place.gallery && Array.isArray(place.gallery) ? place.gallery : []),
  ].filter((p, idx, self) => Boolean(p) && self.indexOf(p) === idx);

  const currentPhoto = allPhotos[activePhotoIdx] || place.cover_image;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-[#1B5E20]">Home</Link>
        <span>/</span>
        <Link to="/explore" className="hover:text-[#1B5E20]">Explore</Link>
        <span>/</span>
        <Link to={`/explore?city_id=${place.city_id}`} className="hover:text-[#1B5E20]">{place.city_name}</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{place.name}</span>
      </div>

      {/* Main Hero Header & Interactive Gallery */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
        {/* Active Hero Image Viewport */}
        <div className="relative h-80 sm:h-[420px] w-full group overflow-hidden bg-slate-950">
          <SafeImage
            src={currentPhoto}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            category="place"
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
              <span className="hidden sm:inline">View Gallery ({allPhotos.length})</span>
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-3 rounded-2xl bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition flex items-center space-x-1.5 text-xs font-bold"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-600 fill-rose-600' : 'text-slate-500'}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Next/Prev Controls on Main Photo */}
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100 z-10"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActivePhotoIdx((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition opacity-0 group-hover:opacity-100 z-10"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Place Title & Badges */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#1B5E20] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                {place.category}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                {place.city_name}, {place.state_name}
              </span>
              <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{place.rating} ({place.review_count} reviews)</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-heading drop-shadow-md">{place.name}</h1>
            <p className="text-slate-200 text-xs sm:text-sm flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-[#F9C74F] shrink-0" />
              <span>{place.address}</span>
            </p>
          </div>
        </div>

        {/* Thumbnail Gallery Strip */}
        {allPhotos.length > 1 && (
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center space-x-3 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 px-2 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-[#F9C74F]" />
              <span>Photos ({allPhotos.length}):</span>
            </span>
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition ${
                  activePhotoIdx === idx ? 'border-[#F9C74F] ring-2 ring-[#F9C74F]/40 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <SafeImage src={photo} alt={`${place.name} view ${idx + 1}`} className="w-full h-full object-cover" category="place" />
              </button>
            ))}
          </div>
        )}

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 border-b border-slate-100 p-4 bg-slate-50/80 text-center">
          <div className="p-3">
            <span className="text-[11px] text-slate-400 font-medium block">Entry Fee</span>
            <span className="text-base font-bold text-slate-900 font-heading">
              {place.entry_fee === 0 ? 'Free Entry' : `₹${place.entry_fee} per person`}
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-400 font-medium block">Visiting Hours</span>
            <span className="text-base font-bold text-slate-900 font-heading">
              {place.opening_time} - {place.closing_time}
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-400 font-medium block">Ideal Duration</span>
            <span className="text-base font-bold text-slate-900 font-heading">
              {place.recommended_duration_hours} Hours
            </span>
          </div>
          <div className="p-3">
            <span className="text-[11px] text-slate-400 font-medium block">Best Time to Visit</span>
            <span className="text-base font-bold text-[#1B5E20] font-heading">
              {place.best_visiting_time}
            </span>
          </div>
        </div>

        {/* Primary CTA Row */}
        <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 text-xs">
            {place.family_friendly ? <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">👨‍👩‍👦 Family Friendly</span> : null}
            {place.couple_friendly ? <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">💑 Couple Friendly</span> : null}
            {place.solo_friendly ? <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">🎒 Solo Friendly</span> : null}
            {place.budget_friendly ? <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">💰 Budget Friendly</span> : null}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={() => handleBookTaxiToPlace()}
              className="flex-1 sm:flex-initial px-6 py-3 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-sm rounded-xl shadow-md shadow-green-900/20 transition flex items-center justify-center space-x-2"
            >
              <Car className="w-4 h-4" />
              <span>Book Taxi to Here</span>
            </button>
            <Link
              to={`/plan-trip?city=${place.city_id}`}
              className="flex-1 sm:flex-initial px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-[#F9C74F]" />
              <span>Include in AI Trip</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Description & Overview */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 text-[#1B5E20]">
          <Info className="w-5 h-5" />
          <h2 className="text-2xl font-bold text-slate-900 font-heading">About {place.name}</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">
          {place.description}
        </p>
      </div>

      {/* Architecture, Heritage & History Deep Dive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-[#1B5E20]">
            <Landmark className="w-5 h-5" />
            <h3 className="text-xl font-bold text-slate-900 font-heading">Architecture &amp; Cultural Heritage</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {place.name} represents timeless craftsmanship with exceptional stone masonry, intricate lattice work, and historic courtyards that embody the cultural soul of {place.city_name}.
          </p>
          <div className="space-y-2.5 pt-2">
            <div className="flex items-start space-x-2 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
              <span><strong>Architectural Style:</strong> Traditional Indian heritage architectural forms with symmetrical pavilions and ornate gateways.</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
              <span><strong>Historical Era:</strong> Celebrated monument representing centuries of cultural preservation and regional history.</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0 mt-0.5" />
              <span><strong>Restoration:</strong> Maintained under Archaeological and Tourism heritage preservation protocols.</span>
            </div>
          </div>
        </div>

        {/* Best Photography Spots */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-[#F3722C]">
            <Camera className="w-5 h-5" />
            <h3 className="text-xl font-bold text-slate-900 font-heading">Best Photography Spots</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Capture stunning memories at {place.name}. Discover optimal angles and lighting to create postcard-perfect photos.
          </p>
          <div className="space-y-2.5 pt-2">
            <div className="flex items-start space-x-2 text-xs text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Golden Hour:</strong> 6:30 AM - 8:00 AM &amp; 5:00 PM - 6:30 PM for soft golden natural backlighting.</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Vantage Point:</strong> Main frontal plaza and reflection viewpoints capture the grand scale of the facade.</span>
            </div>
            <div className="flex items-start space-x-2 text-xs text-slate-700">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span><strong>Photography Rules:</strong> Mobile photography allowed. Commercial drone filming requires prior ASI permission.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Practical Visitor Guidelines */}
      <div className="bg-linear-to-r from-emerald-50/70 via-white to-amber-50/70 p-6 sm:p-8 rounded-3xl border border-emerald-200/70 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 text-[#1B5E20]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="text-xl font-bold text-slate-900 font-heading">Visitor Guidelines &amp; Practical Tips</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
            <span className="text-xs font-bold text-slate-900 block">👟 Footwear &amp; Attire</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Comfortable walking shoes recommended. Respectful, modest clothing covering shoulders and knees is appreciated.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
            <span className="text-xs font-bold text-slate-900 block">🧳 Lockers &amp; Security</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Security checkpoint at the gate. Cloakrooms and safe luggage counters available for day-trippers and tourists.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-2xs space-y-1">
            <span className="text-xs font-bold text-slate-900 block">🎙️ Certified Local Guides</span>
            <p className="text-xs text-slate-600 leading-relaxed">
              Official Ministry of Tourism certified audio guides and licensed multi-lingual guides are available near the ticket desk.
            </p>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for High-Res Pictures */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold font-heading">{place.name}</h3>
              <p className="text-xs text-slate-400">Photo {activePhotoIdx + 1} of {allPhotos.length}</p>
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Lightbox Image View */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <SafeImage
              src={currentPhoto}
              alt={place.name}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
              category="place"
            />

            {allPhotos.length > 1 && (
              <>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev === 0 ? allPhotos.length - 1 : prev - 1))}
                  className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActivePhotoIdx((prev) => (prev === allPhotos.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 overflow-x-auto py-2">
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                  activePhotoIdx === idx ? 'border-[#F9C74F] scale-110' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <SafeImage src={photo} alt="" className="w-full h-full object-cover" category="place" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Hotels & Stays */}
      {nearbyHotels.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-heading">Nearby Stays &amp; Hotels</h2>
              <p className="text-xs text-slate-500">Verified accommodations close to {place.name}</p>
            </div>
            <Link to={`/hotels?city_id=${place.city_id}`} className="text-xs font-bold text-[#1B5E20] hover:underline">
              View all stays →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {nearbyHotels.map((hotel) => (
              <Link
                key={hotel.id}
                to={`/hotels/${hotel.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
              >
                <div className="relative h-44">
                  <SafeImage
                    src={hotel.photos?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                    category="hotel"
                  />
                  <span className="absolute bottom-2 right-2 bg-white text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                    ₹{hotel.price_per_night} / night
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900 font-heading">{hotel.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1">{hotel.address}</p>
                  <div className="pt-2 flex items-center justify-between text-xs text-amber-500 font-bold">
                    <span>★ {hotel.rating}</span>
                    <span className="text-[#1B5E20] font-semibold">View Details &amp; Rooms</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Nearby Restaurants */}
      {nearbyRestaurants.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-heading">Nearby Food &amp; Dining</h2>
              <p className="text-xs text-slate-500">Iconic food spots and cafes near {place.name}</p>
            </div>
            <Link to={`/restaurants?city_id=${place.city_id}`} className="text-xs font-bold text-[#1B5E20] hover:underline">
              View all dining →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {nearbyRestaurants.map((rest) => (
              <Link
                key={rest.id}
                to={`/restaurants/${rest.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
              >
                <div className="relative h-44">
                  <SafeImage
                    src={rest.photos?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'}
                    alt={rest.name}
                    className="w-full h-full object-cover"
                    category="restaurant"
                  />
                  <span className="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                    ₹{rest.avg_cost_for_two} for two
                  </span>
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[10px] font-bold text-[#1B5E20] uppercase">{rest.cuisine}</span>
                  <h4 className="font-bold text-sm text-slate-900 font-heading">{rest.name}</h4>
                  <div className="pt-2 flex items-center justify-between text-xs text-amber-500 font-bold">
                    <span>★ {rest.rating}</span>
                    <span className="text-[#1B5E20] font-semibold">View Menu &amp; Dishes</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Reviews & Visitor Ratings */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Traveller Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Average Rating: <span className="font-bold text-slate-800">★ {place.rating} / 5</span> ({reviews.length} reviews)
            </p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] rounded-xl text-xs font-bold transition flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No reviews yet for this destination. Be the first to share your experience!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#1B5E20] font-bold text-xs flex items-center justify-center">
                      {rev.user_name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rev.user_name}</h4>
                      <span className="text-[10px] text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-amber-400 text-xs">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pl-10">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Taxi Booking Modal */}
      <TaxiBookingModal
        taxi={selectedTaxi}
        isOpen={taxiModalOpen}
        onClose={() => setTaxiModalOpen(false)}
        defaultDrop={place.name}
      />

      {/* Review Submission Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        entityType="PLACE"
        entityId={place.id}
        entityName={place.name}
        onReviewSubmitted={(newAvg, newCount) => {
          setPlace({ ...place, rating: newAvg, review_count: newCount });
        }}
      />

      {/* Skyline Footer */}
      <IndianMonumentsSkyline showTagline />
    </div>
  );
};
