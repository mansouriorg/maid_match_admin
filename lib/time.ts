// Every booking time is shown and typed in Paris time, wherever the admin is
// (for example in Tunis, where there is no summer time). The API stores times
// in UTC (ISO strings). These helpers convert between the two.
export const BUSINESS_TIME_ZONE = "Europe/Paris";

type Parts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

// The calendar date and the wall-clock time in Paris at a given moment.
export function parisParts(date: Date): Parts {
  const values: Record<string, number> = {};
  for (const part of partsFormatter.formatToParts(date)) {
    if (part.type !== "literal") {
      values[part.type] = Number(part.value);
    }
  }
  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
    second: values.second,
  };
}

// How far Paris is ahead of UTC at a given moment, in milliseconds.
function parisOffsetMs(timestamp: number): number {
  const p = parisParts(new Date(timestamp));
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(timestamp / 1000) * 1000;
}

// "2026-07-15" and "09:00" typed as Paris time give "2026-07-15T07:00:00.000Z".
export function parisWallTimeToIso(dateYmd: string, timeHm: string): string {
  const [year, month, day] = dateYmd.split("-").map(Number);
  const [hour, minute] = timeHm.split(":").map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = wallAsUtc - parisOffsetMs(wallAsUtc);
  // A second pass gives the right answer on the days the clocks change.
  timestamp = wallAsUtc - parisOffsetMs(timestamp);
  return new Date(timestamp).toISOString();
}

// Today's date in Paris, as "YYYY-MM-DD".
export function todayInParis(now: Date = new Date()): string {
  const p = parisParts(now);
  return [
    String(p.year),
    String(p.month).padStart(2, "0"),
    String(p.day).padStart(2, "0"),
  ].join("-");
}

// A Date whose getDate(), getHours() ... and plain toLocale...() calls show the
// Paris wall-clock values. Use it only to display or to group by day.
export function toParisWallClock(date: Date): Date {
  const p = parisParts(date);
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}
