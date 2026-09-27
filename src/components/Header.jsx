import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { formatReadableDate, getDaysRange } from '../utils/dateUtils';
import { TripSwitcher } from './TripSwitcher';
import { 
  Compass, 
  Calendar, 
  Share2, 
  Plus, 
  Cloud, 
  CloudOff, 
  Edit3, 
  Users,
  Plane,
  Sparkles
} from 'lucide-react';

export function Header({ onOpenActivityModal, onOpenDatesModal, onOpenShareModal, onOpenProfileModal, onOpenNewTripModal, onOpenSyncModal }) {
  const { tripData, tripId, isCloudSynced, setTripName, activeMembers, userProfile } = useTrip();
  const days = getDaysRange(tripData.startDate, tripData.endDate);

  const membersList = activeMembers && activeMembers.length > 0
    ? activeMembers
    : [userProfile || { id: 'user-1', name: 'Me', avatar: 'M', color: 'bg-indigo-600' }];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Interactive Trip Switcher */}
        <div className="flex items-center gap-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white p-2.5 rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            
            <TripSwitcher onOpenNewTripModal={onOpenNewTripModal} />
          </div>

          {/* Sync Status Badge (Clickable) */}
          <button 
            onClick={onOpenSyncModal}
            title="Click to check or force Firestore Cloud Sync"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-2xs transition cursor-pointer ${
              isCloudSynced 
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200/60' 
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200/60 animate-pulse'
            }`}
          >
            {isCloudSynced ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Live Firestore Sync</span>
                <span className="sm:hidden">Live</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-700 hidden sm:inline">Local Storage Mode</span>
                <span className="text-amber-700 sm:hidden">Local</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons & Companions */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
          
          {/* Active Members Stack */}
          <div className="hidden lg:flex items-center -space-x-2 mr-2" title="Active Trip Companions (Click to edit profile)">
            {membersList.map((member, i) => (
              <div 
                key={member.id || i}
                onClick={onOpenProfileModal}
                className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center border-2 border-white ${member.color || 'bg-indigo-600'} shadow-2xs cursor-pointer hover:scale-110 transition`}
                title={`${member.name} (${member.id === userProfile?.id ? 'You' : 'Live Collaborator'}) — Click to edit profile`}
              >
                {member.avatar || member.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          {/* Set Trip Dates */}
          <button 
            onClick={onOpenDatesModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 rounded-xl transition shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Dates</span>
          </button>

          {/* Share Itinerary */}
          <button 
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-xl transition shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Share Trip</span>
          </button>

        </div>

      </div>
    </header>
  );
}
