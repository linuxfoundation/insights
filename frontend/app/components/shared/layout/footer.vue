<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <footer class="border-t border-neutral-200 py-10 bg-white">
    <div class="container">
      <div class="flex justify-between pb-10 md:pb-16 gap-x-10 gap-y-15 flex-col md:flex-row">
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
          <div class="pt-10 md:pt-11 lg:pt-15 flex items-center gap-5">
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
        <div class="flex gap-x-10 gap-y-10 lg:gap-x-20 flex-col sm:flex-row">
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
                  class="text-sm leading-7 hover:underline whitespace-nowrap"
                >
                  {{link.name}}
                </router-link>
                <a
                  v-else-if="link.link"
                  :href="link.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm leading-7 hover:underline whitespace-nowrap"
                >
                  {{link.name}}
                </a>
                <div
                  v-else
                  class="text-sm leading-7 hover:underline whitespace-nowrap cursor-pointer"
                  @click="link.click()"
                >
                  {{link.name}}
                </div>
              </template>
            </nav>
          </section>
        </div>
      </div>
      <client-only>
        <lfx-footer class="footer !p-0 !text-left max-w-190" />
      </client-only>
    </div>
  </footer>
</template>

<script setup lang="ts">
  import {nextTick} from "vue";
  import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
  import LfxButton from "~/components/uikit/button/button.vue";
  import LfxIcon from "~/components/uikit/icon/icon.vue";
  import {lfxFooterMenu} from "~/config/menu/footer";

  if (import.meta.client) {
    await import('@linuxfoundation/lfx-ui-core');
  }

  onMounted(async () => {
    await nextTick()
    // Hackish way to align footer content to the left as there is no other way to do it
    const footer = document.querySelector('.footer') as HTMLElement;
    const shadowRoot = footer?.shadowRoot;
    if (shadowRoot) {
      const container = shadowRoot.querySelector('.footer-content');
      if (container) {
        (container as HTMLElement).style.textAlign = 'left';
      }
    }
  });
</script>

<script lang="ts">
export default {
  name: 'LfxInsightsFooter'
}
</script>
