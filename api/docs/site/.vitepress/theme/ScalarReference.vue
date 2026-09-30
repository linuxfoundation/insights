<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<script setup lang="ts">
import '@scalar/api-reference/style.css';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useData, useRouter } from 'vitepress';
import type { ApiReferenceInstance } from '@scalar/types/api-reference';

const { isDark } = useData();
const router = useRouter();

const mountEl = ref<HTMLDivElement | null>(null);
let instance: ApiReferenceInstance | null = null;
let unmounted = false;
let filterStyle: HTMLStyleElement | null = null;
let sidebarStyle: HTMLStyleElement | null = null;
// Sidebar groups the reader has expanded, as `tag/<name>`.
const openGroups = new Set<string>();
let originalPushState: History['pushState'] | null = null;
let originalAfterRouteChange: typeof router.onAfterRouteChange;

// Scalar hashes look like `tag/<name>/...`, with the document slug in front once there are several sources.
function tagFromHash(hash: string): string | null {
  return decodeURIComponent(hash.slice(1)).match(/(?:^|\/)(tag\/[^/]+)/)?.[1] ?? null;
}

// Scalar's sidebar lists the groups in page order; read from it so the first group needs no hardcoding.
function firstTag(): string | null {
  const id = document.querySelector('.scalar-reference [data-sidebar-id*="/tag/"]')?.getAttribute('data-sidebar-id');
  return id ? tagFromHash(`#${id}`) : null;
}

// One group per view: hide every other tag. The introduction is hidden, so a hashless visit shows the first group.
// The hash stays empty there because Scalar expands the sidebar group of any hash it scrolls to.
function applyFilter() {
  if (!filterStyle) return;
  const hashTag = tagFromHash(location.hash);
  if (hashTag && !openGroups.has(hashTag)) {
    openGroups.add(hashTag);
    renderSidebar();
  }
  const tag = hashTag ?? firstTag();
  filterStyle.textContent = tag
    ? `.scalar-reference .tag-section-container:not(.tag-section-nested):not(:has([id$="/${CSS.escape(tag)}"])) { display: none; }`
    : '';
}

// Scalar ties each section's rendering to its sidebar group being expanded, so every group stays expanded for Scalar
// and the sidebar collapses here with CSS instead.
function renderSidebar() {
  if (!sidebarStyle) return;
  const open = [...openGroups].map((tag) => `:not([data-sidebar-id$="/${CSS.escape(tag)}"])`).join('');
  const closed = `.scalar-reference .t-doc__sidebar li[data-sidebar-id*="/tag/"]${open}`;
  sidebarStyle.textContent = `${closed} > ul { display: none; }
    ${closed} > div > button > div { rotate: none; transform: none; }`;
}

