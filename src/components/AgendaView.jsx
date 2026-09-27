import React from 'react';
import { useTrip } from '../context/TripContext';
import { getDaysRange, formatHourLabel, parseTimeToHourDecimal, formatReadableDate, formatDisplayTime } from '../utils/dateUtils';
import { MapPin, Clock, ExternalLink, Edit3, X, Calendar as CalendarIcon, Plane, Hotel, Ticket, Globe, Heart } from 'lucide-react';

export function AgendaView({ onEditActivity, onEditTravelDetail }) {
  const { tripData, unscheduleActivity, deleteTravelDetail } = useTrip();
  const days = getDaysRange(tripData.startDate, tripData.endDate);
  const travelDetails = tripData.travelDetails || [];

  const getCombinedItemsForDay = (dateStr) => {
    const items = [];

    // 1. Scheduled activities
    (tripData.activities || []).forEach(act => {
      if (act.isScheduled && act.dateStr === dateStr) {
        items.push({
          id: act.id,
          kind: 'activity',
          sortHour: act.startHour,
          data: act
        });
      }
    });

    // 2. Flights and Lodging
    travelDetails.forEach(tItem => {
      if (tItem.type === 'flight') {
        const depDate = tItem.departureDate;
        const arrDate = tItem.arrivalDate || tItem.departureDate;
        const depH = parseTimeToHourDecimal(tItem.departureTime, 8);
        const arrH = parseTimeToHourDecimal(tItem.arrivalTime, 10);

        if (depDate === dateStr) {
          items.push({
            id: tItem.id + '-flt-dep',
            kind: 'flight-dep',
            sortHour: depH,
            data: tItem
          });
        }
        if (arrDate === dateStr && arrDate !== depDate) {
          items.push({
            id: tItem.id + '-flt-arr',
            kind: 'flight-arr',
            sortHour: arrH,
            data: tItem
          });
        }
        if (dateStr > depDate && dateStr < arrDate) {
          items.push({
            id: tItem.id + '-flt-mid',
            kind: 'flight-mid',
            sortHour: 8,
            data: tItem
          });
        }
      }

      if (tItem.type === 'lodging') {
        if (tItem.checkInDate === dateStr) {
          const inH = parseTimeToHourDecimal(tItem.checkInTime, 14);
          items.push({
            id: tItem.id + '-in',
            kind: 'hotel-checkin',
            sortHour: inH,
            data: tItem
          });
        }
        if (tItem.checkOutDate === dateStr) {
          const outH = parseTimeToHourDecimal(tItem.checkOutTime, 11);
          items.push({
            id: tItem.id + '-out',
            kind: 'hotel-checkout',
            sortHour: outH,
            data: tItem
          });
        }
      }
    });

    return items.sort((a, b) => a.sortHour - b.sortHour);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-6">
      
      <div className="flex items-center justify-between border-b border-stone-100 pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900">Daily Agenda Itinerary</h2>
          <p className="text-xs text-stone-500 font-medium">Clean timeline view including multi-day flights, hotel check-ins, and scheduled activities.</p>
        </div>
      </div>

      <div className="space-y-8">
        {days.map((day, idx) => {
          const dayItems = getCombinedItemsForDay(day.dateStr);

          return (
            <div key={day.dateStr} className="space-y-3">
              
              {/* Day Header */}
              <div className="flex items-center gap-3 sticky top-[69px] bg-white/95 backdrop-blur-md py-2 z-10 border-b border-stone-100">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-serif font-bold text-sm flex items-center justify-center shadow-xs">
                  {idx + 1}
                </span>
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">{day.dayName}</h3>
                  <p className="text-xs text-stone-500 font-medium">{day.formattedDate}</p>
                </div>
                <span className="ml-auto text-xs font-semibold text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
                  {dayItems.length} {dayItems.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Items List */}
              {dayItems.length === 0 ? (
                <div className="py-6 text-center border-2 border-dashed border-stone-200/60 rounded-xl bg-stone-50/50">
                  <p className="text-xs font-medium text-stone-400">No items scheduled for this day yet.</p>
                </div>
              ) : (
                <div className="space-y-3 pl-4 border-l-2 border-indigo-100">
                  {dayItems.map(item => {
                    if (item.kind.startsWith('flight')) {
                      const flt = item.data;
                      const isDep = item.kind === 'flight-dep';
                      const isArr = item.kind === 'flight-arr';
                      const isMid = item.kind === 'flight-mid';

                      return (
                        <div 
                          key={item.id}
                          onClick={() => onEditTravelDetail && onEditTravelDetail(flt)}
                          className="bg-gradient-to-r from-sky-50 via-white to-sky-50/30 border border-sky-200/90 hover:border-sky-400 rounded-xl p-4 shadow-2xs space-y-2 cursor-pointer transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-200 text-sky-900">
                                  <Plane className="w-3.5 h-3.5 text-sky-700 animate-pulse" />
                                  {isDep ? '✈️ Flight Departure' : isArr ? '🛬 Flight Arrival' : '✈️ In-Flight En Route'}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                                  ⏰ {isDep ? formatDisplayTime(flt.departureTime) : isArr ? formatDisplayTime(flt.arrivalTime) : 'All Day'}
                                </span>
                              </div>
                              <h4 className="font-serif font-bold text-stone-900 text-base hover:text-indigo-600 transition">
                                Flight {flt.flightNumber || flt.airline}: {flt.departureAirport || 'Depart'} ➔ {flt.arrivalAirport || 'Arrive'}
                              </h4>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); onEditTravelDetail && onEditTravelDetail(flt); }}
                                className="p-1 text-stone-400 hover:text-indigo-600 rounded"
                                title="Edit flight"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteTravelDetail(flt.id); }}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded"
                                title="Delete flight"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-sky-900 pt-1 border-t border-sky-100/60">
                            <span>
                              {isDep ? (
                                `Departs ${formatReadableDate(flt.departureDate)} @ ${formatDisplayTime(flt.departureTime)} (Arrives ${formatReadableDate(flt.arrivalDate)} @ ${formatDisplayTime(flt.arrivalTime)})`
                              ) : isArr ? (
                                `Arrives ${formatReadableDate(flt.arrivalDate)} @ ${formatDisplayTime(flt.arrivalTime)} (Departed ${formatReadableDate(flt.departureDate)} @ ${formatDisplayTime(flt.departureTime)})`
                              ) : (
                                `In-Flight from ${formatReadableDate(flt.departureDate)} to ${formatReadableDate(flt.arrivalDate)}`
                              )}
                            </span>
                            {flt.confirmationCode && (
                              <span className="font-mono bg-white px-2 py-0.5 rounded border border-sky-200 font-semibold text-[11px]">
                                Ref: {flt.confirmationCode}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (item.kind === 'hotel-checkin' || item.kind === 'hotel-checkout') {
                      const lodg = item.data;
                      const isCheckIn = item.kind === 'hotel-checkin';

                      return (
                        <div 
                          key={item.id}
                          onClick={() => onEditTravelDetail && onEditTravelDetail(lodg)}
                          className="bg-gradient-to-r from-purple-50 via-white to-purple-50/30 border border-purple-200/90 hover:border-purple-400 rounded-xl p-4 shadow-2xs space-y-2 cursor-pointer transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-200 text-purple-900">
                                  <Hotel className="w-3.5 h-3.5 text-purple-700" />
                                  {isCheckIn ? 'Hotel Check-In' : 'Hotel Check-Out'}
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
                                  ⏰ {isCheckIn ? lodg.checkInTime : lodg.checkOutTime}
                                </span>
                              </div>
                              <h4 className="font-serif font-bold text-stone-900 text-base hover:text-indigo-600 transition">{lodg.hotelName}</h4>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); onEditTravelDetail && onEditTravelDetail(lodg); }}
                                className="p-1 text-stone-400 hover:text-indigo-600 rounded"
                                title="Edit lodging"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteTravelDetail(lodg.id); }}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded"
                                title="Delete lodging record"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {lodg.address && (
                            <div className="flex items-center justify-between text-xs text-purple-900 bg-white p-2 rounded-lg border border-purple-100">
                              <div className="flex items-center gap-2 truncate">
                                <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                                <span className="truncate">{lodg.address}</span>
                              </div>
                              {lodg.mapUrl && (
                                <a 
                                  href={lodg.mapUrl} 
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
                      );
                    }

                    // Standard Activity
                    const act = item.data;
                    return (
                      <div 
                        key={act.id}
                        onClick={() => onEditActivity(act)}
                        className="bg-stone-50/80 hover:bg-stone-100 border border-stone-200/80 rounded-xl p-4 transition shadow-2xs space-y-2.5 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800">
                                <Clock className="w-3 h-3" />
                                {formatHourLabel(act.startHour)} – {formatHourLabel(act.startHour + act.duration)} ({act.duration}h)
                              </span>
                              <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-200 text-stone-700">
                                {act.category}
                              </span>
                              {act.upvotes && act.upvotes.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200" title={`${act.upvotes.length} upvotes`}>
                                  <Heart className="w-3 h-3 fill-rose-600 text-rose-600" />
                                  <span>{act.upvotes.length}</span>
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif font-bold text-stone-900 text-base">{act.title}</h4>
                          </div>

                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onEditActivity(act); }}
                              title="Edit activity"
                              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-white rounded-lg transition"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); unscheduleActivity(act.id); }}
                              title="Unschedule activity"
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Location details */}
                        {act.location && (act.location.name || act.location.address) && (
                          <div className="flex items-center justify-between text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200/60">
                            <div className="flex items-center gap-2 truncate">
                              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                              <span className="truncate font-medium">{act.location.name || act.location.address}</span>
                            </div>
                            {act.location.mapUrl && (
                              <a
                                href={act.location.mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md transition ml-2 flex-shrink-0"
                              >
                                <span>Map</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Website details */}
                        {act.websiteUrl && (
                          <div className="flex items-center justify-between text-xs text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200/60">
                            <div className="flex items-center gap-2 truncate">
                              <Globe className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                              <span className="truncate font-medium">{act.websiteUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                            </div>
                            <a
                              href={act.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-md transition ml-2 flex-shrink-0"
                            >
                              <span>Website</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}

                        {/* Notes */}
                        {act.notes && (
                          <p className="text-xs text-stone-600 italic bg-stone-100/80 p-2.5 rounded-lg">
                            {act.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
