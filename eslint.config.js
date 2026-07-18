import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

const sourceFiles = ["**/*.{js,mjs,cjs,ts,tsx}"];
const typescriptFiles = ["**/*.{ts,tsx}"];

export default [
  {
    ignores: [
      "build/**",
      "dist/**",
      ".react-router/**",
      "coverage/**",
      "node_modules/**",
      "old-app/**",
    ],
  },
  {
    ...eslint.configs.recommended,
    files: sourceFiles,
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: typescriptFiles,
  })),
  {
    files: sourceFiles,
    languageOptions: {
      ecmaVersion: "latest",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: "module",
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      react,
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat["jsx-runtime"].rules,
      ...importPlugin.flatConfigs.recommended.rules,
      ...importPlugin.flatConfigs.typescript.rules,
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
      "no-var": "error",
      "prefer-const": "warn",
      "react/display-name": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "none",
          vars: "all",
          varsIgnorePattern: "^_",
        },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
      react: {
        version: "detect",
      },
    },
  },
  prettier,
];
