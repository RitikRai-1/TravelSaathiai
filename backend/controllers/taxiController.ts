import { Request, Response } from 'express';
import { dbManager } from '../db/database';
import { AuthRequest } from '../middleware/auth';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export const getTaxis = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city_id, vehicle_type, availability, search } = req.query;

    let sql = `
      SELECT t.*, c.name as city_name, s.name as state_name
      FROM taxi_services t
      JOIN cities c ON c.id = t.city_id
      JOIN states s ON s.id = c.state_id
      WHERE t.approval_status = 'APPROVED' AND t.is_published = 1
    `;
    const params: any[] = [];

    if (city_id) {
      sql += ' AND t.city_id = ?';
      params.push(city_id);
    }

    if (vehicle_type) {
      sql += ' AND t.vehicle_type = ?';
      params.push(vehicle_type);
    }

    if (availability) {
      sql += ' AND t.availability_status = ?';
      params.push(availability);
    }

    if (search) {
      sql += ' AND (t.service_name LIKE ? OR t.driver_name LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY t.is_featured DESC, t.rating DESC';

    const taxis = dbManager.query(sql, params).map((t) => ({
      ...t,
      vehicle_photos: JSON.parse(t.vehicle_photos_json || '[]'),
    }));

    res.json({ success: true, count: taxis.length, data: taxis });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch taxi services' });
  }
};

