---
title: Web API
layout: page
pageClass: reference-page
---

<script setup>
import { withBase } from 'vitepress'
import ScalarReference from './.vitepress/theme/ScalarReference.vue'

const sources = [{ title: 'Web API', slug: 'web-api', url: withBase('/web-api.json'), default: true }]
</script>

<!-- The spec's description renders as Scalar's introduction, so the page heading is kept for screen readers only. -->
<h1 class="web-api-title">Web API</h1>

<ScalarReference :sources="sources" show-introduction />

<style>
.web-api-title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Same wide-screen sidebar math as the reference page; see reference.md. */
@media (min-width: 1440px) {
  .reference-page .VPContent.has-sidebar {
    padding-right: calc((100% - var(--vp-layout-max-width)) / 2);
    padding-left: calc((100% - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
  }
}
</style>
