<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <footer class="border-t border-neutral-200 py-10 bg-white">
    <div class="container">
      <div class="flex justify-between pb-16">
        <div class="max-w-100">
          <img
            src="~/assets/images/logo.svg"
            alt="LFX Logo"
            class="h-6"
          >
          <p class="pt-3 text-body-2 text-neutral-500">
            LFX Insights helps developers and their organizations make smarter
            decisions about the open source projects they depend on.
          </p>
          <div class="pt-15 flex items-center gap-5">
            <a
              href="https://github.com/linuxfoundation/insights"
              target="_blank"
              rel="noopener noreferrer"
            >
              <lfx-icon-button icon="github">
                <img
                  src="~/assets/images/github.svg"
                  alt="GitHub Logo"
                  class="h-5"
                >
              </lfx-icon-button>
            </a>
            <a
              href="https://github.com/linuxfoundation/insights/discussions"
              target="_blank"
              rel="noopener noreferrer"
            >
              <lfx-button
                type="secondary"
                button-style="pill"
              >
                <lfx-icon name="messages" />
                Join discussions
              </lfx-button>
            </a>
          </div>
        </div>
        <div class="flex gap-20">
          <section
            v-for="section of lfxFooterMenu"
            :key="section.title"
          >
            <p class="text-xs leading-4 font-semibold text-neutral-400 pb-2">
              {{ section.title }}
            </p>
            <nav class="flex flex-col">
              <template
                v-for="link of section.links"
                :key="link.name"
              >
                <router-link
                  v-if="link.route"
                  :to="{name: link.route}"
                  class="text-sm leading-7"
                >
                  {{link.name}}
                </router-link>
                <a
                  v-else
                  :href="link.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm leading-7"
                >
                  {{link.name}}
                </a>
              </template>
            </nav>
          </section>
        </div>
      </div>
      <client-only>
        <lfx-footer class="copyright !p-0 !text-left" />
      </client-only>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
  import LfxButton from "~/components/uikit/button/button.vue";
  import LfxIcon from "~/components/uikit/icon/icon.vue";
  import {lfxFooterMenu} from "~/config/menu/footer";

  if (import.meta.client) {
    await import('@linuxfoundation/lfx-ui-core');
  }
</script>

<script lang="ts">
export default {
  name: 'LfxInsightsFooter'
}
</script>

<style lang="scss">
  .copyright::part(p) {
    color: blue !important;
    font-size: 14px;
  }

</style>
