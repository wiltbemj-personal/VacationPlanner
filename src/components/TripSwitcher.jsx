import React, { useState, useRef, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { ChevronDown, Plus, Check, Trash2, Globe, Compass, ArrowRight, Key } from 'lucide-react';
import { formatReadableDate } from '../utils/dateUtils';

export function TripSwitcher({ onOpenNewTripModal }) {
  const { tripId, tripData, savedTrips, switchTrip, removeSavedTrip } = useTrip();
  const [isOpen, setIsOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitch = (id) => {
    switchTrip(id);
    setIsOpen(false);
  };

  const handleJoinByCode = (e) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().replace(/[^A-Za-z0-9_-]+/g, '');
    if (clean) {
      switchTrip(clean);
      setJoinCodeInput('');
      setIsOpen(false);
    }
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeSavedTrip(id);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 group p-1.5 -ml-1.5 rounded-xl hover:bg-stone-100/80 transition cursor-pointer text-left"
      >
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-indigo-600 transition">
              {tripData.tripName || "Voyageur Vacation"}
            </h1>
            <ChevronDown className={`w-4 h-4 text-stone-400 group-hover:text-indigo-600 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>{formatReadableDate(tripData.startDate)} — {formatReadableDate(tripData.endDate)}</span>
            <span className="font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
              #{tripId}
            </span>
          </div>
        </div>
      </button>

      {/* Floating Popover */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-stone-200 z-50 overflow-hidden animate-in fade-in zoom-in duration-150">
          
          <div className="p-3 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600" />
              My Trips (Synced to Firestore)
            </span>
            <span className="text-[10px] font-semibold text-stone-400 bg-white px-2 py-0.5 rounded-full border border-stone-200">
              {savedTrips.length} {savedTrips.length === 1 ? 'Trip' : 'Trips'}
            </span>
          </div>

          {/* Saved Trips List */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1 divide-y divide-stone-50">
            {savedTrips.map((t) => {
              const isActive = t.id === tripId;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSwitch(t.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition group ${
                    isActive 
                      ? 'bg-indigo-50/80 border border-indigo-200/80 text-indigo-950 font-medium' 
                      : 'hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="space-y-0.5 truncate max-w-[240px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-bold text-sm truncate">{t.name || 'Untitled Trip'}</span>
                      {isActive && <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                    </div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2">
                      <span>{t.startDate ? `${t.startDate} ➔ ${t.endDate}` : 'Dates not set'}</span>
                      <span className="font-mono text-[10px] text-indigo-700 font-bold bg-white/80 px-1 rounded">
                        #{t.id}
                      </span>
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      type="button"
                      onClick={(e) => handleRemove(e, t.id)}
                      className="p-1 text-stone-300 hover:text-rose-600 rounded transition opacity-0 group-hover:opacity-100"
                      title="Remove from saved list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Join Trip by Code */}
          <div className="p-3 border-t border-stone-100 bg-stone-50/40 space-y-2">
            <label className="block text-[10px] font-bold uppercase text-stone-500">Join Existing Trip by Code</label>
            <form onSubmit={handleJoinByCode} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Key className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. safari-2026"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-mono text-stone-800 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs flex-shrink-0"
              >
                Join
              </button>
            </form>
          </div>

          {/* Footer Action */}
          <div className="p-2 bg-stone-100/70 border-t border-stone-200/60 text-center">
            <button
              type="button"
              onClick={() => { setIsOpen(false); onOpenNewTripModal(); }}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Trip</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
