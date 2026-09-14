export interface User {
  id: number;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'BUSINESS_MODERATOR' | 'BUSINESS_OWNER' | 'TOURIST';
  phone?: string;
  mobile_number?: string;
  mobile_verified?: boolean;
  status?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  created_at?: string;
}


export interface State {
  id: number;
  name: string;
  code: string;
  capital: string;
  region: string;
  description: string;
  image_url: string;
}

export interface City {
  id: number;
  state_id: number;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  gallery: string[];
  latitude: number;
  longitude: number;
  categories: string[];
  is_featured: boolean;
  is_published: boolean;
  state_name?: string;
  state_code?: string;
  place_count?: number;
}

export interface TouristPlace {
  id: number;
  city_id: number;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  gallery: string[];
  category: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_time: string;
  closing_time: string;
  entry_fee: number;
  best_visiting_time: string;
  recommended_duration_hours: number;
  rating: number;
  review_count: number;
  family_friendly: boolean;
  couple_friendly: boolean;
  solo_friendly: boolean;
  budget_friendly: boolean;
  is_premium: boolean;
  is_featured: boolean;
  is_published: boolean;
  ai_priority: number;
  city_name?: string;
  state_name?: string;
}

export interface HiddenGem {
  id: number;
  city_id: number;
  name: string;
  description: string;
  photos: string[];
  category: string;
  location: string;
  best_time: string;
  duration_hours: number;
  entry_fee: number;
  distance_from_city_km: number;
  route_info: string;
  rating: number;
  is_featured: boolean;
  is_published: boolean;
  city_name?: string;
  state_name?: string;
}

export interface HotelRoom {
  id: number;
  hotel_id: number;
  room_type: string;
  price_per_night: number;
  capacity: number;
  photos: string[];
  amenities: string[];
}

export interface Hotel {
  id: number;
  owner_id?: number;
  city_id: number;
  name: string;
  description: string;
  photos: string[];
  address: string;
  latitude?: number;
  longitude?: number;
  price_per_night: number;
  facilities: string[];
  rating: number;
  phone: string;
  email: string;
  website: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  is_featured: boolean;
  is_published: boolean;
  views_count?: number;
  saves_count?: number;
  city_name?: string;
  state_name?: string;
  owner_name?: string;
}

export interface MenuItem {
  id: number;
  restaurant_id: number;
  name: string;
  description: string;
  price: number;
  is_veg: boolean;
  category: string;
}

export interface Restaurant {
  id: number;
  owner_id?: number;
  city_id: number;
  name: string;
  description: string;
  photos: string[];
  cuisine: string;
  food_type?: 'veg' | 'non_veg' | 'both';
  popular_dishes: string[];
  facilities: string[];
  opening_hours: string;
  avg_cost_for_two: number;
  rating: number;
  phone: string;
  email: string;
  website: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  is_featured: boolean;
  is_published: boolean;
  city_name?: string;
  state_name?: string;
  owner_name?: string;
}

export interface TaxiService {
  id: number;
  owner_id?: number;
  city_id: number;
  service_name: string;
  driver_name: string;
  phone: string;
  vehicle_type: 'Bike Taxi' | 'Auto' | 'Sedan' | 'SUV' | 'Premium Car' | 'Van' | 'Other';
  vehicle_photos: string[];
  passenger_capacity: number;
  base_fare: number;
  per_km_fare: number;
  per_hour_fare: number;
  airport_fare: number;
  outstation_fare: number;
  service_location: string;
  service_area: string;
  availability_status: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  services_offered?: string;
  description?: string;
  rating: number;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_featured: boolean;
  is_published: boolean;
  city_name?: string;
  state_name?: string;
  distanceKm?: number;
  estimatedArrivalTimeMins?: number;
}

export interface TaxiBooking {
  id: number;
  booking_reference: string;
  customer_id: number;
  taxi_service_id: number;
  pickup_address: string;
  drop_address: string;
  pickup_location?: string;
  drop_location?: string;
  pickup_date: string;
  pickup_time: string;
  passengers: number;
  vehicle_type: string;
  estimated_fare: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  created_at: string;
  service_name?: string;
  driver_name?: string;
  driver_phone?: string;
  taxi_type?: string;
  city_name?: string;
  customer_name?: string;
  customer_email?: string;
}

export interface GeneratedStop {
  stopOrder: number;
  timeSlot?: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  stopType: 'BREAKFAST' | 'PLACE' | 'LUNCH' | 'HIDDEN_GEM' | 'DINNER' | 'HOTEL';
  entityType?: 'PLACE' | 'HOTEL' | 'RESTAURANT' | 'HIDDEN_GEM';
  entityId?: number;
  title: string;
  category?: string;
  imageUrl: string;
  description: string;
  startTime: string;
  durationHours: number;
  bestVisitingTime?: string;
  entryFee: number;
  estimatedCost: number;
  distanceKm: number;
  travelTimeMins: number;
  transportNotes: string;
  latitude?: number;
  longitude?: number;
}

export interface GeneratedDay {
  dayNumber: number;
  dayTitle: string;
  notes: string;
  stops: GeneratedStop[];
}

export interface BudgetBreakdown {
  budgetTarget: number;
  estimatedTotalCost: number;
  remainingBudget: number;
  budgetPercentageUsed: number;
  isExceeded: boolean;
  excessAmount: number;
  status?: 'WITHIN_BUDGET' | 'BUDGET_FULLY_USED' | 'BUDGET_INSUFFICIENT';
  hotelCost: number;
  foodCost: number;
  transportCost: number;
  activitiesCost: number;
  entryFeesCost: number;
  taxiCost: number;
  miscCost: number;
  savingsTips: string[];
  optimizationOptions?: {
    key: string;
    label: string;
    description: string;
    savings: number;
  }[];
}

export interface GeneratedTrip {
  id?: number;
  isBudgetSufficient?: boolean;
  minRequiredBudget?: number;
  shortfallAmount?: number;
  suggestedActions?: {
    reduceDaysTo?: number;
    recommendedMinBudget?: number;
    suggestBudgetHotel?: boolean;
    suggestBudgetTransport?: boolean;
  };
  city: {
    id: number;
    name: string;
    description: string;
    coverImage: string;
    stateName?: string;
  };
  title: string;
  daysCount: number;
  nightsCount?: number;
  travellersCount: number;
  adultsCount?: number;
  childrenCount?: number;
  transportMode: string;
  travellerType: string;
  interests: string[];
  foodPreference?: 'veg' | 'non_veg' | 'both';
  budget: BudgetBreakdown;
  days: GeneratedDay[];
  routeSummary: {
    totalDistanceKm: number;
    totalTravelTimeMins: number;
    suggestedRoute?: string;
    majorStops?: string[];
    placesToVisitOnRoute?: string[];
    fuelEstimate: number;
    tollEstimate?: number;
    parkingTips: string;
  };
  recommendedHotels?: Hotel[];
  recommendedRestaurants?: Restaurant[];
  recommendedHiddenGems?: HiddenGem[];
  availableTaxis?: TaxiService[];
}

export interface Review {
  id: number;
  user_id: number;
  user_name: string;
  avatar_url?: string;
  entity_type: 'PLACE' | 'HOTEL' | 'RESTAURANT' | 'TAXI';
  entity_id: number;
  rating: number;
  comment: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: 'TRIP' | 'BOOKING' | 'REVIEW' | 'BUSINESS' | 'SYSTEM';
  is_read: boolean;
  link?: string;
  created_at: string;
}
