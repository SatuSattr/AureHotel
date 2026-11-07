import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // The project lives on a Windows drive mounted in WSL (/mnt/f).
      // inotify events from Windows editors often don't reach Linux,
      // so poll for changes instead.
      usePolling: true,
      interval: 250,
      ignored: ["**/node_modules/**", "**/dist/**", "**/.git/**"],
    },
  },
});
