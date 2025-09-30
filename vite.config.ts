import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "QrisDynamicify",
      formats: ["umd"],
      fileName: () => "qris-dynamicify.js",
    },
    outDir: "dist/browser",
    rollupOptions: {
      external: ["fs", "path", "jimp", "fs/promises"],
      output: {
        globals: {
          fs: "fs",
          path: "path",
          jimp: "Jimp",
          "fs/promises": "fsPromises",
        },
      },
    },
  },
});
