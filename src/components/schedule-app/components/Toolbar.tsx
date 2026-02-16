import type { FilterMode } from "../lib/types";

export function Toolbar({
  filterMode,
  selectedCount,
  onFilterChange,
  onClear,
}: {
  filterMode: FilterMode;
  onClear: () => void;
  onFilterChange: (mode: FilterMode) => void;
  selectedCount: number;
}) {
  return (
    <div class="toolbar">
      <button
        class={`toolbar-btn${filterMode === "all" ? " active" : ""}`}
        id="filter-all"
        onClick={() => onFilterChange("all")}
      >
        All
      </button>
      <button
        class={`toolbar-btn${filterMode === "selected" ? " active" : ""}`}
        id="filter-selected"
        onClick={() => onFilterChange("selected")}
      >
        Starred
        <span class="count-badge" id="selected-count">
          {selectedCount || ""}
        </span>
      </button>
      <button
        class="toolbar-btn accent"
        id="clear-btn"
        disabled={selectedCount === 0}
        onClick={onClear}
      >
        Clear all
      </button>
    </div>
  );
}
