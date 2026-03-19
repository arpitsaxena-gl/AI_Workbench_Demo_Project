import { config as baseConfig } from "@repo/eslint-config/base";

export default [
  ...baseConfig,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      ".turbo/**",
      "**/build/**",
      "**/*.config.cjs",
      "**/e2e/screenshots/**",
      "**/playwright-report/**",
      "**/test-results/**",
    ],
  },
];
