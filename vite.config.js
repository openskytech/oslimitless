import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const isPages = mode === "pages";

  return {
    plugins: [react()],
    base: isPages ? "/oslimitless/" : "/",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      allowedHosts: "all", // 👈 THIS is the key line
    },
  };
});
