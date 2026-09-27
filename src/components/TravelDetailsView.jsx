import React from 'react';
import { useTrip } from '../context/TripContext';
import { formatReadableDate } from '../utils/dateUtils';
import { Plane, Hotel, Plus, Trash2, MapPin, ExternalLink, Ticket, Edit3 } from 'lucide-react';

export function TravelDetailsView({ onOpenTravelModal, onEditTravelDetail }) {
  const { tripData, deleteTravelDetail } = useTrip();

  const travelDetails = tripData.travelDetails || [];
  const flights = travelDetails.filter(t => t.type === 'flight');
  const lodgings = travelDetails.filter(t => t.type === 'lodging');

  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900">Flights & Accommodations</h2>
          <p className="text-xs text-stone-500 font-medium">Keep flight departure/arrival dates, hotel check-ins, and booking codes in one location. Click any card to edit.</p>
        </div>

        <button
          onClick={onOpenTravelModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Flight or Hotel</span>
        </button>
      </div>

      {/* Grid Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FLIGHTS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base border-b border-stone-100 pb-2">
            <Plane className="w-5 h-5 text-sky-600" />
            <h3>Flights ({flights.length})</h3>
          </div>

          {flights.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              <Plane className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-500">No flight details added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flights.map(flt => (
                <div 
                  key={flt.id} 
                  onClick={() => onEditTravelDetail(flt)}
                  className="bg-gradient-to-br from-sky-50/50 via-white to-stone-50/50 border border-sky-200/80 hover:border-sky-400 rounded-2xl p-4 shadow-2xs space-y-3 relative group cursor-pointer transition"
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditTravelDetail(flt); }}
                      className="text-stone-400 hover:text-indigo-600 transition p-1 rounded-md hover:bg-stone-100"
                      title="Edit flight"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTravelDetail(flt.id); }}
                      className="text-stone-400 hover:text-rose-600 transition p-1 rounded-md hover:bg-rose-50"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pr-12">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                      {flt.airline || 'Flight'}
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-base mt-1 group-hover:text-indigo-600 transition">
                      {flt.title || `Flight ${flt.flightNumber}`}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">Departure</span>
                      <span className="font-bold text-stone-900 block">{flt.departureAirport || 'Departure'}</span>
                      <span className="text-[11px] text-stone-600 font-semibold block mt-0.5">📅 {formatReadableDate(flt.departureDate)}</span>
                      <span className="text-[11px] text-sky-700 font-medium block">⏰ {flt.departureTime}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">Arrival</span>
                      <span className="font-bold text-stone-900 block">{flt.arrivalAirport || 'Arrival'}</span>
                      <span className="text-[11px] text-stone-600 font-semibold block mt-0.5">📅 {formatReadableDate(flt.arrivalDate || flt.departureDate)}</span>
                      <span className="text-[11px] text-sky-700 font-medium block">⏰ {flt.arrivalTime}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600 pt-1">
                    {flt.confirmationCode && (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/60">
                        <Ticket className="w-3.5 h-3.5 text-stone-500" />
                        <span>Ref: {flt.confirmationCode}</span>
                      </span>
                    )}
                    {flt.notes && <span className="text-stone-500 italic text-[11px]">{flt.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACCOMMODATIONS SECTION */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-base border-b border-stone-100 pb-2">
            <Hotel className="w-5 h-5 text-purple-600" />
            <h3>Accommodations & Hotels ({lodgings.length})</h3>
          </div>

          {lodgings.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              <Hotel className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-500">No accommodations added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lodgings.map(lodg => (
                <div 
                  key={lodg.id} 
                  onClick={() => onEditTravelDetail(lodg)}
                  className="bg-gradient-to-br from-purple-50/50 via-white to-stone-50/50 border border-purple-200/80 hover:border-purple-400 rounded-2xl p-4 shadow-2xs space-y-3 relative group cursor-pointer transition"
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditTravelDetail(lodg); }}
                      className="text-stone-400 hover:text-indigo-600 transition p-1 rounded-md hover:bg-stone-100"
                      title="Edit lodging"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTravelDetail(lodg.id); }}
                      className="text-stone-400 hover:text-rose-600 transition p-1 rounded-md hover:bg-rose-50"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pr-12">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                      Hotel / Resort
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-base mt-1 group-hover:text-indigo-600 transition">
                      {lodg.hotelName || lodg.title}
                    </h4>
                  </div>

                  {/* Dates / Check-in */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">Check-In</span>
                      <span className="font-bold text-stone-900 block">{formatReadableDate(lodg.checkInDate)}</span>
                      <span className="text-[11px] text-purple-700 font-medium block">⏰ {lodg.checkInTime || '14:00'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">Check-Out</span>
                      <span className="font-bold text-stone-900 block">{formatReadableDate(lodg.checkOutDate)}</span>
                      <span className="text-[11px] text-purple-700 font-medium block">⏰ {lodg.checkOutTime || '11:00'}</span>
                    </div>
                  </div>

                  {/* Address */}
                  {lodg.address && (
                    <div className="flex items-center justify-between text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200/60">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span className="truncate font-medium">{lodg.address}</span>
                      </div>
                      {lodg.mapUrl && (
                        <a
                          href={lodg.mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md transition ml-2 flex-shrink-0"
                        >
                          <span>Map</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Confirmation Ref */}
                  {lodg.confirmationCode && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200/60 text-stone-700">
                        <Ticket className="w-3.5 h-3.5 text-stone-500" />
                        <span>Conf #: {lodg.confirmationCode}</span>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
