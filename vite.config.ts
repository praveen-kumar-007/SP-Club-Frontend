import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Enable code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'animation': ['framer-motion'],
          'charts': ['recharts'],
        }
      }
    },
    // Optimize chunks
    target: 'esnext',
    minify: 'esbuild',
    // CSS optimization
    cssCodeSplit: true,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'Logo.png', 'robots.txt'],
      manifest: {
        name: 'SP Club',
        short_name: 'SP Club',
        description: 'SP Club — Premier Sports Community in Dhanbad, India',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/Logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/Logo.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
