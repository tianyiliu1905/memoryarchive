import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5199,
    strictPort: true,
    host: true,
  },
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        /**
         * 手动分包。
         *
         * 默认情况下 Vite 会把所有依赖和业务代码打成一个巨包，
         * 用户首次访问要一次性下载全部内容，而且任何一行业务代码
         * 的改动都会让整个包的 hash 失效、缓存全部作废。
         *
         * 这里按「变更频率」而非「功能」来切分：
         *   - three 体积最大且几乎不升级 → 单独一块，可长期缓存
         *   - react / framer-motion 同理，但比 three 小得多
         *   - 业务代码变更频繁 → 留在主包，改动不影响上面三块的缓存
         *
         * 副作用是请求数增加，但 HTTP/2 下多路复用的并行下载
         * 通常比单个大文件更快。
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // three 及其生态（drei / fiber）——首屏必需，但极少变动
          if (
            id.includes('/three/') ||
            id.includes('/@react-three/')
          ) {
            return 'three';
          }

          // 动画库，被首页和详情页共用
          if (id.includes('/framer-motion/') || id.includes('/motion-dom/') ||
              id.includes('/motion-utils/')) {
            return 'motion';
          }

          // React 运行时
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'react';
          }
        },
      },
    },
  },
});
