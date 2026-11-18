'use strict';

// Day boundaries and hours in the business time zone (Asia/Karachi by default),
// so "today" means today in Lahore even if the server runs in UTC.

function partsIn(timeZone, date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const out = {};
  for (const { type, value } of fmt.formatToParts(date)) out[type] = Number(value);
  return out;
}

// Minutes the zone is ahead of UTC at that moment
function offsetMinutes(timeZone, date = new Date()) {
  const p = partsIn(timeZone, date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

function hourIn(timeZone, date = new Date()) {
  return partsIn(timeZone, date).hour;
}

// Start of the local day `daysAgo` days back, as a Date
function startOfDay(timeZone, daysAgo = 0, now = new Date()) {
  const p = partsIn(timeZone, now);
  const localMidnightAsUtc = Date.UTC(p.year, p.month - 1, p.day - daysAgo);
  return new Date(localMidnightAsUtc - offsetMinutes(timeZone, now) * 60000);
}

// YYYYMMDD in the local zone
function dayStamp(timeZone, date = new Date()) {
  const p = partsIn(timeZone, date);
  return `${p.year}${String(p.month).padStart(2, '0')}${String(p.day).padStart(2, '0')}`;
}

module.exports = { hourIn, startOfDay, dayStamp };
