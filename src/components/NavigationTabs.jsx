import React from 'react';
import { Calendar, List, Plane, Lightbulb } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export function NavigationTabs({ activeTab, setActiveTab }) {
  const { tripData } = useTrip();
  
  const unscheduledCount = (tripData.activities || []).filter(a => !a.isScheduled).length;
  const travelCount = (tripData.travelDetails || []).length;

  const tabs = [
    { id: 'calendar', label: 'Calendar Board', icon: Calendar },
    { id: 'agenda', label: 'Daily Agenda List', icon: List },
    { id: 'travel', label: 'Flights & Lodging', icon: Plane, count: travelCount },
    { id: 'pool', label: 'Ideas Wishlist', icon: Lightbulb, count: unscheduledCount, mobileOnly: true }
  ];

  return (
    <div className="bg-stone-100/70 p-1 rounded-2xl border border-stone-200/80 inline-flex items-center gap-1">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        if (tab.mobileOnly && window.innerWidth >= 1024) return null;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
              isActive 
                ? 'bg-white text-stone-900 shadow-sm border border-stone-200/60 font-bold' 
                : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-stone-400'}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-stone-200 text-stone-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
