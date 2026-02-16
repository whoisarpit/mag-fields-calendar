import artists from "../../data/artists.json";
import branding from "../../data/branding.json";
import festival from "../../data/festival.json";
import schedule from "../../data/events.json";
import venues from "../../data/venues.json";
import type {
  AppConfig,
  FestivalDay,
  SitePayload,
} from "../components/schedule-app/lib/types";

function resolveBuildId(publicBuildId?: string): string {
  const runtimeProcess = (
    globalThis as typeof globalThis & {
      process?: { env?: { GITHUB_SHA?: string } };
    }
  ).process;
  return (
    publicBuildId ||
    runtimeProcess?.env?.GITHUB_SHA?.slice(0, 7) ||
    Date.now().toString(36)
  );
}

function resolveSwCachePrefix(storagePrefix?: string): string {
  return (
    String(storagePrefix || "festival")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "festival"
  );
}

function buildCssOverride(
  cssVariables: Record<string, string | undefined>,
): string {
  return `:root {
  --bg: ${cssVariables.bg || "#111111"};
  --bg-dark: ${cssVariables["bg-dark"] || "#000000"};
  --text: ${cssVariables.text || "#f2f2f2"};
  --text-dim: ${cssVariables["text-dim"] || "#cccccc"};
  --selected: ${cssVariables.selected || "#f6c445"};
  --selected-bg: ${cssVariables["selected-bg"] || "rgba(246, 196, 69, 0.18)"};
  --selected-border: ${cssVariables["selected-border"] || "rgba(246, 196, 69, 0.6)"};
  --border: ${cssVariables.border || "rgba(255, 255, 255, 0.15)"};
  --border-light: ${cssVariables["border-light"] || "rgba(255, 255, 255, 0.07)"};
  --card-bg: ${cssVariables["card-bg"] || "rgba(255, 255, 255, 0.06)"};
  --card-hover: ${cssVariables["card-hover"] || "rgba(255, 255, 255, 0.1)"};
  --now-line: ${cssVariables["now-line"] || "#ff6a3d"};
  --workshop-bg: ${cssVariables["workshop-bg"] || "rgba(138, 180, 180, 0.15)"};
  --workshop-border: ${cssVariables["workshop-border"] || "rgba(138, 180, 180, 0.4)"};
}`;
}

type FestivalData = {
  artistPage?: { baseUrl?: string; label?: string };
  days?: AppConfig["festivalDays"];
  storagePrefix?: string;
  timeline?: { endNextDayHour?: number; startHour?: number };
  timezone?: string;
};

