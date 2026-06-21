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
    // .claude/worktrees 하위는 각각 독립된 git worktree(별도 작업본, claude/* 브랜치)다.
    // 메인 작업본 lint 대상에서 전체 제외 — 각 worktree 는 자체적으로 lint 한다.
    // (현재 메인 src 는 계속 lint 대상이므로 오류 은폐가 아님)
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
