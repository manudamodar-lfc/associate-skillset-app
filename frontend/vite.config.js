import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // When running `vite dev` directly (not via `swa start`), proxy API
      // calls to the Functions host running locally on port 7071.
      "/api": "http://localhost:7071",
    },
  },
});
