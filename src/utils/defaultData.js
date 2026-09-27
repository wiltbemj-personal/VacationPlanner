import { generateId } from './idUtils';
import { getTodayDateStr, getFutureDateStr } from './dateUtils';

export function createInitialTripState(tripName = "Voyageur Vacation") {
  const today = getTodayDateStr();
  const endDate = getFutureDateStr(5);

  const act1 = generateId('act');
  const act2 = generateId('act');
  const act3 = generateId('act');
  const act4 = generateId('act');

  return {
    tripName: tripName,
    startDate: today,
    endDate: endDate,
    activeMembers: [
      { id: 'user-1', name: 'Me', avatar: 'M', color: 'bg-indigo-600', isOnline: true }
    ],
    activities: [
      {
        id: act1,
        title: "City Sightseeing & Architecture Walk",
        category: "sightseeing",
        duration: 2,
        location: {
          name: "Historic Waterfront District",
          address: "Victoria & Alfred Waterfront, Cape Town, 8001",
          mapUrl: "https://maps.google.com/?q=Victoria+%26+Alfred+Waterfront+Cape+Town"
        },
        notes: "Leisurely stroll through historic harbors, grab coffee, and take photos of harbor views.",
        isScheduled: true,
        dateStr: today,
        startHour: 11, // 11:00 AM
        color: "emerald"
      },
      {
        id: act2,
        title: "Sunset Cableway & Mountain Lookout",
        category: "sightseeing",
        duration: 3,
        location: {
          name: "Table Mountain Aerial Cableway",
          address: "Tafelberg Rd, Gardens, Cape Town, 8001",
          mapUrl: "https://maps.google.com/?q=Table+Mountain+Aerial+Cableway+Cape+Town"
        },
        notes: "Online tickets booked. Cableway operates weather permitting.",
        isScheduled: true,
        dateStr: today,
        startHour: 15, // 3:00 PM
        color: "emerald"
      },
      {
        id: act3,
        title: "Seafood Tasting Dinner at Harbor Front",
        category: "dining",
        duration: 2,
        location: {
          name: "The Harbor House Restaurant",
          address: "Quay 4, V&A Waterfront, Cape Town, 8002",
          mapUrl: "https://maps.google.com/?q=Harbor+House+Restaurant+VA+Waterfront"
        },
        notes: "Reservation confirmed for 7:00 PM. Dress code smart casual.",
        isScheduled: true,
        dateStr: today,
        startHour: 19, // 7:00 PM
        color: "amber"
      },
      {
        id: act4,
        title: "Coastal Wine Tasting Tour",
        category: "dining",
        duration: 4,
        location: {
          name: "Constantia Valley Wine Estate",
          address: "Groot Constantia Rd, Constantia, Cape Town, 7806",
          mapUrl: "https://maps.google.com/?q=Groot+Constantia+Cape+Town"
        },
        notes: "Includes guided cellar walk and pairings. Shuttle arrives at 11 AM.",
        isScheduled: false,
        dateStr: "",
        startHour: 0,
        color: "amber"
      }
    ],
    travelDetails: [
      {
        id: generateId('flt'),
        type: 'flight',
        title: 'Flight SA-312 (Outbound)',
        airline: 'South African Airways',
        flightNumber: 'SA-312',
        departureDate: today,
        departureTime: '08:30',
        arrivalDate: today,
        arrivalTime: '10:45',
        departureAirport: 'JNB (Johannesburg)',
        arrivalAirport: 'CPT (Cape Town)',
        confirmationCode: 'SA-9821X',
        notes: 'Seat 14A (Window). Checked bag limit 23kg.'
      },
      {
        id: generateId('lodg'),
        type: 'lodging',
        title: 'Waterfront Luxury Hotel & Spa',
        hotelName: 'The Silo Hotel',
        checkInDate: today,
        checkInTime: '14:00',
        checkOutDate: endDate,
        checkOutTime: '11:00',
        address: 'Silo Square, V&A Waterfront, Cape Town, 8001',
        confirmationCode: 'SILO-77492',
        mapUrl: 'https://maps.google.com/?q=The+Silo+Hotel+Cape+Town',
        notes: 'Complimentary breakfast included. Late check-out requested.'
      }
    ]
  };
}
