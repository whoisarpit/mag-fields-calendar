const config = window.__APP_CONFIG__;

if (!config) {
  throw new Error("Missing app config");
}

const VENUES = config.venues;
const ARTISTS = config.artists;
const SCHEDULE = config.schedule;
const FESTIVAL_DAYS = config.festivalDays;
const FESTIVAL_DAY_ORDER = FESTIVAL_DAYS.map((d) => d.id);
const DAY_DATES = Object.fromEntries(FESTIVAL_DAYS.map((d) => [d.id, d.date]));
const DAY_PANEL_LABELS = Object.fromEntries(
  FESTIVAL_DAYS.map((d) => [d.id, d.panelLabel || d.tabLabel]),
);
const FESTIVAL_TIMEZONE = config.festivalTimezone;
const STORAGE_PREFIX = config.storagePrefix;
const STORAGE_KEY = `${STORAGE_PREFIX}-selections`;
const SELECTED_DAY_KEY = `${STORAGE_PREFIX}-selected-day`;
const SCROLL_POSITION_KEY = `${STORAGE_PREFIX}-scroll-positions`;
const HINT_SHOWN_KEY = `${STORAGE_PREFIX}-hint-shown`;
const INSTALL_DISMISSED_KEY = `${STORAGE_PREFIX}-install-dismissed`;
const TIMELINE_START = config.timelineStart;
const TIMELINE_END_NEXT = config.timelineEndNext;
const TOTAL_HOURS = 24 - TIMELINE_START + TIMELINE_END_NEXT;
const TIMELINE_START_MINS = TIMELINE_START * 60;
const ARTIST_PAGE_BASE_URL = config.artistPageBaseUrl;
const ARTIST_PAGE_LABEL = config.artistPageLabel;
const CACHE_NAME = config.cacheName;
const CLEAR_PROMPT = config.clearPrompt;
const FOOTER_TOUCH = config.footerTouch;
const INSTALL_BANNER_ANDROID = config.installBannerAndroid;
const BUILD_ID = config.buildId;
const SW_CACHE_PREFIX = config.swCachePrefix;

function sanityThumb(url, w) {
  if (!url) return "";
  return url + `?w=${w}&h=${w}&fit=crop&auto=format`;
}
function getHourWidth() {
  return parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--hour-w"),
  );
}

function eventId(day, i) {
  return `${day}-${i}`;
}
function loadSelections() {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function saveSelections(sel) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...sel]));
}

function saveSelectedDay(day) {
  localStorage.setItem(SELECTED_DAY_KEY, day);
}

function loadSelectedDay() {
  return localStorage.getItem(SELECTED_DAY_KEY) || FESTIVAL_DAY_ORDER[0];
}

function saveScrollPosition(day, scrollLeft) {
  try {
    const positions = JSON.parse(
      localStorage.getItem(SCROLL_POSITION_KEY) || "{}",
    );
    positions[day] = scrollLeft;
    localStorage.setItem(SCROLL_POSITION_KEY, JSON.stringify(positions));
  } catch (e) {
    // Ignore localStorage errors
  }
}

function loadScrollPosition(day) {
  try {
    const positions = JSON.parse(
      localStorage.getItem(SCROLL_POSITION_KEY) || "{}",
    );
    return positions[day] || 0;
  } catch (e) {
    return 0;
  }
}

let selections = loadSelections();
let filterMode = "all";

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  let mins = h * 60 + m;
  if (h < TIMELINE_START) mins += 24 * 60;
  return mins;
}
function minutesToPx(mins, pxPerHour) {
  return ((mins - TIMELINE_START_MINS) / 60) * pxPerHour;
}

