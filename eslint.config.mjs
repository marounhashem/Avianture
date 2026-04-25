import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma-generated client:
    "lib/generated/**",
    // Stale subagent worktrees (created by superpowers, not part of the source tree)
    ".claude/**",
  ]),
  // MVP rule overrides:
  // - `any` is used in Auth.js v5 beta typing workarounds (see docs/DECISIONS.md).
  //   Demote to warning so builds don't fail.
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);

export default eslintConfig;
