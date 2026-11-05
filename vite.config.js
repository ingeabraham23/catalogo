import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const base = "/catalogo/";
// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
  server: {
    host: true,
  },
});
