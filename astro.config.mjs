import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

export default defineConfig({
  output: "static",
  site: "https://magfields.arpit.io",
  integrations: [preact()],
});
