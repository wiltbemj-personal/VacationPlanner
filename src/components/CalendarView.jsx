import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { getDaysRange, formatHourLabel, parseTimeToHourDecimal, formatReadableDate, formatDisplayTime } from '../utils/dateUtils';
import { MapPin, Clock, X, ExternalLink, Calendar as CalendarIcon, Sparkles, Plane, Hotel, Ticket, Edit3, Globe, Heart } from 'lucide-react';

const CATEGORY_THEMES = {
  sightseeing: {
    bg: 'bg-emerald-50 hover:bg-emerald-100/80',
    border: 'border-emerald-300',
    accent: 'border-l-4 border-l-emerald-500',
    text: 'text-emerald-950',
    tagBg: 'bg-emerald-200/80 text-emerald-900'
  },
  dining: {
    bg: 'bg-amber-50 hover:bg-amber-100/80',
    border: 'border-amber-300',
    accent: 'border-l-4 border-l-amber-500',
    text: 'text-amber-950',
    tagBg: 'bg-amber-200/80 text-amber-900'
  },
  transport: {
    bg: 'bg-sky-50 hover:bg-sky-100/80',
    border: 'border-sky-300',
    accent: 'border-l-4 border-l-sky-500',
    text: 'text-sky-950',
    tagBg: 'bg-sky-200/80 text-sky-900'
  },
  lodging: {
    bg: 'bg-purple-50 hover:bg-purple-100/80',
    border: 'border-purple-300',
    accent: 'border-l-4 border-l-purple-500',
    text: 'text-purple-950',
    tagBg: 'bg-purple-200/80 text-purple-900'
  },
  default: {
    bg: 'bg-indigo-50 hover:bg-indigo-100/80',
    border: 'border-indigo-300',
    accent: 'border-l-4 border-l-indigo-500',
    text: 'text-indigo-950',
    tagBg: 'bg-indigo-200/80 text-indigo-900'
  }
};

const START_HOUR = 8;  // 8 AM
const END_HOUR = 22;   // 10 PM

