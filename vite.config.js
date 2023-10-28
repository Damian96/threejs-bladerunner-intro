import { resolve } from "path";

/** @type {import('vite').UserConfig} */
export default {
  resolve: {
    alias: {
      "@three/examples": resolve(__dirname, "node_modules/three/examples/jsm"),
    },
  },
  build: {
    outDir: "../dist"
  },
};
