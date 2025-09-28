// @ts-check

import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    files: ["src/**/*.ts"],

    extends: [...tseslint.configs.recommended],

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module",
      },
    },

    rules: {
      "@typescript-eslint/no-explicit-any": "warn",

      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],

      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],

      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      semi: ["error", "always"],

      eqeqeq: ["error", "always"],
    },
  },

  {
    ignores: ["dist/", "node_modules/"],
  }
);
