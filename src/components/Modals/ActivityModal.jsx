import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { X, MapPin, Clock, Tag, FileText, Compass, Globe } from 'lucide-react';

export function ActivityModal({ isOpen, onClose, editingActivity }) {
  const { addActivity, updateActivity } = useTrip();

  const [formData, setFormData] = useState({
    title: '',
    category: 'sightseeing',
    duration: 2,
    locationName: '',
    address: '',
    websiteUrl: '',
    notes: ''
  });

  useEffect(() => {
    if (editingActivity) {
      setFormData({
        title: editingActivity.title || '',
        category: editingActivity.category || 'sightseeing',
        duration: editingActivity.duration || 1,
        locationName: editingActivity.location?.name || '',
        address: editingActivity.location?.address || '',
        websiteUrl: editingActivity.websiteUrl || '',
        notes: editingActivity.notes || ''
      });
    } else {
      setFormData({
        title: '',
        category: 'sightseeing',
        duration: 2,
        locationName: '',
        address: '',
        websiteUrl: '',
        notes: ''
      });
    }
  }, [editingActivity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const mapQuery = formData.address || formData.locationName;
    const mapUrl = mapQuery ? `https://maps.google.com/?q=${encodeURIComponent(mapQuery)}` : '';

    let formattedWebsite = formData.websiteUrl.trim();
    if (formattedWebsite && !/^https?:\/\//i.test(formattedWebsite)) {
      formattedWebsite = `https://${formattedWebsite}`;
    }

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      duration: Number(formData.duration),
      location: {
        name: formData.locationName.trim(),
        address: formData.address.trim(),
        mapUrl: mapUrl
      },
      websiteUrl: formattedWebsite,
      notes: formData.notes.trim()
    };

    if (editingActivity) {
      updateActivity(editingActivity.id, payload);
    } else {
      addActivity(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-5 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingActivity ? 'Edit Activity' : 'Create Activity Idea'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">Design your vacation activity card.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Table Mountain Aerial Cableway"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="sightseeing">🏛️ Sightseeing</option>
                <option value="dining">🍷 Dining & Drinks</option>
                <option value="transport">🚗 Transport</option>
                <option value="lodging">🏨 Lodging</option>
                <option value="entertainment">🎟️ Entertainment</option>
                <option value="relaxation">🏖️ Relaxation</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
                Duration (Hours)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-white"
              >
                <option value="0.5">30 Minutes (0.5h)</option>
                <option value="1">1 Hour</option>
                <option value="1.5">1.5 Hours</option>
                <option value="2">2 Hours</option>
                <option value="3">3 Hours</option>
                <option value="4">4 Hours</option>
                <option value="5">5 Hours</option>
                <option value="6">6 Hours</option>
              </select>
            </div>
          </div>

          {/* Location Name & Address Pin */}
          <div className="space-y-2 pt-1 border-t border-stone-100">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase text-stone-700">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Location & Pinning
            </span>

            <input
              type="text"
              placeholder="Place or Landmark Name (e.g. Table Mountain Station)"
              value={formData.locationName}
              onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />

            <input
              type="text"
              placeholder="Full Address (e.g. Tafelberg Rd, Gardens, Cape Town)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Website URL */}
          <div className="pt-1 border-t border-stone-100">
            <label className="flex items-center gap-1 text-[11px] font-bold uppercase text-stone-700 mb-1">
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              Website URL (Optional)
            </label>
            <input
              type="url"
              placeholder="e.g. https://www.tablemountain.net"
              value={formData.websiteUrl}
              onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">
              Notes & Booking Details
            </label>
            <textarea
              rows="3"
              placeholder="Confirmation numbers, dress code, tickets, or travel notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl transition shadow-xs"
            >
              {editingActivity ? 'Save Changes' : 'Create Card'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
