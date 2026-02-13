#!/usr/bin/env node
const fs = require("fs");
const { execSync } = require("child_process");

// Get short git commit hash
const gitHash = execSync("git rev-parse --short HEAD").toString().trim();
const cacheVersion = `mf-nomads-${gitHash}`;

console.log(`Building with cache version: ${cacheVersion}`);

// Update sw.js
const swPath = "./sw.js";
let swContent = fs.readFileSync(swPath, "utf8");
swContent = swContent.replace(
  /const CACHE_NAME = "mf-nomads-[^"]+";/,
  `const CACHE_NAME = "${cacheVersion}";`,
);
fs.writeFileSync(swPath, swContent);

// Update index.html
const htmlPath = "./index.html";
let htmlContent = fs.readFileSync(htmlPath, "utf8");
htmlContent = htmlContent.replace(
  /caches\.open\("mf-nomads-[^"]+"\)/g,
  `caches.open("${cacheVersion}")`,
);
fs.writeFileSync(htmlPath, htmlContent);

console.log("✓ Cache version updated in sw.js and index.html");
