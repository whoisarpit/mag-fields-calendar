#!/usr/bin/env node
const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "dist");
const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const readText = (file) => fs.readFileSync(path.join(root, file), "utf8");

const venues = readJson("data/venues.json");
const artists = readJson("data/artists.json");
const schedule = readJson("data/events.json");
const branding = readJson("data/branding.json");
const festival = readJson("data/festival.json");

const jsString = (value) => JSON.stringify(String(value)).slice(1, -1);
const slug = (value) =>
  String(value || "festival")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const gitHash = execSync("git rev-parse --short HEAD").toString().trim();
const cachePrefix = slug(festival.storagePrefix || "festival");
const cacheVersion = `${cachePrefix}-${gitHash}`;

const timeline = festival.timeline || {};
const themeColor = branding.themeColor || "#111111";
const appShortName =
  branding.appShortName || branding.festivalName || "Festival";
const cssVars = branding.cssVariables || {};
const manifestName =
  branding.manifestName || branding.pageTitle || branding.festivalName;
const manifestDescription =
  branding.manifestDescription ||
  `Schedule picker for ${branding.festivalName}`;

const replacements = new Map([
  ["__PAGE_TITLE__", branding.pageTitle || manifestName],
  ["__THEME_COLOR__", themeColor],
  ["__APP_SHORT_NAME__", appShortName],
  ["__FESTIVAL_NAME__", branding.festivalName || manifestName],
  ["__FESTIVAL_DATES__", branding.festivalDates || ""],
  ["__FOOTER_DESKTOP__", branding.footerDesktop || ""],
  [
    "__FOOTER_TOUCH__",
    jsString(branding.footerTouch || branding.footerDesktop || ""),
  ],
  ["__TOUCH_HINT__", branding.touchHint || ""],
  [
    "__INSTALL_BANNER_ANDROID__",
    jsString(branding.installBanner?.android || ""),
  ],
  ["__VENUES__", JSON.stringify(venues)],
  ["__ARTISTS__", JSON.stringify(artists)],
  ["__SCHEDULE__", JSON.stringify(schedule)],
  ["__FESTIVAL_DAYS__", JSON.stringify(festival.days || [])],
  ["__FESTIVAL_TIMEZONE__", jsString(festival.timezone || "UTC")],
  ["__STORAGE_PREFIX__", jsString(festival.storagePrefix || "festival")],
  ["__TIMELINE_START__", String(timeline.startHour ?? 9)],
  ["__TIMELINE_END_NEXT__", String(timeline.endNextDayHour ?? 6)],
  ["__ARTIST_PAGE_BASE_URL__", jsString(festival.artistPage?.baseUrl || "")],
  [
    "__ARTIST_PAGE_LABEL__",
    jsString(festival.artistPage?.label || "Artist page"),
  ],
  ["__CACHE_NAME__", cacheVersion],
  [
    "__CLEAR_PROMPT__",
    jsString(branding.clearPrompt || "Clear all selections?"),
  ],
  ["__MANIFEST_NAME__", manifestName || ""],
  ["__MANIFEST_DESCRIPTION__", manifestDescription || ""],
  ["__CSS_BG__", cssVars.bg || "#111111"],
  ["__CSS_BG_DARK__", cssVars["bg-dark"] || "#000000"],
  ["__CSS_TEXT__", cssVars.text || "#f2f2f2"],
  ["__CSS_TEXT_DIM__", cssVars["text-dim"] || "#cccccc"],
  ["__CSS_SELECTED__", cssVars.selected || "#f6c445"],
  ["__CSS_SELECTED_BG__", cssVars["selected-bg"] || "rgba(246, 196, 69, 0.18)"],
  [
    "__CSS_SELECTED_BORDER__",
    cssVars["selected-border"] || "rgba(246, 196, 69, 0.6)",
  ],
  ["__CSS_BORDER__", cssVars.border || "rgba(255, 255, 255, 0.15)"],
  [
    "__CSS_BORDER_LIGHT__",
    cssVars["border-light"] || "rgba(255, 255, 255, 0.07)",
  ],
  ["__CSS_CARD_BG__", cssVars["card-bg"] || "rgba(255, 255, 255, 0.06)"],
  ["__CSS_CARD_HOVER__", cssVars["card-hover"] || "rgba(255, 255, 255, 0.1)"],
  ["__CSS_NOW_LINE__", cssVars["now-line"] || "#ff6a3d"],
  [
    "__CSS_WORKSHOP_BG__",
    cssVars["workshop-bg"] || "rgba(138, 180, 180, 0.15)",
  ],
  [
    "__CSS_WORKSHOP_BORDER__",
    cssVars["workshop-border"] || "rgba(138, 180, 180, 0.4)",
  ],
]);

console.log(`Building with cache version: ${cacheVersion}`);

const render = (templatePath, outputPath) => {
  let content = readText(templatePath);
  for (const [token, value] of replacements.entries()) {
    content = content.split(token).join(value);
  }
  fs.writeFileSync(path.join(outDir, outputPath), content);
};

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

render("index.template.html", "index.html");
render("sw.template.js", "sw.js");
render("manifest.template.json", "manifest.json");

const staticFiles = [
  "CNAME",
  "favicon-32.png",
  "favicon.ico",
  "icon-192.png",
  "icon-512.png",
];

for (const file of staticFiles) {
  const source = path.join(root, file);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(outDir, file));
  }
}

console.log("✓ Generated dist/index.html, dist/sw.js, and dist/manifest.json");
