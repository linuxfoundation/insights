<template>
  <lfx-card class="p-5 flex flex-col gap-4">
    <div class="text-neutral-400 font-semibold">
      About
    </div>
    <div class="flex flex-col gap-2">
      <lfx-avatar
        :src="organization.logo"
        type="organization"
      />
      <div class="text-neutral-900 font-medium text-sm mt-1">
        {{ organization.name }}
      </div>
      <div class="text-neutral-500 text-xs">
        {{ organization.description }}
      </div>
    </div>
    <div class="flex flex-row gap-2">
      <lfx-icon name="location-dot" />
      <div class="text-neutral-900 text-xs">
        {{ organization.address }}
      </div>
    </div>
    <div class="flex flex-row gap-2">
      <lfx-icon name="users" />
      <div class="text-neutral-900 text-xs">
        {{ organization.employees }}
      </div>
    </div>
    <div class="flex flex-row gap-2">
      <lfx-icon name="building" />
      <div class="text-neutral-900 text-xs">
        {{ organization.organizationType }}
      </div>
    </div>
    <a
      :href="organization.website"
      target="_blank"
      class="flex flex-row gap-2"
    >
      <lfx-icon name="link" />
      <div class="text-neutral-900 text-xs">
        {{ organization.website }}
      </div>
    </a>
  </lfx-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LfxCard from '~/components/uikit/card/card.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxAvatar from '~/components/uikit/avatar/avatar.vue';
import type { Organization } from '~~/types/contributors/responses.types';

const organization = ref<Organization>({
  logo: 'https://avatars.githubusercontent.com/u/49998002?v=4',
  name: 'Cloud Native Computing Foundation',
  contributions: 100,
  website: 'https://www.cncf.io/',
  description:
    'Open-source organization under the Linux Foundation that promotes the adoption of cloud-native technologies',
  address: 'California, United States',
  employees: '1000+',
  organizationType: 'Public'
});
</script>

<script lang="ts">
export default {
  name: 'LfxProjectAboutSection'
};
</script>
