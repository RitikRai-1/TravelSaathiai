import { Request, Response } from 'express';
import { dbManager } from '../db/database';
import { RecommendationEngine, PlanTripInput } from '../services/recommendationEngine';
import { AuthRequest } from '../middleware/auth';

export const generateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      cityId,
      budgetTarget = 25000,
      daysCount = 3,
      travellersCount = 2,
      adultsCount = 2,
      childrenCount = 0,
      transportMode = 'Taxi',
      interests = ['Heritage', 'Culture', 'Food'],
      travellerType = 'Couple',
      foodPreference,
    } = req.body;

    if (!cityId) {
      res.status(400).json({ success: false, message: 'Please select a destination city' });
      return;
    }

    const input: PlanTripInput = {
      cityId: Number(cityId),
      budgetTarget: Number(budgetTarget),
      daysCount: Math.min(10, Math.max(1, Number(daysCount))),
      travellersCount: Number(travellersCount) || (Number(adultsCount) + Number(childrenCount)),
      adultsCount: Number(adultsCount),
      childrenCount: Number(childrenCount),
      transportMode,
      interests: Array.isArray(interests) ? interests : [interests],
      travellerType,
      foodPreference: foodPreference === 'veg' || foodPreference === 'non_veg' || foodPreference === 'both' ? foodPreference : undefined,
    };

    const trip = RecommendationEngine.generateTrip(input, false);

    // Track analytics event
    dbManager.run(
      'INSERT INTO analytics_events (event_type, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?)',
      ['TRIP_GENERATED', 'CITY', cityId, JSON.stringify({ days: input.daysCount, budget: input.budgetTarget })]
    );

    res.json({ success: true, trip });
  } catch (err: any) {
    console.error('Trip generation error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to generate trip itinerary' });
  }
};

export const optimizeTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      cityId,
      budgetTarget,
      daysCount,
      travellersCount,
      adultsCount,
      childrenCount,
      transportMode,
      interests,
      travellerType,
      foodPreference,
    } = req.body;

    const input: PlanTripInput = {
      cityId: Number(cityId),
      budgetTarget: Number(budgetTarget),
      daysCount: Math.min(10, Math.max(1, Number(daysCount) || 1)),
      travellersCount: Number(travellersCount) || (Number(adultsCount || 0) + Number(childrenCount || 0)) || 1,
      adultsCount: Number(adultsCount) || Number(travellersCount) || 1,
      childrenCount: Number(childrenCount) || 0,
      transportMode: transportMode || 'Taxi',
      interests: Array.isArray(interests) ? interests : [interests || 'Heritage'],
      travellerType: travellerType || 'Couple',
      foodPreference: foodPreference === 'veg' || foodPreference === 'non_veg' || foodPreference === 'both' ? foodPreference : undefined,
    };

    const trip = RecommendationEngine.generateTrip(input, true);
    res.json({ success: true, trip });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to optimize trip' });
  }
};

