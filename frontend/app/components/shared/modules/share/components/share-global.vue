<template>
  <lfx-share-modal
    v-if="isShareModalOpen"
    v-model="isShareModalOpen"
    :defaults="shareDefaults"
  />
</template>

<script lang="ts" setup>
import {storeToRefs} from "pinia";
import LfxShareModal from "~/components/shared/modules/share/components/share-modal.vue";
import {useShareStore} from "~/components/shared/modules/share/store/share.store";

const {isShareModalOpen,shareDefaults } = storeToRefs(useShareStore())
</script>

<script lang="ts">
export default {
  name: 'LfxShareGlobal',
};
</script>