export function CalendarView({ onEditActivity, onEditTravelDetail }) {
  const { 
    tripData, 
    scheduleActivity, 
    unscheduleActivity, 
    deleteTravelDetail,
    activePlacementActivity, 
    setActivePlacementActivity 
  } = useTrip();

  const [draggedActivityId, setDraggedActivityId] = useState(null);
  const [hoveredSlotKey, setHoveredSlotKey] = useState(null);

  const days = getDaysRange(tripData.startDate, tripData.endDate);
  const travelDetails = tripData.travelDetails || [];

  const handleDragStart = (e, actId) => {
    setDraggedActivityId(actId);
    e.dataTransfer.setData('text/plain', actId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, dateStr, hour) => {
    e.preventDefault();
    setHoveredSlotKey(`${dateStr}-${hour}`);
  };

  const handleDrop = (e, dateStr, hour) => {
    e.preventDefault();
    const actId = e.dataTransfer.getData('text/plain') || draggedActivityId;
    if (actId) {
      scheduleActivity(actId, dateStr, hour);
    }
    setDraggedActivityId(null);
    setHoveredSlotKey(null);
  };

  const handleSlotClick = (dateStr, hour) => {
    if (activePlacementActivity) {
      scheduleActivity(activePlacementActivity.id, dateStr, hour);
    }
  };

  // Find scheduled standard activity starting at a given hour
  const getScheduledItemAt = (dateStr, hour) => {
    return (tripData.activities || []).find(act => {
      if (!act.isScheduled || act.dateStr !== dateStr) return false;
      return hour >= Math.floor(act.startHour) && hour < Math.ceil(act.startHour + act.duration);
    });
  };

  // Helper to compute precise flight block-out info for a given calendar day
  const getFlightBlockInfoOnDay = (flight, dateStr) => {
    if (flight.type !== 'flight') return null;

    const depDate = flight.departureDate;
    const arrDate = flight.arrivalDate || flight.departureDate;
    if (!depDate) return null;

    // Check if dateStr falls within the flight date range
    if (dateStr < depDate || dateStr > arrDate) return null;

    const depHour = parseTimeToHourDecimal(flight.departureTime, 8);
    const arrHour = parseTimeToHourDecimal(flight.arrivalTime, 10.5);

    const dayStartHour = (dateStr === depDate) ? depHour : 0;
    const dayEndHour = (dateStr === arrDate) ? arrHour : 24;

    const GRID_START = START_HOUR;     // 8 AM
    const GRID_END = END_HOUR + 1;     // 11 PM (23:00)

    const blockStart = Math.max(GRID_START, dayStartHour);
    const blockEnd = Math.min(GRID_END, dayEndHour);

    if (blockStart >= blockEnd) {
      return null;
    }

    const renderSlot = Math.max(GRID_START, Math.floor(blockStart));
    const numSlotsCovered = Math.max(1, Math.ceil(blockEnd) - renderSlot);
    const durationInHours = Math.max(0.5, blockEnd - blockStart);

    const isMultiDay = depDate !== arrDate;
    const isDepDay = dateStr === depDate;
    const isArrDay = dateStr === arrDate;
    const isMidDay = !isDepDay && !isArrDay;

    let travelKind = 'flight-same-day';
    if (isMidDay) travelKind = 'flight-mid';
    else if (isDepDay && isMultiDay) travelKind = 'flight-dep';
    else if (isArrDay && isMultiDay) travelKind = 'flight-arr';

    return {
      ...flight,
      travelKind,
      depHour,
      arrHour,
      dayStartHour,
      dayEndHour,
      blockStart,
      blockEnd,
      renderSlot,
      numSlotsCovered,
      durationInHours,
      isMultiDay,
      isDepDay,
      isArrDay,
      isMidDay
    };
  };

  // Find travel items (Flights / Hotels) starting at a specific hour
  const getTravelItemStartingAt = (dateStr, hour) => {
    for (const item of travelDetails) {
      if (item.type === 'flight') {
        const info = getFlightBlockInfoOnDay(item, dateStr);
        if (info && info.renderSlot === hour) {
          return info;
        }
      } else if (item.type === 'lodging') {
        const checkInH = Math.floor(parseTimeToHourDecimal(item.checkInTime, 14));
        const checkOutH = Math.floor(parseTimeToHourDecimal(item.checkOutTime, 11));

        if (item.checkInDate === dateStr && checkInH === hour) {
          return { ...item, travelKind: 'hotel-checkin', calculatedDuration: 1, numSlotsCovered: 1 };
        }
        if (item.checkOutDate === dateStr && checkOutH === hour) {
          return { ...item, travelKind: 'hotel-checkout', calculatedDuration: 1, numSlotsCovered: 1 };
        }
      }
    }
    return null;
  };

  // Check if an hour slot is covered by an ongoing flight or travel item starting earlier
  const isSlotCoveredByTravel = (dateStr, hour) => {
    for (const item of travelDetails) {
      if (item.type === 'flight') {
        const info = getFlightBlockInfoOnDay(item, dateStr);
        if (info) {
          // If hour is after renderSlot but before renderSlot + numSlotsCovered, it is covered
          if (hour > info.renderSlot && hour < info.renderSlot + info.numSlotsCovered) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Find intermediate day flight
  const getIntermediateFlightForDay = (dateStr) => {
    return travelDetails.find(item => 
      item.type === 'flight' && 
      item.departureDate && item.arrivalDate &&
      dateStr > item.departureDate && dateStr < item.arrivalDate
    );
  };

  // Find active hotel staying on a given day
  const getActiveHotelForDay = (dateStr) => {
    return travelDetails.find(item => 
      item.type === 'lodging' && 
      item.checkInDate && item.checkOutDate &&
      dateStr >= item.checkInDate && dateStr <= item.checkOutDate
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      
      {/* Legend & Instructions */}
      <div className="bg-stone-50/80 border-b border-stone-200 px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-medium text-stone-600">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-600" />
          <span>Interactive Itinerary Grid (08:00 AM – 10:00 PM)</span>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-sky-500"></span> ✈️ Flights (Multi-Day Spanning)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 border border-purple-500"></span> 🏨 Hotels
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500"></span> Sightseeing
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500"></span> Dining
          </span>
        </div>
      </div>

      {/* Tap-to-Place Active Assist Banner */}
      {activePlacementActivity && (
        <div className="bg-indigo-600 text-white px-6 py-2.5 flex items-center justify-between shadow-inner animate-pulse">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>
              Tap any hour slot to schedule: <strong className="underline">{activePlacementActivity.title}</strong> ({activePlacementActivity.duration}h)
            </span>
          </div>
          <button 
            onClick={() => setActivePlacementActivity(null)}
            className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Main Grid Area */}
      <div className="p-4 sm:p-6 overflow-x-auto flex-1">
        <div className="flex gap-4 min-w-[760px]">
          {days.map((day, dayIdx) => {
            const activeHotel = getActiveHotelForDay(day.dateStr);
            const intermediateFlight = getIntermediateFlightForDay(day.dateStr);

            return (
              <div 
                key={day.dateStr}
                className="flex-1 min-w-[240px] max-w-[320px] bg-stone-50/50 border border-stone-200/80 rounded-2xl overflow-hidden flex flex-col"
              >
                {/* Day Column Header */}
                <div className="bg-stone-100 border-b border-stone-200 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-stone-900 text-base">Day {dayIdx + 1}</h3>
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {day.formattedDate}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-medium">{day.dayName}</p>

                  {/* Intermediate Flight Banner */}
                  {intermediateFlight && (
                    <div 
                      onClick={() => onEditTravelDetail && onEditTravelDetail(intermediateFlight)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-sky-900 bg-sky-100/90 hover:bg-sky-200 px-2 py-1 rounded-lg border border-sky-200 truncate cursor-pointer transition"
                      title="Click to edit multi-day flight"
                    >
                      <Plane className="w-3 h-3 text-sky-600 flex-shrink-0 animate-pulse" />
                      <span className="truncate">In-Flight: {intermediateFlight.flightNumber || intermediateFlight.airline}</span>
                    </div>
                  )}

                  {/* Active Lodging Badge for Day */}
                  {activeHotel && (
                    <div 
                      onClick={() => onEditTravelDetail && onEditTravelDetail(activeHotel)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-purple-900 bg-purple-100/80 hover:bg-purple-200 px-2 py-1 rounded-lg border border-purple-200 truncate cursor-pointer transition"
                      title="Click to edit hotel details"
                    >
                      <Hotel className="w-3 h-3 text-purple-600 flex-shrink-0" />
                      <span className="truncate">Stay: {activeHotel.hotelName || activeHotel.title}</span>
                    </div>
                  )}
                </div>

                {/* Hourly Slots */}
                <div className="p-3 flex flex-col gap-2 flex-grow">
                  {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, idx) => {
                    const hour = START_HOUR + idx;
                    const travelItem = getTravelItemStartingAt(day.dateStr, hour);
                    const isCoveredByFlight = isSlotCoveredByTravel(day.dateStr, hour);
                    const item = getScheduledItemAt(day.dateStr, hour);

                    // Skip slots spanned by an ongoing flight
                    if (isCoveredByFlight && !travelItem) {
                      return null;
                    }

                    return (
                      <React.Fragment key={hour}>
                        
                        {/* FLIGHT OR HOTEL CARD */}
                        {travelItem && (() => {
                          const numSlots = travelItem.numSlotsCovered || 1;
                          const duration = travelItem.durationInHours || travelItem.calculatedDuration || 1;
                          const slotHeight = 62;
                          const cardMinHeight = Math.max(62, numSlots * slotHeight + (numSlots - 1) * 8);

                          const isDep = travelItem.travelKind === 'flight-dep';
                          const isArr = travelItem.travelKind === 'flight-arr';
                          const isMid = travelItem.travelKind === 'flight-mid';

                          return (
                            <div 
                              onClick={() => onEditTravelDetail && onEditTravelDetail(travelItem)}
                              style={{ minHeight: `${cardMinHeight}px` }}
                              className={`p-3 rounded-xl border shadow-xs flex flex-col justify-between space-y-1.5 cursor-pointer transition hover:opacity-95 ${
                                travelItem.type === 'flight' 
                                  ? 'bg-gradient-to-br from-sky-100/95 via-white to-sky-100/70 border-sky-300 border-l-4 border-l-sky-500 text-sky-950 hover:border-sky-400' 
                                  : 'bg-gradient-to-br from-purple-100/95 via-white to-purple-100/70 border-purple-300 border-l-4 border-l-purple-500 text-purple-950 hover:border-purple-400'
                              }`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-1.5 mb-1">
                                  <div className="flex items-center gap-1.5 font-bold font-serif text-xs sm:text-sm leading-tight">
                                    {travelItem.type === 'flight' ? (
                                      <Plane className="w-4 h-4 text-sky-600 flex-shrink-0 animate-pulse" />
                                    ) : (
                                      <Hotel className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                    )}
                                    <span className="hover:underline">
                                      {travelItem.type === 'flight' 
                                        ? (isMid 
                                            ? `✈️ En Route: Flight ${travelItem.flightNumber || travelItem.airline}` 
                                            : isDep 
                                              ? `✈️ Departs: Flight ${travelItem.flightNumber || travelItem.airline}` 
                                              : isArr 
                                                ? `🛬 Arrives: Flight ${travelItem.flightNumber || travelItem.airline}` 
                                                : `✈️ Flight ${travelItem.flightNumber || travelItem.airline}`)
                                        : travelItem.travelKind === 'hotel-checkin'
                                          ? `Check-In: ${travelItem.hotelName}`
                                          : `Check-Out: ${travelItem.hotelName}`}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-0.5">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); onEditTravelDetail && onEditTravelDetail(travelItem); }}
                                      title="Edit travel item"
                                      className="text-stone-400 hover:text-indigo-600 p-0.5 rounded transition"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); deleteTravelDetail(travelItem.id); }}
                                      title="Remove travel item"
                                      className="text-stone-400 hover:text-rose-600 p-0.5 rounded transition"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Details */}
                                {travelItem.type === 'flight' ? (
                                  <div className="text-xs space-y-1 mt-1">
                                    <div className="font-bold text-sky-900 text-xs">
                                      {travelItem.departureAirport || 'Depart'} ➔ {travelItem.arrivalAirport || 'Arrive'}{travelItem.airline ? ` (${travelItem.airline})` : ''}
                                    </div>
                                    <div className="text-sky-800 font-semibold text-[11px] flex items-center gap-1">
                                      <Clock className="w-3 h-3 text-sky-600 flex-shrink-0" />
                                      {isMid ? (
                                        <span>In-Flight all day ({formatReadableDate(travelItem.departureDate)} ➔ {formatReadableDate(travelItem.arrivalDate)})</span>
                                      ) : isDep && travelItem.isMultiDay ? (
                                        <span>Departs {formatDisplayTime(travelItem.departureTime)} (Arrives {formatReadableDate(travelItem.arrivalDate)} @ {formatDisplayTime(travelItem.arrivalTime)})</span>
                                      ) : isArr ? (
                                        <span>Arrives {formatDisplayTime(travelItem.arrivalTime)} (Departed {formatReadableDate(travelItem.departureDate)} @ {formatDisplayTime(travelItem.departureTime)})</span>
                                      ) : (
                                        <span>{formatDisplayTime(travelItem.departureTime)} – {formatDisplayTime(travelItem.arrivalTime)} ({duration.toFixed(1)} hrs)</span>
                                      )}
                                    </div>
                                    {travelItem.confirmationCode && (
                                      <span className="inline-block font-mono bg-sky-200/80 text-sky-950 px-2 py-0.5 rounded text-[10px] font-bold">
                                        Ref: {travelItem.confirmationCode}
                                      </span>
                                    )}
                                    {travelItem.notes && (
                                      <p className="text-[10px] text-sky-900 italic bg-white/60 p-1.5 rounded-lg mt-1">
                                        {travelItem.notes}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs space-y-1 mt-1">
                                    <div className="text-purple-900 font-medium text-[11px]">
                                      ⏰ {travelItem.travelKind === 'hotel-checkin' ? `Check-In @ ${travelItem.checkInTime}` : `Check-Out @ ${travelItem.checkOutTime}`}
                                    </div>
                                    {travelItem.address && (
                                      <div className="flex items-center justify-between gap-1 text-purple-900 text-[10px]">
                                        <span className="truncate">{travelItem.address}</span>
                                        {travelItem.mapUrl && (
                                          <a 
                                            href={travelItem.mapUrl} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-indigo-600 hover:underline flex-shrink-0 font-semibold"
                                          >
                                            Map ↗
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="pt-1">
                                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase rounded-md ${
                                  travelItem.type === 'flight' ? 'bg-sky-200 text-sky-900 border border-sky-300' : 'bg-purple-200 text-purple-900 border border-purple-300'
                                }`}>
                                  {travelItem.type === 'flight' 
                                    ? (isMid
                                        ? 'In-Flight Block-Out (En Route)'
                                        : travelItem.isMultiDay 
                                          ? (isDep ? 'Multi-Day Flight Departure' : 'Multi-Day Flight Arrival') 
                                          : 'In-Flight Block-Out')
                                    : travelItem.travelKind === 'hotel-checkin' ? 'Hotel Check-In' : 'Hotel Check-Out'}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* STANDARD SCHEDULED ACTIVITY CARD */}
                        {!travelItem && item && item.startHour === hour && (() => {
                          const theme = CATEGORY_THEMES[item.category] || CATEGORY_THEMES.default;
                          const slotHeight = 62;
                          const cardMinHeight = item.duration * slotHeight - (item.duration - 1) * 8;

                          return (
                            <div
                              key={item.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.id)}
                              style={{ minHeight: `${cardMinHeight}px` }}
                              className={`relative p-3 rounded-xl border ${theme.bg} ${theme.border} ${theme.accent} ${theme.text} shadow-xs flex flex-col justify-between cursor-grab active:cursor-grabbing transition group`}
                            >
                              <div>
                                <div className="flex items-start justify-between gap-1.5 mb-1">
                                  <h4 
                                    onClick={() => onEditActivity(item)}
                                    className="font-serif font-bold text-stone-900 text-xs sm:text-sm leading-tight hover:underline cursor-pointer"
                                  >
                                    {item.title}
                                  </h4>
                                  <button
                                    onClick={() => unscheduleActivity(item.id)}
                                    title="Unschedule activity"
                                    className="text-stone-400 hover:text-rose-600 p-1 rounded-md hover:bg-white/60 transition"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Time range */}
                                <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-600 mb-2">
                                  <Clock className="w-3 h-3 text-stone-400" />
                                  <span>{formatHourLabel(hour)} – {formatHourLabel(hour + item.duration)}</span>
                                </div>

                                {/* Location Pin */}
                                {item.location && (item.location.name || item.location.address) && (
                                  <div className="flex items-center justify-between text-[10px] text-stone-600 font-medium bg-white/60 p-1.5 rounded-lg border border-stone-200/50 mb-2">
                                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                                      <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                                      <span className="truncate">{item.location.name || item.location.address}</span>
                                    </span>
                                    {item.location.mapUrl && (
                                      <a
                                        href={item.location.mapUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-indigo-600 hover:text-indigo-800 p-0.5 flex-shrink-0"
                                        title="Open map"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    )}
                                  </div>
                                )}

                                {/* Website Link */}
                                {item.websiteUrl && (
                                  <div className="flex items-center justify-between text-[10px] text-stone-600 font-medium bg-white/60 p-1.5 rounded-lg border border-stone-200/50 mb-2">
                                    <span className="flex items-center gap-1 truncate max-w-[160px]">
                                      <Globe className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                                      <span className="truncate">{item.websiteUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                                    </span>
                                    <a
                                      href={item.websiteUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-indigo-600 hover:text-indigo-800 p-0.5 flex-shrink-0"
                                      title="Visit website"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </div>
                                )}

                                {/* Notes */}
                                {item.notes && (
                                  <p className="text-[10px] text-stone-700 italic line-clamp-2 bg-white/40 p-1.5 rounded-lg">
                                    {item.notes}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/40 text-[10px]">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${theme.tagBg}`}>
                                    {item.category}
                                  </span>
                                  {item.upvotes && item.upvotes.length > 0 && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200" title={`${item.upvotes.length} upvotes`}>
                                      <Heart className="w-2.5 h-2.5 fill-rose-600 text-rose-600" />
                                      {item.upvotes.length}
                                    </span>
                                  )}
                                </div>
                                <span className="text-stone-400 font-medium">
                                  {item.duration} {item.duration === 1 ? 'hr' : 'hrs'}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                        {/* EMPTY HOUR SLOT */}
                        {!item && !travelItem && (() => {
                          const slotKey = `${day.dateStr}-${hour}`;
                          const isHovered = hoveredSlotKey === slotKey;

                          return (
                            <div
                              key={hour}
                              onDragOver={(e) => handleDragOver(e, day.dateStr, hour)}
                              onDrop={(e) => handleDrop(e, day.dateStr, hour)}
                              onClick={() => handleSlotClick(day.dateStr, hour)}
                              className={`group flex items-center justify-between p-2.5 rounded-xl border border-dashed text-xs font-medium transition cursor-pointer min-h-[58px] ${
                                isHovered || activePlacementActivity
                                  ? 'border-indigo-500 bg-indigo-50/60 shadow-2xs' 
                                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                              }`}
                            >
                              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider w-14 border-r border-stone-100 pr-2">
                                {formatHourLabel(hour)}
                              </span>

                              <div className="flex items-center text-stone-300 group-hover:text-indigo-600">
                                <span className="text-[11px] font-medium opacity-0 group-hover:opacity-100 transition">
                                  {activePlacementActivity ? 'Tap to Place +' : 'Place Activity +'}
                                </span>
                              </div>
                            </div>
                          );
                        })()}

                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
