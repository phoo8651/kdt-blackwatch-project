import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        host: true,
        proxy: {
            '/api': {
                target: 'http://3.38.39.200:8080',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (_proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': '/src',
            '@/components': '/src/components',
            '@/pages': '/src/pages',
            '@/api': '/src/api',
            '@/stores': '/src/stores',
            '@/types': '/src/types',
            '@/utils': '/src/utils',
        },
    },
    define: {
        global: 'globalThis',
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
    },
});