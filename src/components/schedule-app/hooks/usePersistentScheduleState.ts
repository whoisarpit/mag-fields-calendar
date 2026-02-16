import { useEffect, useMemo, useState } from "preact/hooks";
import type { StorageKeys } from "../lib/types";
import { readJsonStorage, writeJsonStorage } from "../lib/utils";

export function usePersistentScheduleState({
  storageKeys,
  dayOrder,
}: {
  dayOrder: string[];
  storageKeys: StorageKeys;
}) {
  const [selectedDay, setSelectedDay] = useState(dayOrder[0]);
  const [selectionIds, setSelectionIds] = useState<string[]>([]);
  const [scrollPositions, setScrollPositions] = useState<
    Record<string, number>
  >({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistedSelections = readJsonStorage<string[]>(
      storageKeys.selections,
      [],
    );
    const persistedDay = localStorage.getItem(storageKeys.selectedDay);
    const persistedScroll = readJsonStorage<Record<string, number>>(
      storageKeys.scrollPositions,
      {},
    );

    setSelectionIds(
      Array.isArray(persistedSelections) ? persistedSelections : [],
    );
    setSelectedDay(
      persistedDay && dayOrder.includes(persistedDay)
        ? persistedDay
        : dayOrder[0],
    );
    setScrollPositions(
      persistedScroll && typeof persistedScroll === "object"
        ? persistedScroll
        : {},
    );
    setHydrated(true);
  }, [storageKeys, dayOrder]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    writeJsonStorage(storageKeys.selections, selectionIds);
  }, [hydrated, selectionIds, storageKeys]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    localStorage.setItem(storageKeys.selectedDay, selectedDay);
  }, [hydrated, selectedDay, storageKeys]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    writeJsonStorage(storageKeys.scrollPositions, scrollPositions);
  }, [hydrated, scrollPositions, storageKeys]);

  const selections = useMemo(() => new Set(selectionIds), [selectionIds]);

  const toggleSelection = (evId: string) => {
    setSelectionIds((current) => {
      const currentSet = new Set(current);
      if (currentSet.has(evId)) {
        currentSet.delete(evId);
      } else {
        currentSet.add(evId);
      }
      return [...currentSet];
    });
  };

  return {
    selectedDay,
    selectionIds,
    selections,
    scrollPositions,
    setScrollPositions,
    setSelectedDay,
    setSelectionIds,
    toggleSelection,
  };
}