export const saveTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to save trips' });
      return;
    }

    const trip = req.body.trip || req.body.tripData;
    if (!trip || !trip.city?.id) {
      res.status(400).json({ success: false, message: 'Invalid trip data' });
      return;
    }

    const result = dbManager.run(
      `INSERT INTO trips (
        user_id, title, destination_city_id, days_count, budget_target, estimated_total_cost,
        travellers_count, transport_mode, interests_json, traveller_type, route_summary_json,
        budget_breakdown_json, is_saved
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        req.user.id,
        trip.title,
        trip.city.id,
        trip.daysCount,
        trip.budget.budgetTarget,
        trip.budget.estimatedTotalCost,
        trip.travellersCount,
        trip.transportMode,
        JSON.stringify(trip.interests),
        trip.travellerType,
        JSON.stringify(trip.routeSummary),
        JSON.stringify(trip.budget),
      ]
    );

    const tripId = result.lastInsertRowid;

    for (const day of trip.days) {
      const dayRes = dbManager.run(
        'INSERT INTO trip_days (trip_id, day_number, day_title, notes) VALUES (?, ?, ?, ?)',
        [tripId, day.dayNumber, day.dayTitle, day.notes]
      );
      const dayId = dayRes.lastInsertRowid;

      for (const stop of day.stops) {
        dbManager.run(
          `INSERT INTO trip_stops (
            trip_day_id, stop_order, stop_type, entity_type, entity_id, custom_title,
            image_url, description, start_time, duration_hours, estimated_cost,
            travel_distance_km, travel_time_mins, transport_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            dayId,
            stop.stopOrder,
            stop.stopType,
            stop.entityType || null,
            stop.entityId || null,
            stop.title,
            stop.imageUrl || '',
            stop.description || '',
            stop.startTime,
            stop.durationHours,
            stop.estimatedCost,
            stop.distanceKm,
            stop.travelTimeMins,
            stop.transportNotes,
          ]
        );
      }
    }

    // Notification
    dbManager.run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        'Trip Saved to Portfolio!',
        `Your personalized trip "${trip.title}" has been saved.`,
        'TRIP',
        `/trip/${tripId}`,
      ]
    );

    res.status(201).json({ success: true, message: 'Trip saved successfully!', tripId });
  } catch (err: any) {
    console.error('Save trip error:', err);
    res.status(500).json({ success: false, message: 'Failed to save trip' });
  }
};

export const getUserTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const trips = dbManager.query(
      `SELECT t.*, c.name as city_name, c.cover_image as city_cover
       FROM trips t
       JOIN cities c ON c.id = t.destination_city_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC`,
      [req.user.id]
    ).map((t) => ({
      ...t,
      interests: JSON.parse(t.interests_json || '[]'),
      route_summary: JSON.parse(t.route_summary_json || '{}'),
      budget_breakdown: JSON.parse(t.budget_breakdown_json || '{}'),
    }));

    res.json({ success: true, count: trips.length, data: trips });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch user trips' });
  }
};

export const getTripById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const trip = dbManager.queryOne<any>(
      `SELECT t.*, c.name as city_name, c.description as city_description, c.cover_image as city_cover
       FROM trips t
       JOIN cities c ON c.id = t.destination_city_id
       WHERE t.id = ?`,
      [id]
    );

    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }

    const days = dbManager.query(
      'SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number ASC',
      [trip.id]
    );

    for (const day of days) {
      day.dayNumber = day.day_number;
      day.dayTitle = day.day_title;
      const rawStops = dbManager.query(
        'SELECT * FROM trip_stops WHERE trip_day_id = ? ORDER BY stop_order ASC',
        [day.id]
      );
      day.stops = rawStops.map((s: any) => ({
        ...s,
        stopOrder: s.stop_order,
        stopType: s.stop_type,
        entityType: s.entity_type,
        entityId: s.entity_id,
        title: s.custom_title,
        imageUrl: s.image_url,
        description: s.description || '',
        startTime: s.start_time,
        durationHours: s.duration_hours,
        estimatedCost: s.estimated_cost,
        distanceKm: s.travel_distance_km,
        travelTimeMins: s.travel_time_mins,
        transportNotes: s.transport_notes,
      }));
    }

    trip.days = days;
    trip.interests = JSON.parse(trip.interests_json || '[]');
    trip.routeSummary = JSON.parse(trip.route_summary_json || '{}');
    trip.budget = JSON.parse(trip.budget_breakdown_json || '{}');
    trip.durationDays = trip.days_count;
    trip.totalEstimatedCost = trip.estimated_total_cost;
    trip.travelCompanion = trip.traveller_type;
    trip.transportMode = trip.transport_mode;
    trip.city = {
      id: trip.destination_city_id,
      name: trip.city_name,
      description: trip.city_description,
      coverImage: trip.city_cover,
    };

    res.json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch trip details' });
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    dbManager.run('DELETE FROM trips WHERE id = ? AND user_id = ?', [id, req.user.id]);
    res.json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete trip' });
  }
};
