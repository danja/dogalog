import { defineConfig } from 'vite';

const repoName = process.env.GITHUB_REPOSITORY?.split('/').pop();
const isCI = Boolean(process.env.GITHUB_ACTIONS);

export default defineConfig({
  base: isCI && repoName ? `/${repoName}/` : '/',
  test: {
    environment: 'jsdom',
    globals: true
  }
});
