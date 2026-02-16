import type { InstallBannerState } from "../lib/types";

export function InstallBanner({
  installBanner,
  onDismiss,
  onInstall,
}: {
  installBanner: InstallBannerState;
  onDismiss: () => void;
  onInstall: () => void;
}) {
  return (
    <div
      class={`install-banner${installBanner.show ? " show" : ""}`}
      id="install-banner"
    >
      <div
        class="install-banner-text"
        id="install-banner-text"
        dangerouslySetInnerHTML={{ __html: installBanner.text }}
      ></div>
      {installBanner.buttonVisible ? (
        <button
          class="install-banner-btn"
          id="install-banner-btn"
          onClick={onInstall}
        >
          {installBanner.buttonLabel}
        </button>
      ) : null}
      <button
        class="install-banner-dismiss"
        id="install-banner-dismiss"
        onClick={onDismiss}
      >
        &times;
      </button>
    </div>
  );
}
