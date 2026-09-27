import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { X, Plus, Calendar, Compass, Sparkles } from 'lucide-react';
import { getTodayDateStr, getFutureDateStr } from '../../utils/dateUtils';
import { generateTripCode } from '../../utils/idUtils';

export function NewTripModal({ isOpen, onClose }) {
  const { createNewTrip } = useTrip();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateStr());
  const [endDate, setEndDate] = useState(getFutureDateStr(5));
  const [customCode, setCustomCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = tripName.trim() || "New Voyageur Trip";
    const code = customCode.trim() ? customCode.trim().replace(/[^A-Za-z0-9_-]+/g, '') : generateTripCode();
    createNewTrip(name, startDate, endDate, code);
    
    // Reset form & close
    setTripName('');
    setCustomCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">Create New Trip</h3>
              <p className="text-xs text-stone-500 font-medium">Scaffold a new itinerary synced to Firestore.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Trip Name</label>
            <input
              type="text"
              required
              placeholder="e.g., Cape Town & Safari 2026"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Custom Trip Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g., safari-2026 (Leave blank to auto-generate)"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Trip</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
