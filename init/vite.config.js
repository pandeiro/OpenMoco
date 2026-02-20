import { defineConfig } from 'vite';

export default defineConfig({
    base: '/init/',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 5173,
        host: '0.0.0.0',
    }
});
