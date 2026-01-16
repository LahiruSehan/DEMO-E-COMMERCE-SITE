
import { defineConfig } from 'vite';

export default defineConfig({
  // If your repo is 'shani-store', set base to '/shani-store/'
  // For standard user sites (username.github.io), use '/'
  base: './', 
  build: {
    outDir: 'dist',
  }
});
