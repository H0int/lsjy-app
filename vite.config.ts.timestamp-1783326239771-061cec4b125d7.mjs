// vite.config.ts
import { defineConfig } from "file:///D:/%E7%BD%97%E5%9C%A3%E7%BA%AA%E5%85%83-AI%E6%99%BA%E8%83%BD%E4%BD%93/KF02/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/%E7%BD%97%E5%9C%A3%E7%BA%AA%E5%85%83-AI%E6%99%BA%E8%83%BD%E4%BD%93/KF02/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "D:\\\u7F57\u5723\u7EAA\u5143-AI\u667A\u80FD\u4F53\\KF02\\frontend";
var isGitHubPages = process.env.GITHUB_PAGES === "true";
var vite_config_default = defineConfig({
  plugins: [vue()],
  // GitHub Pages: /lsjy-app/  自定义域名: /
  base: "/",
  // 自定义域名 lsjyapp.cn 优先
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-vue": ["vue", "vue-router", "pinia"],
          "vendor-element-plus": ["element-plus", "@element-plus/icons-vue"],
          "vendor-axios": ["axios"]
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxcdTdGNTdcdTU3MjNcdTdFQUFcdTUxNDMtQUlcdTY2N0FcdTgwRkRcdTRGNTNcXFxcS0YwMlxcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcXHU3RjU3XHU1NzIzXHU3RUFBXHU1MTQzLUFJXHU2NjdBXHU4MEZEXHU0RjUzXFxcXEtGMDJcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6LyVFNyVCRCU5NyVFNSU5QyVBMyVFNyVCQSVBQSVFNSU4NSU4My1BSSVFNiU5OSVCQSVFOCU4MyVCRCVFNCVCRCU5My9LRjAyL2Zyb250ZW5kL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xyXG5cclxuLy8gXHU1MjI0XHU2NUFEXHU2NjJGXHU1NDI2XHU0RTNBIEdpdEh1YiBQYWdlcyBcdTY3ODRcdTVFRkFcclxuLy8gR2l0SHViIFBhZ2VzIFx1OTcwMFx1ODk4MVx1OEJCRVx1N0Y2RSBiYXNlIFx1NEUzQSAvbHNqeS1hcHAvIFx1NUU3Nlx1NEY3Rlx1NzUyOCBoYXNoIFx1OERFRlx1NzUzMVxyXG5jb25zdCBpc0dpdEh1YlBhZ2VzID0gcHJvY2Vzcy5lbnYuR0lUSFVCX1BBR0VTID09PSAndHJ1ZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3Z1ZSgpXSxcclxuICAvLyBHaXRIdWIgUGFnZXM6IC9sc2p5LWFwcC8gIFx1ODFFQVx1NUI5QVx1NEU0OVx1NTdERlx1NTQwRDogL1xyXG4gIGJhc2U6ICcvJywgIC8vIFx1ODFFQVx1NUI5QVx1NEU0OVx1NTdERlx1NTQwRCBsc2p5YXBwLmNuIFx1NEYxOFx1NTE0OFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgc2VydmVyOiB7XHJcbiAgICBwb3J0OiA1MTczLFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgIGFzc2V0c0lubGluZUxpbWl0OiA0MDk2LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHtcclxuICAgICAgICAgICd2ZW5kb3ItdnVlJzogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYSddLFxyXG4gICAgICAgICAgJ3ZlbmRvci1lbGVtZW50LXBsdXMnOiBbJ2VsZW1lbnQtcGx1cycsICdAZWxlbWVudC1wbHVzL2ljb25zLXZ1ZSddLFxyXG4gICAgICAgICAgJ3ZlbmRvci1heGlvcyc6IFsnYXhpb3MnXVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvanMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW2V4dF0vW25hbWVdLVtoYXNoXS5bZXh0XSdcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSlcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtVSxTQUFTLG9CQUFvQjtBQUNoVyxPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlO0FBRnhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU0sZ0JBQWdCLFFBQVEsSUFBSSxpQkFBaUI7QUFFbkQsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBO0FBQUEsRUFFZixNQUFNO0FBQUE7QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLElBQ1gsbUJBQW1CO0FBQUEsSUFDbkIsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osY0FBYyxDQUFDLE9BQU8sY0FBYyxPQUFPO0FBQUEsVUFDM0MsdUJBQXVCLENBQUMsZ0JBQWdCLHlCQUF5QjtBQUFBLFVBQ2pFLGdCQUFnQixDQUFDLE9BQU87QUFBQSxRQUMxQjtBQUFBLFFBQ0EsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
