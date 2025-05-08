<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    class="p-6"
    width="30rem"
  >
    <section>
      <div class="flex justify-between">
        <div>
          <p
            v-if="defaults?.area"
            class="text-body-2 text-neutral-500 pb-1"
          >
            {{ defaults.area }}
          </p>
          <h3 class="text-heading-3 font-bold">
            Share
          </h3>
        </div>
        <lfx-icon-button
          icon="close"
          size="small"
          @click="isModalOpen = false"
        />
      </div>
      <div class="flex justify-center items-center gap-6 py-8">

        <div
          class="cursor-pointer"
          @click="twitter()"
        >
          <img
            src="/images/share/x.svg"
            alt="X/Twitter"
          >
        </div>

        <div
          class="cursor-pointer"
          @click="linkedin()"
        >
          <img
            src="/images/share/linkedin.svg"
            alt="LinkedIn"
          >
        </div>
        <div
          class="cursor-pointer"
          @click="reddit()"
        >
          <img
            src="/images/share/reddit.svg"
            alt="Reddit"
          >
        </div>
        <lfx-tooltip
          content="Send email"
          @click="email()"
        >
          <lfx-icon-button
            icon="envelope"
            size="large"
          />
        </lfx-tooltip>
      </div>
      <div class="flex items-center">
        <div class="border-t border-neutral-200 flex-grow" />
        <p class="text-body-2 uppercase text-neutral-500 px-4">or</p>
        <div class="border-t border-neutral-200 flex-grow" />
      </div>
      <div class="flex items-center pt-8 gap-3">
        <lfx-input
          :model-value="defaults.url || ''"
          disabled
          class="!rounded-full flex-grow"
        />
        <lfx-button
          type="tertiary"
          class="!rounded-full"
          @click="copy(defaults.url)"
        >
          <lfx-icon name="clone" />
          Copy link
        </lfx-button>
      </div>
    </section>
  </lfx-modal>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxInput from "~/components/uikit/input/input.vue";
import type {ShareData} from "~/components/shared/modules/share/types/share.types";
import LfxButton from "~/components/uikit/button/button.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import useToastService from "~/components/uikit/toast/toast.service";
import LfxTooltip from "~/components/uikit/tooltip/tooltip.vue";

const props = defineProps<{
  modelValue: boolean;
  defaults: ShareData
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void;
}>();

const {showToast} = useToastService();

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value);
  },
})

const copy = (url: string) => {
  navigator?.clipboard.writeText(url);
  showToast(
      `Link copied to clipboard`,
      ToastTypesEnum.positive,
  );
  isModalOpen.value = false;
}

const email = () => {
  const title = props.defaults?.title
      ? `Check this out: ${props.defaults.title}`
      : 'Check this out'
  const url = encodeURIComponent(props.defaults.url);
  const link = `mailto:?subject=${title}&body=${url}`;
  window?.open(
      link,
      '_blank'
  );
}

const twitter = () => {
  const {url} = props.defaults;
  const title = props.defaults?.title
      ? `Explore ${props.defaults.title}`
      : 'Explore this'

  const link = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} ${url}`)}`;
  const width = 640;
  const height = 480;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  window?.open(
      link,
      '_blank',
      `width=${width},height=${height},top=${top},left=${left},menubar=no,location=no,status=no`
  );
}

const reddit = () => {
  const url = encodeURIComponent(props.defaults.url);
  const title = props.defaults?.title
      ? `Explore ${props.defaults.title}`
      : 'Explore this'
  const link = `https://www.reddit.com/submit?title=${title}&url=${url}`;
  window?.open(
      link,
      '_blank'
  );
}

const linkedin = () => {
  const url = encodeURIComponent(props.defaults.url);

  const link = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  const width = 640;
  const height = 480;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  window?.open(
      link,
      '_blank',
      `width=${width},height=${height},top=${top},left=${left},menubar=no,location=no,status=no`
  );
}
</script>

<script lang="ts">
export default {
  name: 'LfxShareModal',
};
</script>
