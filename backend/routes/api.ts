import { Router, Request, Response } from 'express';
import * as authCtrl from '../controllers/authController';
import * as tourismCtrl from '../controllers/tourismController';
import * as tripCtrl from '../controllers/tripController';
import * as hotelCtrl from '../controllers/hotelController';
import * as restCtrl from '../controllers/restaurantController';
import * as taxiCtrl from '../controllers/taxiController';
import * as reviewCtrl from '../controllers/reviewController';
import * as favCtrl from '../controllers/favoriteController';
import * as adminCtrl from '../controllers/adminController';
import * as bizCtrl from '../controllers/businessController';
import { authMiddleware, requireRole, AuthRequest } from '../middleware/auth';
import { dbManager } from '../db/database';

const router = Router();

// ==================== AUTHENTICATION ====================
router.post('/auth/signup', authCtrl.signup);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authMiddleware, authCtrl.me);
router.put('/auth/profile', authMiddleware, authCtrl.updateProfile);

// ==================== PUBLIC CMS & SETTINGS ====================
router.get('/cms/settings', async (req: Request, res: Response) => {
  try {
    const settings = dbManager.query('SELECT * FROM site_settings');
    const dict: Record<string, string> = {};
    settings.forEach((s) => { dict[s.key] = s.value; });
    res.json({ success: true, data: dict });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading settings' });
  }
});

router.get('/cms/features', async (req: Request, res: Response) => {
  try {
    const features = dbManager.query('SELECT * FROM feature_settings');
    const dict: Record<string, boolean> = {};
    features.forEach((f) => { dict[f.key] = Boolean(f.is_enabled); });
    res.json({ success: true, data: dict });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading features' });
  }
});

