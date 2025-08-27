import pluginVue from "eslint-plugin-vue";
import typescriptEslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";
import vueParser from "vue-eslint-parser";

import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { fixupConfigRules } from "@eslint/compat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  // Ignore patterns
  {
    ignores: [
      "*.config.*js",
      ".tailwind/*",
      "shims-vue.d.ts",
      "docs/.vitepress/theme/cssOverrides/*",
      "pnpm-lock.yaml",
      "vitest.config.ts",
      ".nuxt/**",
      "dist/**",
      "node_modules/**",
      ".stress/**",
      "docs/**",
    ],
  },

  ...fixupConfigRules(
    compat.extends("eslint:recommended", "plugin:import/typescript"),
  ).map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.vue"],
  })),

  // TypeScript files configuration
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },

  // Vue files configuration
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: [".vue"],
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        // Vue 3 Composition API
        defineProps: "readonly",
        defineEmits: "readonly",
        defineExpose: "readonly",
        withDefaults: "readonly",
        defineSlots: "readonly",
        defineModel: "readonly",

        // Vue 3 Reactivity
        ref: "readonly",
        reactive: "readonly",
        computed: "readonly",
        watch: "readonly",
        watchEffect: "readonly",
        toRef: "readonly",
        toRefs: "readonly",
        unref: "readonly",
        nextTick: "readonly",
        onMounted: "readonly",
        onBeforeUnmount: "readonly",
        inject: "readonly",
        useAttrs: "readonly",

        // Nuxt 3 Composables
        useRuntimeConfig: "readonly",
        useRouter: "readonly",
        useRoute: "readonly",
        useSeoMeta: "readonly",
        useHead: "readonly",
        useLazyFetch: "readonly",
        useFetch: "readonly",
        useNuxtData: "readonly",
        navigateTo: "readonly",
        definePageMeta: "readonly",
        $fetch: "readonly",

        // Browser globals for client-side
        document: "readonly",
        window: "readonly",
        HTMLElement: "readonly",
        HTMLDivElement: "readonly",
        Element: "readonly",
        Event: "readonly",
        MouseEvent: "readonly",
        Node: "readonly",
        KeyboardEvent: "readonly",
        TouchEvent: "readonly",
        IntersectionObserver: "readonly",
        IntersectionObserverEntry: "readonly",
        console: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",

        // Global types
        ECOption: "readonly",
      },
    },
  },

  // TypeScript configuration
  ...typescriptEslint.configs.recommended,

  // Vue configuration
  ...pluginVue.configs["flat/recommended"],

  // Prettier configuration (must be last)
  prettier,

  // Custom rules
  {
    plugins: {
      import: pluginImport,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".vue"],
        },
      },
    },
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "vue/no-unused-components": "error",
      "vue/first-attribute-linebreak": "error",
      "vue/max-attributes-per-line": "error",
      "vue/html-closing-bracket-newline": "error",
      "vue/html-closing-bracket-spacing": "warn",
      "vue/html-indent": "warn",
      "vue/html-self-closing": "warn",
      "vue/html-button-has-type": "warn",
      "vue/no-multiple-template-root": "off",
      "vue/no-required-prop-with-default": "off",
      "import/order": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "vue/no-v-html": "off",
      "import/prefer-default-export": "off",
      "import/no-named-as-default": "off",
      "class-methods-use-this": "off",
      "no-shadow": "off",
      "vuejs-accessibility/mouse-events-have-key-events": "off",
      "vuejs-accessibility/click-events-have-key-events": "off",
      "vuejs-accessibility/form-control-has-label": "off",
      "vuejs-accessibility/label-has-for": "off",
      "func-names": "off",
      "import/no-cycle": "off",
      "vue/multi-word-component-names": "off",
      "vue/no-parsing-error": "off",
      "vue/max-len": [
        "error",
        {
          code: 120,
          ignoreComments: true,
          ignoreUrls: true,
        },
      ],
      "max-len": [
        "error",
        {
          code: 120,
          ignoreComments: true,
          ignoreUrls: true,
        },
      ],
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          js: "never",
          jsx: "never",
          ts: "never",
          tsx: "never",
          "": "never",
        },
      ],
    },
  },
];
