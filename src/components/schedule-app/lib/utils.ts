import type {
  CurrentTimeInfo,
  DayMaps,
  DayScheduleGroup,
  FestivalDay,
  FilterMode,
  IndexedScheduleEvent,
  ScheduleByDay,
  ScheduleEvent,
  StorageKeys,
  Venue,
} from "./types";

export function readJsonStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJsonStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStorageKeys(prefix: string): StorageKeys {
  const storageVersion = "v2";
  return {
    selections: `${prefix}-selections-${storageVersion}`,
    selectedDay: `${prefix}-selected-day-${storageVersion}`,
    scrollPositions: `${prefix}-scroll-positions-${storageVersion}`,
    hintShown: `${prefix}-hint-shown-${storageVersion}`,
    installDismissed: `${prefix}-install-dismissed-${storageVersion}`,
  };
}

export function timeToMinutes(time: string, timelineStart: number): number {
  const [hours, minutes] = time.split(":").map(Number);
  let total = hours * 60 + minutes;
  if (hours < timelineStart) {
    total += 24 * 60;
  }
  return total;
}

export function formatTime12Hour(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const suffix = hours >= 12 && hours < 24 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

export function buildTimeLabels(
  timelineStart: number,
  totalHours: number,
): string[] {
  return Array.from({ length: totalHours }, (_, offset) => {
    const hour = (timelineStart + offset) % 24;
    return `${hour % 12 || 12}:00 ${hour >= 12 && hour < 24 ? "PM" : "AM"}`;
  });
}

export function sanityThumb(url: string | undefined, width: number): string {
  return url ? `${url}?w=${width}&h=${width}&fit=crop&auto=format` : "";
}

export function toArtistSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");
}

export function eventId(day: string, index: number): string {
  return `${day}-${index}`;
}

export function parseEventId(id: string): { day: string; idx: number } {
  const [day, idx] = id.split("-");
  return { day, idx: Number.parseInt(idx, 10) };
}

export function getCurrentTimeInfo({
  festivalTimezone,
  timelineStart,
  dayDates,
  dayOrder,
}: {
  dayDates: Record<string, string>;
  dayOrder: string[];
  festivalTimezone: string;
  timelineStart: number;
}): CurrentTimeInfo | null {
  const now = new Date();
  const timezoneNow = new Date(
    now.toLocaleString("en-US", { timeZone: festivalTimezone }),
  );

  const hour = timezoneNow.getHours();
  const minute = timezoneNow.getMinutes();
  const timelineDate = new Date(timezoneNow);

  if (hour < timelineStart) {
    timelineDate.setDate(timelineDate.getDate() - 1);
  }

  const dateString = [
    timelineDate.getFullYear(),
    String(timelineDate.getMonth() + 1).padStart(2, "0"),
    String(timelineDate.getDate()).padStart(2, "0"),
  ].join("-");

  const day = dayOrder.find((dayId) => dayDates[dayId] === dateString);
  if (!day) {
    return null;
  }

  let totalMinutes = hour * 60 + minute;
  if (hour < timelineStart) {
    totalMinutes += 24 * 60;
  }

  return { day, totalMinutes };
}

export function timelineOffsetHours(
  minutes: number,
  timelineStartMins: number,
): number {
  return (minutes - timelineStartMins) / 60;
}

export function getDayMaps(festivalDays: FestivalDay[]): DayMaps {
  return {
    dayOrder: festivalDays.map((day) => day.id),
    dayDates: Object.fromEntries(festivalDays.map((day) => [day.id, day.date])),
    dayPanelLabels: Object.fromEntries(
      festivalDays.map((day) => [day.id, day.panelLabel || day.tabLabel]),
    ),
  };
}

export function groupScheduleByDay({
  dayOrder,
  schedule,
  venues,
  filterMode,
  selections,
}: {
  dayOrder: string[];
  filterMode: FilterMode;
  schedule: ScheduleByDay;
  selections: Set<string>;
  venues: Venue[];
}): DayScheduleGroup[] {
  return dayOrder.map((day) => {
    const dayEvents = schedule[day] || [];
    const usedVenues = new Set(dayEvents.map((event) => event.venue));
    const dayVenues = venues.filter((venue) => usedVenues.has(venue.id));
    const venueEvents = new Map<string, IndexedScheduleEvent[]>();

    dayEvents.forEach((event: ScheduleEvent, index: number) => {
      const id = eventId(day, index);
      if (filterMode === "selected" && !selections.has(id)) {
        return;
      }
      if (!venueEvents.has(event.venue)) {
        venueEvents.set(event.venue, []);
      }
      venueEvents.get(event.venue)?.push({ ...event, idx: index });
    });

    const filteredVenues =
      filterMode === "selected"
        ? dayVenues.filter((venue) => venueEvents.has(venue.id))
        : dayVenues;

    return { day, filteredVenues, venueEvents };
  });
}