router.get('/cms/homepage', async (req: Request, res: Response) => {
  try {
    const featuredCities = dbManager.query(
      'SELECT * FROM cities WHERE is_featured = 1 AND is_published = 1 LIMIT 8'
    ).map(c => ({ ...c, categories: JSON.parse(c.categories_json || '[]') }));

    const featuredPlaces = dbManager.query(
      'SELECT p.*, c.name as city_name FROM tourist_places p JOIN cities c ON c.id = p.city_id WHERE p.is_featured = 1 AND p.is_published = 1 LIMIT 8'
    ).map(p => ({ ...p, gallery: JSON.parse(p.gallery_json || '[]') }));

    const hiddenGems = dbManager.query(
      'SELECT g.*, c.name as city_name FROM hidden_gems g JOIN cities c ON c.id = g.city_id WHERE g.is_published = 1 LIMIT 6'
    ).map(g => ({ ...g, photos: JSON.parse(g.photos_json || '[]') }));

    const featuredHotels = dbManager.query(
      'SELECT h.*, c.name as city_name FROM hotels h JOIN cities c ON c.id = h.city_id WHERE h.is_featured = 1 AND h.approval_status = "APPROVED" AND h.is_published = 1 LIMIT 6'
    ).map(h => ({ ...h, photos: JSON.parse(h.photos_json || '[]'), facilities: JSON.parse(h.facilities_json || '[]') }));

    const featuredRestaurants = dbManager.query(
      'SELECT r.*, c.name as city_name FROM restaurants r JOIN cities c ON c.id = r.city_id WHERE r.is_featured = 1 AND r.approval_status = "APPROVED" AND r.is_published = 1 LIMIT 6'
    ).map(r => ({ ...r, photos: JSON.parse(r.photos_json || '[]'), popular_dishes: JSON.parse(r.popular_dishes_json || '[]') }));

    const featuredTaxis = dbManager.query(
      'SELECT t.*, c.name as city_name FROM taxi_services t JOIN cities c ON c.id = t.city_id WHERE t.approval_status = "APPROVED" AND t.is_published = 1 LIMIT 4'
    );

    res.json({
      success: true,
      data: {
        featuredCities,
        featuredPlaces,
        hiddenGems,
        featuredHotels,
        featuredRestaurants,
        featuredTaxis,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error loading homepage CMS content' });
  }
});

// ==================== TOURISM DISCOVERY ====================
router.get('/states', tourismCtrl.getStates);
router.get('/cities', tourismCtrl.getCities);
router.get('/cities/:id', tourismCtrl.getCityById);
router.get('/places', tourismCtrl.getPlaces);
router.get('/places/:id', tourismCtrl.getPlaceById);
router.get('/hidden-gems', tourismCtrl.getHiddenGems);

// Global Search
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json({ success: true, data: { cities: [], places: [], hotels: [], restaurants: [], hiddenGems: [] } });
    }
    const like = `%${q}%`;
    const cities = dbManager.query(
      'SELECT * FROM cities WHERE is_published = 1 AND (name LIKE ? OR description LIKE ?) LIMIT 10',
      [like, like]
    ).map(c => ({ ...c, categories: JSON.parse(c.categories_json || '[]') }));

    const places = dbManager.query(
      'SELECT p.*, c.name as city_name FROM tourist_places p JOIN cities c ON c.id = p.city_id WHERE p.is_published = 1 AND (p.name LIKE ? OR p.description LIKE ? OR p.category LIKE ?) LIMIT 10',
      [like, like, like]
    ).map(p => ({ ...p, gallery: JSON.parse(p.gallery_json || '[]') }));

    const hotels = dbManager.query(
      'SELECT h.*, c.name as city_name FROM hotels h JOIN cities c ON c.id = h.city_id WHERE h.is_published = 1 AND (h.name LIKE ? OR h.description LIKE ? OR h.address LIKE ?) LIMIT 10',
      [like, like, like]
    ).map(h => ({ ...h, photos: JSON.parse(h.photos_json || '[]'), facilities: JSON.parse(h.facilities_json || '[]') }));

    const restaurants = dbManager.query(
      'SELECT r.*, c.name as city_name FROM restaurants r JOIN cities c ON c.id = r.city_id WHERE r.is_published = 1 AND (r.name LIKE ? OR r.description LIKE ? OR r.cuisine LIKE ?) LIMIT 10',
      [like, like, like]
    ).map(r => ({ ...r, photos: JSON.parse(r.photos_json || '[]'), popular_dishes: JSON.parse(r.popular_dishes_json || '[]') }));

    const hiddenGems = dbManager.query(
      'SELECT g.*, c.name as city_name FROM hidden_gems g JOIN cities c ON c.id = g.city_id WHERE g.is_published = 1 AND (g.name LIKE ? OR g.description LIKE ?) LIMIT 10',
      [like, like]
    ).map(g => ({ ...g, photos: JSON.parse(g.photos_json || '[]') }));

    res.json({
      success: true,
      data: { cities, places, hotels, restaurants, hiddenGems },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Search error' });
  }
});

// ==================== HOTELS ====================
router.get('/hotels', hotelCtrl.getHotels);
router.get('/hotels/:id', hotelCtrl.getHotelById);

// ==================== RESTAURANTS ====================
router.get('/restaurants', restCtrl.getRestaurants);
router.get('/restaurants/:id', restCtrl.getRestaurantById);

// ==================== TAXIS & TAXI NEAR ME ====================
router.get('/taxis', taxiCtrl.getTaxis);
router.get('/taxis/near-me', taxiCtrl.getTaxiNearMe);
router.get('/taxis/:id', taxiCtrl.getTaxiById);
router.post('/bookings/taxi', authMiddleware, taxiCtrl.createBooking);
router.get('/bookings/my-bookings', authMiddleware, taxiCtrl.getMyBookings);
router.put('/bookings/:id/status', authMiddleware, taxiCtrl.updateBookingStatus);

// ==================== AI TRIP PLANNER ====================
router.post('/trips/generate', tripCtrl.generateTrip);
router.post('/trips/optimize', tripCtrl.optimizeTrip);
router.post('/trips/save', authMiddleware, tripCtrl.saveTrip);
router.get('/trips/my-trips', authMiddleware, tripCtrl.getUserTrips);
router.get('/trips/:id', tripCtrl.getTripById);
router.delete('/trips/:id', authMiddleware, tripCtrl.deleteTrip);

// ==================== REVIEWS & RATINGS ====================
router.post('/reviews', authMiddleware, reviewCtrl.createReview);
router.get('/reviews', reviewCtrl.getReviews);

// ==================== FAVORITES ====================
router.post('/favorites/toggle', authMiddleware, favCtrl.toggleFavorite);
router.get('/favorites', authMiddleware, favCtrl.getFavorites);

// ==================== NOTIFICATIONS ====================
router.get('/notifications', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    const notifications = dbManager.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user!.id]
    );
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

