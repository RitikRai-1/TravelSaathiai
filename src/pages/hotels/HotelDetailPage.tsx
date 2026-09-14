import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Hotel, HotelRoom, Review, TouristPlace } from '../../types';
import { ReviewModal } from '../../components/modals/ReviewModal';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';
import {
  Hotel as HotelIcon,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Wifi,
  Check,
  Heart,
  MessageSquarePlus,
  Car,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ShieldCheck,
  Clock,
  Sparkles,
  Bed,
  Users,
  Calendar,
  CheckCircle2,
  Coffee,
  Navigation,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Gallery state
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Booking Inquiry Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api.getHotelById(id)
      .then((res) => {
        if (res.success && res.data) {
          setHotel(res.data.hotel);
          setRooms(res.data.rooms || []);
          setReviews(res.data.reviews || []);
          setNearbyPlaces(res.data.nearbyPlaces || []);
        }
      })
      .finally(() => setLoading(false));

    if (user) {
      api.getFavorites().then((res) => {
        if (res.success && res.data?.hotels) {
          const match = res.data.hotels.some((h: any) => String(h.id) === String(id));
          setIsSaved(match);
        }
      });
    }
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('Please log in to save this hotel');
      return;
    }
    if (!hotel) return;

    try {
      const res = await api.toggleFavorite('HOTEL', hotel.id);
      if (res.success) {
        setIsSaved(res.isFavorited);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenBooking = (room?: HotelRoom) => {
    setSelectedRoom(room || (rooms.length > 0 ? rooms[0] : null));
    setBookingSuccess(false);
    setBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#1B5E20] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm">Loading hotel profile &amp; photo gallery...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <HotelIcon className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 font-heading">Hotel Not Found</h2>
        <Link to="/hotels" className="inline-block px-6 py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-sm font-semibold">
          Back to Hotels Directory
        </Link>
      </div>
    );
  }

  const photos: string[] = (hotel.photos && hotel.photos.length > 0)
    ? hotel.photos
    : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'];

  const currentPhoto = photos[activePhotoIdx] || photos[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-[#1B5E20]">Home</Link>
        <span>/</span>
        <Link to="/hotels" className="hover:text-[#1B5E20]">Hotels</Link>
        <span>/</span>
        <Link to={`/hotels?city_id=${hotel.city_id}`} className="hover:text-[#1B5E20]">{hotel.city_name}</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{hotel.name}</span>
      </div>

      {/* Hotel Banner & Interactive Gallery */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm">
        {/* Main Viewport */}
        <div className="relative h-80 sm:h-[420px] w-full group overflow-hidden bg-slate-950">
          <SafeImage
            src={currentPhoto}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            category="hotel"
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

          {/* Hotel Title & Badges */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#1B5E20] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                {hotel.city_name}, {hotel.state_name || 'India'}
              </span>
              <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow-xs">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{hotel.rating} / 5</span>
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                Verified Stay
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-heading drop-shadow-md">{hotel.name}</h1>
            <p className="text-slate-200 text-xs sm:text-sm flex items-center space-x-1">
              <MapPin className="w-4 h-4 text-[#F9C74F] shrink-0" />
              <span>{hotel.address}</span>
            </p>
          </div>
        </div>

        {/* Thumbnail Gallery Strip */}
        {photos.length > 1 && (
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center space-x-3 overflow-x-auto scrollbar-thin">
            <span className="text-[11px] font-semibold text-slate-400 shrink-0 px-2 flex items-center space-x-1">
              <Camera className="w-3.5 h-3.5 text-[#F9C74F]" />
              <span>Gallery ({photos.length}):</span>
            </span>
            {photos.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIdx(idx)}
                className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition ${
                  activePhotoIdx === idx ? 'border-[#F9C74F] ring-2 ring-[#F9C74F]/40 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <SafeImage src={p} alt="" className="w-full h-full object-cover" category="hotel" />
              </button>
            ))}
          </div>
        )}

        {/* Info Strip */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Starting Price</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold text-slate-900 font-heading">₹{hotel.price_per_night}</span>
              <span className="text-xs text-slate-500"> / night + taxes</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleOpenBooking()}
              className="px-6 py-3 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold text-sm rounded-xl shadow-md shadow-green-900/20 transition flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve Room</span>
            </button>
            {hotel.phone && (
              <a
                href={`tel:${hotel.phone}`}
                className="px-5 py-3 border border-slate-300 hover:border-[#1B5E20] hover:text-[#1B5E20] bg-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
              >
                <Phone className="w-4 h-4 text-[#1B5E20]" />
                <span>Direct Call</span>
              </a>
            )}
          </div>
        </div>

        {/* Property Overview */}
        <div className="p-8 space-y-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-heading">About the Property</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed max-w-4xl">{hotel.description}</p>
          </div>

          {/* Key Facilities & Amenities Breakdown */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 font-heading mb-3">Key Facilities &amp; Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {hotel.facilities?.map((f) => (
                <span key={f} className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 text-[#1B5E20] rounded-xl text-xs font-semibold border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>{f}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Available Room Types */}
      {rooms.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-heading">Available Room Types</h2>
              <p className="text-xs text-slate-500">Select your preferred accommodation option</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="relative h-48 rounded-2xl overflow-hidden group">
                    <SafeImage
                      src={room.photos?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'}
                      alt={room.room_type}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      category="hotel"
                    />
                    <span className="absolute bottom-3 right-3 bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                      ₹{room.price_per_night} / night
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-lg text-slate-900 font-heading">{room.room_type}</h4>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                        Free Breakfast
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Up to {room.capacity} Guests</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span>King / Twin Bed</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {room.amenities?.map((a) => (
                        <span key={a} className="text-[10px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total per night</span>
                    <span className="font-bold text-base text-slate-900">₹{room.price_per_night}</span>
                  </div>
                  <button
                    onClick={() => handleOpenBooking(room)}
                    className="px-5 py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Select Room
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* House Rules & Stay Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-[#1B5E20]">
            <Clock className="w-5 h-5" />
            <h3 className="text-xl font-bold text-slate-900 font-heading">Check-in &amp; Check-out Policies</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Check-in Time</span>
              <span className="text-lg font-bold text-slate-900 font-heading">2:00 PM</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Early check-in on request</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Check-out Time</span>
              <span className="text-lg font-bold text-slate-900 font-heading">11:00 AM</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Express check-out available</span>
            </div>
          </div>
          <div className="space-y-2 pt-2 text-xs text-slate-600">
            <p className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0" />
              <span>24-Hour Front Desk and Concierge service available.</span>
            </p>
            <p className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#1B5E20] shrink-0" />
              <span>Free secure luggage storage before check-in or after check-out.</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 text-[#F3722C]">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-xl font-bold text-slate-900 font-heading">House Rules &amp; Guest Guidelines</h3>
          </div>
          <div className="space-y-3 pt-2 text-xs text-slate-600">
            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <strong className="text-slate-900 block mb-0.5">Government ID Verification:</strong>
              Valid Aadhaar Card, Passport, or Driving License is mandatory for all adult guests during registration.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">Couple &amp; Family Friendly:</strong>
              Welcomes families, solo travelers, and couples with proper identification.
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">Non-Smoking Property:</strong>
              Designated smoking zones provided outdoors; all rooms are strictly 100% smoke-free.
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Attractions */}
      {nearbyPlaces.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-heading">Attractions Near {hotel.name}</h2>
              <p className="text-xs text-slate-500">Popular tourist destinations within easy reach</p>
            </div>
            <Link to={`/explore?city_id=${hotel.city_id}`} className="text-xs font-bold text-[#1B5E20] hover:underline">
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
                  <SafeImage src={p.cover_image} alt={p.name} className="w-full h-full object-cover" category="place" />
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

      {/* Reviews Section */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">Guest Reviews</h2>
            <p className="text-xs text-slate-500 mt-0.5">Rating: ★ {hotel.rating} / 5 ({reviews.length} reviews)</p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#1B5E20] rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>Review Hotel</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400">No guest reviews yet. Be the first to share your stay experience!</p>
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

      {/* Lightbox Modal for Full Screen Photos */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fadeIn">
          <div className="flex items-center justify-between text-white">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-bold font-heading">{hotel.name}</h3>
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
            <SafeImage
              src={currentPhoto}
              alt={hotel.name}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl"
              category="hotel"
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
                <SafeImage src={p} alt="" className="w-full h-full object-cover" category="hotel" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Room Reservation Inquiry Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#1B5E20] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-heading">Reservation Inquiry Ready!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your inquiry details for <strong>{hotel.name}</strong> have been prepared. Connect directly with the front desk via phone or email for instantaneous rate confirmation and room lock.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                  {hotel.phone && (
                    <a
                      href={`tel:${hotel.phone}`}
                      className="w-full sm:w-auto px-5 py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Front Desk ({hotel.phone})</span>
                    </a>
                  )}
                  {hotel.email && (
                    <a
                      href={`mailto:${hotel.email}?subject=Reservation Inquiry: ${hotel.name}&body=Hello, I would like to inquire about booking a ${selectedRoom ? selectedRoom.room_type : 'room'} at ${hotel.name}.`}
                      className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 hover:border-[#1B5E20] text-slate-700 hover:text-[#1B5E20] rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email Front Desk</span>
                    </a>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#1B5E20] uppercase tracking-wider">Direct Stay Inquiry</span>
                  <h3 className="text-2xl font-bold text-slate-900 font-heading">Inquire at {hotel.name}</h3>
                  <p className="text-xs text-slate-500">
                    Selected: <strong>{selectedRoom ? selectedRoom.room_type : 'Standard Room'}</strong> (₹{selectedRoom ? selectedRoom.price_per_night : hotel.price_per_night}/night)
                  </p>
                </div>

                {/* Direct Contact Channels Card */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Verified Contact Details</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {hotel.phone && (
                      <a
                        href={`tel:${hotel.phone}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-emerald-800 hover:border-emerald-500"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1B5E20]" />
                        <span>{hotel.phone}</span>
                      </a>
                    )}
                    {hotel.email && (
                      <a
                        href={`mailto:${hotel.email}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500"
                      >
                        <Mail className="w-3.5 h-3.5 text-[#1B5E20]" />
                        <span>{hotel.email}</span>
                      </a>
                    )}
                    {hotel.website && (
                      <a
                        href={hotel.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500"
                      >
                        <Globe className="w-3.5 h-3.5 text-[#1B5E20]" />
                        <span>Official Website</span>
                      </a>
                    )}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setBookingSuccess(true);
                  }}
                  className="space-y-4 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Check-in Date</label>
                      <input
                        type="date"
                        required
                        defaultValue="2026-09-15"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Check-out Date</label>
                      <input
                        type="date"
                        required
                        defaultValue="2026-09-17"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Guests</label>
                      <select className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden">
                        <option>1 Adult</option>
                        <option selected>2 Adults</option>
                        <option>2 Adults + 1 Child</option>
                        <option>3 Adults</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Guest Contact Phone</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        defaultValue={user?.phone || ''}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#1B5E20] outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-emerald-900 block font-bold">Estimated Total (2 Nights)</span>
                      <span className="text-[10px] text-emerald-700">Pay directly to Hotel • 0% Middleman Cut</span>
                    </div>
                    <span className="text-lg font-bold text-[#1B5E20] font-heading">
                      ₹{((selectedRoom ? selectedRoom.price_per_night : hotel.price_per_night) * 2).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#1B5E20] hover:bg-[#154a19] text-white font-bold rounded-xl text-sm transition shadow-md shadow-green-900/20 cursor-pointer"
                  >
                    Submit Direct Reservation Inquiry
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
        entityType="HOTEL"
        entityId={hotel.id}
        entityName={hotel.name}
        onReviewSubmitted={(newAvg) => setHotel({ ...hotel, rating: newAvg })}
      />

      {/* Skyline Footer */}
      <IndianMonumentsSkyline showTagline />
    </div>
  );
};
