import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When the mobile app should load these screens from local files,
  // set output to "export" and run `npm run build`. The `out` folder
  // can then be bundled into the iOS or Android WebView.
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
