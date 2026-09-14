import { Response } from 'express';
import { dbManager } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export const registerBusiness = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { business_type, name, city_id, description, address, phone, email, price, vehicle_type, cuisine, facilities } = req.body;

    if (!business_type || !name || !city_id) {
      res.status(400).json({ success: false, message: 'Business type, name and city are required' });
      return;
    }

    // Upgrade user role to BUSINESS_OWNER if not already
    if (req.user.role === 'TOURIST') {
      dbManager.run('UPDATE users SET role = "BUSINESS_OWNER" WHERE id = ?', [req.user.id]);
    }

    let insertRes;
    if (business_type === 'HOTEL') {
      insertRes = dbManager.run(
        `INSERT INTO hotels (
          owner_id, city_id, name, description, photos_json, address, price_per_night,
          facilities_json, phone, email, approval_status, is_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0)`,
        [
          req.user.id,
          city_id,
          name,
          description || '',
          JSON.stringify(['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80']),
          address || '',
          Number(price) || 2500,
          JSON.stringify(facilities || ['Free Wi-Fi', 'AC']),
          phone || '',
          email || '',
        ]
      );
    } else if (business_type === 'RESTAURANT') {
      insertRes = dbManager.run(
        `INSERT INTO restaurants (
          owner_id, city_id, name, description, photos_json, cuisine,
          avg_cost_for_two, facilities_json, phone, email, approval_status, is_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0)`,
        [
          req.user.id,
          city_id,
          name,
          description || '',
          JSON.stringify(['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80']),
          cuisine || 'Multi-cuisine',
          Number(price) || 600,
          JSON.stringify(facilities || ['Takeaway', 'AC']),
          phone || '',
          email || '',
        ]
      );
    } else if (business_type === 'TAXI') {
      insertRes = dbManager.run(
        `INSERT INTO taxi_services (
          owner_id, city_id, service_name, driver_name, phone, vehicle_type,
          base_fare, per_km_fare, approval_status, is_published
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0)`,
        [
          req.user.id,
          city_id,
          name,
          req.user.name,
          phone || '',
          vehicle_type || 'Sedan',
          Number(price) || 150,
          14,
        ]
      );
    }

    // Send confirmation notification
    dbManager.run(
      'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        'Business Application Submitted',
        `Your application for ${name} (${business_type}) has been submitted and is currently PENDING Super Admin review.`,
        'BUSINESS',
        '/business/dashboard',
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Business profile submitted successfully! It is currently pending moderation.',
      businessId: insertRes?.lastInsertRowid,
    });
  } catch (err) {
    console.error('Register business error:', err);
    res.status(500).json({ success: false, message: 'Failed to register business profile' });
  }
};

export const getBusinessDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const hotels = dbManager.query('SELECT * FROM hotels WHERE owner_id = ?', [req.user.id]).map((h) => ({
      ...h,
      photos: JSON.parse(h.photos_json || '[]'),
      facilities: JSON.parse(h.facilities_json || '[]'),
    }));

    const restaurants = dbManager.query('SELECT * FROM restaurants WHERE owner_id = ?', [req.user.id]).map((r) => ({
      ...r,
      photos: JSON.parse(r.photos_json || '[]'),
      popular_dishes: JSON.parse(r.popular_dishes_json || '[]'),
    }));

    const taxis = dbManager.query('SELECT * FROM taxi_services WHERE owner_id = ?', [req.user.id]).map((t) => ({
      ...t,
      vehicle_photos: JSON.parse(t.vehicle_photos_json || '[]'),
    }));

    // Bookings for any taxi owned by this user
    const taxiIds = taxis.map((t) => t.id);
    let bookings: any[] = [];
    if (taxiIds.length > 0) {
      const placeholders = taxiIds.map(() => '?').join(',');
      bookings = dbManager.query(
        `SELECT b.*,
                b.pickup_address as pickup_location,
                b.drop_address as drop_location,
                b.estimated_fare as fare_estimate,
                b.status as booking_status,
                u.name as customer_name, u.email as customer_email, t.service_name
         FROM taxi_bookings b
         LEFT JOIN users u ON u.id = b.customer_id
         JOIN taxi_services t ON t.id = b.taxi_service_id
         WHERE b.taxi_service_id IN (${placeholders})
         ORDER BY b.created_at DESC`,
        taxiIds
      );
    }

    res.json({
      success: true,
      data: {
        hotels,
        restaurants,
        taxis,
        bookings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load business dashboard' });
  }
};

export const updateBusinessProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { type, id } = req.params;
    const { name, description, address, phone, email, price, cuisine, facilities, vehicle_type, popular_dishes, driver_name, per_km_fare } = req.body;

    if (type === 'HOTEL') {
      dbManager.run(
        `UPDATE hotels SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          price_per_night = COALESCE(?, price_per_night),
          facilities_json = COALESCE(?, facilities_json)
         WHERE id = ? AND (owner_id = ? OR ? = 'SUPER_ADMIN')`,
        [name, description, address, phone, email, price ? Number(price) : null, facilities ? JSON.stringify(facilities) : null, id, req.user.id, req.user.role]
      );
    } else if (type === 'RESTAURANT') {
      dbManager.run(
        `UPDATE restaurants SET
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          email = COALESCE(?, email),
          cuisine = COALESCE(?, cuisine),
          avg_cost_for_two = COALESCE(?, avg_cost_for_two),
          facilities_json = COALESCE(?, facilities_json),
          popular_dishes_json = COALESCE(?, popular_dishes_json)
         WHERE id = ? AND (owner_id = ? OR ? = 'SUPER_ADMIN')`,
        [name, description, address, phone, email, cuisine, price ? Number(price) : null, facilities ? JSON.stringify(facilities) : null, popular_dishes ? JSON.stringify(popular_dishes) : null, id, req.user.id, req.user.role]
      );
    } else if (type === 'TAXI') {
      dbManager.run(
        `UPDATE taxi_services SET
          service_name = COALESCE(?, service_name),
          driver_name = COALESCE(?, driver_name),
          phone = COALESCE(?, phone),
          vehicle_type = COALESCE(?, vehicle_type),
          base_fare = COALESCE(?, base_fare),
          per_km_fare = COALESCE(?, per_km_fare)
         WHERE id = ? AND (owner_id = ? OR ? = 'SUPER_ADMIN')`,
        [name, driver_name, phone, vehicle_type, price ? Number(price) : null, per_km_fare ? Number(per_km_fare) : null, id, req.user.id, req.user.role]
      );
    }

    res.json({ success: true, message: 'Business profile updated successfully' });
  } catch (err) {
    console.error('Update business profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update business profile' });
  }
};
