/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { merge } from 'lodash-es';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig, loadEnv, version as viteVersion } from 'vite';
import { compression } from 'vite-plugin-compression2';
import vuetify from 'vite-plugin-vuetify';
import vuePkg from 'vue/package.json' assert { type: 'json' };
import vuetifyPkg from 'vuetify/package.json' assert { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: env.VITE_APP_BASE_PATH || '/',
    plugins: [
      vue(),
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vite-plugin
      vuetify({
        autoImport: true,
        styles: { configFile: 'src/styles/variables.scss' },
      }),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
      }),
      compression(),
    ],
    define: {
      'process.env': merge(env, {
        vite: viteVersion,
        vue: vuePkg.version,
        vuetify: vuetifyPkg.version,
      }),
    },
    test: {
      globals: true,
      environment: 'happy-dom',
    },
    resolve: {
      alias: {
        '~': fileURLToPath(new URL('./', import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@data': fileURLToPath(new URL('./src/data', import.meta.url)),
      },
      extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
    },
    server: {
      port: 4399,
      proxy: {
        '/api': {
          target: env.VITE_APP_BASE_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: { charset: false },
        css: { charset: false },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vue3-lottie': ['vue3-lottie'],
            'vue3-apexcharts': ['vue3-apexcharts'],
            'lodash-es': ['lodash-es'],
            vuetify: ['vuetify'],
            moment: ['moment'],
          },
        },
      },
    },
  };
});