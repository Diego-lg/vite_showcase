import path from "path"; // Import path

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // Optional: Set to '/' for root

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Set alias for "@/..." to point to "./src"
    },
  },
});