function fmt12(t) {
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 && h < 24 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${suffix}`;
}

function timeLabels() {
  const labels = [];
  for (let i = 0; i < TOTAL_HOURS; i++) {
    const h = (TIMELINE_START + i) % 24;
    labels.push(`${h % 12 || 12}:00 ${h >= 12 && h < 24 ? "PM" : "AM"}`);
  }
  return labels;
}

function updateCounts() {
  const count = selections.size;
  document.getElementById("selected-count").textContent =
    count > 0 ? count : "";
  document.getElementById("clear-btn").disabled = count === 0;
}

function venuesForDay(day) {
  const used = new Set(SCHEDULE[day].map((e) => e.venue));
  return VENUES.filter((v) => used.has(v.id));
}

function getCurrentTimeInfo() {
  // Get current time in Asia/Kolkata timezone
  const now = new Date();
  const kolkataTime = new Date(
    now.toLocaleString("en-US", { timeZone: FESTIVAL_TIMEZONE }),
  );

  // Determine which day of the festival
  const year = kolkataTime.getFullYear();
  const month = kolkataTime.getMonth();
  const date = kolkataTime.getDate();
  const hours = kolkataTime.getHours();
  const minutes = kolkataTime.getMinutes();

  // Adjust date if it's early morning (before 11 AM, belongs to previous day's timeline)
  let festivalYear = year;
  let festivalMonth = month + 1; // Convert to 1-indexed
  let festivalDay = date;

  if (hours < TIMELINE_START) {
    // Subtract a day for early morning hours
    const tempDate = new Date(year, month, date);
    tempDate.setDate(tempDate.getDate() - 1);
    festivalYear = tempDate.getFullYear();
    festivalMonth = tempDate.getMonth() + 1;
    festivalDay = tempDate.getDate();
  }

  // Construct date string directly to avoid timezone issues
  const dateStr = `${festivalYear}-${String(festivalMonth).padStart(2, "0")}-${String(festivalDay).padStart(2, "0")}`;
  const day = FESTIVAL_DAY_ORDER.find((dayId) => DAY_DATES[dayId] === dateStr);

  if (!day) return null;

  // Calculate minutes since timeline start
  let totalMinutes = hours * 60 + minutes;
  if (hours < TIMELINE_START) totalMinutes += 24 * 60;

  console.log("Current time:", {
    kolkataTime: kolkataTime.toISOString(),
    day,
    hours,
    minutes,
    totalMinutes,
  });

  return { day, totalMinutes };
}

function renderTimeline(day) {
  const events = SCHEDULE[day];
  const venues = venuesForDay(day);
  const labels = timeLabels();
  const pxPerHour = getHourWidth();

  const venueEvents = new Map();
  events.forEach((ev, i) => {
    const id = eventId(day, i);
    if (filterMode === "selected" && !selections.has(id)) return;
    if (!venueEvents.has(ev.venue)) venueEvents.set(ev.venue, []);
    venueEvents.get(ev.venue).push({ ...ev, idx: i });
  });

  const filteredVenues =
    filterMode === "selected"
      ? venues.filter((v) => venueEvents.has(v.id))
      : venues;
  if (filterMode === "selected" && filteredVenues.length === 0) {
    return `<div class="empty-state">No starred sets for this day</div>`;
  }

  const cols = `var(--venue-w) repeat(${TOTAL_HOURS}, var(--hour-w))`;
  const rows = `auto repeat(${filteredVenues.length}, var(--row-h))`;

  // Calculate "now" line position if applicable
  const currentTime = getCurrentTimeInfo();
  const showNowLine = currentTime && currentTime.day === day;

  let html = `<div class="timeline" style="grid-template-columns:${cols}; grid-template-rows:${rows};">`;
  html += `<div class="timeline-corner"></div>`;
  for (const label of labels) html += `<div class="time-label">${label}</div>`;

  filteredVenues.forEach((v, vIdx) => {
    html += `<div class="venue-label">${v.name}</div>`;
    for (let c = 0; c < TOTAL_HOURS; c++) {
      html += `<div class="venue-track-cell"${c === 0 ? ' style="position:relative;"' : ""}>`;
      if (c === 0) {
        const evts = venueEvents.get(v.id) || [];
        for (const ev of evts) {
          const startMins = timeToMinutes(ev.start);
          const endMins = timeToMinutes(ev.end);
          const left = minutesToPx(startMins, pxPerHour);
          const width = Math.max(((endMins - startMins) / 60) * pxPerHour, 30);
          const id = eventId(day, ev.idx);
          const sel = selections.has(id) ? " selected" : "";
          const workshop = ev.tag === "Workshop" ? " workshop" : "";
          const tagHtml = ev.tag ? `<span class="ev-tag">${ev.tag}</span>` : "";
          html += `<div class="event-block${sel}${workshop}" data-id="${id}" data-artist="${ev.artist.replace(/"/g, "&quot;")}" style="left:${left}px; width:${width}px;" title="${ev.artist} \u2014 ${fmt12(ev.start)} \u2013 ${fmt12(ev.end)}">`;
          html += `<span class="ev-name">${ev.artist}</span>`;
          html += `<span class="ev-time">${fmt12(ev.start)} \u2013 ${fmt12(ev.end)}</span>`;
          html += tagHtml;
          html += `</div>`;
        }
      }
      html += `</div>`;
    }
  });

  // Add "now" line outside the grid, positioned absolutely
  if (showNowLine) {
    const nowLeft =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--venue-w",
        ),
      ) + minutesToPx(currentTime.totalMinutes, pxPerHour);
    const venueRowsHeight =
      filteredVenues.length *
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--row-h"),
      );
    html += `<div class="now-line" data-day="${day}" style="left:${nowLeft}px; height:${venueRowsHeight}px;"></div>`;
  }

  html += `</div>`;
  return html;
}

