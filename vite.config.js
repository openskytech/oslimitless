import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "pages" ? "/oslimitless/" : "/",
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  server: {
    allowedHosts: "ta-01kf19kmezvmfn72ayny6ngq1g-5173.wo-uegy3gtiw2znmtnl8l1smq0wt.w.modal.host", // fixes Base44 modal.host errors forever
  },
}));
