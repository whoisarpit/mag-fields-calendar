import type { FestivalDay } from "../lib/types";

export function DayTabs({
  festivalDays,
  selectedDay,
  onSelectDay,
}: {
  festivalDays: FestivalDay[];
  onSelectDay: (dayId: string) => void;
  selectedDay: string;
}) {
  return (
    <div class="day-tabs" id="day-tabs">
      {festivalDays.map((day) => (
        <button
          key={day.id}
          class={`day-tab${selectedDay === day.id ? " active" : ""}`}
          data-day={day.id}
          onClick={() => onSelectDay(day.id)}
        >
          {day.tabLabel}
        </button>
      ))}
    </div>
  );
}
