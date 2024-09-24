// vite.config.ts
import { defineConfig } from 'vite';
import { defineWorkspace } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov'],
    },
    reporters: ['default', 'vitest-sonar-reporter'],
    outputFile: {
      'vitest-sonar-reporter': './sonar-report.xml',
    },
  },
  // outras configurações do Vite podem ser adicionadas aqui
});

// Definindo o workspace
defineWorkspace(['src/*']);
