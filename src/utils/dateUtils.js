/**
 * Date and Time utilities designed to strictly prevent timezone drift
 * by handling dates directly in YYYY-MM-DD format.
 */

export function formatDateStr(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateStr(dateStr) {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatReadableDate(dateStr) {
  if (!dateStr) return '';
  const date = parseDateStr(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getDaysRange(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return [];
  const start = parseDateStr(startDateStr);
  const end = parseDateStr(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return [];
  }

  const days = [];
  const current = new Date(start);
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  while (current <= end) {
    const dStr = formatDateStr(current);
    days.push({
      dateStr: dStr,
      dayName: weekdays[current.getDay()],
      formattedDate: `${months[current.getMonth()]} ${current.getDate()}`,
      fullDateStr: dStr
    });
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function formatHourLabel(hourDecimal) {
  const hours = Math.floor(hourDecimal);
  const minutes = Math.round((hourDecimal - hours) * 60);
  
  const isPm = hours >= 12;
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  const minuteStr = String(minutes).padStart(2, '0');
  const suffix = isPm ? 'PM' : 'AM';

  return `${String(displayHour).padStart(2, '0')}:${minuteStr} ${suffix}`;
}

export function parseTimeToHourDecimal(timeStr, defaultHour = 9) {
  if (timeStr === null || timeStr === undefined) return defaultHour;
  const str = String(timeStr).trim();
  if (!str) return defaultHour;

  // Case 1: 4-digit military time e.g. "2025", "0830", "1710"
  const m4 = str.match(/^(\d{2})(\d{2})$/);
  if (m4) {
    const h = parseInt(m4[1], 10);
    const m = parseInt(m4[2], 10);
    if (h >= 0 && h < 24 && m >= 0 && m < 60) {
      return h + (m / 60);
    }
  }

  // Case 2: 3-digit military time e.g. "930", "845"
  const m3 = str.match(/^(\d{1})(\d{2})$/);
  if (m3) {
    const h = parseInt(m3[1], 10);
    const m = parseInt(m3[2], 10);
    if (h >= 0 && h < 10 && m >= 0 && m < 60) {
      return h + (m / 60);
    }
  }

  // Case 3: Standard time with colon e.g. "20:25", "08:30", "8:30 AM", "8:30 PM"
  const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;

    return hours + (minutes / 60);
  }

  // Case 4: Pure hour number e.g. "20", "8", "8 PM", "12 AM"
  const mHour = str.match(/^(\d{1,2})\s*(AM|PM)?$/i);
  if (mHour) {
    let hours = parseInt(mHour[1], 10);
    const ampm = mHour[2] ? mHour[2].toUpperCase() : null;
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    if (hours >= 0 && hours <= 24) {
      return hours;
    }
  }

  return defaultHour;
}

export function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  const decimal = parseTimeToHourDecimal(timeStr, -1);
  if (decimal < 0) return timeStr;
  return formatHourLabel(decimal);
}

export function getTodayDateStr() {
  return formatDateStr(new Date());
}

export function getFutureDateStr(daysAhead = 5) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return formatDateStr(date);
}
