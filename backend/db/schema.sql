-- TravelSaathi AI Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('SUPER_ADMIN', 'CONTENT_MANAGER', 'BUSINESS_MODERATOR', 'BUSINESS_OWNER', 'TOURIST')),
  phone TEXT,
  mobile_verified INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url TEXT,
  location TEXT,
  mobile_number TEXT,
  mobile_verified INTEGER DEFAULT 0,
  preferences_json TEXT
);

CREATE TABLE IF NOT EXISTS otps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mobile_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  purpose TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS states (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  capital TEXT,
  region TEXT,
  description TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS cities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state_id INTEGER REFERENCES states(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_image TEXT,
  gallery_json TEXT,
  latitude REAL,
  longitude REAL,
  categories_json TEXT,
  is_featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tourist_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  gallery_json TEXT,
  category TEXT NOT NULL,
  address TEXT,
  latitude REAL,
  longitude REAL,
  opening_time TEXT DEFAULT '09:00 AM',
  closing_time TEXT DEFAULT '06:00 PM',
  entry_fee REAL DEFAULT 0,
  best_visiting_time TEXT,
  recommended_duration_hours REAL DEFAULT 2.0,
  rating REAL DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  family_friendly INTEGER DEFAULT 1,
  couple_friendly INTEGER DEFAULT 1,
  solo_friendly INTEGER DEFAULT 1,
  budget_friendly INTEGER DEFAULT 1,
  is_premium INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  ai_priority INTEGER DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hidden_gems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  photos_json TEXT,
  category TEXT,
  location TEXT,
  best_time TEXT,
  duration_hours REAL DEFAULT 2,
  entry_fee REAL DEFAULT 0,
  distance_from_city_km REAL DEFAULT 10,
  route_info TEXT,
  rating REAL DEFAULT 4.8,
  is_featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER REFERENCES users(id),
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  photos_json TEXT,
  address TEXT,
  latitude REAL,
  longitude REAL,
  price_per_night REAL NOT NULL,
  facilities_json TEXT,
  rating REAL DEFAULT 4.5,
  phone TEXT,
  email TEXT,
  website TEXT,
  approval_status TEXT DEFAULT 'APPROVED' CHECK(approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  is_featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  contact_clicks INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotel_rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  price_per_night REAL NOT NULL,
  capacity INTEGER DEFAULT 2,
  photos_json TEXT,
  amenities_json TEXT
);

CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER REFERENCES users(id),
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  photos_json TEXT,
  cuisine TEXT,
  food_type TEXT DEFAULT 'both' CHECK(food_type IN ('veg', 'non_veg', 'both')),
  popular_dishes_json TEXT,
  facilities_json TEXT,
  opening_hours TEXT DEFAULT '10:00 AM - 11:00 PM',
  avg_cost_for_two REAL NOT NULL,
  rating REAL DEFAULT 4.5,
  phone TEXT,
  email TEXT,
  website TEXT,
  approval_status TEXT DEFAULT 'APPROVED' CHECK(approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  is_featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  views_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  contact_clicks INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  is_veg INTEGER DEFAULT 1,
  category TEXT
);

CREATE TABLE IF NOT EXISTS taxi_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER REFERENCES users(id),
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_type TEXT NOT NULL CHECK(vehicle_type IN ('Bike Taxi', 'Auto', 'Sedan', 'SUV', 'Premium Car', 'Van', 'Other')),
  vehicle_photos_json TEXT,
  passenger_capacity INTEGER DEFAULT 4,
  base_fare REAL NOT NULL,
  per_km_fare REAL NOT NULL,
  per_hour_fare REAL DEFAULT 0,
  airport_fare REAL DEFAULT 0,
  outstation_fare REAL DEFAULT 0,
  service_location TEXT,
  service_area TEXT,
  latitude REAL,
  longitude REAL,
  availability_status TEXT DEFAULT 'AVAILABLE' CHECK(availability_status IN ('AVAILABLE', 'BUSY', 'OFFLINE')),
  services_offered TEXT,
  description TEXT,
  rating REAL DEFAULT 4.7,
  approval_status TEXT DEFAULT 'APPROVED' CHECK(approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED')),
  is_featured INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS taxi_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_reference TEXT UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES users(id),
  taxi_service_id INTEGER REFERENCES taxi_services(id),
  pickup_address TEXT NOT NULL,
  drop_address TEXT NOT NULL,
  pickup_date TEXT NOT NULL,
  pickup_time TEXT NOT NULL,
  passengers INTEGER DEFAULT 1,
  vehicle_type TEXT,
  estimated_fare REAL NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  title TEXT NOT NULL,
  destination_city_id INTEGER REFERENCES cities(id),
  days_count INTEGER NOT NULL,
  budget_target REAL NOT NULL,
  estimated_total_cost REAL NOT NULL,
  travellers_count INTEGER NOT NULL,
  transport_mode TEXT NOT NULL,
  interests_json TEXT NOT NULL,
  traveller_type TEXT NOT NULL,
  route_summary_json TEXT,
  budget_breakdown_json TEXT,
  is_saved INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trip_days (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  day_title TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS trip_stops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_day_id INTEGER REFERENCES trip_days(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  stop_type TEXT NOT NULL CHECK(stop_type IN ('BREAKFAST', 'PLACE', 'LUNCH', 'HIDDEN_GEM', 'DINNER', 'HOTEL')),
  entity_type TEXT CHECK(entity_type IN ('PLACE', 'HOTEL', 'RESTAURANT', 'HIDDEN_GEM')),
  entity_id INTEGER,
  custom_title TEXT,
  image_url TEXT,
  description TEXT,
  start_time TEXT,
  duration_hours REAL,
  estimated_cost REAL,
  travel_distance_km REAL,
  travel_time_mins INTEGER,
  transport_notes TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('PLACE', 'HOTEL', 'RESTAURANT', 'TAXI')),
  entity_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  is_moderated INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK(entity_type IN ('TRIP', 'CITY', 'PLACE', 'HIDDEN_GEM', 'HOTEL', 'RESTAURANT', 'TAXI')),
  entity_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('TRIP', 'BOOKING', 'REVIEW', 'BUSINESS', 'SYSTEM')),
  is_read INTEGER DEFAULT 0,
  link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  target_type TEXT,
  target_id INTEGER,
  tags TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feature_settings (
  key TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_enabled INTEGER DEFAULT 1,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER REFERENCES users(id),
  admin_name TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id INTEGER,
  old_value_json TEXT,
  new_value_json TEXT,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  user_id INTEGER,
  metadata_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_places_city ON tourist_places(city_id);
CREATE INDEX IF NOT EXISTS idx_places_category ON tourist_places(category);
CREATE INDEX IF NOT EXISTS idx_places_published ON tourist_places(is_published);
CREATE INDEX IF NOT EXISTS idx_hidden_gems_city ON hidden_gems(city_id);
CREATE INDEX IF NOT EXISTS idx_hotels_city ON hotels(city_id);
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels(approval_status, is_published);
CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city_id);
CREATE INDEX IF NOT EXISTS idx_taxis_city ON taxi_services(city_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON taxi_bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_taxi ON taxi_bookings(taxi_service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
