import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { X, Plane, Hotel } from 'lucide-react';

export function TravelModal({ isOpen, onClose, editingTravelDetail }) {
  const { addTravelDetail, updateTravelDetail, tripData } = useTrip();
  const [formType, setFormType] = useState('flight'); // 'flight' | 'lodging'

  const [formData, setFormData] = useState({
    title: '',
    airline: '',
    flightNumber: '',
    departureDate: tripData.startDate || '',
    departureTime: '08:30',
    arrivalDate: tripData.startDate || '',
    arrivalTime: '10:45',
    departureAirport: '',
    arrivalAirport: '',
    hotelName: '',
    checkInDate: tripData.startDate || '',
    checkInTime: '14:00',
    checkOutDate: tripData.endDate || '',
    checkOutTime: '11:00',
    address: '',
    mapUrl: '',
    confirmationCode: '',
    notes: ''
  });

  useEffect(() => {
    if (editingTravelDetail) {
      setFormType(editingTravelDetail.type || 'flight');
      setFormData({
        title: editingTravelDetail.title || '',
        airline: editingTravelDetail.airline || '',
        flightNumber: editingTravelDetail.flightNumber || '',
        departureDate: editingTravelDetail.departureDate || tripData.startDate || '',
        departureTime: editingTravelDetail.departureTime || '08:30',
        arrivalDate: editingTravelDetail.arrivalDate || tripData.startDate || '',
        arrivalTime: editingTravelDetail.arrivalTime || '10:45',
        departureAirport: editingTravelDetail.departureAirport || '',
        arrivalAirport: editingTravelDetail.arrivalAirport || '',
        hotelName: editingTravelDetail.hotelName || '',
        checkInDate: editingTravelDetail.checkInDate || tripData.startDate || '',
        checkInTime: editingTravelDetail.checkInTime || '14:00',
        checkOutDate: editingTravelDetail.checkOutDate || tripData.endDate || '',
        checkOutTime: editingTravelDetail.checkOutTime || '11:00',
        address: editingTravelDetail.address || '',
        mapUrl: editingTravelDetail.mapUrl || '',
        confirmationCode: editingTravelDetail.confirmationCode || '',
        notes: editingTravelDetail.notes || ''
      });
    } else {
      setFormType('flight');
      setFormData({
        title: '',
        airline: '',
        flightNumber: '',
        departureDate: tripData.startDate || '',
        departureTime: '08:30',
        arrivalDate: tripData.startDate || '',
        arrivalTime: '10:45',
        departureAirport: '',
        arrivalAirport: '',
        hotelName: '',
        checkInDate: tripData.startDate || '',
        checkInTime: '14:00',
        checkOutDate: tripData.endDate || '',
        checkOutTime: '11:00',
        address: '',
        mapUrl: '',
        confirmationCode: '',
        notes: ''
      });
    }
  }, [editingTravelDetail, isOpen, tripData.startDate, tripData.endDate]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      type: formType,
      ...formData,
      title: formData.title || (formType === 'flight' ? `Flight ${formData.flightNumber}` : formData.hotelName)
    };

    if (editingTravelDetail) {
      updateTravelDetail(editingTravelDetail.id, payload);
    } else {
      addTravelDetail(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4 animate-in fade-in zoom-in duration-150">
        
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${formType === 'flight' ? 'bg-sky-50 text-sky-600' : 'bg-purple-50 text-purple-600'}`}>
              {formType === 'flight' ? <Plane className="w-5 h-5" /> : <Hotel className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg">
                {editingTravelDetail ? (formType === 'flight' ? 'Edit Flight' : 'Edit Accommodation') : 'Add Travel Detail'}
              </h3>
              <p className="text-xs text-stone-500 font-medium">Flight schedules, hotel check-ins, and confirmation details.</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Switcher (only active if creating new or switching type) */}
        {!editingTravelDetail && (
          <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFormType('flight')}
              className={`py-2 rounded-lg transition ${formType === 'flight' ? 'bg-white text-sky-700 shadow-2xs font-bold' : 'text-stone-600'}`}
            >
              ✈️ Flight
            </button>
            <button
              type="button"
              onClick={() => setFormType('lodging')}
              className={`py-2 rounded-lg transition ${formType === 'lodging' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-stone-600'}`}
            >
              🏨 Accommodation
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {formType === 'flight' ? (
            <>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Airline & Flight #</label>
                <input
                  type="text"
                  placeholder="e.g., South African Airways SA-312"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value, flightNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Departure Airport</label>
                  <input
                    type="text"
                    placeholder="e.g., JNB"
                    value={formData.departureAirport}
                    onChange={e => setFormData({ ...formData, departureAirport: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Arrival Airport</label>
                  <input
                    type="text"
                    placeholder="e.g., CPT"
                    value={formData.arrivalAirport}
                    onChange={e => setFormData({ ...formData, arrivalAirport: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Departure Date</label>
                  <input
                    type="date"
                    required
                    value={formData.departureDate}
                    onChange={e => setFormData({ ...formData, departureDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Departure Time</label>
                  <input
                    type="text"
                    placeholder="e.g., 08:30 AM"
                    value={formData.departureTime}
                    onChange={e => setFormData({ ...formData, departureTime: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Arrival Date</label>
                  <input
                    type="date"
                    required
                    value={formData.arrivalDate}
                    onChange={e => setFormData({ ...formData, arrivalDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Arrival Time</label>
                  <input
                    type="text"
                    placeholder="e.g., 10:45 AM"
                    value={formData.arrivalTime}
                    onChange={e => setFormData({ ...formData, arrivalTime: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Hotel / Property Name</label>
                <input
                  type="text"
                  placeholder="e.g., The Silo Hotel"
                  required
                  value={formData.hotelName}
                  onChange={e => setFormData({ ...formData, hotelName: e.target.value, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="Full hotel address..."
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value, mapUrl: `https://maps.google.com/?q=${encodeURIComponent(e.target.value)}` })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    required
                    value={formData.checkInDate}
                    onChange={e => setFormData({ ...formData, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Check-In Time</label>
                  <input
                    type="text"
                    placeholder="e.g., 14:00"
                    value={formData.checkInTime}
                    onChange={e => setFormData({ ...formData, checkInTime: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    required
                    value={formData.checkOutDate}
                    onChange={e => setFormData({ ...formData, checkOutDate: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Check-Out Time</label>
                  <input
                    type="text"
                    placeholder="e.g., 11:00"
                    value={formData.checkOutTime}
                    onChange={e => setFormData({ ...formData, checkOutTime: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Confirmation / Booking Code</label>
            <input
              type="text"
              placeholder="e.g., Ref # SA-9821X"
              value={formData.confirmationCode}
              onChange={e => setFormData({ ...formData, confirmationCode: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-stone-500 mb-1">Notes</label>
            <textarea
              rows="2"
              placeholder="Seat numbers, baggage limit, contact info..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 resize-none"
            ></textarea>
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
              {editingTravelDetail ? 'Save Changes' : 'Add Entry'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
