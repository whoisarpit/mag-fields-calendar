import artists from "../../data/artists.json";
import branding from "../../data/branding.json";
import festival from "../../data/festival.json";
import schedule from "../../data/events.json";
import venues from "../../data/venues.json";

function resolveBuildId(publicBuildId) {
  return (
    publicBuildId ||
    process.env.GITHUB_SHA?.slice(0, 7) ||
    Date.now().toString(36)
  );
}

function resolveSwCachePrefix(storagePrefix) {
  return (
    String(storagePrefix || "festival")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "festival"
  );
}

function buildCssOverride(cssVariables) {
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

export function getSitePayload(publicBuildId) {
  const timeline = festival.timeline || {};
  const cssVariables = branding.cssVariables || {};
  const festivalDays = festival.days || [];

  const pageTitle =
    branding.pageTitle || branding.festivalName || "Festival Schedule";
  const themeColor = branding.themeColor || "#111111";
  const appShortName =
    branding.appShortName || branding.festivalName || "Festival";
  const festivalName = branding.festivalName || pageTitle;
  const festivalDates = branding.festivalDates || "";
  const footerDesktop = branding.footerDesktop || "";
  const touchHint = branding.touchHint || "";

  const buildId = resolveBuildId(publicBuildId);
  const swCachePrefix = resolveSwCachePrefix(festival.storagePrefix);

  return {
    appShortName,
    appConfig: {
      venues,
      artists,
      schedule,
      festivalDays,
      festivalTimezone: festival.timezone || "UTC",
      storagePrefix: festival.storagePrefix || "festival",
      timelineStart: timeline.startHour ?? 9,
      timelineEndNext: timeline.endNextDayHour ?? 6,
      artistPageBaseUrl: festival.artistPage?.baseUrl || "",
      artistPageLabel: festival.artistPage?.label || "Artist page",
      cacheName: `${swCachePrefix}-${buildId}`,
      clearPrompt: branding.clearPrompt || "Clear all selections?",
      footerTouch: branding.footerTouch || branding.footerDesktop || "",
      installBannerAndroid: branding.installBanner?.android || "",
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
