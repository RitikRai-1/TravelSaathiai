import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { GeneratedTrip, GeneratedStop, Hotel, Restaurant } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { TaxiBookingModal } from '../../components/booking/TaxiBookingModal';
import { IndianMonumentsSkyline } from '../../components/common/IndianMonumentsSkyline';
import { SafeImage } from '../../components/common/SafeImage';
import { MobileTripDetailView } from './MobileTripDetailView';
import { useIsMobile } from '../../hooks/useIsMobile';
import {
  Sparkles,
  BookmarkCheck,
  RotateCcw,
  SlidersHorizontal,
  Wallet,
  Compass,
  MapPin,
  Clock,
  Ticket,
  Car,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Printer,
  Calendar,
  Users,
  ChevronDown,
  Info,
  Hotel as HotelIcon,
  Utensils,
  ArrowRight,
  Star,
  Phone,
  Fuel,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Navigation,
  Search,
  Check,
  ShieldCheck,
  Bed,
  Wifi,
  Coffee,
  Building,
  Filter,
} from 'lucide-react';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, formatDayTitle, formatSlotTitle, formatStopType } = useLanguage();
  const isMobile = useIsMobile();

  const [trip, setTrip] = useState<GeneratedTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [savedTripId, setSavedTripId] = useState<number | null>(null);

  // Workflow Stage: Step 1 (Hotel Selection) -> Step 2 (Full Day-by-Day Itinerary)
  const [workflowStage, setWorkflowStage] = useState<'hotel_selection' | 'full_itinerary'>(
    id && id !== 'preview' ? 'full_itinerary' : 'hotel_selection'
  );

  // Selected Hotel state & City Data
  const [selectedHotel, setSelectedHotel] = useState<any | null>(null);
  const [cityHotels, setCityHotels] = useState<Hotel[]>([]);
  const [cityRestaurants, setCityRestaurants] = useState<Restaurant[]>([]);

  // Hotel filters
  const [hotelFilterTier, setHotelFilterTier] = useState<'ALL' | 'BUDGET' | 'MID_RANGE' | 'LUXURY'>('ALL');
  const [hotelMinRating, setHotelMinRating] = useState<number>(0);
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>('');
  const [hotelAmenityFilter, setHotelAmenityFilter] = useState<string>('ALL');

  // Booking modal & selected taxi
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [defaultDrop, setDefaultDrop] = useState('');
  const [selectedTaxi, setSelectedTaxi] = useState<any>(null);
  const [appliedOptimizations, setAppliedOptimizations] = useState<string[]>([]);

  useEffect(() => {
    if (id && id !== 'preview') {
      // Load saved trip from API
      api.getTripById(id)
        .then((res) => {
          if (res.success && res.trip) {
            setTrip(res.trip);
            setIsSaved(true);
            setSavedTripId(Number(id));
            if ((res.trip as any).selectedHotel) {
              setSelectedHotel((res.trip as any).selectedHotel);
            }
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      // Load from session storage for preview
      const stored = sessionStorage.getItem('lastGeneratedTrip');
      if (stored) {
        const parsed = JSON.parse(stored);
        setTrip(parsed);
        if (parsed.selectedHotel) {
          setSelectedHotel(parsed.selectedHotel);
        }
      }
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (trip?.city?.id) {
      // Fetch hotels for destination city
      api.getHotels({ city_id: trip.city.id }).then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setCityHotels(res.data);
          setSelectedHotel((prev: any) => prev || trip.recommendedHotels?.[0] || res.data[0]);
        }
      });

      // Fetch restaurants for destination city matching food preference
      const foodTypeParam = trip.foodPreference === 'veg' ? 'veg' : trip.foodPreference === 'non_veg' ? 'non_veg' : undefined;
      api.getRestaurants({ city_id: trip.city.id, food_type: foodTypeParam }).then((res) => {
        if (res.success && res.data && res.data.length > 0) {
          setCityRestaurants(res.data);
        }
      });
    }
  }, [trip?.city?.id]);

  useEffect(() => {
    if (trip) {
      if (trip.availableTaxis && trip.availableTaxis.length > 0) {
        setSelectedTaxi(trip.availableTaxis[0]);
      } else if (trip.city?.id) {
        api.getTaxis({ city_id: trip.city.id }).then((res) => {
          if (res.success && res.data && res.data.length > 0) {
            setSelectedTaxi(res.data[0]);
          }
        });
      }
    }
  }, [trip]);

  const activeTaxi = selectedTaxi || (trip ? {
    id: 999,
    service_name: `${trip.city.name} Verified City Cabs`,
    driver_name: 'Harpreet Singh',
    phone: '+91 98110 22334',
    vehicle_type: 'Sedan',
    vehicle_photos: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80'],
    base_fare: 150,
    per_km_fare: 14,
    rating: 4.8,
  } : null);

  const handleOpenTaxiBooking = () => {
    setDefaultDrop(trip?.city?.name ? `${trip.city.name} Sightseeing Circuit` : 'City Center');
    setBookingModalOpen(true);
  };

  const handleApplyOptimization = (optKey: string, savings: number) => {
    if (!trip || appliedOptimizations.includes(optKey)) return;
    setAppliedOptimizations((prev) => [...prev, optKey]);

    const updatedBudget = { ...trip.budget };
    if (optKey === 'hotel') updatedBudget.hotelCost = Math.max(0, (updatedBudget.hotelCost || 0) - savings);
    if (optKey === 'food') updatedBudget.foodCost = Math.max(trip.daysCount * trip.travellersCount * 250, (updatedBudget.foodCost || 0) - savings);
    if (optKey === 'transport') updatedBudget.transportCost = Math.max(100, (updatedBudget.transportCost || 0) - savings);
    if (optKey === 'activity') updatedBudget.entryFeesCost = Math.max(0, (updatedBudget.entryFeesCost || 0) - savings);
    if (optKey === 'taxi') updatedBudget.taxiCost = Math.max(100, (updatedBudget.taxiCost || 0) - savings);

    const newTotal =
      (updatedBudget.hotelCost || 0) +
      (updatedBudget.foodCost || 0) +
      (updatedBudget.transportCost || 0) +
      (updatedBudget.activitiesCost || 0) +
      (updatedBudget.entryFeesCost || 0) +
      (updatedBudget.taxiCost || 0) +
      (updatedBudget.miscCost || 0);

    updatedBudget.estimatedTotalCost = newTotal;
    updatedBudget.remainingBudget = Math.max(0, updatedBudget.budgetTarget - newTotal);
    updatedBudget.budgetPercentageUsed = Math.min(100, Math.round((newTotal / updatedBudget.budgetTarget) * 100));
    updatedBudget.isExceeded = newTotal > updatedBudget.budgetTarget;
    updatedBudget.excessAmount = updatedBudget.isExceeded ? newTotal - updatedBudget.budgetTarget : 0;
    updatedBudget.status = updatedBudget.isExceeded
      ? 'BUDGET_INSUFFICIENT'
      : (newTotal === updatedBudget.budgetTarget ? 'BUDGET_FULLY_USED' : 'WITHIN_BUDGET');

    const updatedTrip = { ...trip, budget: updatedBudget };
    setTrip(updatedTrip);
    sessionStorage.setItem('lastGeneratedTrip', JSON.stringify(updatedTrip));
  };

  const handleSelectHotel = (hotel: any) => {
    setSelectedHotel(hotel);
  };

  const handleProceedToItinerary = () => {
    if (!trip) return;
    const hotelToUse = selectedHotel || (cityHotels.length > 0 ? cityHotels[0] : trip.recommendedHotels?.[0]);
    if (!hotelToUse) {
      setWorkflowStage('full_itinerary');
      return;
    }

    const nights = Math.max(0, trip.daysCount <= 1 ? 0 : trip.daysCount - 1);
    const rooms = Math.ceil(trip.travellersCount / 2);
    const totalStayPrice = nights > 0 ? (hotelToUse.price_per_night || 2200) * nights * rooms : 0;

    let updatedBudget = { ...trip.budget, hotelCost: totalStayPrice };
    let newTotal =
      (updatedBudget.hotelCost || 0) +
      (updatedBudget.foodCost || 0) +
      (updatedBudget.transportCost || 0) +
      (updatedBudget.activitiesCost || 0) +
      (updatedBudget.entryFeesCost || 0) +
      (updatedBudget.taxiCost || 0) +
      (updatedBudget.miscCost || 0);

    // If new hotel pushes over budget, automatically re-balance buffer and dining so total stays within budget:
    if (newTotal > updatedBudget.budgetTarget) {
      const excess = newTotal - updatedBudget.budgetTarget;
      if (updatedBudget.miscCost > 0) {
        const cut = Math.min(updatedBudget.miscCost, excess);
        updatedBudget.miscCost -= cut;
      }
      newTotal =
        (updatedBudget.hotelCost || 0) +
        (updatedBudget.foodCost || 0) +
        (updatedBudget.transportCost || 0) +
        (updatedBudget.activitiesCost || 0) +
        (updatedBudget.entryFeesCost || 0) +
        (updatedBudget.taxiCost || 0) +
        (updatedBudget.miscCost || 0);

      const minFood = trip.daysCount * trip.travellersCount * 250;
      if (newTotal > updatedBudget.budgetTarget && updatedBudget.foodCost > minFood) {
        const cut = Math.min(updatedBudget.foodCost - minFood, newTotal - updatedBudget.budgetTarget);
        updatedBudget.foodCost -= cut;
      }
      newTotal =
        (updatedBudget.hotelCost || 0) +
        (updatedBudget.foodCost || 0) +
        (updatedBudget.transportCost || 0) +
        (updatedBudget.activitiesCost || 0) +
        (updatedBudget.entryFeesCost || 0) +
        (updatedBudget.taxiCost || 0) +
        (updatedBudget.miscCost || 0);
    }

    updatedBudget.estimatedTotalCost = newTotal;
    updatedBudget.remainingBudget = Math.max(0, updatedBudget.budgetTarget - newTotal);
    updatedBudget.budgetPercentageUsed = Math.min(100, Math.round((newTotal / updatedBudget.budgetTarget) * 100));
    updatedBudget.isExceeded = newTotal > updatedBudget.budgetTarget;
    updatedBudget.excessAmount = updatedBudget.isExceeded ? newTotal - updatedBudget.budgetTarget : 0;
    updatedBudget.status = updatedBudget.isExceeded
      ? 'BUDGET_INSUFFICIENT'
      : (newTotal === updatedBudget.budgetTarget ? 'BUDGET_FULLY_USED' : 'WITHIN_BUDGET');

    // Update hotel stops in itinerary
    const updatedDays = trip.days.map((day) => ({
      ...day,
      stops: day.stops.map((stop) => {
        if (stop.stopType === 'HOTEL') {
          return {
            ...stop,
            title: `Overnight Stay: ${hotelToUse.name}`,
            entityId: hotelToUse.id,
            imageUrl: Array.isArray(hotelToUse.photos) && hotelToUse.photos.length > 0 ? hotelToUse.photos[0] : stop.imageUrl,
            description: hotelToUse.description || stop.description,
            estimatedCost: nights > 0 ? Math.round(totalStayPrice / nights) : 0,
          };
        }
        return stop;
      }),
    }));

    const updatedTrip = { ...trip, days: updatedDays, budget: updatedBudget, selectedHotel: hotelToUse };
    setTrip(updatedTrip);
    setSelectedHotel(hotelToUse);
    sessionStorage.setItem('lastGeneratedTrip', JSON.stringify(updatedTrip));
    setWorkflowStage('full_itinerary');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveTrip = async () => {
    if (!user) {
      alert('Please log in first to save this trip to your dashboard.');
      navigate('/login');
      return;
    }
    if (!trip) return;

    try {
      const res = await api.saveTrip(trip);
      if (res.success) {
        setIsSaved(true);
        setSavedTripId(res.tripId);
        alert('Trip saved to your dashboard portfolio!');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save trip');
    }
  };

  const handleOptimizeBudget = async () => {
    if (!trip) return;
    setIsOptimizing(true);
    try {
      const res = await api.optimizeTrip({
        cityId: trip.city.id,
        budgetTarget: trip.budget.budgetTarget,
        daysCount: trip.daysCount,
        travellersCount: trip.travellersCount,
        adultsCount: trip.adultsCount || trip.travellersCount,
        childrenCount: trip.childrenCount || 0,
        transportMode: trip.transportMode,
        interests: trip.interests,
        travellerType: trip.travellerType,
        foodPreference: trip.foodPreference,
      });

      if (res.success && res.trip) {
        setTrip(res.trip);
        sessionStorage.setItem('lastGeneratedTrip', JSON.stringify(res.trip));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to optimize budget');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share && trip) {
      try {
        await navigator.share({
          title: trip.title,
          text: `Check out my ${trip.daysCount}-day itinerary for ${trip.city.name} on TravelSaathi AI!`,
          url: window.location.href,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Itinerary link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#0F766E] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 text-sm">Retrieving personalized itinerary...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Compass className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 font-heading">No Itinerary Found</h2>
        <p className="text-xs text-slate-500">Plan a new trip using our AI engine.</p>
        <Link to="/plan-trip" className="inline-block px-6 py-3 bg-[#0F766E] hover:bg-[#0D5E57] text-white rounded-xl text-sm font-bold">
          Plan My Trip
        </Link>
      </div>
    );
  }

  const { budget } = trip;
  const budgetRatio = Math.min(100, Math.round((budget.estimatedTotalCost / budget.budgetTarget) * 100));

  // Curated & verified hotels for selection
  const baseHotelsList = (cityHotels && cityHotels.length > 0)
    ? cityHotels
    : (trip.recommendedHotels && trip.recommendedHotels.length > 0)
      ? trip.recommendedHotels
      : [
          {
            id: 101,
            name: `${trip.city.name} Heritage Grand Palace & Suites`,
            city_name: trip.city.name,
            rating: 4.8,
            price_per_night: 3200,
            room_type: 'Deluxe Heritage AC Room',
            photos: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80'],
            facilities: ['Free High-Speed WiFi', 'Air Conditioning', 'Complimentary Breakfast', 'Swimming Pool', 'Secure Parking'],
            description: 'Centrally located luxury heritage stay close to prime monuments, scenic avenues, and vibrant local bazaars.',
            distance_from_center: '1.2 km from Landmark Hub',
            ai_badge: 'AI Best Value & Location',
            why_recommend: 'Optimal midpoint between morning heritage monuments and evening dining hubs, saving 40 mins transit daily.'
          },
          {
            id: 102,
            name: `${trip.city.name} Royal Comfort Executive Inn`,
            city_name: trip.city.name,
            rating: 4.6,
            price_per_night: 2100,
            room_type: 'Executive King Comfort Room',
            photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80'],
            facilities: ['Free High-Speed WiFi', 'Air Conditioning', 'Complimentary Breakfast', '24/7 Power Backup', 'Room Service'],
            description: 'Top-rated comfortable property with modern amenities, round-the-clock front desk, and pristine cleanliness.',
            distance_from_center: '2.5 km from Sightseeing Circuit',
            ai_badge: 'Top Budget Pick',
            why_recommend: 'Maximum amenities per rupee spent with 98% positive guest reviews on hygiene, safety, and staff hospitality.'
          },
          {
            id: 103,
            name: `${trip.city.name} Haveli Residency & Spa`,
            city_name: trip.city.name,
            rating: 4.9,
            price_per_night: 5800,
            room_type: 'Royal Luxury Suite with City View',
            photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80'],
            facilities: ['Free High-Speed WiFi', 'Air Conditioning', 'Buffet Breakfast', 'Wellness Spa', 'Valet Parking'],
            description: 'Premium boutique property featuring traditional architecture, rooftop panoramic restaurant, and serene courtyard gardens.',
            distance_from_center: '0.8 km from Cultural District',
            ai_badge: 'Luxury Experience',
            why_recommend: 'Unmatched cultural ambience, panoramic sunset views, and curated regional dining right at your doorstep.'
          },
          {
            id: 104,
            name: `${trip.city.name} Eco Green Resort & Stay`,
            city_name: trip.city.name,
            rating: 4.7,
            price_per_night: 2600,
            room_type: 'Garden View Premium Room',
            photos: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1000&q=80'],
            facilities: ['Free High-Speed WiFi', 'Air Conditioning', 'Organic Breakfast', 'EV Charging Station', 'Lawn & Games'],
            description: 'Tranquil greenery and spacious lawns offering peace away from traffic yet within quick reach of main sights.',
            distance_from_center: '3.0 km from City Center',
            ai_badge: 'Eco Friendly Stay',
            why_recommend: 'Spacious outdoor environment with verified on-site dining and EV charging facilities.'
          }
        ];

  const enrichedHotels = baseHotelsList.map((hotel: any, idx: number) => {
    const price = hotel.price_per_night || 2600;
    const badges = ['AI Best Value', 'Top Rated Choice', 'Central Stay Base', 'Scenic Heritage Property'];
    const reasons = [
      `Strategically positioned within 15 minutes of Day 1 and Day 2 attractions, minimizing intra-city travel time.`,
      `Highly reviewed for family comfort, prompt room service, and complimentary high-speed WiFi.`,
      `Budget-optimized stay that preserves more funds for authentic dining, guided monuments, and local shopping.`,
      `Verified hospitality partner with secure parking, 24/7 power backup, and seamless taxi pickup access.`
    ];
    const distances = ['1.2 km from Landmark Hub', '0.8 km from Cultural Corridor', '2.1 km from Central Bazaar', '1.5 km from City Center'];

    return {
      ...hotel,
      price_per_night: price,
      ai_badge: hotel.ai_badge || badges[idx % badges.length],
      why_recommend: hotel.why_recommend || reasons[idx % reasons.length],
      distance_from_center: hotel.distance_from_center || distances[idx % distances.length],
      room_type: hotel.room_type || (price > 4500 ? 'Luxury Heritage Suite' : price > 2500 ? 'Deluxe AC Room' : 'Standard Comfort AC Room'),
      facilities: (hotel.facilities && hotel.facilities.length > 0)
        ? hotel.facilities
        : ['Free High-Speed WiFi', 'Air Conditioning', 'Complimentary Breakfast', 'Secure Parking', 'Room Service']
    };
  });

  const filteredHotels = enrichedHotels.filter((hotel: any) => {
    if (hotelFilterTier === 'BUDGET' && hotel.price_per_night >= 2500) return false;
    if (hotelFilterTier === 'MID_RANGE' && (hotel.price_per_night < 2500 || hotel.price_per_night > 5500)) return false;
    if (hotelFilterTier === 'LUXURY' && hotel.price_per_night <= 5500) return false;

    if (hotelMinRating > 0 && (hotel.rating || 4.5) < hotelMinRating) return false;

    if (hotelSearchQuery.trim()) {
      const q = hotelSearchQuery.toLowerCase();
      const nameMatch = (hotel.name || '').toLowerCase().includes(q);
      const descMatch = (hotel.description || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch) return false;
    }

    if (hotelAmenityFilter !== 'ALL') {
      const hasAmenity = (hotel.facilities || []).some((f: string) => f.toLowerCase().includes(hotelAmenityFilter.toLowerCase()));
      if (!hasAmenity) return false;
    }

    return true;
  });

  // Active chosen hotel
  const activeStayHotel = selectedHotel || enrichedHotels[0];

  // Helper for restaurant cards per day and slot
  const getRestaurantForSlot = (dayNumber: number, slot: 'lunch' | 'dinner') => {
    const rawDining = (cityRestaurants && cityRestaurants.length > 0)
      ? cityRestaurants
      : (trip.recommendedRestaurants && trip.recommendedRestaurants.length > 0)
        ? trip.recommendedRestaurants
        : [
            {
              id: 201,
              name: `${trip.city.name} Heritage Rasoi & Thali`,
              cuisine: 'Traditional Regional & North Indian Thali',
              food_type: 'veg',
              rating: 4.8,
              avg_cost_for_two: 550,
              photos: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80'],
              popular_dishes: ['Special Regional Thali', 'Dal Makhani', 'Stuffed Kulcha', 'Kesar Kheer'],
              description: 'Iconic dining spot renowned for farm-fresh ingredients, fragrant desi ghee preparations, and rapid service.'
            },
            {
              id: 202,
              name: `${trip.city.name} Grand Darbar Grill & Cuisine`,
              cuisine: 'Mughlai, North Indian & Kebabs',
              food_type: 'both',
              rating: 4.7,
              avg_cost_for_two: 750,
              photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80'],
              popular_dishes: ['Paneer Tikka', 'Chicken Tikka', 'Garlic Naan', 'Phirni'],
              description: 'Acclaimed family-friendly restaurant with ambient evening lightning, courtyard seating, and live instrumental tunes.'
            },
            {
              id: 203,
              name: `${trip.city.name} Organic Haveli Bhojanalaya`,
              cuisine: 'Pure Veg Traditional & Satvik',
              food_type: 'veg',
              rating: 4.9,
              avg_cost_for_two: 450,
              photos: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80'],
              popular_dishes: ['Bajara Khichdi', 'Desi Ghee Churma', 'Kadhi Pakora', 'Chaach'],
              description: 'Pure vegetarian dining hub celebrating rural culinary traditions, handmade rotis, and clay-pot preparations.'
            }
          ];

    // Filter dining pool strictly according to trip foodPreference
    const isVeg = trip.foodPreference === 'veg';
    const isNonVeg = trip.foodPreference === 'non_veg';
    let filteredDining = rawDining.filter((r: any) => {
      const ft = r.food_type || 'both';
      if (isVeg) return ft === 'veg';
      if (isNonVeg) return ft === 'non_veg' || ft === 'both';
      return true;
    });

    if (isVeg && filteredDining.length === 0) {
      // Exclude strict non-veg restaurants completely
      filteredDining = rawDining.filter((r: any) => (r.food_type || 'both') !== 'non_veg');
    }

    const allDining = filteredDining.length > 0 ? filteredDining : [
      {
        id: 201,
        name: `${trip.city.name} Pure Veg Heritage Rasoi`,
        cuisine: 'Pure Veg Regional & North Indian Thali',
        food_type: 'veg',
        rating: 4.8,
        avg_cost_for_two: 500,
        photos: ['https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1000&q=80'],
        popular_dishes: ['Pure Veg Thali', 'Dal Makhani', 'Stuffed Kulcha', 'Kesar Kheer'],
        description: 'Pure vegetarian dining hub celebrating authentic spices, farm-fresh ingredients, and desi ghee preparations.'
      }
    ];

    const idx = slot === 'lunch' ? ((dayNumber - 1) * 2) % allDining.length : ((dayNumber - 1) * 2 + 1) % allDining.length;
    const dining = allDining[idx] || allDining[0];
    const costPerPerson = Math.round((dining.avg_cost_for_two || 600) / 2);
    const groupCost = costPerPerson * trip.travellersCount;
    const dishes = Array.isArray(dining.popular_dishes) && dining.popular_dishes.length > 0
      ? dining.popular_dishes.slice(0, 4)
      : ['Signature Thali', 'Paneer Special', 'Tandoori Roti', 'Dessert'];

    const whyAI = slot === 'lunch'
      ? `AI Lunch Pick: Perfectly situated within 8 mins of your morning sightseeing. Wholesome authentic thalis with zero detours.`
      : `AI Dinner Pick: Relaxing ambient dining on your return corridor to ${activeStayHotel?.name || 'your stay base'}, ideal for evening unwind.`;

    const photo = Array.isArray(dining.photos) && dining.photos.length > 0
      ? dining.photos[0]
      : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80';

    return { dining, costPerPerson, groupCost, dishes, whyAI, photo };
  };

  return (
    <>
      {/* Mobile Trip Detail View */}
      <div className="block md:hidden">
        <MobileTripDetailView
          trip={trip}
          selectedHotel={selectedHotel}
          setSelectedHotel={handleSelectHotel}
          cityHotels={cityHotels}
          workflowStage={workflowStage}
          setWorkflowStage={setWorkflowStage}
          isSaved={isSaved}
          onSaveTrip={handleSaveTrip}
          isOptimizing={isOptimizing}
          onOptimizeTrip={handleOptimizeBudget}
          onBookTaxi={(pickup, drop) => {
            setDefaultDrop(drop);
            setBookingModalOpen(true);
          }}
          appliedOptimizations={appliedOptimizations}
        />
      </div>

      {/* Desktop Trip Detail View */}
      <div className="hidden md:block max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full">
          <SafeImage
            src={trip.city.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover"
            category="city"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-[#0F766E] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>AI Generated Itinerary</span>
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                {trip.city.name}
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                {trip.daysCount} {trip.daysCount === 1 ? t('dayUnit', 'Day') : t('daysUnit', 'Days')} • {trip.travellersCount} {trip.travellersCount === 1 ? 'Traveller' : 'Travellers'}
              </span>
              {trip.foodPreference && (
                <span className={`backdrop-blur-md text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1 ${
                  trip.foodPreference === 'veg'
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                    : trip.foodPreference === 'both'
                    ? 'bg-teal-500/30 text-teal-200 border border-teal-400/40'
                    : 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                }`}>
                  <span>{trip.foodPreference === 'veg' ? '🥬 Pure Vegetarian' : trip.foodPreference === 'both' ? '🥬🍗 Veg & Non-Veg' : '🍗 Non-Vegetarian'}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold font-heading">{trip.title}</h1>

            <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center space-x-1">
                <Car className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>{t('transportModeLabel', 'Mode:')} {trip.transportMode}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>{t('travelWithTitle', 'With:')} {trip.travellerType}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>{trip.interests.join(', ')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Header Bar */}
        <div className="p-4 sm:p-6 bg-[#FAF9F6] border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSaveTrip}
              disabled={isSaved}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                isSaved
                  ? 'bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/30'
                  : 'bg-[#0F766E] hover:bg-[#0D5E57] text-white shadow-xs'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>{isSaved ? t('tripSavedBadge', 'Trip Saved ✓') : t('saveTripDashboardBtn', 'Save Trip to Dashboard')}</span>
            </button>

            {isSaved && (
              <Link
                to="/my-trips"
                className="px-4 py-2.5 rounded-xl bg-[#0B192C] hover:bg-[#FF6B35] text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-xs"
              >
                <span>{t('viewInMyTripsBtn', 'View in My Trips')}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#2DD4BF]" />
              </Link>
            )}

            <Link
              to={`/plan-trip?city=${trip.city.id}`}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-[#0F766E] text-xs font-semibold transition flex items-center space-x-1"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#0F766E]" />
              <span>{t('modifyTripBtn', 'Modify Trip')}</span>
            </Link>

            <button
              onClick={() => {
                sessionStorage.removeItem('lastGeneratedTrip');
                navigate('/plan-trip');
              }}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-[#0F766E] text-xs font-semibold transition flex items-center space-x-1"
            >
              <RotateCcw className="w-4 h-4 text-[#0F766E]" />
              <span>{t('regenerateTripBtn', 'Regenerate')}</span>
            </button>

            <button
              onClick={handlePrint}
              title="Print or Save as PDF"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-[#0F766E] text-xs font-semibold transition flex items-center space-x-1"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{t('printPdfBtn', 'Print / PDF')}</span>
            </button>

            <button
              onClick={handleShare}
              title="Share Itinerary"
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-[#0F766E] text-xs font-semibold transition flex items-center space-x-1"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">{t('shareBtn', 'Share')}</span>
            </button>
          </div>

          <button
            onClick={handleOpenTaxiBooking}
            className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#E85D26] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-[#FF6B35]/20"
          >
            <Car className="w-4 h-4 text-amber-100" />
            <span>{t('bookTaxiItineraryBtn', 'Book Taxi for this Itinerary')}</span>
          </button>
        </div>
      </div>

      {/* ═══ HOTEL SELECTION WORKFLOW (Step 2) ═══ */}
      {workflowStage === 'hotel_selection' && (
        <div className="space-y-6">
          {/* Progress Stepper */}
          <div className="bg-[#0B192C] rounded-2xl p-5 flex flex-wrap items-center justify-center gap-0">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#2DD4BF] text-[#0B192C] flex items-center justify-center font-bold text-sm">✓</div>
              <span className="ml-2 text-sm font-bold text-[#2DD4BF] hidden sm:inline">{t('step1Preferences', 'Preferences')}</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-[#2DD4BF] mx-2 sm:mx-3"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center font-bold text-sm animate-pulse">2</div>
              <span className="ml-2 text-sm font-bold text-[#FF6B35]">{t('step2ChooseStay', 'Choose Your Stay')}</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-[#0F766E]/30 mx-2 sm:mx-3"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#0F766E]/30 text-[#FAF9F6]/50 flex items-center justify-center font-bold text-sm">3</div>
              <span className="ml-2 text-sm font-bold text-[#FAF9F6]/50 hidden sm:inline">{t('step3DayByDay', 'Day-by-Day Journey')}</span>
            </div>
          </div>

          {/* Section Header */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">Step 2 • {t('step2ChooseStay', 'Curated Accommodation')}</span>
            <h2 className="text-2xl font-bold text-[#0B192C] font-heading">{t('recommendedHotelsTitle', 'Recommended Hotels for Your Trip to')} {trip.city.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('recommendedHotelsSubtitle', 'AI-verified stays matched to your trip duration and budget')}</p>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#2DD4BF]/20 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#0F766E]">
              <Filter className="w-4 h-4" />
              <span>{t('filterCompareHotels', 'Filter & Compare Hotels')}</span>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchHotelsPlaceholder', 'Search hotels by name or description...')}
                value={hotelSearchQuery}
                onChange={(e) => setHotelSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{t('filterPriceLabel', 'Price:')}</span>
                {([
                  { key: 'ALL' as const, label: t('filterAll', 'All') },
                  { key: 'BUDGET' as const, label: t('filterBudget', '< ₹2,500') },
                  { key: 'MID_RANGE' as const, label: t('filterMidRange', '₹2,500–₹5,500') },
                  { key: 'LUXURY' as const, label: t('filterLuxury', '> ₹5,500') },
                ]).map((tier) => (
                  <button key={tier.key} onClick={() => setHotelFilterTier(tier.key)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${hotelFilterTier === tier.key ? 'bg-[#0F766E] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0F766E]'}`}>
                    {tier.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{t('filterRatingLabel', 'Rating:')}</span>
                {[{ val: 0, label: t('filterAnyRating', 'Any') }, { val: 4.0, label: '4.0+' }, { val: 4.5, label: '4.5+' }].map((r) => (
                  <button key={r.val} onClick={() => setHotelMinRating(r.val)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${hotelMinRating === r.val ? 'bg-[#FF6B35] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#FF6B35]'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{t('filterAmenityLabel', 'Amenity:')}</span>
                {['ALL', 'WiFi', 'AC', 'Breakfast', 'Pool', 'Parking'].map((am) => (
                  <button key={am} onClick={() => setHotelAmenityFilter(am)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${hotelAmenityFilter === am ? 'bg-[#2DD4BF] text-[#0B192C]' : 'bg-white border border-slate-200 text-slate-600 hover:border-[#2DD4BF]'}`}>
                    {am === 'ALL' ? t('filterAll', 'All') : am}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hotel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHotels.map((hotel: any, idx: number) => {
              const isSelected = selectedHotel?.id === hotel.id || selectedHotel?.name === hotel.name;
              const photo = Array.isArray(hotel.photos) && hotel.photos.length > 0 ? hotel.photos[0] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';
              const facilities = (hotel.facilities || []).slice(0, 5);
              const nights = trip.nightsCount !== undefined ? trip.nightsCount : Math.max(0, trip.daysCount <= 1 ? 0 : trip.daysCount - 1);
              const rooms = Math.ceil(trip.travellersCount / 2);
              const totalStay = nights > 0 ? (hotel.price_per_night || 2200) * nights * rooms : 0;
              const budgetTag = hotel.price_per_night < 2500 ? 'Budget' : hotel.price_per_night <= 5500 ? 'Mid-Range' : 'Luxury';

              return (
                <div key={hotel.id || idx} className={`bg-white rounded-3xl border-2 overflow-hidden flex flex-col transition shadow-sm hover:shadow-lg ${isSelected ? 'border-[#FF6B35] ring-2 ring-[#FF6B35]/20' : 'border-slate-200 hover:border-[#2DD4BF]'}`}>
                  <div className="relative h-52 w-full">
                    <SafeImage src={photo} alt={hotel.name} className="w-full h-full object-cover" category="hotel" />
                    <div className="absolute top-3 left-3 bg-[#0F766E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-[#2DD4BF]" />
                      <span>{hotel.ai_badge || 'AI Recommended'}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{hotel.rating || 4.5}</span>
                    </div>
                    <div className={`absolute bottom-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${budgetTag === 'Budget' ? 'bg-[#2DD4BF] text-[#0B192C]' : budgetTag === 'Mid-Range' ? 'bg-[#0F766E] text-white' : 'bg-[#FF6B35] text-white'}`}>
                      {budgetTag}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-[#0B192C]/85 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      ₹{(hotel.price_per_night || 2200).toLocaleString('en-IN')} / {t('perNightLabel', 'night')}
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-1">
                    <div>
                      <h3 className="font-bold text-base text-[#0B192C] font-heading">{hotel.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#0F766E]" />
                        <span>{hotel.distance_from_center || trip.city.name}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[#0F766E] font-medium">{hotel.room_type || 'Deluxe Room'}</span>
                      </p>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{hotel.description || 'Verified boutique property with modern comforts and authentic hospitality.'}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {facilities.map((fac: string, fIdx: number) => (
                        <span key={fIdx} className="text-[10px] bg-[#0F766E]/10 text-[#0F766E] px-2 py-0.5 rounded-md font-medium">{fac}</span>
                      ))}
                    </div>
                    <div className="p-3 bg-[#FAF9F6] rounded-xl border border-[#2DD4BF]/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('totalStayLabel', 'Total Stay')} ({nights} {nights === 1 ? t('dayUnit', 'night') : t('daysUnit', 'nights')})</span>
                        <span className="text-lg font-bold text-[#0B192C] font-heading">₹{totalStay.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block">{t('perNightLabel', 'Per Night')}</span>
                        <span className="text-sm font-bold text-[#0F766E]">₹{(hotel.price_per_night || 2200).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#0F766E]/5 rounded-xl border border-[#2DD4BF]/30 text-[11px] text-[#0F766E] flex items-start space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0 mt-0.5" />
                      <span>{hotel.why_recommend || 'AI-verified for optimal location, value, and comfort for your trip profile.'}</span>
                    </div>
                  </div>

                  <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                    <Link to={hotel.id ? `/hotels/${hotel.id}` : '/hotels'} className="py-2.5 bg-[#0F766E]/10 text-[#0F766E] hover:bg-[#0F766E] hover:text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition border border-[#0F766E]/20">
                      <span>{t('viewDetailsBtn', 'View Details')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <button onClick={() => handleSelectHotel(hotel)} className={`py-2.5 font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition ${isSelected ? 'bg-[#FF6B35] text-white' : 'bg-[#0B192C] hover:bg-[#FF6B35] text-white'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>{isSelected ? t('selectedStayBadge', 'Selected ✓') : t('selectHotelBtn', 'Select Hotel')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredHotels.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <Building className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500">No hotels match your current filters. Try adjusting your search criteria.</p>
              <button onClick={() => { setHotelFilterTier('ALL'); setHotelMinRating(0); setHotelSearchQuery(''); setHotelAmenityFilter('ALL'); }} className="px-4 py-2 bg-[#0F766E] text-white text-xs font-bold rounded-xl">{t('filterAll', 'Reset Filters')}</button>
            </div>
          )}

          {/* Sticky Action Bar */}
          {selectedHotel && (
            <div className="sticky bottom-4 z-30 bg-[#0B192C] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl border border-[#2DD4BF]/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6B35] text-white flex items-center justify-center"><Bed className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedHotel.name}</p>
                  {(() => {
                    const n = trip.nightsCount !== undefined ? trip.nightsCount : Math.max(0, trip.daysCount <= 1 ? 0 : trip.daysCount - 1);
                    const rm = Math.ceil(trip.travellersCount / 2);
                    const cost = n > 0 ? (selectedHotel.price_per_night || 2200) * n * rm : 0;
                    return (
                      <p className="text-xs text-[#2DD4BF]">₹{cost.toLocaleString('en-IN')} total for {n} {n === 1 ? 'night' : 'nights'} ({rm} {rm === 1 ? 'room' : 'rooms'})</p>
                    );
                  })()}
                </div>
              </div>
              <button onClick={handleProceedToItinerary} className="px-8 py-3.5 bg-[#FF6B35] hover:bg-[#e85d2f] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF6B35]/30 transition flex items-center space-x-2">
                <span>{t('generateDayByDayBtn', 'Generate My Day-by-Day Trip')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══ FULL ITINERARY WORKFLOW ═══ */}
      {workflowStage === 'full_itinerary' && (<>

      {/* Selected Hotel Base Banner */}
      {activeStayHotel && (
        <div className="bg-[#0B192C] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#2DD4BF]/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center"><Bed className="w-5 h-5" /></div>
            <div>
              <p className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-wider">{t('yourStayBaseLabel', 'Your Stay Base')}</p>
              <p className="text-sm font-bold text-white">{activeStayHotel.name}</p>
              {(() => {
                const n = trip.nightsCount !== undefined ? trip.nightsCount : Math.max(0, trip.daysCount <= 1 ? 0 : trip.daysCount - 1);
                const rm = Math.ceil(trip.travellersCount / 2);
                const cost = n > 0 ? (activeStayHotel.price_per_night || 2200) * n * rm : 0;
                return (
                  <p className="text-xs text-slate-400">₹{cost.toLocaleString('en-IN')} for {n} {n === 1 ? t('dayUnit', 'night') : t('daysUnit', 'nights')} • {activeStayHotel.room_type || 'Deluxe Room'}</p>
                );
              })()}
            </div>
          </div>
          <button onClick={() => setWorkflowStage('hotel_selection')} className="px-5 py-2.5 bg-[#0F766E] hover:bg-[#FF6B35] text-white font-bold text-xs rounded-xl transition flex items-center space-x-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('changeHotelBtn', 'Change Hotel')}</span>
          </button>
        </div>
      )}

      {/* SMART BUDGET PLANNER (SIH Section 4) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E]">{t('smartBudgetEngineTitle', 'Smart Budget Engine')}</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <h2 className="text-2xl font-bold text-[#0B192C] font-heading">{t('tripBudgetPlannerTitle', 'Trip Budget Planner')}</h2>
              {budget.status === 'WITHIN_BUDGET' && (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Within Budget ✓</span>
              )}
              {budget.status === 'BUDGET_FULLY_USED' && (
                <span className="bg-teal-100 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Budget Fully Used ✓</span>
              )}
              {budget.status === 'BUDGET_INSUFFICIENT' && (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">Budget Insufficient ⚠️</span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('budgetPlannerSubtitle', 'Automated cost distribution, buffer allowance & savings optimizations')}</p>
          </div>

          {(budget.isExceeded || trip.isBudgetSufficient === false) && (
            <button
              onClick={handleOptimizeBudget}
              disabled={isOptimizing}
              className="px-5 py-2.5 bg-[#FF6B35] hover:bg-[#E85D26] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>{isOptimizing ? t('optimizingBtn', 'Optimizing...') : t('autoOptimizeBtn', 'Auto-Optimize Trip to Fit Budget')}</span>
            </button>
          )}
        </div>

        {/* Insufficient Budget Alert Banner */}
        {trip.isBudgetSufficient === false || budget.status === 'BUDGET_INSUFFICIENT' ? (
          <div className="p-5 bg-amber-50 border-2 border-amber-300 rounded-3xl space-y-4 text-amber-950 animate-in fade-in">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-base text-amber-900">
                  Insufficient Budget Detected for This Itinerary
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Your selected budget of <strong>₹{budget.budgetTarget.toLocaleString('en-IN')}</strong> is lower than the minimum feasible budget of <strong>₹{(trip.minRequiredBudget || budget.estimatedTotalCost).toLocaleString('en-IN')}</strong> needed for {trip.daysCount} days and {trip.travellersCount} travellers (Shortfall: <strong>₹{(trip.shortfallAmount || (budget.estimatedTotalCost - budget.budgetTarget)).toLocaleString('en-IN')}</strong>).
                </p>
                <p className="text-[11px] text-amber-700 font-medium">
                  To ensure realistic quality without unexpected out-of-pocket expenses, please select an option below:
                </p>
              </div>
            </div>

            {/* Actionable Option Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <button
                onClick={() => {
                  navigate(`/plan-trip?city=${trip.city.id}&days=${trip.suggestedActions?.reduceDaysTo || 1}&budget=${budget.budgetTarget}`);
                }}
                className="p-3 bg-white border border-amber-300 hover:border-[#0F766E] rounded-2xl text-left transition shadow-2xs group"
              >
                <span className="text-xs font-bold text-slate-800 block group-hover:text-[#0F766E]">
                  Reduce to {trip.suggestedActions?.reduceDaysTo || 1} {trip.suggestedActions?.reduceDaysTo === 1 ? 'Day' : 'Days'} →
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Fit within your ₹{budget.budgetTarget.toLocaleString('en-IN')} budget
                </span>
              </button>

              <button
                onClick={async () => {
                  setIsOptimizing(true);
                  try {
                    const newBudget = trip.minRequiredBudget || budget.estimatedTotalCost;
                    const res = await api.generateTrip({
                      cityId: trip.city.id,
                      budgetTarget: newBudget,
                      daysCount: trip.daysCount,
                      travellersCount: trip.travellersCount,
                      adultsCount: trip.adultsCount || trip.travellersCount,
                      childrenCount: trip.childrenCount || 0,
                      transportMode: trip.transportMode,
                      interests: trip.interests,
                      travellerType: trip.travellerType as any,
                      foodPreference: trip.foodPreference,
                    });
                    if (res.success && res.trip) {
                      setTrip(res.trip);
                      sessionStorage.setItem('lastGeneratedTrip', JSON.stringify(res.trip));
                    }
                  } catch (e: any) {
                    alert(e.message || 'Optimization failed');
                  } finally {
                    setIsOptimizing(false);
                  }
                }}
                className="p-3 bg-[#0F766E] hover:bg-[#0D5E57] text-white rounded-2xl text-left transition shadow-2xs"
              >
                <span className="text-xs font-bold block">
                  Increase Budget to ₹{(trip.minRequiredBudget || budget.estimatedTotalCost).toLocaleString('en-IN')} →
                </span>
                <span className="text-[10px] text-emerald-200 block mt-0.5">
                  Keep {trip.daysCount} days with verified stays & dining
                </span>
              </button>

              <button
                onClick={handleOptimizeBudget}
                disabled={isOptimizing}
                className="p-3 bg-[#FF6B35] hover:bg-[#E85D26] text-white rounded-2xl text-left transition shadow-2xs"
              >
                <span className="text-xs font-bold block">
                  {isOptimizing ? 'Optimizing...' : 'Auto-Optimize to Fit Budget →'}
                </span>
                <span className="text-[10px] text-amber-100 block mt-0.5">
                  Max savings via budget stays and transit
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-emerald-900 text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-emerald-800">
                {budget.status === 'BUDGET_FULLY_USED' ? 'Budget Fully Utilized ✓' : 'Within Budget ✓'}
              </span>
              <span className="text-emerald-700">
                Estimated Total: <strong>₹{budget.estimatedTotalCost.toLocaleString('en-IN')}</strong> of ₹{budget.budgetTarget.toLocaleString('en-IN')} target ({budget.budgetPercentageUsed}% used • ₹{(budget.remainingBudget ?? 0).toLocaleString('en-IN')} remaining buffer).
              </span>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-600">
              {t('estimatedTotalLabel', 'Estimated Total:')} <span className="text-[#0B192C]">₹{budget.estimatedTotalCost.toLocaleString('en-IN')}</span>
            </span>
            <span className="text-slate-600">
              {t('remainingBufferLabel', 'Remaining:')} <span className="text-[#0F766E]">₹{(budget.remainingBudget ?? Math.max(0, budget.budgetTarget - budget.estimatedTotalCost)).toLocaleString('en-IN')}</span>
            </span>
            <span className="text-slate-600">
              {t('targetBudgetLabel', 'Target Budget:')} <span className="text-[#0F766E]">₹{budget.budgetTarget.toLocaleString('en-IN')}</span>
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budget.isExceeded ? 'bg-rose-500' : 'bg-[#0F766E]'
              }`}
              style={{ width: `${Math.min(100, budgetRatio)}%` }}
            />
          </div>
        </div>

        {/* Exact Mathematical Formula Banner (Hotel + Food + Transport + Activities + Other = Total) */}
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
          <span className="font-bold text-emerald-900 block mb-1">
            Budget Calculation Formula (Hotel + Food + Transport + Activities + Other = Total Estimated Cost):
          </span>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-emerald-800">
            <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">Hotel: ₹{(budget.hotelCost || 0).toLocaleString('en-IN')}</span>
            <span>+</span>
            <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">Food: ₹{(budget.foodCost || 0).toLocaleString('en-IN')}</span>
            <span>+</span>
            <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">Transport: ₹{((budget.transportCost || 0) + (budget.taxiCost || 0)).toLocaleString('en-IN')}</span>
            <span>+</span>
            <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">Activities: ₹{((budget.entryFeesCost || 0) + (budget.activitiesCost || 0)).toLocaleString('en-IN')}</span>
            <span>+</span>
            <span className="bg-white px-2 py-0.5 rounded border border-emerald-200">Other: ₹{(budget.miscCost || 0).toLocaleString('en-IN')}</span>
            <span>=</span>
            <span className="font-bold bg-[#0F766E] text-white px-2.5 py-0.5 rounded shadow-xs">
              Total: ₹{budget.estimatedTotalCost.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 7 Category Breakdown Tiles (SIH Section 4) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('catAccommodation', 'Accommodation')}</span>
            <span className="text-base font-bold text-[#0B192C] font-heading">₹{budget.hotelCost?.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('catFood', 'Food')}</span>
            <span className="text-base font-bold text-[#0B192C] font-heading">₹{budget.foodCost?.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('catTransportation', 'Transportation')}</span>
            <span className="text-base font-bold text-[#0B192C] font-heading">₹{(budget.transportCost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('catActivities', 'Activities')}</span>
            <span className="text-base font-bold text-[#0B192C] font-heading">₹{(budget.activitiesCost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('catEntryFees', 'Entry Fees')}</span>
            <span className="text-base font-bold text-[#0B192C] font-heading">₹{budget.entryFeesCost?.toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('catTaxi', 'Taxi')}</span>
            <span className="text-base font-bold text-[#0B192C] font-heading">₹{(budget.taxiCost || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('catMisc', 'Miscellaneous')}</span>
            <span className="text-base font-bold text-[#0B192C] font-heading">₹{budget.miscCost?.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* 5 Interactive Optimization Options (SIH Section 4) */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800">{t('budgetOptimizationsTitle', 'Budget Optimization Options:')}</span>
            <span className="text-[11px] text-slate-500">{t('budgetOptimizationsSub', 'Click any option to apply instant savings')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[
              { key: 'hotel', label: t('optCheaperHotel', 'Cheaper hotel'), savings: Math.round(budget.hotelCost * 0.35), icon: '🏨', desc: 'Swap with verified heritage homestays' },
              { key: 'food', label: t('optLocalRestaurant', 'Local restaurant'), savings: Math.round(budget.foodCost * 0.25), icon: '🍲', desc: 'Iconic local thalis & authentic street eats' },
              { key: 'transport', label: t('optPublicTransport', 'Public transport'), savings: Math.round(((budget.transportCost || 0) + (budget.taxiCost || 0)) * 0.5), icon: '🚇', desc: 'Metro & state AC buses' },
              { key: 'activity', label: t('optRemoveActivity', 'Free Attractions'), savings: Math.round(((budget.activitiesCost || 0) + (budget.entryFeesCost || 0)) * 0.5), icon: '🎟️', desc: 'Explore free heritage courtyards' },
              { key: 'taxi', label: t('optReduceTaxi', 'Reduce taxi usage'), savings: Math.round((budget.taxiCost || 0) * 0.4), icon: '🚕', desc: 'Combine walking with e-rickshaws' },
            ].map((opt) => {
              const isApplied = appliedOptimizations.includes(opt.key);
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleApplyOptimization(opt.key, opt.savings)}
                  disabled={isApplied}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isApplied
                      ? 'bg-teal-50 border-teal-300 text-teal-800 opacity-90'
                      : 'bg-white border-slate-200 hover:border-[#0F766E] hover:bg-teal-50/30 text-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base">{opt.icon}</span>
                      {isApplied && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />}
                    </div>
                    <h5 className="text-xs font-bold font-heading">{opt.label}</h5>
                    <p className="text-[10px] text-slate-500 leading-tight">{opt.desc}</p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-[#0F766E]">-{isApplied ? t('optAppliedBadge', 'Applied') : `Save ₹${opt.savings}`}</span>
                    <span className="text-[#0F766E] text-[10px]">{isApplied ? '✓' : t('optApplyBtn', 'Apply →')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Savings Suggestions */}
        {budget.savingsTips?.length > 0 && (
          <div className="pt-2 text-xs text-slate-600 space-y-1 border-t border-slate-100">
            <span className="font-bold text-slate-700">{t('additionalRecommendationsTitle', 'Additional Recommendations:')}</span>
            {budget.savingsTips.map((tip, idx) => (
              <p key={idx} className="flex items-center space-x-1.5 text-slate-500">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]"></span>
                <span>{tip}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {/* SMART ROUTE SUMMARY & SELF-VEHICLE LOGISTICS */}
      <div className="bg-[#0B192C] text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6 border border-[#2DD4BF]/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F766E]/30 text-[#2DD4BF] flex items-center justify-center border border-[#2DD4BF]/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF]">{t('smartTransportTitle', 'Smart Transport Engine')}</span>
              <h3 className="text-xl font-bold font-heading text-white">{t('routeLogisticsTitle', 'Route Logistics & Travel Plan')}</h3>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-[#0F766E]/20 text-[#2DD4BF] border border-[#0F766E]/40 px-3 py-1 rounded-full font-bold">
              {t('transportModeLabel', 'Mode:')} {trip.transportMode}
            </span>
            <span className="text-xs bg-white/10 text-slate-300 px-3 py-1 rounded-full">
              Paced for 0 Backtracking
            </span>
          </div>
        </div>

        {/* Suggested Route Corridor */}
        {trip.routeSummary?.suggestedRoute && (
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-[#2DD4BF] font-bold">
              <Navigation className="w-4 h-4" />
              <span>{t('corridorLabel', 'Recommended Highway & Sightseeing Corridor:')}</span>
            </div>
            <p className="text-sm text-slate-100 font-medium pl-6">{trip.routeSummary.suggestedRoute}</p>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">{t('totalCircuitDistanceLabel', 'Total Circuit Distance')}</span>
            <p className="text-xl font-bold font-heading text-white">{trip.routeSummary?.totalDistanceKm || 35} km</p>
            <span className="text-[10px] text-[#2DD4BF]">Optimized cluster sequence</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">{t('estTransitTimeLabel', 'Est. Transit Time')}</span>
            <p className="text-xl font-bold font-heading text-white">
              {Math.floor((trip.routeSummary?.totalTravelTimeMins || 90) / 60)}h {(trip.routeSummary?.totalTravelTimeMins || 90) % 60}m
            </p>
            <span className="text-[10px] text-slate-400">{trip.routeSummary?.totalTravelTimeMins || 90} mins total road travel</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">{t('estimatedFuelLabel', 'Estimated Fuel')}</span>
            <p className="text-xl font-bold font-heading text-[#FF6B35]">
              ₹{trip.routeSummary?.fuelEstimate || 1200}
            </p>
            <span className="text-[10px] text-slate-400">Based on standard fuel economy</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-1">
            <span className="text-slate-400">{t('tollsFastagLabel', 'Tolls & FASTag')}</span>
            <p className="text-xl font-bold font-heading text-[#2DD4BF]">
              ₹{trip.routeSummary?.tollEstimate || 350}
            </p>
            <span className="text-[10px] text-slate-400">NHAI digital FASTag booths</span>
          </div>
        </div>

        {/* Waypoints & Transit Advice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {trip.routeSummary?.majorStops && trip.routeSummary.majorStops.length > 0 && (
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
              <span className="text-slate-300 font-bold block">{t('highwayWaypointsLabel', 'Key Highway Waypoints & Checkpoints:')}</span>
              <div className="space-y-1.5">
                {trip.routeSummary.majorStops.map((stop, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-[#0F766E]/40 text-[#2DD4BF] font-bold flex items-center justify-center text-[10px] border border-[#2DD4BF]/30">
                      {idx + 1}
                    </span>
                    <span>{stop}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
            <span className="text-slate-300 font-bold block">{t('transitAdvisoryLabel', 'Road & Transit Advisory:')}</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              {(trip.routeSummary as any)?.transitAdvice ||
                'Expressways and key arterial roads have dedicated service lanes, fuel stations, and EV charging corridors every 15-20 km.'}
            </p>
            <p className="text-slate-400 text-[11px] pt-1 border-t border-white/10">
              🅿️ {trip.routeSummary?.parkingTips || 'Monument parking is available; digital FASTag accepted at selected plazas.'}
            </p>
          </div>
        </div>
      </div>

      {/* DEDICATED SUITABLE HOTELS SECTION */}
      {(() => {
        const hotelsList =
          trip.recommendedHotels && trip.recommendedHotels.length > 0
            ? trip.recommendedHotels
            : trip.days
                .flatMap((d) => d.stops)
                .filter((s, idx, arr) => s.stopType === 'HOTEL' && arr.findIndex((x) => x.title === s.title) === idx)
                .map((s) => ({
                  id: s.entityId,
                  name: s.title,
                  city_name: trip.city.name,
                  rating: 4.6,
                  price_per_night: s.estimatedCost || 2800,
                  room_type: 'Deluxe Heritage Room / AC Suite',
                  photos: [s.imageUrl],
                  facilities: ['Free High-Speed WiFi', 'Air Conditioning', 'Free Breakfast', 'Valet Parking', 'Room Service'],
                  phone: '+91 98110 22334',
                  description: s.description,
                }));

        if (hotelsList.length === 0) return null;

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">Curated Accommodation</span>
                <h2 className="text-2xl font-bold text-slate-900 font-heading">Suitable &amp; Verified Hotels</h2>
                <p className="text-xs text-slate-500">Handpicked comfortable stays tailored to your budget and traveller profile</p>
              </div>
              <Link
                to={`/hotels?city=${trip.city.id}`}
                className="text-xs font-bold text-[#0F766E] hover:text-[#0B192C] flex items-center space-x-1"
              >
                <span>View all hotels in {trip.city.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hotelsList.slice(0, 3).map((hotel: any, idx: number) => {
                const photo =
                  Array.isArray(hotel.photos) && hotel.photos.length > 0
                    ? hotel.photos[0]
                    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';

                const facilities = Array.isArray(hotel.facilities) && hotel.facilities.length > 0
                  ? hotel.facilities.slice(0, 4)
                  : ['Free WiFi', 'AC', 'Breakfast', 'Parking'];

                return (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="relative h-48 w-full">
                        <SafeImage src={photo} alt={hotel.name} className="w-full h-full object-cover" category="hotel" />
                        <div className="absolute top-3 left-3 bg-[#0F766E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                          <HotelIcon className="w-3 h-3" />
                          <span>Recommended Stay</span>
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{hotel.rating || 4.5}</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-[#0B192C]/85 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          ₹{hotel.price_per_night || 2800} / night
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 font-heading">{hotel.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#0F766E]" />
                            <span>{hotel.city_name || trip.city.name}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[#0F766E] font-medium">{hotel.room_type || 'Deluxe Room'}</span>
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {hotel.description || 'Verified boutique property with modern comforts, authentic hospitality, and convenient landmark access.'}
                        </p>

                        {/* Facilities tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {facilities.map((fac: string, fIdx: number) => (
                            <span key={fIdx} className="text-[10px] bg-[#0F766E]/10 text-[#0F766E] px-2 py-0.5 rounded-md font-medium">
                              {fac}
                            </span>
                          ))}
                        </div>

                        {hotel.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center space-x-1 pt-1">
                            <Phone className="w-3 h-3 text-[#0F766E]" />
                            <span>Front Desk: {hotel.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <Link
                        to={hotel.id ? `/hotels/${hotel.id}` : '/hotels'}
                        className="py-2.5 bg-[#0F766E]/10 text-[#0F766E] hover:bg-[#0F766E] hover:text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition border border-[#0F766E]/20"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <a
                        href={hotel.phone ? `tel:${hotel.phone}` : '/hotels'}
                        className="py-2.5 bg-[#0B192C] hover:bg-[#FF6B35] text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition"
                      >
                        <span>Book / Visit</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* DEDICATED SUITABLE RESTAURANTS SECTION */}
      {(() => {
        const diningList =
          trip.recommendedRestaurants && trip.recommendedRestaurants.length > 0
            ? trip.recommendedRestaurants
            : trip.days
                .flatMap((d) => d.stops)
                .filter((s, idx, arr) => (s.stopType === 'BREAKFAST' || s.stopType === 'LUNCH' || s.stopType === 'DINNER') && arr.findIndex((x) => x.title === s.title) === idx)
                .map((s) => ({
                  id: s.entityId,
                  name: s.title,
                  city_name: trip.city.name,
                  cuisine: s.category || 'Traditional Regional & Thali',
                  rating: 4.7,
                  avg_cost_for_two: s.estimatedCost || 600,
                  opening_hours: '11:00 AM - 11:00 PM',
                  photos: [s.imageUrl],
                  popular_dishes: ['Regional Thali', 'Special Gravy Dishes', 'Sweet Delicacy', 'Masala Chai'],
                  description: s.description,
                  phone: '+91 98110 22334',
                }));

        if (diningList.length === 0) return null;

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Culinary Highlights</span>
                <h2 className="text-2xl font-bold text-slate-900 font-heading">Suitable &amp; Verified Restaurants</h2>
                <p className="text-xs text-slate-500">Taste authentic regional cuisines and must-try delicacies recommended for your trip</p>
              </div>
              <Link
                to={`/restaurants?city=${trip.city.id}`}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center space-x-1"
              >
                <span>Explore all dining in {trip.city.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {diningList.slice(0, 3).map((dining: any, idx: number) => {
                const photo =
                  Array.isArray(dining.photos) && dining.photos.length > 0
                    ? dining.photos[0]
                    : 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80';

                const dishes = Array.isArray(dining.popular_dishes) && dining.popular_dishes.length > 0
                  ? dining.popular_dishes.slice(0, 3).join(', ')
                  : 'Traditional Thali, Seasonal Sweets';

                return (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="relative h-48 w-full">
                        <SafeImage src={photo} alt={dining.name} className="w-full h-full object-cover" category="restaurant" />
                        <div className="absolute top-3 left-3 bg-amber-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                          <Utensils className="w-3 h-3" />
                          <span>{dining.cuisine || 'Regional Special'}</span>
                        </div>
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-sm flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{dining.rating || 4.6}</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          ₹{dining.avg_cost_for_two || 600} for two
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 font-heading">{dining.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{dining.opening_hours || '11:00 AM - 11:00 PM'}</span>
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {dining.description || 'Acclaimed dining establishment serving fresh regional specialties, authentic spices, and hygienic food.'}
                        </p>

                        <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-100 text-[11px] text-amber-900">
                          <span className="font-bold">Must Try: </span>
                          <span>{dishes}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                      <Link
                        to={dining.id ? `/restaurants/${dining.id}` : '/restaurants'}
                        className="py-2.5 bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition border border-amber-200"
                      >
                        <span>View Menu</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        to={dining.id ? `/restaurants/${dining.id}` : '/restaurants'}
                        className="py-2.5 bg-slate-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1 transition"
                      >
                        <span>Visit Spot</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* DEDICATED HIDDEN GEMS SHOWCASE */}
      {(() => {
        const gemsList =
          trip.recommendedHiddenGems && trip.recommendedHiddenGems.length > 0
            ? trip.recommendedHiddenGems
            : trip.days
                .flatMap((d) => d.stops)
                .filter((s, idx, arr) => s.stopType === 'HIDDEN_GEM' && arr.findIndex((x) => x.title === s.title) === idx)
                .map((s) => ({
                  id: s.entityId,
                  name: s.title,
                  city_name: trip.city.name,
                  description: s.description,
                  photos: [s.imageUrl],
                  best_time_to_visit: s.bestVisitingTime || 'Early Morning / Golden Sunset',
                  distance_km: s.distanceKm || 12,
                  estimated_cost: s.entryFee || 0,
                  how_to_reach: s.transportNotes || 'Accessible via self-drive bypass or local taxi',
                }));

        if (gemsList.length === 0) return null;

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Offbeat Wonders</span>
                <h2 className="text-2xl font-bold text-slate-900 font-heading">Recommended Hidden Gems</h2>
                <p className="text-xs text-slate-500">Secret viewpoints, ancient stepwells, and peaceful cultural spots away from crowds</p>
              </div>
              <Link
                to="/hidden-gems"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center space-x-1"
              >
                <span>Browse all Hidden Gems</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gemsList.slice(0, 3).map((gem: any, idx: number) => {
                const photo =
                  Array.isArray(gem.photos) && gem.photos.length > 0
                    ? gem.photos[0]
                    : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80';

                return (
                  <div key={idx} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="relative h-48 w-full">
                        <SafeImage src={photo} alt={gem.name} className="w-full h-full object-cover" category="gem" />
                        <div className="absolute top-3 left-3 bg-teal-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-[#F9C74F]" />
                          <span>Hidden Gem</span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                          {gem.estimated_cost ? `₹${gem.estimated_cost}` : 'Free Entry'}
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 font-heading">{gem.name}</h3>
                          <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>Best Time: {gem.best_time_to_visit || 'Morning / Evening'}</span>
                          </p>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {gem.description}
                        </p>

                        <div className="pt-2 border-t border-slate-100 text-[11px] text-teal-800 font-medium flex items-start space-x-1">
                          <span>🧭</span>
                          <span>{gem.how_to_reach || `Approx. ${gem.distance_km || 12} km from central hub.`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <Link
                        to="/hidden-gems"
                        className="w-full py-2.5 bg-teal-50 text-teal-800 hover:bg-teal-700 hover:text-white font-bold text-xs rounded-xl text-center flex items-center justify-center space-x-1.5 transition border border-teal-200"
                      >
                        <span>Explore Hidden Gem Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* DAY-BY-DAY ITINERARY STOPS GROUPED BY TIME SLOTS */}
      <div className="space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">{t('masterScheduleTitle', 'Master Day Schedule')}</span>
          <h2 className="text-3xl font-bold text-[#0B192C] mt-1 font-heading">{t('dayByDayScheduleTitle', 'Day-by-Day Journey Schedule')}</h2>
          <p className="text-xs text-slate-500">{t('dayScheduleSubtitle', 'Chronological slots paced for leisurely sightseeing, scenic breaks, and zero backtracking')}</p>
        </div>

        {trip.days.map((day) => {
          // Group stops into Morning, Afternoon, Evening, Night
          const timeSlotDefinitions = [
            {
              key: 'Morning',
              label: 'Morning Exploration & Heritage',
              timeRange: '08:00 AM – 12:30 PM',
              icon: <Sunrise className="w-4 h-4 text-amber-600" />,
              headerBg: 'bg-amber-50/80 border-amber-200 text-amber-900',
              matcher: (stop: GeneratedStop) =>
                stop.timeSlot === 'Morning' ||
                stop.stopType === 'BREAKFAST' ||
                stop.stopOrder <= 2,
            },
            {
              key: 'Afternoon',
              label: 'Afternoon Culture & Regional Feast',
              timeRange: '12:30 PM – 05:00 PM',
              icon: <Sun className="w-4 h-4 text-orange-600" />,
              headerBg: 'bg-orange-50/80 border-orange-200 text-orange-900',
              matcher: (stop: GeneratedStop) =>
                stop.timeSlot === 'Afternoon' ||
                stop.stopType === 'LUNCH' ||
                (stop.stopOrder > 2 && stop.stopOrder <= 4),
            },
            {
              key: 'Evening',
              label: 'Evening Sunset & Bazaars',
              timeRange: '05:00 PM – 08:30 PM',
              icon: <Sunset className="w-4 h-4 text-rose-600" />,
              headerBg: 'bg-rose-50/80 border-rose-200 text-rose-900',
              matcher: (stop: GeneratedStop) =>
                stop.timeSlot === 'Evening' ||
                stop.stopType === 'HIDDEN_GEM' ||
                stop.stopOrder === 5,
            },
            {
              key: 'Night',
              label: 'Night Dining & Comfortable Rest',
              timeRange: '08:30 PM Onwards',
              icon: <Moon className="w-4 h-4 text-indigo-600" />,
              headerBg: 'bg-indigo-50/80 border-indigo-200 text-indigo-900',
              matcher: (stop: GeneratedStop) =>
                stop.timeSlot === 'Night' ||
                stop.stopType === 'DINNER' ||
                stop.stopType === 'HOTEL' ||
                stop.stopOrder > 5,
            },
          ];

          // Partition stops into slots without duplicates
          const assignedStopIndices = new Set<number>();
          const slottedGroups = timeSlotDefinitions.map((def) => {
            const stopsInSlot = day.stops.filter((stop, idx) => {
              if (assignedStopIndices.has(idx)) return false;
              const matches = def.matcher(stop);
              if (matches) {
                assignedStopIndices.add(idx);
                return true;
              }
              return false;
            });
            return { ...def, stops: stopsInSlot };
          });

          // Any remaining unassigned stops go to the last slot with items
          day.stops.forEach((stop, idx) => {
            if (!assignedStopIndices.has(idx)) {
              slottedGroups[slottedGroups.length - 1].stops.push(stop);
            }
          });

          return (
            <div key={day.dayNumber} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-6 pb-6">
              {/* Day Header */}
              <div className="bg-[#FAF9F6] px-6 py-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#0F766E] bg-[#0F766E]/10 border border-[#0F766E]/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {formatDayTitle(day.dayNumber)}
                    </span>
                    <h3 className="text-xl font-bold text-[#0B192C] font-heading">{day.dayTitle}</h3>
                  </div>
                  {day.notes && <p className="text-xs text-slate-500 mt-1">{day.notes}</p>}
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-2xs text-[#0B192C] font-semibold">
                    {day.stops.length} {t('plannedStopsLabel', 'Planned Stops')}
                  </span>
                </div>
              </div>

              {/* Time Slots Content */}
              <div className="px-6 sm:px-8 space-y-6">
                {slottedGroups.map((group) => {
                  if (group.stops.length === 0) return null;

                  return (
                    <div key={group.key} className="space-y-4">
                      {/* Time Slot Header Banner */}
                      <div className={`px-4 py-2.5 rounded-2xl border flex items-center justify-between ${group.headerBg}`}>
                        <div className="flex items-center space-x-2">
                          {group.icon}
                          <span className="text-xs font-bold font-heading">{formatSlotTitle(group.key, group.label)}</span>
                        </div>
                        <span className="text-[11px] font-semibold opacity-80">{group.timeRange}</span>
                      </div>

                      {/* Stops in this Time Slot */}
                      <div className="space-y-4 pl-1 sm:pl-2">
                        {group.stops.map((stop, sIdx) => {
                          const isFood = stop.stopType === 'BREAKFAST' || stop.stopType === 'LUNCH' || stop.stopType === 'DINNER';
                          const isGem = stop.stopType === 'HIDDEN_GEM';
                          const isHotel = stop.stopType === 'HOTEL';

                          return (
                            <div key={sIdx} className="bg-slate-50/80 hover:bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col md:flex-row gap-5 items-start transition shadow-2xs">
                              {/* Thumbnail */}
                              {stop.imageUrl && (
                                <div className="relative w-full md:w-44 h-32 rounded-xl overflow-hidden shrink-0">
                                  <SafeImage
                                    src={stop.imageUrl}
                                    alt={stop.title}
                                    className="w-full h-full object-cover"
                                    category="place"
                                  />
                                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[#0B192C]/80 text-white font-bold text-xs flex items-center justify-center backdrop-blur-xs">
                                    {stop.stopOrder}
                                  </div>
                                </div>
                              )}

                              {/* Details */}
                              <div className="flex-1 space-y-2 w-full">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                                        isFood
                                          ? 'bg-amber-100 text-amber-800'
                                          : isGem
                                          ? 'bg-teal-100 text-teal-800'
                                          : isHotel
                                          ? 'bg-purple-100 text-purple-800'
                                          : 'bg-emerald-100 text-emerald-800'
                                      }`}
                                    >
                                      {formatStopType(stop.stopType)}
                                    </span>
                                    {stop.category && (
                                      <span className="text-xs text-slate-500 font-medium">• {stop.category}</span>
                                    )}
                                  </div>

                                  <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{stop.startTime}</span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-slate-500 font-normal">{stop.durationHours} hrs</span>
                                  </div>
                                </div>

                                <h4 className="text-base font-bold text-[#0B192C] font-heading">{stop.title}</h4>
                                <p className="text-xs text-slate-600 leading-relaxed">{stop.description}</p>

                                {/* Logistics Meta Pills */}
                                <div className="pt-2 flex flex-wrap gap-4 text-[11px] text-slate-600">
                                  {stop.bestVisitingTime && (
                                    <span className="flex items-center space-x-1 text-slate-700 font-medium">
                                      <span>☀️ Best Time:</span>
                                      <span className="font-bold">{stop.bestVisitingTime}</span>
                                    </span>
                                  )}
                                  {stop.entryFee !== undefined && (
                                    <span className="flex items-center space-x-1 font-semibold text-slate-700">
                                      <Ticket className="w-3.5 h-3.5 text-[#0F766E]" />
                                      <span>Entry: {stop.entryFee === 0 ? 'Free Entry' : `₹${stop.entryFee} / person`}</span>
                                    </span>
                                  )}
                                  {stop.distanceKm > 0 && (
                                    <span className="flex items-center space-x-1">
                                      <Car className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{stop.distanceKm} km ({stop.travelTimeMins} mins travel)</span>
                                    </span>
                                  )}
                                </div>

                                {/* Transport Notes */}
                                {stop.transportNotes && (
                                  <div className="text-[11px] text-[#0F766E] font-medium bg-[#0F766E]/5 p-2.5 rounded-xl border border-[#0F766E]/15">
                                    👉 {stop.transportNotes}
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-2 flex flex-wrap items-center gap-2">
                                  {stop.entityId && stop.entityType === 'PLACE' && (
                                    <Link
                                      to={`/places/${stop.entityId}`}
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#0F766E]/10 hover:bg-[#0F766E] text-[#0F766E] hover:text-white text-xs font-bold transition border border-[#0F766E]/20"
                                    >
                                      <span>{t('viewPlaceGalleryBtn', 'View Place Details & Gallery')}</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  )}
                                  {stop.entityId && stop.entityType === 'HOTEL' && (
                                    <Link
                                      to={`/hotels/${stop.entityId}`}
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-700 text-purple-900 hover:text-white text-xs font-bold transition border border-purple-200"
                                    >
                                      <span>{t('viewHotelRoomsBtn', 'View Hotel Rooms & Amenities')}</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  )}
                                  {stop.entityId && stop.entityType === 'RESTAURANT' && (
                                    <Link
                                      to={`/restaurants/${stop.entityId}`}
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-900 hover:text-white text-xs font-bold transition border border-amber-200"
                                    >
                                      <span>{t('viewRestaurantMenuBtn', 'View Restaurant Details & Menu')}</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  )}
                                  {stop.stopType === 'HIDDEN_GEM' && (
                                    <Link
                                      to="/hidden-gems"
                                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-700 text-teal-900 hover:text-white text-xs font-bold transition border border-teal-200"
                                    >
                                      <span>{t('exploreAllGemsBtn', 'Explore All Hidden Gems')}</span>
                                      <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDefaultDrop(stop.title);
                                      setBookingModalOpen(true);
                                    }}
                                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#0B192C] text-slate-700 hover:text-white text-xs font-semibold transition border border-slate-200"
                                  >
                                    <Car className="w-3.5 h-3.5 text-[#FF6B35]" />
                                    <span>{t('bookTaxiStopBtn', 'Book Taxi to Stop')}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Afternoon Slot Lunch Recommendation Card */}
                        {group.key === 'Afternoon' && (() => {
                          const lunch = getRestaurantForSlot(day.dayNumber, 'lunch');
                          return (
                            <div className="bg-[#FAF9F6] border-2 border-[#0F766E]/25 hover:border-[#0F766E]/50 rounded-2xl p-4 sm:p-5 shadow-xs transition space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-[#FF6B35] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs flex items-center space-x-1">
                                    <Utensils className="w-3 h-3" />
                                    <span>{t('aiLunchTitle', 'AI Lunch Recommendation')}</span>
                                  </span>
                                  {lunch.dining.food_type === 'veg' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      🥬 Vegetarian
                                    </span>
                                  )}
                                  {lunch.dining.food_type === 'non_veg' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                      🍗 Non-Vegetarian
                                    </span>
                                  )}
                                  {lunch.dining.food_type === 'both' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                                      🥬🍗 Veg & Non-Veg
                                    </span>
                                  )}
                                  <span className="text-xs font-semibold text-[#0F766E]">{lunch.dining.cuisine}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-xs">
                                  <span className="flex items-center space-x-1 text-slate-800 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span>{lunch.dining.rating || 4.7}</span>
                                  </span>
                                  <span className="text-slate-500 font-medium">₹{lunch.costPerPerson} / {t('dayUnit', 'person')}</span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0">
                                  <SafeImage
                                    src={lunch.photo}
                                    alt={lunch.dining.name}
                                    className="w-full h-full object-cover"
                                    category="food"
                                  />
                                </div>

                                <div className="flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h5 className="text-base font-bold text-[#0B192C] font-heading">{lunch.dining.name}</h5>
                                    <span className="text-xs font-bold text-[#0F766E] bg-[#0F766E]/10 px-2.5 py-0.5 rounded-md">
                                      {t('estGroupCostLabel', 'Est. Group Cost:')} ₹{lunch.groupCost.toLocaleString('en-IN')} ({trip.travellersCount} {trip.travellersCount === 1 ? 'person' : 'people'})
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed">{lunch.dining.description}</p>

                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t('mustTryLabel', 'Must Try:')}</span>
                                    {lunch.dishes.map((dish: string, dIdx: number) => (
                                      <span key={dIdx} className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                                        {dish}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="p-2.5 bg-[#0F766E]/5 rounded-xl border border-[#0F766E]/15 text-[11px] text-[#0F766E] font-medium flex items-start space-x-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B35] shrink-0 mt-0.5" />
                                    <span>{lunch.whyAI}</span>
                                  </div>

                                  <div className="pt-1 flex items-center justify-between">
                                    <Link
                                      to={`/restaurants/${lunch.dining.id}`}
                                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0B192C] text-white text-xs font-bold transition shadow-xs"
                                    >
                                      <span>{t('viewRestaurantMenuBtn', 'View Restaurant Details & Menu')}</span>
                                      <ArrowRight className="w-3.5 h-3.5 text-[#2DD4BF]" />
                                    </Link>
                                    <span className="text-[11px] text-slate-400">Paced for midday recharge</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {/* Night Slot Dinner Recommendation Card */}
                        {group.key === 'Night' && (() => {
                          const dinner = getRestaurantForSlot(day.dayNumber, 'dinner');
                          return (
                            <div className="bg-[#FAF9F6] border-2 border-[#0F766E]/25 hover:border-[#0F766E]/50 rounded-2xl p-4 sm:p-5 shadow-xs transition space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                                <div className="flex items-center space-x-2">
                                  <span className="bg-[#FF6B35] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs flex items-center space-x-1">
                                    <Utensils className="w-3 h-3" />
                                    <span>{t('aiDinnerTitle', 'AI Dinner Recommendation')}</span>
                                  </span>
                                  {dinner.dining.food_type === 'veg' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      🥬 Vegetarian
                                    </span>
                                  )}
                                  {dinner.dining.food_type === 'non_veg' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                      🍗 Non-Vegetarian
                                    </span>
                                  )}
                                  {dinner.dining.food_type === 'both' && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                                      🥬🍗 Veg & Non-Veg
                                    </span>
                                  )}
                                  <span className="text-xs font-semibold text-[#0F766E]">{dinner.dining.cuisine}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-xs">
                                  <span className="flex items-center space-x-1 text-slate-800 font-bold bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    <span>{dinner.dining.rating || 4.7}</span>
                                  </span>
                                  <span className="text-slate-500 font-medium">₹{dinner.costPerPerson} / {t('dayUnit', 'person')}</span>
                                </div>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <div className="relative w-full sm:w-44 h-32 rounded-xl overflow-hidden shrink-0">
                                  <SafeImage
                                    src={dinner.photo}
                                    alt={dinner.dining.name}
                                    className="w-full h-full object-cover"
                                    category="food"
                                  />
                                </div>

                                <div className="flex-1 space-y-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h5 className="text-base font-bold text-[#0B192C] font-heading">{dinner.dining.name}</h5>
                                    <span className="text-xs font-bold text-[#0F766E] bg-[#0F766E]/10 px-2.5 py-0.5 rounded-md">
                                      {t('estGroupCostLabel', 'Est. Group Cost:')} ₹{dinner.groupCost.toLocaleString('en-IN')} ({trip.travellersCount} {trip.travellersCount === 1 ? 'person' : 'people'})
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-600 leading-relaxed">{dinner.dining.description}</p>

                                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{t('mustTryLabel', 'Must Try:')}</span>
                                    {dinner.dishes.map((dish: string, dIdx: number) => (
                                      <span key={dIdx} className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                                        {dish}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="p-2.5 bg-[#0F766E]/5 rounded-xl border border-[#0F766E]/15 text-[11px] text-[#0F766E] font-medium flex items-start space-x-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B35] shrink-0 mt-0.5" />
                                    <span>{dinner.whyAI}</span>
                                  </div>

                                  <div className="pt-1 flex items-center justify-between">
                                    <Link
                                      to={`/restaurants/${dinner.dining.id}`}
                                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0B192C] text-white text-xs font-bold transition shadow-xs"
                                    >
                                      <span>{t('viewRestaurantMenuBtn', 'View Restaurant Details & Menu')}</span>
                                      <ArrowRight className="w-3.5 h-3.5 text-[#2DD4BF]" />
                                    </Link>
                                    <span className="text-[11px] text-slate-400">Convenient return route stop</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      </>)}

      {/* Skyline footer accent */}
      <div className="pt-6">
        <IndianMonumentsSkyline className="w-full text-[#0F766E]/15" tagline="Bharat Ki Khoj Ab Aur Aasaan • Designed for India" />
      </div>
    </div>

      {/* Taxi Booking Modal (shared between mobile and desktop) */}
      <TaxiBookingModal
        taxi={activeTaxi}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        defaultDrop={defaultDrop}
      />
    </>
  );
};
