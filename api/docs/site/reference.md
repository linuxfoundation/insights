---
title: Reference
layout: page
pageClass: reference-page
---

<script setup>
import ScalarReference from './.vitepress/theme/ScalarReference.vue'
</script>

<!-- Scalar renders the visible API title, so the page heading is kept for screen readers only. -->
<h1 class="reference-title">API Reference</h1>

<ScalarReference />

<style>
.reference-title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* VitePress offsets wide-screen content by 100vw, which counts the scrollbar while its fixed sidebar does not.
   Matching the sidebar's math closes the gap between the two sidebars. */
@media (min-width: 1440px) {
  .reference-page .VPContent.has-sidebar {
    padding-right: calc((100% - var(--vp-layout-max-width)) / 2);
    padding-left: calc((100% - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
  }
}
</style>
