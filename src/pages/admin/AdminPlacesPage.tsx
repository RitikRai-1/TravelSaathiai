import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Compass,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Sliders,
  ExternalLink,
  X,
  Sparkles,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SafeImage } from '../../components/common/SafeImage';

export const AdminPlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<any | null>(null);
  const [formName, setFormName] = useState('');
  const [formCityId, setFormCityId] = useState('');
  const [formCategory, setFormCategory] = useState('Heritage & Monuments');
  const [formDescription, setFormDescription] = useState('');
  const [formEntryFee, setFormEntryFee] = useState('50');
  const [formDuration, setFormDuration] = useState('2');
  const [formPriority, setFormPriority] = useState('80');
  const [formImage, setFormImage] = useState('');
  const [formOpening, setFormOpening] = useState('09:00 AM');
  const [formClosing, setFormClosing] = useState('06:00 PM');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Heritage & Monuments',
    'Spiritual & Temples',
    'Nature & Wildlife',
    'Forts & Palaces',
    'Beaches & Coastal',
    'Hills & Adventure',
    'Art & Culture',
    'Shopping & Bazaars',
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const [placesRes, citiesRes] = await Promise.all([
        api.getAdminPlaces(),
        api.getCities(),
      ]);
      if (placesRes.success && placesRes.data) setPlaces(placesRes.data);
      if (citiesRes.success && citiesRes.data) setCities(citiesRes.data);
    } catch (err: any) {
      alert(err.message || 'Failed to load places');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingPlace(null);
    setFormName('');
    setFormCityId(cities[0]?.id?.toString() || '1');
    setFormCategory('Heritage & Monuments');
    setFormDescription('');
    setFormEntryFee('50');
    setFormDuration('2');
    setFormPriority('85');
    setFormImage('https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80');
    setFormOpening('09:00 AM');
    setFormClosing('06:00 PM');
    setIsModalOpen(true);
  };

  const openEditModal = (place: any) => {
    setEditingPlace(place);
    setFormName(place.name);
    setFormCityId(place.city_id?.toString());
    setFormCategory(place.category);
    setFormDescription(place.description || '');
    setFormEntryFee(place.entry_fee?.toString() || '0');
    setFormDuration(place.ideal_duration_hours?.toString() || '2');
    setFormPriority(place.ai_priority?.toString() || '50');
    setFormImage(place.gallery?.[0] || '');
    setFormOpening(place.opening_time || '09:00 AM');
    setFormClosing(place.closing_time || '06:00 PM');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formCityId) {
      alert('Place name and city are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formName,
        city_id: Number(formCityId),
        category: formCategory,
        description: formDescription,
        entry_fee: parseFloat(formEntryFee) || 0,
        ideal_duration_hours: parseFloat(formDuration) || 2,
        ai_priority: parseInt(formPriority, 10) || 50,
        opening_time: formOpening,
        closing_time: formClosing,
        gallery: [formImage || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'],
        is_published: 1,
      };

      if (editingPlace) {
        await api.updateAdminPlace(editingPlace.id, payload);
      } else {
        await api.createAdminPlace(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPriorityChange = async (place: any, newPriority: number) => {
    try {
      await api.updateAdminPlace(place.id, { ai_priority: newPriority });
      setPlaces((prev) =>
        prev.map((p) => (p.id === place.id ? { ...p, ai_priority: newPriority } : p))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update priority');
    }
  };

  const handleTogglePublish = async (place: any) => {
    try {
      await api.updateAdminPlace(place.id, {
        is_published: place.is_published ? 0 : 1,
      });
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle publish status');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.deleteAdminPlace(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete place');
    }
  };

  const filteredPlaces = places.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()) ||
      p.city_name?.toLowerCase().includes(search.toLowerCase());
    const matchesCity = selectedCity ? p.city_id.toString() === selectedCity : true;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-white">
            Attractions & Monuments CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tune AI recommendation priorities (USP 2), ticket prices, and visiting logistics
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Attraction / Monument
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
            placeholder="Search attractions by name, category..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center space-x-3">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Destinations ({cities.length})</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-400 whitespace-nowrap">
            Showing <strong>{filteredPlaces.length}</strong> spots
          </span>
        </div>
      </div>

      {/* Places Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Monument / Spot</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Ticket (₹)</th>
                <th className="py-3.5 px-4">AI Rec Priority (1-100)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPlaces.map((place) => (
                <tr key={place.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <SafeImage
                        src={place.gallery?.[0] || 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80'}
                        alt={place.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                        category="place"
                      />
                      <div>
                        <div className="font-bold text-white text-sm">{place.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {place.ideal_duration_hours || 2}h ideal time
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-300">
                    {place.city_name}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                      {place.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold text-white">
                    {place.entry_fee === 0 ? (
                      <span className="text-emerald-400">Free</span>
                    ) : (
                      `₹${place.entry_fee}`
                    )}
                  </td>

                  {/* AI Priority Slider Control */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={place.ai_priority || 50}
                        onChange={(e) => handleQuickPriorityChange(place, parseInt(e.target.value, 10))}
                        className="w-24 accent-amber-500 cursor-pointer"
                        title="Tuning this dynamically alters AI itinerary ranking"
                      />
                      <span className="font-mono font-bold text-amber-400 text-xs w-6">
                        {place.ai_priority || 50}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleTogglePublish(place)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        place.is_published
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {place.is_published ? (
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
                  </td>

                  <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                    <Link
                      to={`/places/${place.id}`}
                      target="_blank"
                      className="p-1.5 inline-block text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                      title="View Public Page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => openEditModal(place)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition"
                      title="Edit Attraction"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(place.id, place.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                      title="Delete Attraction"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold font-heading">
                {editingPlace ? `Edit Spot: ${editingPlace.name}` : 'Add New Tourist Attraction'}
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
                    Spot Name
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder="e.g. City Palace"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Operating City
                  </label>
                  <select
                    value={formCityId}
                    onChange={(e) => setFormCityId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Entry Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formEntryFee}
                    onChange={(e) => setFormEntryFee(e.target.value)}
                    placeholder="50"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                  Photo URL
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
                  Description & Cultural Highlights
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Historical context, architectural style, key sights inside..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* AI Priority Slider */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-400 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Itinerary Recommendation Weight</span>
                  </span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formPriority} / 100
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Higher scores prioritize this destination when tourists request AI-generated itineraries.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Opening Time
                  </label>
                  <input
                    type="text"
                    value={formOpening}
                    onChange={(e) => setFormOpening(e.target.value)}
                    placeholder="09:00 AM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Closing Time
                  </label>
                  <input
                    type="text"
                    value={formClosing}
                    onChange={(e) => setFormClosing(e.target.value)}
                    placeholder="06:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
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
                  {submitting ? 'Saving...' : editingPlace ? 'Update Attraction' : 'Create Attraction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
