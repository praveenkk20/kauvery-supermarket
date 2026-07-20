import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = mode === 'development'
    ? 'http://localhost:4000'
    : (env.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');

  return defineConfig({
    plugins: [vue()],
    server: {
      proxy: {
        '/api': {
          target: backend,
          changeOrigin: true,
          secure: false,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    }
  });
};
