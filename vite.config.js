import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
    watch: {
      // Windows: root-level media/logos can be locked by other apps (EBUSY)
      ignored: [
        "**/*.jpeg",
        "**/*.jpg",
        "**/*.png",
        "**/scripts/**",
        "**/server/data/**",
        "**/dev-server.log",
      ],
    },
  },
});