export const getTaxiById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const taxi = dbManager.queryOne<any>(
      `SELECT t.*, c.name as city_name, s.name as state_name, u.name as owner_name
       FROM taxi_services t
       JOIN cities c ON c.id = t.city_id
       JOIN states s ON s.id = c.state_id
       LEFT JOIN users u ON u.id = t.owner_id
       WHERE t.id = ? AND t.approval_status = 'APPROVED' AND t.is_published = 1`,
      [id]
    );

    if (!taxi) {
      res.status(404).json({ success: false, message: 'Taxi service not found or pending approval' });
      return;
    }

    taxi.vehicle_photos = JSON.parse(taxi.vehicle_photos_json || '[]');

    const reviews = dbManager.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.entity_type = 'TAXI' AND r.entity_id = ? AND r.is_moderated = 1
       ORDER BY r.created_at DESC`,
      [taxi.id]
    );

    res.json({ success: true, data: { taxi, reviews } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch taxi details' });
  }
};

export const getTaxiNearMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, city_name, vehicle_type, sort = 'nearest' } = req.query;

    let targetLat = lat ? Number(lat) : 28.6139; // Delhi default if none
    let targetLng = lng ? Number(lng) : 77.2090;

    // If manual city specified
    if (city_name) {
      const city = dbManager.queryOne<any>(
        'SELECT latitude, longitude FROM cities WHERE name LIKE ? LIMIT 1',
        [`%${city_name}%`]
      );
      if (city && city.latitude) {
        targetLat = city.latitude;
        targetLng = city.longitude;
      }
    }

    let sql = `
      SELECT t.*, c.name as city_name, c.latitude as city_lat, c.longitude as city_lng
      FROM taxi_services t
      JOIN cities c ON c.id = t.city_id
      WHERE t.approval_status = 'APPROVED' AND t.is_published = 1
    `;
    const params: any[] = [];

    if (vehicle_type) {
      sql += ' AND t.vehicle_type = ?';
      params.push(vehicle_type);
    }

    const taxis = dbManager.query(sql, params).map((t) => {
      const taxiLat = t.latitude || t.city_lat || targetLat + 0.02;
      const taxiLng = t.longitude || t.city_lng || targetLng + 0.02;
      const distanceKm = haversineDistance(targetLat, targetLng, taxiLat, taxiLng);

      return {
        ...t,
        distanceKm,
        estimatedArrivalTimeMins: Math.max(3, Math.round(distanceKm * 2.5)),
        vehicle_photos: JSON.parse(t.vehicle_photos_json || '[]'),
      };
    });

    if (sort === 'nearest') {
      taxis.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === 'cheapest') {
      taxis.sort((a, b) => a.base_fare - b.base_fare);
    } else if (sort === 'rating') {
      taxis.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      count: taxis.length,
      currentLocation: { lat: targetLat, lng: targetLng, label: city_name || 'Current Geolocation' },
      isEstimatedData: true,
      data: taxis,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to search nearby taxis' });
  }
};

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to book a taxi' });
      return;
    }

    const {
      taxi_service_id,
      pickup_address,
      drop_address,
      pickup_date,
      pickup_time,
      passengers = 1,
      estimated_distance_km = 12,
      notes = '',
    } = req.body;

    if (!taxi_service_id || !pickup_address || !drop_address || !pickup_date || !pickup_time) {
      res.status(400).json({ success: false, message: 'Please fill all required booking details' });
      return;
    }

    const taxi = dbManager.queryOne<any>('SELECT * FROM taxi_services WHERE id = ?', [taxi_service_id]);
    if (!taxi) {
      res.status(404).json({ success: false, message: 'Taxi service not found' });
      return;
    }

    const fare = Math.round(taxi.base_fare + Number(estimated_distance_km) * taxi.per_km_fare);
    const bookingReference = `TS-BK-${Math.floor(100000 + Math.random() * 900000)}`;

    const resDb = dbManager.run(
      `INSERT INTO taxi_bookings (
        booking_reference, customer_id, taxi_service_id, pickup_address, drop_address,
        pickup_date, pickup_time, passengers, vehicle_type, estimated_fare, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingReference,
        req.user.id,
        taxi.id,
        pickup_address,
        drop_address,
        pickup_date,
        pickup_time,
        passengers,
        taxi.vehicle_type,
        fare,
        'PENDING',
        notes,
      ]
    );

    // Notify Customer
    dbManager.run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        'Taxi Booking Requested',
        `Booking ${bookingReference} for ${taxi.service_name} is currently PENDING driver confirmation.`,
        'BOOKING',
        '/dashboard',
      ]
    );

    // Notify Owner if owner exists
    if (taxi.owner_id) {
      dbManager.run(
        'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
        [
          taxi.owner_id,
          'New Taxi Ride Request!',
          `New ride request ${bookingReference} from ${pickup_address} to ${drop_address}.`,
          'BOOKING',
          '/business/dashboard',
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully!',
      booking: {
        id: resDb.lastInsertRowid,
        booking_reference: bookingReference,
        estimated_fare: fare,
        status: 'PENDING',
      },
    });
  } catch (err: any) {
    console.error('Booking error:', err);
    res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
};

export const getMyBookings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const bookings = dbManager.query(
      `SELECT b.*,
              b.pickup_address as pickup_location,
              b.drop_address as drop_location,
              b.pickup_date as travel_date,
              b.estimated_fare as total_fare,
              b.passengers as passengers_count,
              t.service_name, t.driver_name, t.phone as driver_phone, t.vehicle_type as taxi_type,
              c.name as city_name
       FROM taxi_bookings b
       JOIN taxi_services t ON t.id = b.taxi_service_id
       JOIN cities c ON c.id = t.city_id
       WHERE b.customer_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    let { status } = req.body;

    // Normalize CONFIRMED to ACCEPTED
    if (status === 'CONFIRMED') {
      status = 'ACCEPTED';
    }

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const booking = dbManager.queryOne<any>('SELECT * FROM taxi_bookings WHERE id = ?', [id]);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    dbManager.run('UPDATE taxi_bookings SET status = ? WHERE id = ?', [status, id]);

    // Send customer notification
    dbManager.run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        booking.customer_id,
        `Taxi Booking ${status}`,
        `Your taxi booking ${booking.booking_reference} has been marked as ${status}.`,
        'BOOKING',
        '/profile?tab=bookings',
      ]
    );

    res.json({ success: true, message: `Booking status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update booking status' });
  }
};
