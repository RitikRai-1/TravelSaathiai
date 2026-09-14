import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  MapPin,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  ExternalLink,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../../components/common/SafeImage';

export const AdminCitiesPage: React.FC = () => {
  const [cities, setCities] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any | null>(null);
  const [formName, setFormName] = useState('');
  const [formStateId, setFormStateId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formLat, setFormLat] = useState('28.6139');
  const [formLng, setFormLng] = useState('77.2090');
  const [formFeatured, setFormFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [citiesRes, statesRes] = await Promise.all([
        api.getAdminCities(),
        api.getStates(),
      ]);
      if (citiesRes.success && citiesRes.data) setCities(citiesRes.data);
      if (statesRes.success && statesRes.data) setStates(statesRes.data);
    } catch (err: any) {
      alert(err.message || 'Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingCity(null);
    setFormName('');
    setFormStateId(states[0]?.id?.toString() || '1');
    setFormDescription('');
    setFormImage('https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80');
    setFormLat('28.6139');
    setFormLng('77.2090');
    setFormFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (city: any) => {
    setEditingCity(city);
    setFormName(city.name);
    setFormStateId(city.state_id?.toString());
    setFormDescription(city.description || '');
    setFormImage(city.cover_image || '');
    setFormLat(city.latitude?.toString() || '28.6139');
    setFormLng(city.longitude?.toString() || '77.2090');
    setFormFeatured(Boolean(city.is_featured));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formStateId) {
      alert('City name and state are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName,
        state_id: Number(formStateId),
        description: formDescription,
        cover_image: formImage,
        latitude: parseFloat(formLat) || 28.6139,
        longitude: parseFloat(formLng) || 77.2090,
        is_featured: formFeatured ? 1 : 0,
        is_published: 1,
      };

      if (editingCity) {
        await api.updateAdminCity(editingCity.id, payload);
      } else {
        await api.createAdminCity(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleFeature = async (city: any) => {
    try {
      await api.updateAdminCity(city.id, {
        is_featured: city.is_featured ? 0 : 1,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle feature status');
    }
  };

  const handleTogglePublish = async (city: any) => {
    try {
      await api.updateAdminCity(city.id, {
        is_published: city.is_published ? 0 : 1,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publish status');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This will remove all associated tourist places.`)) {
      return;
    }
    try {
      await api.deleteAdminCity(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete city');
    }
  };

  const filteredCities = cities.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.state_name?.toLowerCase().includes(search.toLowerCase());
    const matchesState = selectedState ? c.state_id.toString() === selectedState : true;
    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Destinations & Cities CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage official tourist destinations, geo-coordinates, and publication visibility
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add New City
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by city or state..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center space-x-3">
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All States ({states.length})</option>
            {states.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Showing <strong>{filteredCities.length}</strong> cities
          </span>
        </div>
      </div>

      {/* Mobile Cities Cards (<= 767px) */}
      <div className="block md:hidden space-y-3">
        {filteredCities.map((city) => (
          <div key={city.id} className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <SafeImage
                src={city.cover_image}
                alt={city.name}
                className="w-14 h-14 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                category="city"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base truncate">{city.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold text-[10px]">
                    {city.place_count || 0} spots
                  </span>
                </div>
                <p className="text-xs text-slate-400">{city.state_name}</p>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{city.description}</p>
              </div>
            </div>

            {/* Badges row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleFeature(city)}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition min-h-[32px] ${
                    city.is_featured
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Star className={`w-3 h-3 ${city.is_featured ? 'fill-amber-400' : ''}`} />
                  <span>{city.is_featured ? 'Featured' : 'Standard'}</span>
                </button>

                <button
                  onClick={() => handleTogglePublish(city)}
                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition min-h-[32px] ${
                    city.is_published
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {city.is_published ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>Live</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      <span>Draft</span>
                    </>
                  )}
                </button>
              </div>

              {/* Action icons */}
              <div className="flex items-center gap-1">
                <Link
                  to={`/city/${city.id}`}
                  target="_blank"
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="View Public City Page"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => openEditModal(city)}
                  className="p-2 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Edit City"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(city.id, city.name)}
                  className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title="Delete City"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Cities Table (>= 768px) - 100% Preserved */}
      <div className="hidden md:block bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">City / Cover</th>
                <th className="py-3.5 px-4">State</th>
                <th className="py-3.5 px-4">Monuments</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Published</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCities.map((city) => (
                <tr key={city.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <SafeImage
                        src={city.cover_image}
                        alt={city.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                        category="city"
                      />
                      <div>
                        <div className="font-bold text-white text-sm">{city.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                          {city.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-300">
                    {city.state_name}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-bold text-[11px]">
                      {city.place_count || 0} spots
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleFeature(city)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        city.is_featured
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Star className={`w-3 h-3 ${city.is_featured ? 'fill-amber-400' : ''}`} />
                      <span>{city.is_featured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePublish(city)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        city.is_published
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {city.is_published ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          <span>Published</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Draft</span>
                        </>
                      )}
                    </button>
                  </td>

                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      to={`/city/${city.id}`}
                      target="_blank"
                      className="p-1.5 inline-block text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="View Public City Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => openEditModal(city)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition"
                      title="Edit City"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(city.id, city.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete City"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-heading">
                {editingCity ? `Edit Destination: ${editingCity.name}` : 'Add New Indian Destination'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    City Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. Udaipur"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    State / UT
                  </label>
                  <select
                    value={formStateId}
                    onChange={(e) => setFormStateId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Tourism Summary & Description
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the cultural importance, heritage, and vibe..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    placeholder="28.6139"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    placeholder="77.2090"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0"
                />
                <label htmlFor="featuredCheck" className="text-slate-300 font-semibold cursor-pointer">
                  Feature on Homepage Carousel & Recommendations
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold transition shadow-md shadow-amber-500/20"
                >
                  {submitting ? 'Saving...' : editingCity ? 'Update City' : 'Create City'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
