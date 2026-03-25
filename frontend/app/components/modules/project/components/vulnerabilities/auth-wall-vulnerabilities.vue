<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-card class="p-6 flex flex-col relative">
    <img
      src="/images/misc/vulnerabilities-preview.png"
      alt="Auth wall vulnerabilities"
    />

    <div class="absolute h-full w-full flex items-center justify-center -mt-6 -ml-6">
      <div
        class="shadow-xl bg-gradient-to-b from-violet-50/50 to-white p-8 border border-neutral-200 rounded-xl flex flex-col gap-8 items-center"
      >
        <!-- Icon and text section -->
        <div class="flex flex-col gap-5 items-center">
          <div class="bg-discovery-100 p-4 rounded-full flex items-center justify-center size-14">
            <lfx-icon
              name="lock-keyhole"
              class="text-discovery-600"
              :size="32"
            />
          </div>

          <div class="flex flex-col gap-5 items-center">
            <div class="flex flex-col gap-1 items-center">
              <h4 class="text-heading-4 font-secondary font-bold text-black">Unlock project vulnerabilities</h4>
              <p class="text-body-2 text-neutral-600">Sign in to access detailed vulnerability insights including:</p>
            </div>

            <!-- Pills/Tags -->
            <div class="flex flex-wrap gap-4 items-center justify-center max-w-[600px]">
              <lfx-chip
                v-for="feature in features"
                :key="feature"
                type="bordered"
              >
                {{ feature }}
              </lfx-chip>
            </div>
          </div>
        </div>

        <!-- CTA section -->
        <div class="flex flex-col gap-4 items-center">
          <lfx-button
            type="primary"
            size="large"
            class="!rounded-full"
            @click="handleLogin"
          >
            Sign in to your LFX account
          </lfx-button>
          <p class="text-2xs text-neutral-600">
            New to LFX?
            <a
              href="#"
              class="text-accent-500 hover:underline"
              @click.prevent="handleLogin"
              >Create an account</a
            >
          </p>
        </div>
      </div>
    </div>
  </lfx-card>
</template>

<script setup lang="ts">
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxChip from '~/components/uikit/chip/chip.vue';
import { useAuth } from '~~/composables/useAuth';

const { login } = useAuth();

const features = [
  'Open vulnerabilities',
  'Median CVS of all vulnerabilities',
  'Fix status',
  'Vulnerability by severity',
  'Vulnerabilities by ecosystem',
];

const handleLogin = () => {
  login();
};
</script>

<script lang="ts">
export default {
  name: 'LfxAuthWallVulnerabilities',
};
</script>
