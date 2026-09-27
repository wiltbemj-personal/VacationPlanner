import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Lightbulb, Plus, Search, MapPin, Edit3, Trash2, Clock, Sparkles, Globe, ExternalLink, Heart, ArrowUpDown } from 'lucide-react';

const CATEGORY_COLORS = {
  sightseeing: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  dining: 'bg-amber-100 text-amber-900 border-amber-300',
  transport: 'bg-sky-100 text-sky-900 border-sky-300',
  lodging: 'bg-purple-100 text-purple-900 border-purple-300',
  entertainment: 'bg-pink-100 text-pink-900 border-pink-300',
  relaxation: 'bg-teal-100 text-teal-900 border-teal-300',
  default: 'bg-indigo-100 text-indigo-900 border-indigo-300'
};

export function ActivityDrawer({ onOpenActivityModal, onEditActivity }) {
  const { tripData, deleteActivity, toggleUpvoteActivity, userProfile, activePlacementActivity, setActivePlacementActivity } = useTrip();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'upvotes'

  const unscheduledActivities = (tripData.activities || []).filter(a => !a.isScheduled);

  const filteredActivities = unscheduledActivities.filter(act => {
    const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (act.notes && act.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (act.location && act.location.name && act.location.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || act.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === 'upvotes') {
      const aCount = (a.upvotes || []).length;
      const bCount = (b.upvotes || []).length;
      return bCount - aCount;
    }
    return 0;
  });

  const categories = ['all', 'sightseeing', 'dining', 'transport', 'lodging', 'entertainment', 'relaxation'];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 flex flex-col gap-4 h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-200/60">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-base">Ideas Wishlist</h2>
            <p className="text-[11px] text-stone-500 font-medium">Unscheduled activities pool</p>
          </div>
        </div>
        
        <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full">
          {unscheduledActivities.length} {unscheduledActivities.length === 1 ? 'Idea' : 'Ideas'}
        </span>
      </div>

      {/* Add Idea Button */}
      <button
        onClick={onOpenActivityModal}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl transition shadow-xs"
      >
        <Plus className="w-4 h-4" />
        <span>Add Activity Idea</span>
      </button>

      {/* Search & Category Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Pills & Sort Toggle */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar flex-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortBy(sortBy === 'default' ? 'upvotes' : 'default')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition flex-shrink-0 flex items-center gap-1 border ${
              sortBy === 'upvotes'
                ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
            }`}
            title="Sort by Upvotes"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{sortBy === 'upvotes' ? 'Top Voted' : 'Sort'}</span>
          </button>
        </div>
      </div>

      {/* Sticky Notes Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[500px] lg:max-h-[calc(100vh-360px)]">
        {sortedActivities.length === 0 ? (
          <div className="py-10 px-4 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
            <Sparkles className="w-6 h-6 text-stone-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-stone-500">
              {unscheduledActivities.length === 0 
                ? 'All activity ideas are currently scheduled on your calendar!' 
                : 'No activity ideas match your search filter.'}
            </p>
          </div>
        ) : (
          sortedActivities.map(act => {
            const isSelectedForPlacement = activePlacementActivity && activePlacementActivity.id === act.id;
            const badgeColor = CATEGORY_COLORS[act.category] || CATEGORY_COLORS.default;
            const upvotes = act.upvotes || [];
            const upvoteCount = upvotes.length;
            const hasUpvoted = userProfile && upvotes.includes(userProfile.id);

            return (
              <div
                key={act.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', act.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onClick={() => setActivePlacementActivity(isSelectedForPlacement ? null : act)}
                className={`p-3.5 rounded-2xl border bg-white cursor-grab active:cursor-grabbing transition shadow-2xs relative group space-y-2 ${
                  isSelectedForPlacement
                    ? 'ring-2 ring-indigo-600 border-indigo-500 bg-indigo-50/30'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-bold text-stone-900 text-xs sm:text-sm group-hover:text-indigo-600 transition">
                    {act.title}
                  </h4>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditActivity(act); }}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteActivity(act.id); }}
                      className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Location */}
                {act.location && (act.location.name || act.location.address) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-600 truncate">
                    <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                    <span className="truncate">{act.location.name || act.location.address}</span>
                  </div>
                )}

                {/* Website */}
                {act.websiteUrl && (
                  <div className="flex items-center gap-1.5 text-[11px] truncate">
                    <Globe className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                    <a
                      href={act.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium truncate inline-flex items-center gap-1"
                    >
                      <span className="truncate">{act.websiteUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                      <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                    </a>
                  </div>
                )}

                {/* Notes */}
                {act.notes && (
                  <p className="text-[11px] text-stone-500 italic line-clamp-2 bg-stone-50 p-2 rounded-lg">
                    {act.notes}
                  </p>
                )}

                {/* Category, Duration & Upvote Footer */}
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${badgeColor}`}>
                      {act.category}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUpvoteActivity(act.id);
                      }}
                      title={hasUpvoted ? 'Remove your upvote' : 'Upvote this idea'}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold transition border ${
                        hasUpvoted
                          ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-2xs'
                          : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200'
                      }`}
                    >
                      <Heart className={`w-3 h-3 transition-transform active:scale-125 ${hasUpvoted ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{upvoteCount}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1 text-stone-500 font-semibold">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{act.duration} {act.duration === 1 ? 'hour' : 'hours'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

