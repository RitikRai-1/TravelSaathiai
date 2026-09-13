import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { BookmarkCheck, Star, MapPin, Compass, ArrowRight, Heart } from 'lucide-react';
import { SafeImage } from '../../components/common/SafeImage';

export const SavedPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any>({ places: [], hotels: [], restaurants: [], taxis: [], cities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getFavorites()
      .then((res) => {
        if (res.success && res.data) setFavorites(res.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <BookmarkCheck className="w-16 h-16 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900 font-heading">Sign In to View Saved Items</h2>
        <p className="text-xs text-slate-500">Save tourist destinations, hotels, and restaurants to your personal portfolio.</p>
        <Link to="/login" className="inline-block px-6 py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-sm font-semibold">
          Log In
        </Link>
      </div>
    );
  }

  const totalCount =
    (favorites.places?.length || 0) +
    (favorites.hotels?.length || 0) +
    (favorites.restaurants?.length || 0) +
    (favorites.taxis?.length || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#1B5E20] text-xs font-semibold mb-2">
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Personal Travel Collection</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 font-heading">Saved Items ({totalCount})</h1>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading saved collection...</div>
      ) : totalCount === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Heart className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 font-heading">Your collection is empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click the heart icon on any monument, hotel, or restaurant while exploring to add it to your travel bucket list.
          </p>
          <Link to="/explore" className="inline-block px-5 py-2.5 bg-[#1B5E20] hover:bg-[#154a19] text-white rounded-xl text-xs font-bold mt-2">
            Explore Destinations
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Saved Places */}
          {favorites.places?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Saved Tourist Places ({favorites.places.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.places.map((p: any) => (
                  <Link
                    key={p.id}
                    to={`/places/${p.slug || p.id}`}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs card-hover flex flex-col justify-between"
                  >
                    <div className="relative h-44">
                      <SafeImage src={p.cover_image} alt={p.name} className="w-full h-full object-cover" category="place" />
                      <span className="absolute bottom-2 right-2 bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-md flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{p.rating}</span>
                      </span>
                    </div>
                    <div className="p-4 space-y-1">
                      <span className="text-[10px] text-[#1B5E20] font-bold uppercase">{p.category}</span>
                      <h4 className="font-bold text-sm text-slate-900 font-heading">{p.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{p.address}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Saved Hotels */}
          {favorites.hotels?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Saved Hotels ({favorites.hotels.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.hotels.map((h: any) => (
                  <Link
                    key={h.id}
                    to={`/hotels/${h.id}`}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs card-hover p-4 space-y-2"
                  >
                    <h4 className="font-bold text-sm text-slate-900 font-heading">{h.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{h.address}</p>
                    <div className="flex justify-between items-center text-xs pt-2">
                      <span className="font-bold text-[#1B5E20]">₹{h.price_per_night} / night</span>
                      <span className="text-slate-400">View Property →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
