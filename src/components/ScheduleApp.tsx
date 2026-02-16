import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { ArtistPanel } from "./schedule-app/components/ArtistPanel";
import { DayTabs } from "./schedule-app/components/DayTabs";
import { InstallBanner } from "./schedule-app/components/InstallBanner";
import { ScheduleTimeline } from "./schedule-app/components/ScheduleTimeline";
import { Toolbar } from "./schedule-app/components/Toolbar";
import { useInstallBanner } from "./schedule-app/hooks/useInstallBanner";
import { usePersistentScheduleState } from "./schedule-app/hooks/usePersistentScheduleState";
import {
  useImagePrefetch,
  useServiceWorkerUpdates,
  useTick,
  useTouchHint,
} from "./schedule-app/hooks/useRuntimeFeatures";
import type { AppConfig, FilterMode } from "./schedule-app/lib/types";
import {
  buildTimeLabels,
  getCurrentTimeInfo,
  getDayMaps,
  getStorageKeys,
  groupScheduleByDay,
  parseEventId,
} from "./schedule-app/lib/utils";

export default function ScheduleApp({
  appConfig,
  footerDesktop,
  touchHint,
}: {
  appConfig: AppConfig;
  footerDesktop: string;
  touchHint: string;
}) {
  const {
    artists,
    artistPageBaseUrl,
    artistPageLabel,
    buildId,
    cacheName,
    clearPrompt,
    festivalDays,
    festivalTimezone,
    footerTouch,
    installBannerAndroid,
    schedule,
    storagePrefix,
    swCachePrefix,
    timelineEndNext,
    timelineStart,
    venues,
  } = appConfig;

  const storageKeys = useMemo(
    () => getStorageKeys(storagePrefix),
    [storagePrefix],
  );
  const { dayOrder, dayDates, dayPanelLabels } = useMemo(
    () => getDayMaps(festivalDays),
    [festivalDays],
  );

  const totalHours = 24 - timelineStart + timelineEndNext;
  const timelineStartMins = timelineStart * 60;
  const labels = useMemo(
    () => buildTimeLabels(timelineStart, totalHours),
    [timelineStart, totalHours],
  );

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [panelEventId, setPanelEventId] = useState<string | null>(null);
  const [panelArtistName, setPanelArtistName] = useState("");

  const {
    selectedDay,
    selectionIds,
    selections,
    scrollPositions,
    setScrollPositions,
    setSelectedDay,
    setSelectionIds,
    toggleSelection,
  } = usePersistentScheduleState({
    storageKeys,
    dayOrder,
  });

  const tick = useTick();
  const { isTouchDevice, showTouchHint } = useTouchHint({ storageKeys });
  const { installBanner, dismissInstallBanner, triggerInstallPrompt } =
    useInstallBanner({
      storageKeys,
      installBannerAndroid,
    });

  useServiceWorkerUpdates({ buildId, swCachePrefix });
  useImagePrefetch({ artists, cacheName });

  const wrapperRefs = useRef<Record<string, HTMLDivElement | undefined>>({});
  const nowLineRef = useRef<HTMLDivElement | null>(null);

  const currentTime = useMemo(
    () =>
      getCurrentTimeInfo({
        festivalTimezone,
        timelineStart,
        dayDates,
        dayOrder,
      }),
    [tick, festivalTimezone, timelineStart, dayDates, dayOrder],
  );

  useEffect(() => {
    const wrapper = wrapperRefs.current[selectedDay];
    if (wrapper) {
      wrapper.scrollLeft = scrollPositions[selectedDay] || 0;
    }
  }, [selectedDay, scrollPositions]);

  useEffect(() => {
    if (!nowLineRef.current) {
      return;
    }
    const timeline = nowLineRef.current.closest(".timeline");
    const timeLabel = timeline?.querySelector(".time-label");
    if (timeLabel) {
      nowLineRef.current.style.top = `${(timeLabel as HTMLElement).offsetHeight}px`;
    }
  }, [selectedDay, filterMode, selectionIds, tick]);

  const scheduleByDay = useMemo(
    () =>
      groupScheduleByDay({
        dayOrder,
        schedule,
        venues,
        filterMode,
        selections,
      }),
    [dayOrder, schedule, venues, filterMode, selections],
  );

  const panelArtist = panelArtistName ? artists[panelArtistName] : null;
  const panelEventParts = panelEventId ? parseEventId(panelEventId) : null;
  const panelEvent = panelEventParts
    ? schedule[panelEventParts.day]?.[panelEventParts.idx] || null
    : null;

  const panelVenue = panelEvent
    ? venues.find((venue) => venue.id === panelEvent.venue)?.name || ""
    : "";

  const panelDayLabel = panelEventParts
    ? dayPanelLabels[panelEventParts.day] || ""
    : "";

  const openPanel = (artistName: string, evId: string) => {
    setPanelArtistName(artistName);
    setPanelEventId(evId);
  };

  const closePanel = () => {
    setPanelArtistName("");
    setPanelEventId(null);
  };

  const onClear = () => {
    if (!window.confirm(clearPrompt)) {
      return;
    }
    setSelectionIds([]);
  };

  return (
    <>
      <Toolbar
        filterMode={filterMode}
        selectedCount={selectionIds.length}
        onFilterChange={setFilterMode}
        onClear={onClear}
      />

      <DayTabs
        festivalDays={festivalDays}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
      />

      <ScheduleTimeline
        currentTime={currentTime}
        filterMode={filterMode}
        labels={labels}
        nowLineRef={nowLineRef}
        onOpenPanel={openPanel}
        onScrollPositionChange={(day, left) => {
          setScrollPositions((current) => ({ ...current, [day]: left }));
        }}
        scheduleByDay={scheduleByDay}
        selectedDay={selectedDay}
        selections={selections}
        timelineStart={timelineStart}
        timelineStartMins={timelineStartMins}
        totalHours={totalHours}
        wrapperRefs={wrapperRefs}
      />

      <footer id="footer-hint">
        {isTouchDevice ? footerTouch : footerDesktop}
      </footer>
      <div class={`touch-hint${showTouchHint ? " show" : ""}`} id="touch-hint">
        {touchHint}
      </div>

      <InstallBanner
        installBanner={installBanner}
        onDismiss={dismissInstallBanner}
        onInstall={triggerInstallPrompt}
      />

      <ArtistPanel
        artistPageBaseUrl={artistPageBaseUrl}
        artistPageLabel={artistPageLabel}
        panelArtist={panelArtist}
        panelArtistName={panelArtistName}
        panelDayLabel={panelDayLabel}
        panelEvent={panelEvent}
        panelEventId={panelEventId}
        panelVenue={panelVenue}
        selections={selections}
        onClose={closePanel}
        onToggleSelection={() => {
          if (panelEventId) {
            toggleSelection(panelEventId);
          }
        }}
      />
    </>
  );
}
