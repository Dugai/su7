import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  plugins: [react(), glsl()],
  server: {
    host: true,
  },
  resolve: {
    alias: {
      "three/examples/jsm/loaders/GLTFLoader":
        "three/examples/jsm/loaders/GLTFLoader.js",
      "three/examples/jsm/loaders/FBXLoader":
        "three/examples/jsm/loaders/FBXLoader.js",
      "three/examples/jsm/loaders/RGBELoader":
        "three/examples/jsm/loaders/RGBELoader.js",
      "three/examples/jsm/postprocessing/EffectComposer":
        "three/examples/jsm/postprocessing/EffectComposer.js",
      "three/examples/jsm/postprocessing/RenderPass":
        "three/examples/jsm/postprocessing/RenderPass.js",
      "three/examples/jsm/postprocessing/UnrealBloomPass":
        "three/examples/jsm/postprocessing/UnrealBloomPass.js",
      "three/examples/jsm/controls/OrbitControls":
        "three/examples/jsm/controls/OrbitControls.js",
    },
  },
  assetsInclude: ["**/*.gltf", "**/*.glb", "**/*.fbx", "**/*.hdr", "**/*.glsl"],
  publicDir: "public",
});
