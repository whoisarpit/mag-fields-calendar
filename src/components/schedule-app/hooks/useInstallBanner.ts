import { useEffect, useRef, useState } from "preact/hooks";
import type {
  BeforeInstallPromptEvent,
  InstallBannerState,
  StorageKeys,
} from "../lib/types";

const IOS_BANNER_TEXT =
  "Tap the <strong>Share button ⬆︎</strong> on your browser at the bottom → scroll to <strong>Add to Home Screen</strong> → tap <strong>Add</strong>";

export function useInstallBanner({
  storageKeys,
  installBannerAndroid,
}: {
  installBannerAndroid: string;
  storageKeys: StorageKeys;
}) {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [installBanner, setInstallBanner] = useState<InstallBannerState>({
    show: false,
    text: "",
    buttonLabel: "Install",
    buttonVisible: true,
  });

  useEffect(() => {
    if (localStorage.getItem(storageKeys.installDismissed)) {
      return;
    }

    const navigatorStandalone = (
      navigator as Navigator & { standalone?: boolean }
    ).standalone;

    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      navigatorStandalone
    ) {
      return;
    }

    const isIos =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    const isSafari =
      /Safari/.test(navigator.userAgent) &&
      !/CriOS|FxiOS|OPiOS|EdgiOS/.test(navigator.userAgent);

    if (isIos && isSafari) {
      setInstallBanner({
        show: true,
        text: IOS_BANNER_TEXT,
        buttonLabel: "Install",
        buttonVisible: false,
      });
    }

    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      deferredPromptRef.current = promptEvent;
      setInstallBanner({
        show: true,
        text: installBannerAndroid,
        buttonLabel: "Install",
        buttonVisible: true,
      });
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, [installBannerAndroid, storageKeys]);

  const dismissInstallBanner = () => {
    setInstallBanner((current) => ({ ...current, show: false }));
    localStorage.setItem(storageKeys.installDismissed, "1");
  };

  const triggerInstallPrompt = () => {
    const deferredPrompt = deferredPromptRef.current;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(() => {
        deferredPromptRef.current = null;
        setInstallBanner((current) => ({ ...current, show: false }));
      });
      return;
    }

    dismissInstallBanner();
  };

  return {
    installBanner,
    dismissInstallBanner,
    triggerInstallPrompt,
  };
}
