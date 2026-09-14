import { Response } from 'express';
import { dbManager } from '../db/database';
import { AuthRequest } from '../middleware/auth';

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Please log in to save favorites' });
      return;
    }

    const { entity_type, entity_id } = req.body;

    if (!entity_type || !entity_id) {
      res.status(400).json({ success: false, message: 'entity_type and entity_id are required' });
      return;
    }

    const existing = dbManager.queryOne<any>(
      'SELECT id FROM favorites WHERE user_id = ? AND entity_type = ? AND entity_id = ?',
      [req.user.id, entity_type, entity_id]
    );

    if (existing) {
      dbManager.run('DELETE FROM favorites WHERE id = ?', [existing.id]);
      res.json({ success: true, isFavorited: false, message: 'Removed from saved collection' });
    } else {
      dbManager.run(
        'INSERT INTO favorites (user_id, entity_type, entity_id) VALUES (?, ?, ?)',
        [req.user.id, entity_type, entity_id]
      );
      res.json({ success: true, isFavorited: true, message: 'Saved to your collection!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update favorite' });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const favs = dbManager.query<any>(
      'SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const places: any[] = [];
    const hotels: any[] = [];
    const restaurants: any[] = [];
    const taxis: any[] = [];
    const cities: any[] = [];

    for (const f of favs) {
      if (f.entity_type === 'PLACE') {
        const p = dbManager.queryOne<any>('SELECT * FROM tourist_places WHERE id = ?', [f.entity_id]);
        if (p) {
          places.push({
            ...p,
            photos: JSON.parse(p.photos_json || '[]'),
          });
        }
      } else if (f.entity_type === 'HOTEL') {
        const h = dbManager.queryOne<any>('SELECT * FROM hotels WHERE id = ?', [f.entity_id]);
        if (h) {
          hotels.push({
            ...h,
            photos: JSON.parse(h.photos_json || '[]'),
            facilities: JSON.parse(h.facilities_json || '[]'),
          });
        }
      } else if (f.entity_type === 'RESTAURANT') {
        const r = dbManager.queryOne<any>('SELECT * FROM restaurants WHERE id = ?', [f.entity_id]);
        if (r) {
          restaurants.push({
            ...r,
            photos: JSON.parse(r.photos_json || '[]'),
            popular_dishes: JSON.parse(r.popular_dishes_json || '[]'),
            facilities: JSON.parse(r.facilities_json || '[]'),
          });
        }
      } else if (f.entity_type === 'TAXI') {
        const t = dbManager.queryOne<any>('SELECT * FROM taxi_services WHERE id = ?', [f.entity_id]);
        if (t) {
          taxis.push({
            ...t,
            vehicle_photos: JSON.parse(t.vehicle_photos_json || '[]'),
          });
        }
      } else if (f.entity_type === 'CITY') {
        const c = dbManager.queryOne<any>('SELECT * FROM cities WHERE id = ?', [f.entity_id]);
        if (c) cities.push(c);
      }
    }

    res.json({
      success: true,
      data: {
        places,
        hotels,
        restaurants,
        taxis,
        cities,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve favorites' });
  }
};