type BrandingData = {
  appShortName?: string;
  clearPrompt?: string;
  cssVariables?: Record<string, string | undefined>;
  festivalDates?: string;
  festivalName?: string;
  footerDesktop?: string;
  footerTouch?: string;
  installBanner?: { android?: string };
  pageTitle?: string;
  stagePalette?: string[];
  themeColor?: string;
  touchHint?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function parseFestivalDays(input: unknown): FestivalDay[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.map((day, index) => {
    if (!isRecord(day)) {
      throw new Error(`Invalid festival day at index ${index}`);
    }

    const id = optionalString(day.id);
    const date = optionalString(day.date);
    const tabLabel = optionalString(day.tabLabel);
    const panelLabel = optionalString(day.panelLabel);

    if (!id || !date || !tabLabel) {
      throw new Error(`Festival day ${index} is missing id/date/tabLabel`);
    }

    return { id, date, tabLabel, panelLabel };
  });
}

function parseFestivalData(input: unknown): FestivalData {
  if (!isRecord(input)) {
    throw new Error("Invalid festival.json: expected object");
  }

  const artistPage = isRecord(input.artistPage)
    ? {
        baseUrl: optionalString(input.artistPage.baseUrl),
        label: optionalString(input.artistPage.label),
      }
    : undefined;

  const timeline = isRecord(input.timeline)
    ? {
        startHour:
          typeof input.timeline.startHour === "number"
            ? input.timeline.startHour
            : undefined,
        endNextDayHour:
          typeof input.timeline.endNextDayHour === "number"
            ? input.timeline.endNextDayHour
            : undefined,
      }
    : undefined;

  return {
    artistPage,
    days: parseFestivalDays(input.days),
    storagePrefix: optionalString(input.storagePrefix),
    timeline,
    timezone: optionalString(input.timezone),
  };
}

function parseBrandingData(input: unknown): BrandingData {
  if (!isRecord(input)) {
    throw new Error("Invalid branding.json: expected object");
  }

  const cssVariables = isRecord(input.cssVariables)
    ? Object.fromEntries(
        Object.entries(input.cssVariables).map(([key, value]) => [
          key,
          optionalString(value),
        ]),
      )
    : undefined;

  const installBanner = isRecord(input.installBanner)
    ? { android: optionalString(input.installBanner.android) }
    : undefined;

  return {
    appShortName: optionalString(input.appShortName),
    clearPrompt: optionalString(input.clearPrompt),
    cssVariables,
    festivalDates: optionalString(input.festivalDates),
    festivalName: optionalString(input.festivalName),
    footerDesktop: optionalString(input.footerDesktop),
    footerTouch: optionalString(input.footerTouch),
    installBanner,
    pageTitle: optionalString(input.pageTitle),
    stagePalette: Array.isArray(input.stagePalette)
      ? input.stagePalette.filter(
          (value): value is string => typeof value === "string",
        )
      : undefined,
    themeColor: optionalString(input.themeColor),
    touchHint: optionalString(input.touchHint),
  };
}

function parseArtistsData(input: unknown): AppConfig["artists"] {
  if (!isRecord(input)) {
    throw new Error("Invalid artists.json: expected object");
  }

  for (const [name, artist] of Object.entries(input)) {
    if (!isRecord(artist)) {
      throw new Error(`Invalid artist entry: ${name}`);
    }
    if (typeof artist.bio !== "string") {
      throw new Error(`Artist "${name}" is missing a string bio`);
    }
  }

  return input as AppConfig["artists"];
}

function parseVenuesData(input: unknown): AppConfig["venues"] {
  if (!Array.isArray(input)) {
    throw new Error("Invalid venues.json: expected array");
  }

  for (const [index, venue] of input.entries()) {
    if (!isRecord(venue)) {
      throw new Error(`Invalid venue at index ${index}`);
    }
    if (typeof venue.id !== "string" || typeof venue.name !== "string") {
      throw new Error(`Venue at index ${index} is missing id/name`);
    }
  }

  return input as AppConfig["venues"];
}

function parseScheduleData(input: unknown): AppConfig["schedule"] {
  if (!isRecord(input)) {
    throw new Error("Invalid events.json: expected object");
  }

  for (const [day, events] of Object.entries(input)) {
    if (!Array.isArray(events)) {
      throw new Error(`Schedule day "${day}" must be an array`);
    }

    for (const [index, event] of events.entries()) {
      if (!isRecord(event)) {
        throw new Error(`Invalid schedule event ${day}[${index}]`);
      }
      if (
        typeof event.artist !== "string" ||
        typeof event.start !== "string" ||
        typeof event.end !== "string" ||
        typeof event.venue !== "string"
      ) {
        throw new Error(`Schedule event ${day}[${index}] has invalid fields`);
      }
    }
  }

  return input as AppConfig["schedule"];
}

export function getSitePayload(publicBuildId?: string): SitePayload {
  const festivalData = parseFestivalData(festival);
  const brandingData = parseBrandingData(branding);
  const artistsData = parseArtistsData(artists);
  const venuesData = parseVenuesData(venues);
  const scheduleData = parseScheduleData(schedule);

  const timeline = festivalData.timeline || {};
  const cssVariables = brandingData.cssVariables || {};
  const festivalDays = festivalData.days || [];

  const pageTitle =
    brandingData.pageTitle || brandingData.festivalName || "Festival Schedule";
  const themeColor = brandingData.themeColor || "#111111";
  const appShortName =
    brandingData.appShortName || brandingData.festivalName || "Festival";
  const festivalName = brandingData.festivalName || pageTitle;
  const festivalDates = brandingData.festivalDates || "";
  const footerDesktop = brandingData.footerDesktop || "";
  const touchHint = brandingData.touchHint || "";

  const buildId = resolveBuildId(publicBuildId);
  const swCachePrefix = resolveSwCachePrefix(festivalData.storagePrefix);

  return {
    appShortName,
    appConfig: {
      venues: venuesData,
      artists: artistsData,
      schedule: scheduleData,
      festivalDays,
      festivalTimezone: festivalData.timezone || "UTC",
      storagePrefix: festivalData.storagePrefix || "festival",
      timelineStart: timeline.startHour ?? 9,
      timelineEndNext: timeline.endNextDayHour ?? 6,
      stagePalette:
        brandingData.stagePalette && brandingData.stagePalette.length > 0
          ? brandingData.stagePalette
          : ["#e8c547", "#e87547", "#6ea071", "#6f8cb8", "#b17eb3"],
      artistPageBaseUrl: festivalData.artistPage?.baseUrl || "",
      artistPageLabel: festivalData.artistPage?.label || "Artist page",
      cacheName: `${swCachePrefix}-${buildId}`,
      clearPrompt: brandingData.clearPrompt || "Clear all selections?",
      footerTouch: brandingData.footerTouch || brandingData.footerDesktop || "",
      installBannerAndroid: brandingData.installBanner?.android || "",
      buildId,
      swCachePrefix,
    },
    cssOverride: buildCssOverride(cssVariables),
    festivalDates,
    festivalName,
    footerDesktop,
    pageTitle,
    themeColor,
    touchHint,
  };
}
