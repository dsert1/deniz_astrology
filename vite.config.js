import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  envPrefix: ['VITE_', 'PUBLIC_'] // allow PUBLIC_* in the client
});
