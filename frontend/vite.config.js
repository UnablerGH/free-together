import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    // Use classic runtime so React import is required
    react({ jsxRuntime: 'classic' })
  ],
  server: { port: 3000 }
});