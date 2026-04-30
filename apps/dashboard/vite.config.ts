import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@cathedral/shared-types': resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@cathedral/calculations': resolve(__dirname, '../../packages/calculations/src/index.ts'),
      '@cathedral/nspire-engine': resolve(__dirname, '../../packages/nspire-engine/src/index.ts'),
    },
  },
});