function render() {
  const container = document.getElementById("schedule-container");
  container.innerHTML = "";
  for (const day of FESTIVAL_DAY_ORDER) {
    const isActive = document
      .querySelector(`.day-tab[data-day="${day}"]`)
      .classList.contains("active");
    const wrapper = document.createElement("div");
    wrapper.className = `timeline-wrapper${isActive ? " active" : ""}`;
    wrapper.dataset.day = day;
    wrapper.innerHTML = renderTimeline(day);
    container.appendChild(wrapper);

    // Attach scroll listener
    wrapper.addEventListener("scroll", () => {
      saveScrollPosition(day, wrapper.scrollLeft);
    });

    // Restore scroll position if this is the active day
    if (isActive) {
      requestAnimationFrame(() => {
        wrapper.scrollLeft = loadScrollPosition(day);
      });
    }
  }
  updateCounts();

  // Position now-line after time label row (needs to be done after DOM is rendered)
  requestAnimationFrame(() => {
    const nowLine = document.querySelector(".now-line");
    if (nowLine) {
      const timeline = nowLine.closest(".timeline");
      const timeLabel = timeline?.querySelector(".time-label");
      if (timeLabel) {
        const timeLabelHeight = timeLabel.offsetHeight;
        nowLine.style.top = `${timeLabelHeight}px`;
      }
    }
  });
}

// Artist panel
let currentPanelId = null;

function openPanel(artistName, evId) {
  const info = ARTISTS[artistName];
  if (!info) return;
  currentPanelId = evId;
  const panel = document.getElementById("artist-panel");
  const overlay = document.getElementById("panel-overlay");
  const imgEl = document.getElementById("panel-img");

  document.getElementById("panel-name").textContent = artistName;
  document.getElementById("panel-name").className =
    "panel-artist-name" + (selections.has(evId) ? " is-selected" : "");

  const ev = findEvent(evId);
  const venueName = ev ? VENUES.find((v) => v.id === ev.venue)?.name : "";
  const dayLabel = DAY_PANEL_LABELS[evId.split("-")[0]] || "";
  document.getElementById("panel-meta").textContent = ev
    ? `${dayLabel} \u00b7 ${fmt12(ev.start)} \u2013 ${fmt12(ev.end)} \u00b7 ${venueName}`
    : "";

  document.getElementById("panel-bio").textContent = info.bio;

  const linksEl = document.getElementById("panel-links");
  linksEl.innerHTML = "";
  if (info.instagram) {
    const a = document.createElement("a");
    a.className = "panel-link";
    a.href = info.instagram;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Instagram";
    linksEl.appendChild(a);
  }
  if (ARTIST_PAGE_BASE_URL) {
    const mfLink = document.createElement("a");
    mfLink.className = "panel-link";
    mfLink.href = `${ARTIST_PAGE_BASE_URL}${artistName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "")}`;
    mfLink.target = "_blank";
    mfLink.rel = "noopener";
    mfLink.textContent = ARTIST_PAGE_LABEL;
    linksEl.appendChild(mfLink);
  }

  updatePanelStar();

  const thumbUrl = info.image ? sanityThumb(info.image, 840) : "";
  if (!thumbUrl) {
    imgEl.style.display = "none";
    imgEl.src = "";
    panel.classList.add("open");
    overlay.classList.add("open");
    return;
  }

  if (imgEl.src === thumbUrl) {
    imgEl.style.display = "block";
    panel.classList.add("open");
    overlay.classList.add("open");
    return;
  }

  imgEl.style.display = "block";
  const preload = new Image();
  const show = () => {
    imgEl.src = thumbUrl;
    panel.classList.add("open");
    overlay.classList.add("open");
  };
  preload.onload = show;
  preload.onerror = show;
  preload.src = thumbUrl;
}

