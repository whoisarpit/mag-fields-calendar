import { useRef } from "preact/hooks";
import { SCHEDULE_UI } from "../lib/constants";
import type {
  CurrentTimeInfo,
  DayScheduleGroup,
  FilterMode,
} from "../lib/types";
import {
  eventId,
  formatTime12Hour,
  timeToMinutes,
  timelineOffsetHours,
} from "../lib/utils";

export function ScheduleTimeline({
  currentTime,
  filterMode,
  labels,
  nowLineRef,
  onOpenPanel,
  onToggleSelection,
  onScrollPositionChange,
  scheduleByDay,
  selectedDay,
  selections,
  stageColors,
  timelineStart,
  timelineStartMins,
  totalHours,
  wrapperRefs,
}: {
  currentTime: CurrentTimeInfo | null;
  filterMode: FilterMode;
  labels: string[];
  nowLineRef: { current: HTMLDivElement | null };
  onOpenPanel: (artistName: string, eventId: string) => void;
  onToggleSelection: (eventId: string) => void;
  onScrollPositionChange: (day: string, left: number) => void;
  scheduleByDay: DayScheduleGroup[];
  selectedDay: string;
  selections: Set<string>;
  stageColors: Record<
    string,
    | {
        bg: string;
        border: string;
        hover: string;
        subtext: string;
        text: string;
      }
    | undefined
  >;
  timelineStart: number;
  timelineStartMins: number;
  totalHours: number;
  wrapperRefs: { current: Record<string, HTMLDivElement | undefined> };
}) {
  const longPressRef = useRef<{ timer: number | null; triggered: boolean }>({
    timer: null,
    triggered: false,
  });

  const clearLongPress = () => {
    if (longPressRef.current.timer) {
      window.clearTimeout(longPressRef.current.timer);
      longPressRef.current.timer = null;
    }
  };

  return (
    <div id="schedule-container">
      {scheduleByDay.map(({ day, filteredVenues, venueEvents }) => {
        const isActiveDay = day === selectedDay;
        const showNowLine = Boolean(currentTime && currentTime.day === day);
        const columns = `var(--venue-w) repeat(${totalHours}, var(--hour-w))`;
        const rows = `auto repeat(${filteredVenues.length}, var(--row-h))`;

        return (
          <div
            key={day}
            class={`timeline-wrapper${isActiveDay ? " active" : ""}`}
            data-day={day}
            ref={(node) => {
              if (node) {
                wrapperRefs.current[day] = node;
              }
            }}
            onScroll={(event) => {
              onScrollPositionChange(day, event.currentTarget.scrollLeft);
            }}
          >
            {filterMode === "selected" && filteredVenues.length === 0 ? (
              <div class="empty-state">No starred sets for this day</div>
            ) : (
              <div
                class="timeline"
                style={{
                  gridTemplateColumns: columns,
                  gridTemplateRows: rows,
                }}
              >
                <div class="timeline-corner"></div>
                {labels.map((label) => (
                  <div class="time-label" key={`${day}-${label}`}>
                    {label}
                  </div>
                ))}

                {filteredVenues.map((venue) => (
                  <div
                    key={`${day}-${venue.id}-group`}
                    style={{ display: "contents" }}
                  >
                    <div class="venue-label">{venue.name}</div>
                    {Array.from({ length: totalHours }, (_, column) => (
                      <div
                        class="venue-track-cell"
                        key={`${day}-${venue.id}-${column}`}
                        style={
                          column === 0 ? { position: "relative" } : undefined
                        }
                      >
                        {column === 0 &&
                          (venueEvents.get(venue.id) || []).map((event) => {
                            const id = eventId(day, event.idx);
                            const startMins = timeToMinutes(
                              event.start,
                              timelineStart,
                            );
                            const endMins = timeToMinutes(
                              event.end,
                              timelineStart,
                            );
                            const leftHours = timelineOffsetHours(
                              startMins,
                              timelineStartMins,
                            );
                            const durationHours = Math.max(
                              (endMins - startMins) / 60,
                              SCHEDULE_UI.minEventDurationHours,
                            );
                            const selected = selections.has(id);
                            const className = `event-block${selected ? " selected" : ""}`;
                            const color = stageColors[venue.id];

                            return (
                              <div
                                key={id}
                                class={className}
                                data-id={id}
                                data-artist={event.artist}
                                style={{
                                  "--event-bg": color?.bg,
                                  "--event-border": color?.border,
                                  "--event-hover": color?.hover,
                                  "--event-text": color?.text,
                                  "--event-subtext": color?.subtext,
                                  left: `calc(${leftHours} * var(--hour-w))`,
                                  width: `max(calc(${durationHours} * var(--hour-w)), 30px)`,
                                }}
                                title={`${event.artist} — ${formatTime12Hour(event.start)} – ${formatTime12Hour(event.end)}`}
                                onClick={() => onOpenPanel(event.artist, id)}
                                onContextMenu={(eventObj) => {
                                  eventObj.preventDefault();
                                  onToggleSelection(id);
                                }}
                                onTouchStart={() => {
                                  longPressRef.current.triggered = false;
                                  longPressRef.current.timer =
                                    window.setTimeout(() => {
                                      longPressRef.current.triggered = true;
                                      onToggleSelection(id);
                                    }, SCHEDULE_UI.longPressMs);
                                }}
                                onTouchMove={() => {
                                  clearLongPress();
                                }}
                                onTouchCancel={() => {
                                  clearLongPress();
                                }}
                                onTouchEnd={(eventObj) => {
                                  clearLongPress();
                                  if (longPressRef.current.triggered) {
                                    eventObj.preventDefault();
                                  }
                                }}
                              >
                                <span class="ev-name">{event.artist}</span>
                                <span class="ev-time">
                                  {formatTime12Hour(event.start)} –{" "}
                                  {formatTime12Hour(event.end)}
                                </span>
                                {selected ? (
                                  <span class="ev-star-indicator">Starred</span>
                                ) : null}
                                {event.tag ? (
                                  <span class="ev-tag">{event.tag}</span>
                                ) : null}
                              </div>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                ))}

                {showNowLine && currentTime ? (
                  <div
                    class="now-line"
                    ref={isActiveDay ? nowLineRef : undefined}
                    data-day={day}
                    style={{
                      left: `calc(var(--venue-w) + ${timelineOffsetHours(currentTime.totalMinutes, timelineStartMins)} * var(--hour-w))`,
                      height: `calc(${filteredVenues.length} * var(--row-h))`,
                    }}
                  ></div>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
