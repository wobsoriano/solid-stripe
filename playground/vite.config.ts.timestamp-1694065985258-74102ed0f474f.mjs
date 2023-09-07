// vite.config.ts
import solid from "file:///Users/wobsoriano/tmp/solid-stripe/node_modules/.pnpm/solid-start@0.3.5_@solidjs+meta@0.28.6_@solidjs+router@0.8.3_solid-js@1.7.11_solid-start-node_nkiuyt5rjrkisoqsxjnsfslddu/node_modules/solid-start/vite/plugin.js";
import { defineConfig } from "file:///Users/wobsoriano/tmp/solid-stripe/node_modules/.pnpm/vite@4.4.9_@types+node@20.5.9/node_modules/vite/dist/node/index.js";
import basicSsl from "file:///Users/wobsoriano/tmp/solid-stripe/node_modules/.pnpm/@vitejs+plugin-basic-ssl@1.0.1_vite@4.4.9/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs";
import vercel from "file:///Users/wobsoriano/tmp/solid-stripe/node_modules/.pnpm/solid-start-vercel@0.3.5_solid-start@0.3.5_vite@4.4.9/node_modules/solid-start-vercel/index.js";
var vite_config_default = defineConfig((config) => {
  if (config.command === "serve") {
    return {
      plugins: [basicSsl(), solid()]
    };
  }
  return {
    plugins: [solid({ adapter: vercel() })]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvd29ic29yaWFuby90bXAvc29saWQtc3RyaXBlL3BsYXlncm91bmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy93b2Jzb3JpYW5vL3RtcC9zb2xpZC1zdHJpcGUvcGxheWdyb3VuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvd29ic29yaWFuby90bXAvc29saWQtc3RyaXBlL3BsYXlncm91bmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgc29saWQgZnJvbSAnc29saWQtc3RhcnQvdml0ZSdcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgYmFzaWNTc2wgZnJvbSAnQHZpdGVqcy9wbHVnaW4tYmFzaWMtc3NsJ1xuaW1wb3J0IHZlcmNlbCBmcm9tICdzb2xpZC1zdGFydC12ZXJjZWwnXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoY29uZmlnKSA9PiB7XG4gIGlmIChjb25maWcuY29tbWFuZCA9PT0gJ3NlcnZlJykge1xuICAgIHJldHVybiB7XG4gICAgICBwbHVnaW5zOiBbYmFzaWNTc2woKSwgc29saWQoKV0sXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbc29saWQoeyBhZGFwdGVyOiB2ZXJjZWwoKSB9KV0sXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlULE9BQU8sV0FBVztBQUMzVSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGNBQWM7QUFDckIsT0FBTyxZQUFZO0FBRW5CLElBQU8sc0JBQVEsYUFBYSxDQUFDLFdBQVc7QUFDdEMsTUFBSSxPQUFPLFlBQVksU0FBUztBQUM5QixXQUFPO0FBQUEsTUFDTCxTQUFTLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUFBLElBQy9CO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxPQUFPLEVBQUUsQ0FBQyxDQUFDO0FBQUEsRUFDeEM7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
