# Frontend Review Checklist

Vue 3 / Nuxt 4 frontend review standards for the Insights repo.

---

## 1. Uikit component usage (SHOULD FIX)

Always use components from `frontend/app/components/uikit/` instead of raw HTML equivalents. Check `.claude/rules/always-use-uikit.md` for the full mapping.

**Violation:**
```html
<button @click="submit">Save</button>
<input v-model="query" />
```

**Fix:**
```html
<lfx-button @click="submit">Save</lfx-button>
<lfx-input v-model="query" />
```

Common uikit components: `lfx-button`, `lfx-icon-button`, `lfx-input`, `lfx-select`, `lfx-table`, `lfx-modal`, `lfx-drawer`, `lfx-spinner`, `lfx-skeleton`, `lfx-tabs`, `lfx-tooltip`, `lfx-checkbox`, `lfx-radio`, `lfx-toggle`.

---

## 2. Vue 3 Composition API (SHOULD FIX)

Use `<script setup>` with Composition API. No Options API components.

**Violation:**
```vue
<script>
export default {
  data() { return { count: 0 } }
}
</script>
```

**Fix:**
```vue
<script setup lang="ts">
const count = ref(0)
</script>
```

---

## 3. TanStack Query for server state (SHOULD FIX)

Use `useQuery` / `useMutation` from TanStack Vue Query for client-side data fetching. Do not use raw `$fetch` directly in components for data that should be cached or shared.

**Exception:** `useFetch` and `useAsyncData` are acceptable in **SSR-only contexts** (e.g. OG-image components, server-rendered metadata). Do not flag those uses.

**Violation:**
```ts
const data = ref(null)
onMounted(async () => {
  data.value = await $fetch('/api/projects')
})
```

**Fix:**
```ts
const { data } = useQuery({
  queryKey: ['projects'],
  queryFn: () => $fetch('/api/projects'),
})
```

---

## 4. Pinia for client state (SHOULD FIX)

Use Pinia stores for shared client-side state. Do not pass deeply nested props or use `provide`/`inject` for state that should be in a store.

---

## 5. TypeScript — no `any` (SHOULD FIX)

Avoid `any`. Use proper types, `unknown` with narrowing, or generics.

**Violation:**
```ts
const handleResponse = (data: any) => { ... }
```

**Fix:**
```ts
const handleResponse = (data: ProjectResponse) => { ... }
```

---

## 6. Tailwind CSS conventions (SHOULD FIX)

- **Prefer `gap-*` over `space-y-*`** for vertical stacking — `gap-*` is the dominant pattern in this codebase. Only flag `space-y-*` in new code; existing usages are acceptable.
- Use Tailwind classes from the project's `tailwind.config.ts` — verify class names are valid before using
- No hard-coded hex color values in templates — use Tailwind color tokens

**Preferred:**
```html
<div class="flex flex-col gap-4 text-blue-600">
```

---

## 7. ECharts for data visualization (SHOULD FIX)

Use ECharts (via the `nuxt-echarts` integration) for all charts and graphs. Do not introduce other charting libraries.

---

## 8. License headers (SHOULD FIX)

Every `.ts`, `.vue`, `.js`, `.scss` file must start with the copyright header:

- **TS/JS/SCSS:** `// Copyright (c) 2025 The Linux Foundation and each contributor.` + `// SPDX-License-Identifier: MIT`
- **Vue:** `<!-- Copyright (c) 2025 The Linux Foundation and each contributor. SPDX-License-Identifier: MIT -->`

---

## 9. No direct `$fetch` in components (NIT)

Data fetching logic should live in composables or TanStack Query `queryFn`, not directly in component `setup`. Makes it reusable and testable.

---

## 10. Reactive refs over non-reactive values (SHOULD FIX)

State that should trigger re-renders must use `ref()` or `computed()`.

**Violation:**
```ts
let isLoading = false // won't trigger re-render
```

**Fix:**
```ts
const isLoading = ref(false)
```
