import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const base = "/catalogo/";
// https://vite.dev/config/
export default defineConfig({
  base,

  server: {
    host: true,
  },

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      devOptions: {
        enabled: true,
      },

      manifest: {
        id: base,
        name: "PWA Catalogo JoyVoltAuto",
        short_name: "PWA Catalogo",
        description:
          "Aplicación para tener el control de un catalogo de productos.",

        lang: "es-MX",
        dir: "ltr",

        start_url: base,
        scope: base,

        display: "standalone",
        display_override: ["standalone", "fullscreen"],
        orientation: "portrait",

        background_color: "#ffffff",
        theme_color: "#317EFB",

        categories: ["transportation", "utilities"],

        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});