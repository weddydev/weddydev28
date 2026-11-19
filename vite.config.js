import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

/* Two passes (see package.json): each page becomes ONE self-contained HTML file,
   so dist/index.html opens by double-click and deploys anywhere as-is. */
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    emptyOutDir: mode !== 'generator',
    rollupOptions: { input: mode === 'generator' ? 'generator.html' : 'index.html' },
    chunkSizeWarningLimit: 3000
  }
}));
