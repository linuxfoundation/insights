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

<div class="vp-doc web-api-intro">

# Web API

The Web API documents the public endpoints served by insights.linuxfoundation.org/api. They are read-only and need no authentication.

::: warning
`healthScore` and the Health Score v1 fields are soon to be deprecated. Use the [migration guide](/health-score-v2-migration/) to move to the latest fields.
:::

</div>

<ScalarReference :sources="sources" />

<style>
.web-api-intro {
  max-width: 688px;
  margin: 0 auto;
  padding: 32px 24px 0;
}

/* Same wide-screen sidebar math as the reference page; see reference.md. */
@media (min-width: 1440px) {
  .reference-page .VPContent.has-sidebar {
    padding-right: calc((100% - var(--vp-layout-max-width)) / 2);
    padding-left: calc((100% - var(--vp-layout-max-width)) / 2 + var(--vp-sidebar-width));
  }
}
</style>
