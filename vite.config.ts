import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 5174,
    host: "0.0.0.0"
  },
  preview: {
    port: 5174,
    host: "0.0.0.0"
  },
  build: {
    target: "esnext"
  }
});
