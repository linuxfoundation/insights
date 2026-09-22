<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-button
    :type="type"
    button-style="pill"
    :class="type === 'ghost' ? '!text-accent-500' : ''"
    v-bind="$attrs"
    @click="handleClick"
  >
    <lfx-icon name="rectangle-history-circle-plus" />
    Create collection
  </lfx-button>

  <lf-create-collection-modal
    v-if="isCreateCollectionModalOpen"
    v-model="isCreateCollectionModalOpen"
    @created="handleCreated"
  />

  <lfx-collection-auth-wall
    v-if="isAuthWallOpen"
    v-model="isAuthWallOpen"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import LfxCollectionAuthWall from '~/components/modules/collection/components/auth-wall/collection-auth-wall.vue';
import type { CreateCollectionForm } from '~/components/modules/collection/config/create-collection.config';
import LfxButton from '~/components/uikit/button/button.vue';
import type { ButtonType } from '~/components/uikit/button/types/button.types';
import LfxIcon from '~/components/uikit/icon/icon.vue';

import LfCreateCollectionModal from './create-collection-modal.vue';

withDefaults(
  defineProps<{
    type?: ButtonType;
  }>(),
  {
    type: 'outline',
  },
);

const emit = defineEmits<{
  created: [form: CreateCollectionForm];
}>();

const isCreateCollectionModalOpen = ref(false);
const isAuthWallOpen = ref(false);
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const handleClick = () => {
  if (user.value) {
    isCreateCollectionModalOpen.value = true;
  } else {
    isAuthWallOpen.value = true;
  }
};

const handleCreated = (form: CreateCollectionForm) => {
  emit('created', form);
};
</script>
