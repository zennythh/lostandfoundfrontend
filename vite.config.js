import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      // Proxy API calls to the backend running on port 8080
      '/api/items': 'http://localhost:8080',
    },
  },
});