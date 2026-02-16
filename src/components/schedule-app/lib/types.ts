export type FilterMode = "all" | "selected";

export interface ArtistInfo {
  bio: string;
  image?: string | null;
  instagram?: string | null;
}

export type ArtistsMap = Record<string, ArtistInfo>;

export interface Venue {
  id: string;
  name: string;
}

export interface ScheduleEvent {
  artist: string;
  end: string;
  start: string;
  tag?: string;
  venue: string;
}

export interface IndexedScheduleEvent extends ScheduleEvent {
  idx: number;
}

export type ScheduleByDay = Record<string, ScheduleEvent[]>;

export interface FestivalDay {
  date: string;
  id: string;
  panelLabel?: string;
  tabLabel: string;
}

export interface StorageKeys {
  hintShown: string;
  installDismissed: string;
  scrollPositions: string;
  selectedDay: string;
  selections: string;
}

export interface AppConfig {
  artists: ArtistsMap;
  artistPageBaseUrl: string;
  artistPageLabel: string;
  buildId: string;
  cacheName: string;
  clearPrompt: string;
  festivalDays: FestivalDay[];
  festivalTimezone: string;
  footerTouch: string;
  installBannerAndroid: string;
  schedule: ScheduleByDay;
  storagePrefix: string;
  swCachePrefix: string;
  timelineEndNext: number;
  timelineStart: number;
  venues: Venue[];
}

export interface CurrentTimeInfo {
  day: string;
  totalMinutes: number;
}

export interface DayMaps {
  dayDates: Record<string, string>;
  dayOrder: string[];
  dayPanelLabels: Record<string, string>;
}

export interface DayScheduleGroup {
  day: string;
  filteredVenues: Venue[];
  venueEvents: Map<string, IndexedScheduleEvent[]>;
}

export interface InstallBannerState {
  buttonLabel: string;
  buttonVisible: boolean;
  show: boolean;
  text: string;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export interface SitePayload {
  appConfig: AppConfig;
  appShortName: string;
  cssOverride: string;
  festivalDates: string;
  festivalName: string;
  footerDesktop: string;
  pageTitle: string;
  themeColor: string;
  touchHint: string;
}
