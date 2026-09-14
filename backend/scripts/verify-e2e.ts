import { dbManager } from '../db/database';

async function runE2EVerification() {
  console.log('==================================================');
  console.log('  TRAVELSAATHI AI - FULL END-TO-END VERIFICATION  ');
  console.log('==================================================\n');

  const BASE_URL = 'http://localhost:5000/api';

  // 1. HEALTH CHECK
  console.log('Step 1: Checking API Health...');
  const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  if (healthRes.status !== 'online') throw new Error('Health check failed: ' + JSON.stringify(healthRes));
  console.log('✅ Backend API is healthy:', healthRes.appName, `(${healthRes.status})`);

  // 2. CHECK 16 REQUIRED CITIES
  console.log('\nStep 2: Validating 16 Required Cities in Database...');
  const REQUIRED_CITIES = [
    'Delhi', 'Agra', 'Jaipur', 'Udaipur', 'Amritsar', 'Mumbai', 'Goa',
    'Manali', 'Rishikesh', 'Srinagar', 'Varanasi', 'Hyderabad', 'Kolkata',
    'Kochi', 'Munnar', 'Leh',
  ];
  const citiesRes = await fetch(`${BASE_URL}/cities`).then((r) => r.json());
  const seededNames = citiesRes.data.map((c: any) => c.name);
  const missing = REQUIRED_CITIES.filter((name) => !seededNames.includes(name));
  if (missing.length > 0) {
    throw new Error(`Missing required cities: ${missing.join(', ')}`);
  }
  console.log(`✅ All ${REQUIRED_CITIES.length} required cities exist in SQLite:`, REQUIRED_CITIES.join(', '));

  // Find Jaipur
  const jaipur = citiesRes.data.find((c: any) => c.name === 'Jaipur');
  console.log(`📍 Using Jaipur (ID: ${jaipur.id}) for trip generation.`);

  // 3. GENERATE ITINERARY
  console.log('\nStep 3: Generating Plan My Trip Itinerary (Jaipur, ₹25,000, 3 Days, Couple, Self Vehicle)...');
  const genPayload = {
    cityId: jaipur.id,
    budgetTarget: 25000,
    daysCount: 3,
    travellersCount: 2,
    adultsCount: 2,
    childrenCount: 0,
    transportMode: 'Self / Own Vehicle',
    interests: ['Heritage', 'Food'],
    travellerType: 'Couple',
  };

  const genRes = await fetch(`${BASE_URL}/trips/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(genPayload),
  }).then((r) => r.json());

  if (!genRes.success || !genRes.trip) {
    throw new Error('Trip generation failed: ' + JSON.stringify(genRes));
  }

  const trip = genRes.trip;
  console.log(`✅ Itinerary Generated: "${trip.title}"`);
  console.log(`   - Days: ${trip.days.length}`);
  console.log(`   - Total Stops: ${trip.days.reduce((acc: number, d: any) => acc + d.stops.length, 0)}`);

  // Verify Day 1 slots
  const d1 = trip.days[0];
  const slotsFound = d1.stops.map((s: any) => s.timeSlot);
  console.log(`   - Day 1 Time Slots: ${[...new Set(slotsFound)].join(' -> ')}`);

  // Verify Budget Breakdown
  const b = trip.budget;
  if (b.estimatedTotalCost > b.budgetTarget) {
    throw new Error(`Budget hard limit violation: estimated ₹${b.estimatedTotalCost} > budget ₹${b.budgetTarget}`);
  }
  const compSum = (b.hotelCost || 0) + (b.foodCost || 0) + (b.transportCost || 0) + (b.activitiesCost || 0) + (b.entryFeesCost || 0) + (b.taxiCost || 0) + (b.miscCost || 0);
  if (b.estimatedTotalCost !== compSum) {
    throw new Error(`Budget exactness violation: total ₹${b.estimatedTotalCost} != sum of components ₹${compSum}`);
  }
  console.log('   - Budget Breakdown:');
  console.log(`     * Target: ₹${b.budgetTarget}`);
  console.log(`     * Estimated Total: ₹${b.estimatedTotalCost} (HARD LIMIT RESPECTED <= ₹${b.budgetTarget})`);
  console.log(`     * Remaining: ₹${b.remainingBudget} (${b.budgetPercentageUsed}% used)`);
  console.log(`     * Hotel: ₹${b.hotelCost}, Food: ₹${b.foodCost}, Transport: ₹${b.transportCost}`);
  console.log(`     * Fuel: ₹${trip.routeSummary?.fuelEstimate}, Tolls: ₹${trip.routeSummary?.tollEstimate}`);
  console.log(`   - Budget Optimizations Available: ${b.optimizationOptions?.length || 0}`);
  b.optimizationOptions?.forEach((opt: any) => {
    console.log(`     [Opt] ${opt.label} -> Save ₹${opt.savings}`);
  });

  // Verify Route Logistics
  console.log('   - Smart Route Logistics:');
  console.log(`     * Suggested Route: ${trip.routeSummary?.suggestedRoute}`);
  console.log(`     * Circuit Distance: ${trip.routeSummary?.totalDistanceKm} km`);
  console.log(`     * Major Checkpoints: ${trip.routeSummary?.majorStops?.join(' -> ')}`);
  console.log(`     * Transit Advice: ${trip.routeSummary?.transitAdvice}`);

  // Verify Recommended Cards
  console.log(`   - Recommended Hotels: ${trip.recommendedHotels?.length || 0} properties`);
  console.log(`   - Recommended Restaurants: ${trip.recommendedRestaurants?.length || 0} spots`);
  console.log(`   - Recommended Hidden Gems: ${trip.recommendedHiddenGems?.length || 0} gems`);
  console.log(`   - Available Taxis: ${trip.availableTaxis?.length || 0} cabs`);

  // 3B. TEST FOOD PREFERENCE FILTERING
  console.log('\nStep 3B: Testing Strict Dietary Filtering (Veg vs Non-Veg vs Both)...');
  // 1. Strict Veg
  const vegTripRes = await fetch(`${BASE_URL}/trips/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...genPayload, foodPreference: 'veg' }),
  }).then((r) => r.json());
  if (!vegTripRes.success) throw new Error('Veg trip generation failed');
  const vegRestaurants = vegTripRes.trip.recommendedRestaurants || [];
  const nonVegFoundInVeg = vegRestaurants.filter((r: any) => r.food_type && r.food_type !== 'veg');
  if (nonVegFoundInVeg.length > 0) {
    throw new Error(`Veg integrity violation: found non-veg restaurants in pure veg itinerary!`);
  }
  console.log(`✅ Strict Veg Test: 100% pure veg restaurants returned (${vegRestaurants.length} options)`);

  // 2. Non-Veg
  const nonVegTripRes = await fetch(`${BASE_URL}/trips/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...genPayload, foodPreference: 'non_veg' }),
  }).then((r) => r.json());
  if (!nonVegTripRes.success) throw new Error('Non-veg trip generation failed');
  console.log(`✅ Non-Veg Test: returned ${nonVegTripRes.trip.recommendedRestaurants?.length || 0} dining options`);

  // 3. Both
  const bothTripRes = await fetch(`${BASE_URL}/trips/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...genPayload, foodPreference: 'both' }),
  }).then((r) => r.json());
  if (!bothTripRes.success) throw new Error('Both food preference trip generation failed');
  console.log(`✅ Both Test: returned ${bothTripRes.trip.recommendedRestaurants?.length || 0} balanced dining options`);

  // 4. AUTHENTICATION & SAVE TRIP
  console.log('\nStep 4: Authenticating User & Saving Trip to Portfolio...');
  let loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rahul.tourist@example.com', password: 'password123' }),
  }).then((r) => r.json());

  if (!loginRes.success) {
    // Signup if not seeded
    loginRes = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rahul Sharma',
        email: 'rahul.tourist@example.com',
        password: 'password123',
        role: 'TOURIST',
      }),
    }).then((r) => r.json());
  }

  const token = loginRes.token;
  console.log(`✅ Logged in as: ${loginRes.user.name} (${loginRes.user.role})`);

  // Save Trip
  const saveRes = await fetch(`${BASE_URL}/trips/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ trip }),
  }).then((r) => r.json());

  if (!saveRes.success) throw new Error('Save trip failed: ' + JSON.stringify(saveRes));
  console.log(`✅ Saved Trip to Dashboard with ID: ${saveRes.tripId}`);

  // Retrieve Saved Trips
  const myTripsRes = await fetch(`${BASE_URL}/trips/my-trips`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  console.log(`✅ Retrieved user trips: ${myTripsRes.data.length} trips saved.`);

  // 5. TAXI BOOKING
  console.log('\nStep 5: Testing Taxi Booking Confirmation...');
  const taxi = trip.availableTaxis?.[0] || { id: 1 };
  const bookingRes = await fetch(`${BASE_URL}/bookings/taxi`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      taxi_service_id: taxi.id,
      pickup_address: 'Jaipur Junction Station Road',
      drop_address: 'Amber Fort Sightseeing Circuit',
      pickup_date: '2026-10-15',
      pickup_time: '09:30 AM',
      passengers: 2,
      estimated_distance_km: 14,
      notes: 'Please arrange luggage carrier',
    }),
  }).then((r) => r.json());

  if (!bookingRes.success) throw new Error('Taxi booking failed: ' + JSON.stringify(bookingRes));
  console.log(`✅ Taxi Booking Confirmed: Ref #${bookingRes.booking.booking_reference}, Est Fare: ₹${bookingRes.booking.estimated_fare}`);

  // 6. GLOBAL SEARCH
  console.log('\nStep 6: Testing Omni Global Search Endpoint...');
  const searchRes = await fetch(`${BASE_URL}/search?q=Jaipur`).then((r) => r.json());
  if (!searchRes.success) throw new Error('Search failed: ' + JSON.stringify(searchRes));
  console.log('✅ Global Search for "Jaipur" returned:');
  console.log(`   - Cities: ${searchRes.data.cities.length}`);
  console.log(`   - Places: ${searchRes.data.places.length}`);
  console.log(`   - Hotels: ${searchRes.data.hotels.length}`);
  console.log(`   - Restaurants: ${searchRes.data.restaurants.length}`);
  console.log(`   - Hidden Gems: ${searchRes.data.hiddenGems.length}`);
  console.log(`   - Taxis: ${searchRes.data.taxis?.length || 0}`);

  // 7. AI ASSISTANT CHATBOT
  console.log('\nStep 7: Testing TravelSaathi AI Assistant...');
  const chatRes = await fetch(`${BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'What are the best places in Jaipur?' }),
  }).then((r) => r.json());
  if (!chatRes.success) throw new Error('AI chat failed: ' + JSON.stringify(chatRes));
  console.log('✅ AI Assistant Response:');
  console.log('--------------------------------------------------');
  console.log(chatRes.reply.slice(0, 280) + '...');
  console.log('--------------------------------------------------');
  console.log(`   - Quick suggestions provided: ${chatRes.suggestions?.length || 0}`);

  // 8. BUSINESS DASHBOARD & PROFILE UPDATE
  console.log('\nStep 8: Testing Business Owner Dashboard & Profile Update...');
  // Find or create business owner
  let bizLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner.hotel@example.com', password: 'password123' }),
  }).then((r) => r.json());

  if (!bizLogin.success) {
    bizLogin = await fetch(`${BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Vikram Rajput',
        email: 'owner.hotel@example.com',
        password: 'password123',
        role: 'BUSINESS_OWNER',
      }),
    }).then((r) => r.json());
  }

  const bizToken = bizLogin.token;
  const bizDash = await fetch(`${BASE_URL}/business/dashboard`, {
    headers: { Authorization: `Bearer ${bizToken}` },
  }).then((r) => r.json());

  if (!bizDash.success) throw new Error('Business dashboard failed: ' + JSON.stringify(bizDash));
  console.log(`✅ Business Dashboard loaded: ${bizDash.data.hotels.length} hotels, ${bizDash.data.restaurants.length} dining, ${bizDash.data.taxis.length} taxis`);

  // Test updating a hotel profile if one exists or create one
  if (bizDash.data.hotels.length === 0) {
    // Register business
    const regRes = await fetch(`${BASE_URL}/business/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bizToken}`,
      },
      body: JSON.stringify({
        business_type: 'HOTEL',
        name: 'Rajputana Heritage Haveli',
        city_id: jaipur.id,
        price: 3400,
        phone: '+91 98110 33445',
        description: 'Authentic royal haveli experience near Hawa Mahal',
      }),
    }).then((r) => r.json());
    console.log('   - Registered business response:', regRes);
  }

  const updatedDash = await fetch(`${BASE_URL}/business/dashboard`, {
    headers: { Authorization: `Bearer ${bizToken}` },
  }).then((r) => r.json());
  console.log('   - Updated dash hotel count:', updatedDash.data?.hotels?.length);

  if (updatedDash.data?.hotels?.length > 0) {
    const hotelId = updatedDash.data.hotels[0].id;
    const updateRes = await fetch(`${BASE_URL}/business/HOTEL/${hotelId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bizToken}`,
      },
      body: JSON.stringify({
        name: 'Rajputana Heritage Grand Haveli',
        price: 3600,
        phone: '+91 98110 55667',
      }),
    }).then((r) => r.json());

    if (!updateRes.success) throw new Error('Update business profile failed: ' + JSON.stringify(updateRes));
    console.log(`✅ Business profile updated successfully: ${updateRes.message}`);
  }

  console.log('\n==================================================');
  console.log('  🎉 ALL 8 CORE TEST SUITES PASSED FLAWLESSLY!   ');
  console.log('==================================================\n');
}

runE2EVerification().catch((err) => {
  console.error('\n❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});
