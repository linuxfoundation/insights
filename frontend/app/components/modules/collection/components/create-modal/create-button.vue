<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-button
    v-if="canCreateCollection"
    :type="type"
    button-style="pill"
    :class="type === 'ghost' ? '!text-accent-500' : ''"
    @click="isCreateCollectionModalOpen = true"
  >
    <lfx-icon name="rectangle-history-circle-plus" />
    Create collection
  </lfx-button>

  <lf-create-collection-modal
    v-if="isCreateCollectionModalOpen"
    v-model="isCreateCollectionModalOpen"
    @created="handleCreated"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import LfCreateCollectionModal from './create-collection-modal.vue';
import { useAuthStore } from '~/components/modules/auth/store/auth.store';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import type { ButtonType } from '~/components/uikit/button/types/button.types';
import type { CreateCollectionForm } from '~/components/modules/collection/config/create-collection.config';

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
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

// TODO: remove this once we have everything done and tested
const canCreateCollection = computed(() => {
  return user.value?.isLfInsightsTeamMember || false;
});

const handleCreated = (form: CreateCollectionForm) => {
  emit('created', form);
};
</script>
