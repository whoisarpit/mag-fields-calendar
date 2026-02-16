import branding from "../../data/branding.json";

export const prerender = true;

export const GET = () => {
  const manifest = {
    name: branding.manifestName || branding.pageTitle || branding.festivalName,
    short_name: branding.appShortName || branding.festivalName,
    description:
      branding.manifestDescription ||
      `Schedule picker for ${branding.festivalName || "festival"}`,
    start_url: "/",
    display: "standalone",
    background_color: branding.themeColor || "#111111",
    theme_color: branding.themeColor || "#111111",
    icons: [
      {
        src: "icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: {
      "content-type": "application/manifest+json",
    },
  });
};
