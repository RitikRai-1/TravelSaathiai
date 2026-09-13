import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Eye,
  Plus,
  Search,
  Trash2,
  MapPin,
  Clock,
  Navigation,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';
import { SafeImage } from '../../components/common/SafeImage';

export const AdminHiddenGemsPage: React.FC = () => {
  const [gems, setGems] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCityId, setFormCityId] = useState('');
  const [formCategory, setFormCategory] = useState('Nature');
  const [formDescription, setFormDescription] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formBestTime, setFormBestTime] = useState('Sunrise & Early Morning');
  const [formDuration, setFormDuration] = useState('2');
  const [formEntryFee, setFormEntryFee] = useState('0');
  const [formDistanceKm, setFormDistanceKm] = useState('15');
  const [formRouteInfo, setFormRouteInfo] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Nature',
    'Heritage',
    'Spiritual',
    'Wildlife',
    'Adventure',
    'Photography',
    'Culture',
    'Scenic',
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [gemsRes, citiesRes] = await Promise.all([
        api.getAdminHiddenGems(),
        api.getCities(),
      ]);
      if (gemsRes.success && gemsRes.data) setGems(gemsRes.data);
      if (citiesRes.success && citiesRes.data) setCities(citiesRes.data);
    } catch (err: any) {
      alert(err.message || 'Failed to load hidden gems');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setFormName('');
    setFormCityId(cities[0]?.id?.toString() || '1');
    setFormCategory('Nature');
    setFormDescription('');
    setFormLocation('');
    setFormBestTime('Sunrise & Early Morning');
    setFormDuration('2');
    setFormEntryFee('0');
    setFormDistanceKm('15');
    setFormRouteInfo('Follow local state highway, short 10-minute trek from parking.');
    setFormPhoto('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCityId) {
      alert('Gem title and operating city are required');
      return;
    }

    setSubmitting(true);
    try {
      await api.createAdminHiddenGem({
        city_id: Number(formCityId),
        name: formName,
        description: formDescription,
        category: formCategory,
        location: formLocation,
        best_time: formBestTime,
        duration_hours: Number(formDuration),
        entry_fee: Number(formEntryFee),
        distance_from_city_km: Number(formDistanceKm),
        route_info: formRouteInfo,
        photos: formPhoto ? [formPhoto] : [],
      });
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save hidden gem');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete secret gem "${name}"?`)) return;
    try {
      await api.deleteAdminHiddenGem(id);
      setGems((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete gem');
    }
  };

  const filteredGems = gems.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description?.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = !selectedCity || g.city_id === Number(selectedCity);
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">Hidden Gems Curations</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage off-the-beaten-track secret spots, hiking trails, and undiscovered heritage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Add Hidden Gem</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search gems by name, theme, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full md:w-56 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
        >
          <option value="">All Operating Cities ({cities.length})</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Gems Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading hidden gems portfolio...</div>
      ) : filteredGems.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 rounded-3xl border border-slate-800">
          <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-400">No secret gems found matching filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGems.map((gem) => {
            const photos = Array.isArray(gem.photos) ? gem.photos : [];
            const photoUrl = photos[0] || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
            return (
              <div
                key={gem.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="relative h-44 w-full">
                    <SafeImage src={photoUrl} alt={gem.name} className="w-full h-full object-cover" category="gem" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <span className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-500/20">
                      {gem.city_name || `City #${gem.city_id}`}
                    </span>
                    <span className="absolute top-2.5 right-2.5 bg-slate-900/80 text-slate-300 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      {gem.category}
                    </span>
                    <div className="absolute bottom-2.5 left-3 right-3 text-white">
                      <h3 className="font-bold text-base font-heading truncate">{gem.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 text-xs text-slate-400">
                    <p className="line-clamp-2 text-slate-300 text-[11px] leading-relaxed">
                      {gem.description || 'No description provided.'}
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2 text-[10px] text-slate-500 border-t border-slate-800">
                      <span className="flex items-center space-x-1">
                        <Navigation className="w-3 h-3 text-emerald-400" />
                        <span>{gem.distance_from_city_km || 0} km from city</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{gem.duration_hours || 2}h duration</span>
                      </span>
                      <span>Entry: ₹{gem.entry_fee || 0}</span>
                    </div>
                    {gem.route_info && (
                      <p className="text-[10px] text-slate-500 italic truncate">
                        Route: {gem.route_info}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">ID: #{gem.id}</span>
                  <button
                    onClick={() => handleDelete(gem.id, gem.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete Hidden Gem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Hidden Gem Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base font-heading">Add Off-the-Beaten-Track Secret Gem</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Gem Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Abhaneri Chand Baori Stepwell"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nearest City *</label>
                  <select
                    value={formCityId}
                    onChange={(e) => setFormCityId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Distance (km)</label>
                  <input
                    type="number"
                    value={formDistanceKm}
                    onChange={(e) => setFormDistanceKm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Entry Fee (₹)</label>
                  <input
                    type="number"
                    value={formEntryFee}
                    onChange={(e) => setFormEntryFee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Best Visiting Time / Season</label>
                <input
                  type="text"
                  value={formBestTime}
                  onChange={(e) => setFormBestTime(e.target.value)}
                  placeholder="e.g. October to March, early mornings"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Route & Navigation Advice</label>
                <input
                  type="text"
                  value={formRouteInfo}
                  onChange={(e) => setFormRouteInfo(e.target.value)}
                  placeholder="e.g. Take Jaipur-Agra Highway, exit at Sikandra..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe why this place is unique, peaceful, or culturally significant..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Photo Image URL</label>
                <input
                  type="url"
                  value={formPhoto}
                  onChange={(e) => setFormPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-md"
                >
                  {submitting ? 'Saving...' : 'Add to Hidden Gems'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
