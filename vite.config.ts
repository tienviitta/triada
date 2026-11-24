import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths so the build works from any static host sub-path (e.g. GitHub Pages).
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
