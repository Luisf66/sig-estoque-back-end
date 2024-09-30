// vite.config.ts
import { defineConfig } from 'vite';
import { defineWorkspace } from 'vitest/config';

export default defineConfig({
    test: {
        coverage: {
          provider: 'v8',
          reportsDirectory: './coverage',
          reporter: ['text', 'lcov'],
          exclude: [
            'src/app.ts',
            'src/server.ts',
            'src/env/**',
            'src/http/middlewares/**',
            'src/http/routes/**',
            'src/lib/**',
            'src/repositories/prisma/**',
            'src/@types/**',
            'src/services/factories/**',
            'vite.config.mts',
            'vitest.config.ts',
            'vitest.workspace.ts',
            'src/utils',
          ],
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