router.put('/notifications/:id/read', authMiddleware, (req: AuthRequest, res: Response) => {
  try {
    dbManager.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user!.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
});

// ==================== BUSINESS OWNER ====================
router.post('/business/register', authMiddleware, bizCtrl.registerBusiness);
router.get('/business/dashboard', authMiddleware, bizCtrl.getBusinessDashboard);
router.put('/business/:type/:id', authMiddleware, bizCtrl.updateBusinessProfile);

// ==================== GLOBAL SEARCH ====================
router.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim();
    if (!q) {
      res.json({ success: true, data: { cities: [], places: [], hotels: [], restaurants: [], hiddenGems: [] } });
      return;
    }

    const searchTerm = `%${q}%`;
    const cities = dbManager.query(
      'SELECT * FROM cities WHERE is_published = 1 AND (name LIKE ? OR description LIKE ?) LIMIT 6',
      [searchTerm, searchTerm]
    );

    const places = dbManager.query(
      `SELECT p.*, c.name as city_name FROM tourist_places p
       JOIN cities c ON c.id = p.city_id
       WHERE p.is_published = 1 AND (p.name LIKE ? OR p.category LIKE ? OR p.description LIKE ?) LIMIT 6`,
      [searchTerm, searchTerm, searchTerm]
    );

    const hotels = dbManager.query(
      `SELECT h.*, c.name as city_name FROM hotels h
       JOIN cities c ON c.id = h.city_id
       WHERE h.approval_status = "APPROVED" AND h.is_published = 1 AND (h.name LIKE ? OR h.description LIKE ? OR c.name LIKE ?) LIMIT 6`,
      [searchTerm, searchTerm, searchTerm]
    );

    const restaurants = dbManager.query(
      `SELECT r.*, c.name as city_name FROM restaurants r
       JOIN cities c ON c.id = r.city_id
       WHERE r.approval_status = "APPROVED" AND r.is_published = 1 AND (r.name LIKE ? OR r.cuisine LIKE ? OR c.name LIKE ?) LIMIT 6`,
      [searchTerm, searchTerm, searchTerm]
    );

    const hiddenGems = dbManager.query(
      `SELECT g.*, c.name as city_name FROM hidden_gems g
       JOIN cities c ON c.id = g.city_id
       WHERE g.is_published = 1 AND (g.name LIKE ? OR g.description LIKE ? OR c.name LIKE ?) LIMIT 6`,
      [searchTerm, searchTerm, searchTerm]
    );

    res.json({
      success: true,
      data: {
        cities,
        places,
        hotels,
        restaurants,
        hiddenGems,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

// ==================== AI ASSISTANT CHAT ====================
router.post('/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    // Combine previous user messages and current prompt to maintain session state
    const allUserTexts = [
      ...conversationHistory
        .filter((h: any) => h.sender === 'user' || h.role === 'user')
        .map((h: any) => h.text || h.content || ''),
      message,
    ];
    const fullConversationText = allUserTexts.join(' ').toLowerCase();
    const currentLower = message.toLowerCase();

    // 1. Destination Extraction: search across full history (most recent mentioned city takes priority)
    const allCities = dbManager.query<any>('SELECT id, name FROM cities WHERE is_published = 1');
    let matchedCity: any = null;
    for (let i = allUserTexts.length - 1; i >= 0; i--) {
      const txt = allUserTexts[i].toLowerCase();
      const found = allCities.find((c: any) => txt.includes(c.name.toLowerCase()));
      if (found) {
        matchedCity = found;
        break;
      }
    }

    // 2. Budget Extraction: detect numbers with k, ₹, or budget keywords
    let detectedBudget: number | null = null;
    const budgetMatches = fullConversationText.match(/(?:budget\s*(?:is|of)?\s*[:=]?\s*₹?\s*|₹\s*|in\s*₹?\s*)(\d{3,7})|(\d{1,3})\s*k\b/gi);
    if (budgetMatches) {
      const lastMatch = budgetMatches[budgetMatches.length - 1].toLowerCase();
      if (lastMatch.includes('k')) {
        const num = parseFloat(lastMatch.replace(/[^0-9.]/g, ''));
        if (!isNaN(num)) detectedBudget = num * 1000;
      } else {
        const num = parseInt(lastMatch.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num)) detectedBudget = num;
      }
    } else {
      const rawNumMatches = fullConversationText.match(/\b\d{4,6}\b/g);
      if (rawNumMatches) {
        detectedBudget = parseInt(rawNumMatches[rawNumMatches.length - 1], 10);
      }
    }

    // 3. Travellers Extraction:
    let detectedTravellers: { count: number; type: string } | null = null;
    if (fullConversationText.includes('solo')) {
      detectedTravellers = { count: 1, type: 'Solo traveller' };
    } else if (fullConversationText.includes('couple') || fullConversationText.includes('wife') || fullConversationText.includes('husband') || fullConversationText.includes('partner')) {
      detectedTravellers = { count: 2, type: 'Couple' };
    } else if (fullConversationText.includes('family')) {
      detectedTravellers = { count: 4, type: 'Family' };
    } else {
      const travMatch = fullConversationText.match(/(\d+)\s*(?:people|person|traveller|travellers|pax|members|friends)/i);
      if (travMatch) {
        detectedTravellers = { count: parseInt(travMatch[1], 10), type: `${travMatch[1]} travellers` };
      }
    }

    // 4. Duration Extraction:
    let detectedDays: number | null = null;
    const daysMatch = fullConversationText.match(/(\d+)\s*(?:days|day|nights|night)/i);
    if (daysMatch) {
      detectedDays = parseInt(daysMatch[1], 10);
    } else if (fullConversationText.includes('weekend')) {
      detectedDays = 2;
    }

    // 5. Food Preference Extraction:
    let detectedFoodPref: 'veg' | 'non_veg' | null = null;
    const lowerConv = fullConversationText.toLowerCase();
    if (lowerConv.includes('non-veg') || lowerConv.includes('non veg') || lowerConv.includes('chicken') || lowerConv.includes('mutton') || lowerConv.includes('meat') || lowerConv.includes('fish') || lowerConv.includes('seafood')) {
      detectedFoodPref = 'non_veg';
    } else if (lowerConv.includes('pure veg') || lowerConv.includes('vegetarian') || lowerConv.includes('veg ') || lowerConv.includes('veg,')) {
      detectedFoodPref = 'veg';
    }

    // Summary Context Header to confirm multi-turn memory
    const contextItems: string[] = [];
    if (matchedCity) contextItems.push(`📍 **${matchedCity.name}**`);
    if (detectedBudget) contextItems.push(`💰 **₹${detectedBudget.toLocaleString('en-IN')}**`);
    if (detectedTravellers) contextItems.push(`👥 **${detectedTravellers.type}**`);
    if (detectedDays) contextItems.push(`🗓️ **${detectedDays} Days**`);
    if (detectedFoodPref) contextItems.push(detectedFoodPref === 'veg' ? '🥬 **Vegetarian**' : '🍗 **Non-Veg**');

    const contextHeader = contextItems.length > 0
      ? `*(Current Session: ${contextItems.join(' • ')})*\n\n`
      : '';

    let reply = '';
    let suggestions: string[] = [];

    // Response generation based on current turn intent and remembered session
    if (currentLower.includes('hotel') || currentLower.includes('stay') || currentLower.includes('resort') || currentLower.includes('room')) {
      if (matchedCity) {
        const hotels = dbManager.query<any>(
          'SELECT name, price_per_night, rating, facilities_json FROM hotels WHERE city_id = ? AND approval_status = "APPROVED" ORDER BY rating DESC LIMIT 3',
          [matchedCity.id]
        );
        const nights = detectedDays || 2;
        reply = `${contextHeader}Here are recommended hotels in **${matchedCity.name}** matching your profile:\n\n` +
          hotels.map((h: any) => {
            const total = h.price_per_night * nights;
            return `🏨 **${h.name}** (⭐ ${h.rating})\n   • Price: ₹${h.price_per_night.toLocaleString('en-IN')}/night (Est. ₹${total.toLocaleString('en-IN')} for ${nights} nights)\n   • Amenities: WiFi, AC, Breakfast Included`;
          }).join('\n\n') +
          `\n\n💡 *All stays are verified and can be pre-selected in your itinerary.*`;

        suggestions = [
          `Now suggest restaurants in ${matchedCity.name}`,
          `Taxi advice in ${matchedCity.name}`,
          `Day-by-day itinerary for ${matchedCity.name}`,
          `Hidden gems in ${matchedCity.name}`,
        ];
      } else {
        reply = `${contextHeader}Which city would you like hotel recommendations for? We cover 16+ destinations including **Jaipur, Udaipur, Agra, Varanasi, Goa, Manali, and Srinagar**.`;
        suggestions = ['Hotels in Jaipur', 'Hotels in Udaipur', 'Hotels in Goa', 'Hotels in Manali'];
      }
    } else if (currentLower.includes('restaurant') || currentLower.includes('food') || currentLower.includes('eat') || currentLower.includes('dhaba') || currentLower.includes('dish') || currentLower.includes('veg') || currentLower.includes('dining')) {
      if (matchedCity) {
        let restSql = 'SELECT name, cuisine, food_type, avg_cost_for_two, popular_dishes_json FROM restaurants WHERE city_id = ? AND approval_status = "APPROVED"';
        const restParams: any[] = [matchedCity.id];
        if (detectedFoodPref === 'veg') {
          restSql += ' AND (food_type = "veg" OR food_type = "both")';
        } else if (detectedFoodPref === 'non_veg') {
          restSql += ' AND (food_type = "non_veg" OR food_type = "both")';
        }
        restSql += ' ORDER BY rating DESC LIMIT 3';
        const restaurants = dbManager.query<any>(restSql, restParams);
        const groupCount = detectedTravellers ? detectedTravellers.count : 2;
        const dietLabel = detectedFoodPref === 'veg' ? 'Pure Veg & Veg-friendly' : detectedFoodPref === 'non_veg' ? 'Non-Vegetarian & Multi-Cuisine' : 'Culinary';
        reply = `${contextHeader}Here are top **${dietLabel}** highlights in **${matchedCity.name}** for ${groupCount} travellers:\n\n` +
          restaurants.map((r: any) => {
            const dishes = JSON.parse(r.popular_dishes_json || '[]').slice(0, 3).join(', ');
            const groupCost = Math.round((r.avg_cost_for_two / 2) * groupCount);
            const badge = r.food_type === 'veg' ? '🥬 [Veg]' : r.food_type === 'non_veg' ? '🍗 [Non-Veg]' : '🥬🍗 [Veg & Non-Veg]';
            return `🍽️ **${r.name}** ${badge} — ${r.cuisine}\n   • Must Try: ${dishes || 'Regional Thali'}\n   • Approx Cost: ₹${groupCost.toLocaleString('en-IN')} for ${groupCount} people (₹${r.avg_cost_for_two} for two)`;
          }).join('\n\n') +
          `\n\nMust savor authentic local flavours!`;

        suggestions = [
          `Suggest hotels in ${matchedCity.name}`,
          `Day-by-day plan for ${matchedCity.name}`,
          `Taxi options in ${matchedCity.name}`,
          `Hidden gems in ${matchedCity.name}`,
        ];
      } else {
        reply = `${contextHeader}Which city's cuisine would you like to explore? From Rajasthani thalis in Jaipur to Kashmiri Wazwan in Srinagar, tell me your destination!`;
        suggestions = ['Best food in Delhi', 'Rajasthani thali in Jaipur', 'Seafood in Goa', 'Street food in Varanasi'];
      }
    } else if (currentLower.includes('taxi') || currentLower.includes('cab') || currentLower.includes('driver') || currentLower.includes('car')) {
      if (matchedCity) {
        const taxis = dbManager.query<any>(
          'SELECT service_name, vehicle_type, base_fare, per_km_fare, rating FROM taxi_services WHERE city_id = ? AND approval_status = "APPROVED" LIMIT 2',
          [matchedCity.id]
        );
        reply = `${contextHeader}Verified local taxi options in **${matchedCity.name}**:\n\n` +
          taxis.map((t: any) => `🚕 **${t.service_name}** (${t.vehicle_type}, ⭐ ${t.rating})\n   • Base Fare: ₹${t.base_fare} • Per km: ₹${t.per_km_fare}/km\n   • Direct driver booking with 0% commission cut`).join('\n\n') +
          `\n\n💡 *You can hail nearby cabs via GPS in our "Taxi Near Me" page!*`;

        suggestions = [
          `Hotels in ${matchedCity.name}`,
          `Restaurants in ${matchedCity.name}`,
          `Plan My Trip for ${matchedCity.name}`,
        ];
      } else {
        reply = `${contextHeader}We have verified local taxi fleets, autos, and SUVs across all 16 destination cities. Which city are you travelling to?`;
        suggestions = ['Taxis in Jaipur', 'Taxis in Agra', 'Taxis in Goa', 'Find Taxi Near Me (GPS)'];
      }
    } else if (currentLower.includes('hidden gem') || currentLower.includes('secret') || currentLower.includes('offbeat')) {
      if (matchedCity) {
        const gems = dbManager.query<any>(
          'SELECT name, category, best_time, distance_from_city_km, description FROM hidden_gems WHERE city_id = ? AND is_published = 1 LIMIT 3',
          [matchedCity.id]
        );
        reply = `${contextHeader}Serene offbeat gems in **${matchedCity.name}** away from regular crowds:\n\n` +
          gems.map((g: any) => `✨ **${g.name}** (${g.category})\n   • Best Time: ${g.best_time}\n   • Distance: ${g.distance_from_city_km} km from city center\n   • ${g.description}`).join('\n\n');

        suggestions = [
          `Hotels in ${matchedCity.name}`,
          `Food spots in ${matchedCity.name}`,
          `Plan 3 days in ${matchedCity.name}`,
        ];
      } else {
        reply = `${contextHeader}Explore India's best-kept secrets — from Chand Baori stepwells in Rajasthan to secluded Dudhsagar trails in Goa. Which state or city are you planning for?`;
        suggestions = ['Hidden gems in Jaipur', 'Hidden gems in Agra', 'Hidden gems in Himachal'];
      }
    } else if (
      // Context update turn: User specifies budget, travellers, or days after a destination
      (detectedBudget && (currentLower.includes('budget') || currentLower.includes('rupee') || currentLower.includes('₹') || currentLower.match(/\b\d{4,6}\b/))) ||
      (detectedTravellers && (currentLower.includes('people') || currentLower.includes('person') || currentLower.includes('solo') || currentLower.includes('couple') || currentLower.includes('family'))) ||
      (detectedDays && (currentLower.includes('day') || currentLower.includes('days') || currentLower.includes('weekend')))
    ) {
      reply = `${contextHeader}Awesome, I have saved your trip preferences:\n` +
        (matchedCity ? `• **Destination:** ${matchedCity.name}\n` : `• **Destination:** Not chosen yet\n`) +
        (detectedBudget ? `• **Budget:** ₹${detectedBudget.toLocaleString('en-IN')}\n` : '') +
        (detectedTravellers ? `• **Travellers:** ${detectedTravellers.type}\n` : '') +
        (detectedDays ? `• **Duration:** ${detectedDays} Days\n` : '') +
        `\nWhat would you like me to recommend next?`;

      suggestions = matchedCity
        ? [
            `Suggest hotels in ${matchedCity.name}`,
            `Recommend restaurants in ${matchedCity.name}`,
            `Top sights in ${matchedCity.name}`,
            `Plan My Trip now`,
          ]
        : [
            'Plan trip to Jaipur',
            'Plan trip to Udaipur',
            'Plan trip to Goa',
            'Plan trip to Varanasi',
          ];
    } else if (matchedCity) {
      // General city overview with memory
      const places = dbManager.query<any>(
        'SELECT name, category, rating, entry_fee FROM tourist_places WHERE city_id = ? AND is_published = 1 ORDER BY rating DESC LIMIT 4',
        [matchedCity.id]
      );
      reply = `${contextHeader}**${matchedCity.name}** is a phenomenal choice! Here is a curated itinerary overview:\n\n` +
        `🏛️ **Top Sights & Monuments:**\n` +
        places.map((p: any) => `• **${p.name}** (${p.category}) — ₹${p.entry_fee || 'Free'} entry (⭐ ${p.rating})`).join('\n') +
        `\n\n💡 Next steps: You can tell me your **budget** (e.g. *"budget is 20000"*), **travellers count** (e.g. *"2 people"*), or ask for **hotels** and **restaurants**!`;

      suggestions = [
        `My budget is ₹20,000`,
        `We are 2 people`,
        `Suggest hotels in ${matchedCity.name}`,
        `Best food in ${matchedCity.name}`,
      ];
    } else {
      reply = `Namaste! 🙏 I am your **TravelSaathi AI Assistant**.\n\n` +
        `I remember your destination, budget, group size, and preferences across our chat to craft the perfect journey:\n\n` +
        `• **Monuments & Sights:** Real-time entry fees, crowd patterns, and opening hours\n` +
        `• **Hotels & Homestays:** Curated stays within your target budget\n` +
        `• **Culinary Hotspots:** Authentic regional dining and iconic street dhabas\n` +
        `• **Verified Taxis:** Transparent per-km rates with zero surge pricing\n\n` +
        `Where would you like to travel today? (e.g. *"Plan a trip to Jaipur"* or *"Goa with friends"*!)`;

      suggestions = [
        'Plan a trip to Jaipur',
        'Plan a trip to Udaipur',
        'Plan a trip to Goa',
        'Plan a trip to Varanasi',
      ];
    }

    res.json({ success: true, reply, suggestions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'AI Assistant error' });
  }
});

// ==================== SUPER ADMIN CONTROL PANEL ====================
router.get('/admin/stats', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER', 'BUSINESS_MODERATOR'), adminCtrl.getDashboardStats);

// Cities
router.get('/admin/cities', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.getCitiesAdmin);
router.post('/admin/cities', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.createCity);
router.put('/admin/cities/:id', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.updateCity);
router.delete('/admin/cities/:id', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.deleteCity);

// Places
router.get('/admin/places', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.getPlacesAdmin);
router.post('/admin/places', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.createPlace);
router.put('/admin/places/:id', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.updatePlace);
router.delete('/admin/places/:id', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.deletePlace);

// Hidden Gems
router.get('/admin/hidden-gems', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.getHiddenGemsAdmin);
router.post('/admin/hidden-gems', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.createHiddenGem);
router.delete('/admin/hidden-gems/:id', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.deleteHiddenGem);

// Business Approvals & Moderation
router.get('/admin/business-approvals', authMiddleware, requireRole('SUPER_ADMIN', 'BUSINESS_MODERATOR'), adminCtrl.getBusinessApprovals);
router.put('/admin/business-approvals/:type/:id', authMiddleware, requireRole('SUPER_ADMIN', 'BUSINESS_MODERATOR'), adminCtrl.updateBusinessStatus);

// Users Management
router.get('/admin/users', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.getUsersAdmin);
router.put('/admin/users/:id', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.updateUserAdmin);

// Bookings
router.get('/admin/bookings', authMiddleware, requireRole('SUPER_ADMIN', 'BUSINESS_MODERATOR'), adminCtrl.getBookingsAdmin);

// Reviews Moderation
router.get('/admin/reviews', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.getReviewsAdmin);
router.put('/admin/reviews/:id/moderation', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.toggleReviewModeration);

// CMS & Settings
router.get('/admin/settings', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.getSiteSettings);
router.post('/admin/settings', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.updateSiteSetting);

// Features
router.get('/admin/features', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.getFeatureFlags);
router.put('/admin/features/:key', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.toggleFeatureFlag);

// Logs & Search
router.get('/admin/activity-logs', authMiddleware, requireRole('SUPER_ADMIN'), adminCtrl.getActivityLogs);
router.get('/admin/search', authMiddleware, requireRole('SUPER_ADMIN', 'CONTENT_MANAGER'), adminCtrl.globalAdminSearch);

export default router;