function selectTag(tag: string) {
  history.pushState({}, '', `#${tag}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// Runs in the capture phase so Scalar never sees group clicks; its own handler would collapse the section too.
function onSidebarClick(event: MouseEvent) {
  const target = event.target as Element | null;
  const group = target?.closest('.t-doc__sidebar li[data-sidebar-id*="/tag/"]');
  const toggle = target?.closest('button, a');
  if (!group || !toggle || toggle.parentElement?.parentElement !== group) return;
  const tag = tagFromHash(`#${group.getAttribute('data-sidebar-id')}`);
  if (!tag) return;
  event.preventDefault();
  event.stopPropagation();
  const isCurrent = (tagFromHash(location.hash) ?? firstTag()) === tag;
  if (toggle.tagName === 'A' && !isCurrent) {
    openGroups.add(tag);
    selectTag(tag);
  } else if (openGroups.has(tag)) {
    openGroups.delete(tag);
  } else {
    openGroups.add(tag);
  }
  renderSidebar();
}

// Search results navigate through the VitePress router, which misses Scalar's slug-prefixed ids and scrolls to the top.
// Scalar's scroll sync may rewrite the hash first, so restore it from the href and replay it as a popstate that Scalar
// follows and VitePress ignores (null state).
async function afterRouteChange(href: string) {
  await originalAfterRouteChange?.(href);
  if (!new URL(href, location.href).hash) return;
  requestAnimationFrame(() => {
    history.replaceState(history.state, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

onMounted(async () => {
  filterStyle = document.head.appendChild(document.createElement('style'));
  sidebarStyle = document.head.appendChild(document.createElement('style'));
  renderSidebar();
  applyFilter();
  mountEl.value?.addEventListener('click', onSidebarClick, true);
  // Scalar navigates with pushState, which fires no event. Filtering synchronously here lets its next-tick scroll find a visible target.
  const pushState = history.pushState;
  originalPushState = pushState;
  history.pushState = function (...args) {
    pushState.apply(this, args);
    applyFilter();
  };
  window.addEventListener('popstate', applyFilter);
  originalAfterRouteChange = router.onAfterRouteChange;
  router.onAfterRouteChange = afterRouteChange;
  // Scalar mounts into the DOM directly, so it must load client-side, after mount.
  const { createApiReference } = await import('@scalar/api-reference');
  if (!mountEl.value) return;
  const created = createApiReference(mountEl.value, {
    // One source per API version. Uncomment v1 once it has routes; an empty spec renders a blank page.
    sources: [
      { title: 'v1-alpha', slug: 'v1-alpha', url: '/v1-alpha/openapi.json', default: true },
      // { title: 'v1', slug: 'v1', url: '/v1/openapi.json' },
    ],
    // Try-it client off: it would let a PAT be pasted into the browser.
    hideClientButton: true,
    hideTestRequestButton: true,
    // Scalar shows its hosted AI agent and MCP generator by default on localhost.
    agent: { disabled: true },
    mcp: { disabled: true },
    // Scalar's localhost toolbar would sit behind the VitePress nav.
    showDeveloperTools: 'never',
    // The VitePress nav already has a search box, and both bind Ctrl+K.
    hideSearch: true,
    // VitePress owns the color mode; Scalar reads its own mode only once, at mount.
    forceDarkModeState: isDark.value ? 'dark' : 'light',
    hideDarkModeToggle: true,
    // Every section renders only while its group is expanded; renderSidebar collapses the sidebar instead.
    defaultOpenAllTags: true,
    expandAllResponses: true,
    // Scalar may rewrite the landing hash to its canonical form.
    onLoaded: applyFilter,
  });
  // Component may unmount while the dynamic import was pending; destroy right away instead of leaking.
  if (unmounted) {
    created.destroy();
    return;
  }
  instance = created;
});

// Scalar themes key off these body classes, so swapping them follows the VitePress toggle live.
watch(isDark, (dark) => {
  document.body.classList.toggle('dark-mode', dark);
  document.body.classList.toggle('light-mode', !dark);
});

onUnmounted(() => {
  unmounted = true;
  if (originalPushState) history.pushState = originalPushState;
  window.removeEventListener('popstate', applyFilter);
  router.onAfterRouteChange = originalAfterRouteChange;
  filterStyle?.remove();
  filterStyle = null;
  sidebarStyle?.remove();
  sidebarStyle = null;
  instance?.destroy();
  instance = null;
});
</script>

<template>
  <!-- vp-raw keeps VitePress's router from hijacking Scalar's hash links. -->
  <div ref="mountEl" class="vp-raw scalar-reference" />
</template>

<style scoped>
/* Maps Scalar's theme onto the VitePress tokens so both color modes match the rest of the site.
   Sidebar tokens are repeated because Scalar derives them on body, before these overrides apply. */
.scalar-reference {
  /* Scalar's sticky sidebar and headers sit below the fixed VitePress nav bar. */
  --scalar-custom-header-height: var(--vp-nav-height);

  --scalar-font: var(--vp-font-family-base);
  --scalar-font-code: var(--vp-font-family-mono);
  --scalar-heading-1: 28px;
  --scalar-heading-2: 20px;
  --scalar-bold: 600;

  --scalar-color-1: var(--vp-c-text-1);
  --scalar-color-2: var(--vp-c-text-2);
  --scalar-color-3: var(--vp-c-text-3);
  --scalar-color-accent: var(--vp-c-brand-1);
  --scalar-link-color: var(--vp-c-brand-1);
  --scalar-link-color-hover: var(--vp-c-brand-2);

  --scalar-background-1: var(--vp-c-bg);
  --scalar-background-2: var(--vp-c-bg-soft);
  --scalar-background-3: var(--vp-c-bg-elv);
  --scalar-background-accent: var(--vp-c-brand-soft);
  --scalar-border-color: var(--vp-c-divider);

  /* HTTP method badges and status colors. */
  --scalar-color-blue: var(--vp-c-brand-1);
  --scalar-color-green: var(--vp-c-green-1);
  --scalar-color-orange: var(--vp-c-yellow-2);
  --scalar-color-yellow: var(--vp-c-yellow-1);
  --scalar-color-red: var(--vp-c-red-1);
  --scalar-color-purple: var(--vp-c-purple-1);
  --scalar-color-danger: var(--vp-c-danger-1);
  --scalar-background-danger: var(--vp-c-danger-soft);
  --scalar-color-alert: var(--vp-c-warning-1);
  --scalar-background-alert: var(--vp-c-warning-soft);

  --scalar-button-1: var(--vp-button-brand-bg);
  --scalar-button-1-color: var(--vp-button-brand-text);
  --scalar-button-1-hover: var(--vp-button-brand-hover-bg);
  --scalar-scrollbar-color: var(--vp-c-default-2);
  --scalar-scrollbar-color-active: var(--vp-c-default-1);

  --scalar-sidebar-background-1: var(--vp-c-bg);
  --scalar-sidebar-color-1: var(--vp-c-text-1);
  --scalar-sidebar-color-2: var(--vp-c-text-2);
  --scalar-sidebar-color-active: var(--vp-c-brand-1);
  --scalar-sidebar-border-color: var(--vp-c-divider);
  --scalar-sidebar-item-hover-background: var(--vp-c-default-soft);
  --scalar-sidebar-item-hover-color: var(--vp-c-text-1);
  --scalar-sidebar-item-active-background: var(--vp-c-brand-soft);
  --scalar-sidebar-indent-border: var(--vp-c-divider);
  --scalar-sidebar-indent-border-hover: var(--vp-c-divider);
  --scalar-sidebar-indent-border-active: var(--vp-c-brand-1);
  --scalar-sidebar-search-background: var(--vp-c-bg-soft);
  --scalar-sidebar-search-color: var(--vp-c-text-3);
  --scalar-sidebar-search-border-color: var(--vp-c-divider);
}
</style>

<style>
/* VitePress resets every heading to 16px, which beats the size Scalar headings inherit from their wrapper.
   The :where keeps this below Scalar's own class rules. */
.scalar-reference :where(h1, h2, h3, h4, h5, h6) {
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
}

/* Same tight tracking as VitePress page headings. */
.scalar-reference .section-header {
  letter-spacing: -0.02em;
}

/* Scalar sizes group and endpoint titles alike, so step them down by heading level. */
.scalar-reference h2.section-header-label {
  font-size: 32px;
  line-height: 40px;
}

.scalar-reference h3.section-header-label {
  font-size: 22px;
  line-height: 30px;
}

/* Scalar gives the selected sidebar item `cursor-auto`, which shows a text cursor over a still clickable link. */
.scalar-reference .t-doc__sidebar a[aria-current] {
  cursor: pointer;
}

/* One group shows at a time, so the divider between groups only peeks out under the nav. */
.scalar-reference .tag-section-container {
  border-top: 0;
}

/* The group title section only held the hidden endpoint list, so it hugs the first endpoint instead.
   A lighter top padding than Scalar's 48px keeps the title near the first sidebar row. */
.scalar-reference .tag-section-container > section.section {
  padding-top: 24px;
  padding-bottom: 0;
  border-bottom: 0;
}

.scalar-reference .tag-section-container > .contents > :first-child > section.section {
  padding-top: 24px;
}

.scalar-reference .tag-section-container .section-content:has(.markdown:empty) {
  display: none;
}

/* The spec description already heads the docs site, so the reference starts at the first group. */
.scalar-reference .section-container:has(.introduction-section),
.scalar-reference [data-sidebar-id$="/description/introduction"] {
  display: none;
}

/* Scalar has no option for its sidebar credit, and the MIT license asks for none. */
.scalar-reference .darklight-reference:has(a[href="https://www.scalar.com"]) {
  display: none;
}

/* Per-tag endpoint list; it repeats the sidebar. */
.scalar-reference .endpoints-card {
  display: none;
}
</style>