function findEvent(evId) {
  const [day, idx] = evId.split("-");
  return SCHEDULE[day]?.[parseInt(idx)];
}

function updatePanelStar() {
  const btn = document.getElementById("panel-star");
  const isSel = selections.has(currentPanelId);
  btn.textContent = isSel ? "Starred" : "Star this set";
  btn.className = "panel-star-btn" + (isSel ? " is-selected" : "");
  document.getElementById("panel-name").className =
    "panel-artist-name" + (isSel ? " is-selected" : "");
}

function closePanel() {
  document.getElementById("artist-panel").classList.remove("open");
  document.getElementById("panel-overlay").classList.remove("open");
  currentPanelId = null;
}

document.getElementById("panel-close").addEventListener("click", closePanel);
document.getElementById("panel-overlay").addEventListener("click", closePanel);

document.getElementById("panel-star").addEventListener("click", () => {
  if (!currentPanelId) return;
  if (selections.has(currentPanelId)) selections.delete(currentPanelId);
  else selections.add(currentPanelId);
  saveSelections(selections);
  updatePanelStar();
  const block = document.querySelector(
    `.event-block[data-id="${currentPanelId}"]`,
  );
  if (block) block.classList.toggle("selected", selections.has(currentPanelId));
  updateCounts();
});

// Event handlers
document.getElementById("schedule-container").addEventListener("click", (e) => {
  const block = e.target.closest(".event-block");
  if (!block) return;
  const id = block.dataset.id;
  if (selections.has(id)) selections.delete(id);
  else selections.add(id);
  saveSelections(selections);
  if (filterMode === "selected") {
    render();
  } else {
    block.classList.toggle("selected");
    updateCounts();
  }
});

document
  .getElementById("schedule-container")
  .addEventListener("contextmenu", (e) => {
    const block = e.target.closest(".event-block");
    if (!block) return;
    e.preventDefault();
    openPanel(block.dataset.artist, block.dataset.id);
  });

// Long press for mobile
let longPressTimer = null;
let longPressTriggered = false;
document.getElementById("schedule-container").addEventListener(
  "touchstart",
  (e) => {
    const block = e.target.closest(".event-block");
    if (!block) return;
    longPressTriggered = false;
    longPressTimer = setTimeout(() => {
      longPressTriggered = true;
      openPanel(block.dataset.artist, block.dataset.id);
    }, 500);
  },
  { passive: true },
);
document
  .getElementById("schedule-container")
  .addEventListener("touchend", (e) => {
    clearTimeout(longPressTimer);
    if (longPressTriggered) {
      e.preventDefault();
    }
  });
document.getElementById("schedule-container").addEventListener(
  "touchmove",
  () => {
    clearTimeout(longPressTimer);
  },
  { passive: true },
);

document.getElementById("day-tabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".day-tab");
  if (!tab) return;
  const selectedDay = tab.dataset.day;
  document
    .querySelectorAll(".day-tab")
    .forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  document.querySelectorAll(".timeline-wrapper").forEach((w) => {
    const isActive = w.dataset.day === selectedDay;
    w.classList.toggle("active", isActive);
    // Restore scroll position when switching to this day
    if (isActive) {
      requestAnimationFrame(() => {
        w.scrollLeft = loadScrollPosition(selectedDay);
      });
    }
  });
  saveSelectedDay(selectedDay);
});

document.getElementById("filter-all").addEventListener("click", () => {
  filterMode = "all";
  document.getElementById("filter-all").classList.add("active");
  document.getElementById("filter-selected").classList.remove("active");
  render();
});

