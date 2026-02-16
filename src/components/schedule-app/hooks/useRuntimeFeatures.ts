import { useEffect, useState } from "preact/hooks";
import { APP_TIMERS, SCHEDULE_UI } from "../lib/constants";
import type { ArtistsMap } from "../lib/types";
import { sanityThumb } from "../lib/utils";

export function useTick(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTick((value) => value + 1);
    }, APP_TIMERS.tickUpdateMs);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let resizeTimer: number | null = null;
    const onResize = () => {
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        setTick((value) => value + 1);
      }, APP_TIMERS.resizeDebounceMs);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) {
        window.clearTimeout(resizeTimer);
      }
    };
  }, []);

  return tick;
}

export function useTouchHint({
  storageKeys,
}: {
  storageKeys: { hintShown: string };
}) {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [showTouchHint, setShowTouchHint] = useState(false);

  useEffect(() => {
    if (!("ontouchstart" in window)) {
      return;
    }

    setIsTouchDevice(true);
    const seenHint = localStorage.getItem(storageKeys.hintShown);
    if (seenHint) {
      return;
    }

    const showTimer = window.setTimeout(() => {
      setShowTouchHint(true);
    }, APP_TIMERS.touchHintShowMs);

    const hideTimer = window.setTimeout(() => {
      setShowTouchHint(false);
      localStorage.setItem(storageKeys.hintShown, "1");
    }, APP_TIMERS.touchHintHideMs);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [storageKeys]);

  return { isTouchDevice, showTouchHint };
}

export function useServiceWorkerUpdates({
  buildId,
  swCachePrefix,
}: {
  buildId: string;
  swCachePrefix: string;
}) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let refreshing = false;
    const swUrl = `sw.js?v=${encodeURIComponent(buildId)}&p=${encodeURIComponent(swCachePrefix)}`;
    let updateInterval: number | null = null;

    navigator.serviceWorker.register(swUrl).then((registration) => {
      updateInterval = window.setInterval(() => {
        registration.update();
      }, APP_TIMERS.swUpdateMs);
    });

    const onControllerChange = () => {
      if (refreshing) {
        return;
      }
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      if (updateInterval) {
        window.clearInterval(updateInterval);
      }
    };
  }, [buildId, swCachePrefix]);
}

export function useImagePrefetch({
  artists,
  cacheName,
}: {
  artists: ArtistsMap;
  cacheName: string;
}) {
  useEffect(() => {
    const imageUrls = Object.values(artists)
      .map((artist) => artist.image)
      .filter((url): url is string => Boolean(url))
      .map((url) => sanityThumb(url, SCHEDULE_UI.imageThumbSize));

    if (imageUrls.length === 0 || !("caches" in window)) {
      return;
    }

    caches.open(cacheName).then((cache) => {
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
  }, [artists, cacheName]);
}
