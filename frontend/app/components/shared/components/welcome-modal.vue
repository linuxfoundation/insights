<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="30rem"
  >
    <div class="p-6">
      <h3 class="text-heading-3 font-bold font-secondary mb-1">
        Insights got a major update! 🎉
      </h3>
      <p class="text-body-2 text-neutral-600">
        If you would like to share any feedback, please reach out to
        <a
          href="mailto:insights@linuxfoundation.org"
          class="text-brand-600"
          target="_blank"
        >insights@linuxfoundation.org</a>
      </p>
      <img
        alt="LFX Insights"
        src="/og-image.png"
        class="mb-6 mt-3"
      >

      <lfx-button
        class="w-full justify-center mb-3"
        button-style="pill"
        @click="isModalOpen = false"
      >
        Explore Insights
      </lfx-button>

      <a
        href="/docs/"
        target="_blank"
      >
        <lfx-button
          class="w-full justify-center"
          type="tertiary"
          button-style="pill"
        >
          <lfx-icon name="book-open" />
          Read docs
        </lfx-button>
      </a>
    </div>
  </lfx-modal>
</template>
<script setup lang="ts">
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";

const isModalOpen = ref(false);

onMounted(() => {
  const welcomeModal = localStorage.getItem('lfx-welcome-modal');
  if (welcomeModal === null) {
    setTimeout(() => {
      isModalOpen.value = true;
      localStorage.setItem('lfx-welcome-modal', 'true');
    }, 0);
  }
})
</script>

<script lang="ts">
export default {
  name: 'LfxWelcomeModal',
}
</script>
