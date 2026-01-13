import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __dirname = dirname(__filename);

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      
      // Next.js rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "warn",
      
      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      
      // Glass styles restriction - only allowed in src/platform/ui/
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/glass/]",
          message: "Direct 'glass' className is forbidden outside src/platform/ui/. Use GlassSurface or DribbbleCard components instead.",
        },
        {
          selector: "JSXAttribute[name.name='className'] TemplateLiteral[quasis=/glass/]",
          message: "Direct 'glass' className is forbidden outside src/platform/ui/. Use GlassSurface or DribbbleCard components instead.",
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/backdrop-blur/]",
          message: "Direct 'backdrop-blur' is forbidden outside src/platform/ui/. Use GlassSurface or DribbbleCard components instead.",
        },
        {
          selector: "JSXAttribute[name.name='className'] TemplateLiteral[quasis=/backdrop-blur/]",
          message: "Direct 'backdrop-blur' is forbidden outside src/platform/ui/. Use GlassSurface or DribbbleCard components instead.",
        },
        {
          selector: "JSXAttribute[name.name='className'] Literal[value=/border-\\[rgba\\(var\\(--border\\)/]",
          message: "Direct 'border-[rgba(var(--border)' is forbidden outside src/platform/ui/. Use GlassSurface or DribbbleCard components instead.",
        },
        {
          selector: "JSXAttribute[name.name='className'] TemplateLiteral[quasis=/border-\\[rgba\\(var\\(--border\\)/]",
          message: "Direct 'border-[rgba(var(--border)' is forbidden outside src/platform/ui/. Use GlassSurface or DribbbleCard components instead.",
        },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    // Allow glass styles in src/platform/ui/ (design system primitives)
    files: ["src/platform/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": "off",
    },
  },
  {
    files: ["scripts/**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "convex/_generated/**",
    ],
  }
);
