import { SCHEDULE_UI } from "../lib/constants";
import type { ArtistInfo, ScheduleEvent } from "../lib/types";
import { formatTime12Hour, sanityThumb, toArtistSlug } from "../lib/utils";

export function ArtistPanel({
  artistPageBaseUrl,
  artistPageLabel,
  panelArtist,
  panelArtistName,
  panelDayLabel,
  panelEvent,
  panelEventId,
  panelVenue,
  selections,
  onClose,
  onToggleSelection,
}: {
  artistPageBaseUrl: string;
  artistPageLabel: string;
  onClose: () => void;
  onToggleSelection: () => void;
  panelArtist: ArtistInfo | null;
  panelArtistName: string;
  panelDayLabel: string;
  panelEvent: ScheduleEvent | null;
  panelEventId: string | null;
  panelVenue: string;
  selections: Set<string>;
}) {
  const isSelected = panelEventId ? selections.has(panelEventId) : false;

  return (
    <>
      <div
        class={`panel-overlay${panelEventId ? " open" : ""}`}
        id="panel-overlay"
        onClick={onClose}
      ></div>
      <div
        class={`artist-panel${panelEventId ? " open" : ""}`}
        id="artist-panel"
      >
        <button class="panel-close" id="panel-close" onClick={onClose}>
          &times;
        </button>
        {panelArtist?.image ? (
          <img
            class="panel-img"
            id="panel-img"
            src={sanityThumb(panelArtist.image, SCHEDULE_UI.imageThumbSize)}
            alt={panelArtistName}
          />
        ) : null}
        <div class="panel-body">
          <div
            class={`panel-artist-name${isSelected ? " is-selected" : ""}`}
            id="panel-name"
          >
            {panelArtistName}
          </div>
          <div class="panel-meta" id="panel-meta">
            {panelEvent
              ? `${panelDayLabel} · ${formatTime12Hour(panelEvent.start)} – ${formatTime12Hour(panelEvent.end)} · ${panelVenue}`
              : ""}
          </div>
          <div class="panel-bio" id="panel-bio">
            {panelArtist?.bio || ""}
          </div>
          <div class="panel-links" id="panel-links">
            {panelArtist?.instagram ? (
              <a
                class="panel-link"
                href={panelArtist.instagram}
                target="_blank"
                rel="noopener"
              >
                Instagram
              </a>
            ) : null}
            {artistPageBaseUrl && panelArtistName ? (
              <a
                class="panel-link"
                href={`${artistPageBaseUrl}${toArtistSlug(panelArtistName)}`}
                target="_blank"
                rel="noopener"
              >
                {artistPageLabel}
              </a>
            ) : null}
          </div>
          <button
            class={`panel-star-btn${isSelected ? " is-selected" : ""}`}
            id="panel-star"
            disabled={!panelEventId}
            onClick={onToggleSelection}
          >
            {isSelected ? "Starred" : "Star this set"}
          </button>
        </div>
      </div>
    </>
  );
}
