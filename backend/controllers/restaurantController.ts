import { Request, Response } from 'express';
import { dbManager } from '../db/database';

export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { city_id, cuisine, food_type, max_cost, min_rating, search, featured } = req.query;

    let sql = `
      SELECT r.*, c.name as city_name, s.name as state_name
      FROM restaurants r
      JOIN cities c ON c.id = r.city_id
      JOIN states s ON s.id = c.state_id
      WHERE r.approval_status = 'APPROVED' AND r.is_published = 1
    `;
    const params: any[] = [];

    if (city_id) {
      sql += ' AND r.city_id = ?';
      params.push(city_id);
    }

    if (food_type) {
      if (food_type === 'veg' || food_type === 'pure_veg') {
        sql += " AND r.food_type = 'veg'";
      } else if (food_type === 'non_veg') {
        sql += " AND (r.food_type = 'non_veg' OR r.food_type = 'both')";
      } else if (food_type !== 'all') {
        sql += ' AND r.food_type = ?';
        params.push(food_type);
      }
    }

    if (cuisine) {
      sql += ' AND r.cuisine LIKE ?';
      params.push(`%${cuisine}%`);
    }

    if (max_cost) {
      sql += ' AND r.avg_cost_for_two <= ?';
      params.push(Number(max_cost));
    }

    if (min_rating) {
      sql += ' AND r.rating >= ?';
      params.push(Number(min_rating));
    }

    if (featured === 'true' || featured === '1') {
      sql += ' AND r.is_featured = 1';
    }

    if (search) {
      sql += ' AND (r.name LIKE ? OR r.description LIKE ? OR r.cuisine LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY r.is_featured DESC, r.rating DESC';

    const restaurants = dbManager.query(sql, params).map((r) => ({
      ...r,
      photos: JSON.parse(r.photos_json || '[]'),
      popular_dishes: JSON.parse(r.popular_dishes_json || '[]'),
      facilities: JSON.parse(r.facilities_json || '[]'),
    }));

    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch restaurants' });
  }
};

export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const restaurant = dbManager.queryOne<any>(
      `SELECT r.*, c.name as city_name, s.name as state_name, u.name as owner_name
       FROM restaurants r
       JOIN cities c ON c.id = r.city_id
       JOIN states s ON s.id = c.state_id
       LEFT JOIN users u ON u.id = r.owner_id
       WHERE r.id = ? AND r.approval_status = 'APPROVED' AND r.is_published = 1`,
      [id]
    );

    if (!restaurant) {
      res.status(404).json({ success: false, message: 'Restaurant not found or pending approval' });
      return;
    }

    dbManager.run('UPDATE restaurants SET views_count = views_count + 1 WHERE id = ?', [restaurant.id]);

    restaurant.photos = JSON.parse(restaurant.photos_json || '[]');
    restaurant.popular_dishes = JSON.parse(restaurant.popular_dishes_json || '[]');
    restaurant.facilities = JSON.parse(restaurant.facilities_json || '[]');

    const menuItems = dbManager.query(
      'SELECT * FROM menu_items WHERE restaurant_id = ? ORDER BY category, price ASC',
      [restaurant.id]
    );

    const reviews = dbManager.query(
      `SELECT r.*, u.name as user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.entity_type = 'RESTAURANT' AND r.entity_id = ? AND r.is_moderated = 1
       ORDER BY r.created_at DESC`,
      [restaurant.id]
    );

    const nearbyPlaces = dbManager.query(
      'SELECT id, name, category, rating, entry_fee, cover_image, address FROM tourist_places WHERE city_id = ? AND is_published = 1 LIMIT 4',
      [restaurant.city_id]
    );

    res.json({ success: true, data: { restaurant, menuItems, reviews, nearbyPlaces } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch restaurant details' });
  }
};
