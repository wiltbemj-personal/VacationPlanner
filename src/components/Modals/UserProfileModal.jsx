import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { X, User, Check, Sparkles } from 'lucide-react';

const COLOR_OPTIONS = [
  { name: 'Indigo', class: 'bg-indigo-600' },
  { name: 'Emerald', class: 'bg-emerald-600' },
  { name: 'Amber', class: 'bg-amber-600' },
  { name: 'Purple', class: 'bg-purple-600' },
  { name: 'Rose', class: 'bg-rose-600' },
  { name: 'Sky', class: 'bg-sky-600' }
];

export function UserProfileModal({ isOpen, onClose }) {
  const { userProfile, updateUserProfile } = useTrip();
  const [name, setName] = useState(userProfile?.name || 'Me');
  const [avatar, setAvatar] = useState(userProfile?.avatar || 'M');
  const [color, setColor] = useState(userProfile?.color || 'bg-indigo-600');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || 'Me');
      setAvatar(userProfile.avatar || 'M');
      setColor(userProfile.color || 'bg-indigo-600');
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(name.trim() || 'Me', avatar.trim().charAt(0).toUpperCase() || 'M', color);
    onClose();
  };

  const handleNameChange = (val) => {
    setName(val);
    if (val.trim()) {
      setAvatar(val.trim().charAt(0).toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in duration-150">
        
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">Your Companion Profile</h3>
              <p className="text-xs text-stone-500 font-medium">How your avatar appears to live collaborators.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Badge Preview */}
        <div className="flex items-center justify-center py-3 bg-stone-50 rounded-xl border border-stone-100">
          <div className="flex flex-col items-center gap-1.5">
            <div className={`w-12 h-12 rounded-full text-white text-lg font-bold flex items-center justify-center border-2 border-white ${color} shadow-md`}>
              {avatar || (name ? name.charAt(0).toUpperCase() : 'M')}
            </div>
            <span className="text-xs font-bold text-stone-800">{name || 'Your Name'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Your Display Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Holly"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Avatar Letter / Initial</label>
            <input
              type="text"
              maxLength="2"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Badge Color</label>
            <div className="flex items-center gap-2 pt-1">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.class}
                  type="button"
                  onClick={() => setColor(c.class)}
                  className={`w-7 h-7 rounded-full ${c.class} text-white flex items-center justify-center transition border-2 ${
                    color === c.class ? 'border-stone-900 scale-110 shadow-sm' : 'border-white hover:scale-105'
                  }`}
                  title={c.name}
                >
                  {color === c.class && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Save Profile
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