document.getElementById("filter-selected").addEventListener("click", () => {
  filterMode = "selected";
  document.getElementById("filter-selected").classList.add("active");
  document.getElementById("filter-all").classList.remove("active");
  render();
});

document.getElementById("clear-btn").addEventListener("click", () => {
  if (!confirm(CLEAR_PROMPT)) return;
  selections.clear();
  saveSelections(selections);
  render();
});

function renderDayTabs() {
  const tabs = document.getElementById("day-tabs");
  tabs.innerHTML = FESTIVAL_DAYS.map(
    (day, idx) =>
      `<button class="day-tab${idx === 0 ? " active" : ""}" data-day="${day.id}">${day.tabLabel}</button>`,
  ).join("");
}

renderDayTabs();

// Restore selected day from localStorage BEFORE render
(() => {
  const savedDay = loadSelectedDay();
  const savedTab = document.querySelector(`.day-tab[data-day="${savedDay}"]`);
  if (savedTab) {
    document
      .querySelectorAll(".day-tab")
      .forEach((t) => t.classList.remove("active"));
    savedTab.classList.add("active");
  }
})();

render();

// Update "now" line every minute
setInterval(() => {
  const currentTime = getCurrentTimeInfo();
  if (currentTime) {
    render();
  }
}, 60000);

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(render, 150);
});

if ("ontouchstart" in window) {
  document.getElementById("footer-hint").textContent = FOOTER_TOUCH;
  const hint = document.getElementById("touch-hint");
  const hintShown = localStorage.getItem(HINT_SHOWN_KEY);
  if (!hintShown) {
    setTimeout(() => {
      hint.classList.add("show");
    }, 1000);
    setTimeout(() => {
      hint.classList.remove("show");
      localStorage.setItem(HINT_SHOWN_KEY, "1");
    }, 4000);
  }
}

// Service worker registration and auto-update
if ("serviceWorker" in navigator) {
  let refreshing = false;
  const swUrl = `sw.js?v=${encodeURIComponent(BUILD_ID)}&p=${encodeURIComponent(SW_CACHE_PREFIX)}`;

  navigator.serviceWorker.register(swUrl).then((registration) => {
    // Check for updates every 60 seconds
    setInterval(() => {
      registration.update();
    }, 60000);
  });

  // Reload when service worker takes control
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}

// Preload all artist images for offline use
(() => {
  const imageUrls = Object.values(ARTISTS)
    .map((a) => a.image)
    .filter((url) => url)
    .map((url) => sanityThumb(url, 840));

  if (imageUrls.length > 0 && "caches" in window) {
    caches.open(CACHE_NAME).then((cache) => {
      imageUrls.forEach((url) => {
        fetch(url, { mode: "no-cors" })
          .then((response) => {
            if (response.ok || response.type === "opaque") {
              cache.put(url, response);
            }
          })
          .catch(() => {});
      });
    });
  }
})();

// Install prompt
(() => {
  if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;
  if (window.matchMedia("(display-mode: standalone)").matches) return;
  if (navigator.standalone) return;

  const banner = document.getElementById("install-banner");
  const text = document.getElementById("install-banner-text");
  const btn = document.getElementById("install-banner-btn");
  const dismiss = document.getElementById("install-banner-dismiss");

  let deferredPrompt = null;

  dismiss.addEventListener("click", () => {
    banner.classList.remove("show");
    localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
  });

  // Android / Chrome
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    text.textContent = INSTALL_BANNER_ANDROID;
    btn.textContent = "Install";
    banner.classList.add("show");
  });

  btn.addEventListener("click", () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        banner.classList.remove("show");
        deferredPrompt = null;
      });
    } else {
      banner.classList.remove("show");
      localStorage.setItem(INSTALL_DISMISSED_KEY, "1");
    }
  });

  // iOS Safari only
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isSafari =
    /Safari/.test(navigator.userAgent) &&
    !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent);

  if (isIos && isSafari) {
    text.innerHTML =
      "Tap the <strong>Share button ⬆︎</strong> on your browser at the bottom → scroll to <strong>Add to Home Screen</strong> → tap <strong>Add</strong>";
    btn.style.display = "none";
    banner.classList.add("show");
  }
})();
