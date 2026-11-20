<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    class="p-6"
  >
    <section class="pb-6">
      <div class="flex justify-between pb-3">
        <div class="bg-brand-50 h-12 w-12 rounded-full flex items-center justify-center">
          <lfx-icon
            name="globe"
            class="text-brand-600"
            :size="24"
          />
        </div>
        <lfx-icon-button
          icon="close"
          size="small"
          :disabled="isSending"
          @click="isModalOpen = false"
        />
      </div>
      <h3 class="text-heading-3 font-secondary font-bold pb-1">Request a docs URL correction</h3>
      <!-- prettier-ignore -->
      <p class="text-body-2 text-neutral-500">
        Tell us where the documentation for {{ context.projectName }} lives. Your request is posted as a public GitHub
        issue on the <a :href="links.issues" target="_blank" rel="noreferrer" class="text-brand-500">Insights repository</a>.
        The LF team reviews it, and an approved URL is used for every future evaluation.
      </p>
    </section>

    <section class="flex flex-col gap-6 pb-6">
      <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm bg-neutral-50 rounded-lg px-3.5 py-2.5">
        <span class="min-w-0">
          <span class="text-neutral-500">Project</span>{{ ' '
          }}<strong class="font-semibold [overflow-wrap:anywhere]">{{ context.projectName }}</strong>
        </span>
        <span class="min-w-0">
          <span class="text-neutral-500">Currently evaluated</span>{{ ' '
          }}<strong class="font-semibold [overflow-wrap:anywhere]">{{
            currentDocsUrl ? displayDocsUrl(currentDocsUrl) : 'None found'
          }}</strong>
        </span>
      </div>

      <lfx-field
        label="Where is the project's main documentation?"
        :required="true"
      >
        <div
          class="flex flex-col gap-2 pt-1"
          role="radiogroup"
          aria-label="Where is the project's main documentation?"
        >
          <template v-if="isPending">
            <lfx-skeleton
              v-for="n in 3"
              :key="n"
              height="3.5rem"
              border-radius="0.5rem"
            />
          </template>

          <div
            v-for="candidate in candidates"
            :key="candidate.url"
            class="border rounded-lg px-3.5 py-3 cursor-pointer flex flex-col"
            :class="rowClass(candidate.url)"
            @click="form.picked = candidate.url"
          >
            <lfx-radio
              v-model="form.picked"
              :value="candidate.url"
              name="docs-url"
              :class="radioClass"
            >
              <span class="flex min-w-0 flex-col gap-0.5">
                <span class="flex flex-wrap items-center gap-2 font-semibold">
                  <span class="[overflow-wrap:anywhere]">{{ displayDocsUrl(candidate.url) }}</span>
                  <lfx-tag
                    v-if="candidate.isCurrent"
                    size="small"
                    variation="neutral"
                  >
                    Currently used
                  </lfx-tag>
                </span>
                <span class="text-xs text-neutral-500 font-normal">
                  {{ docsCandidateMeta(candidate.method, candidate.confidence) }}
                </span>
              </span>
            </lfx-radio>
          </div>

          <div
            class="border rounded-lg px-3.5 py-3 cursor-pointer flex flex-col gap-1.5"
            :class="rowClass(OTHER)"
            @click="form.picked = OTHER"
          >
            <lfx-radio
              v-model="form.picked"
              :value="OTHER"
              name="docs-url"
              :class="radioClass"
            >
              <span class="font-semibold">A different URL</span>
            </lfx-radio>
            <lfx-input
              v-model="form.url"
              type="url"
              placeholder="https://"
              aria-label="Documentation URL"
              :invalid="!!urlError"
            />
            <div role="alert">
              <lfx-field-messages
                :validation="$v.url"
                :error-messages="{ ...docsUrlErrorMessages, required: '' }"
              />
            </div>
          </div>

          <div
            v-if="showNoDocsOption"
            class="border rounded-lg px-3.5 py-3 cursor-pointer flex flex-col"
            :class="rowClass(NONE)"
            @click="form.picked = NONE"
          >
            <lfx-radio
              v-model="form.picked"
              :value="NONE"
              name="docs-url"
              :class="radioClass"
            >
              <span class="flex min-w-0 flex-col gap-0.5">
                <span class="font-semibold">The project has no documentation site</span>
                <span class="text-xs text-neutral-500 font-normal">
                  We'll stop looking for one and show that on the project page.
                </span>
              </span>
            </lfx-radio>
          </div>
        </div>

        <lfx-field-message
          v-if="currentPicked"
          type="warning"
          class="pt-2"
        >
          That's the URL we already evaluate. Pick another option to request a change.
        </lfx-field-message>
      </lfx-field>

      <lfx-field label="What's wrong with the current URL? (optional)">
        <p class="text-xs text-neutral-500 leading-4">
          Anything that helps us check, like where the docs are linked from.
        </p>
        <lfx-textarea
          v-model="form.description"
          aria-label="What's wrong with the current URL?"
          :maxlength="DOCS_CORRECTION_DESCRIPTION_MAX"
          rows="3"
          placeholder="e.g. docs.kubernetes.io redirects to kubernetes.io; the docs live at kubernetes.io/docs."
        />
        <p class="text-right text-xs text-neutral-500">
          {{ form.description.length }} / {{ DOCS_CORRECTION_DESCRIPTION_MAX }}
        </p>
      </lfx-field>

      <lfx-field-message
        v-if="submitFailed"
        type="error"
        role="alert"
      >
        Correction requests aren't working at the moment. Please try again later.
      </lfx-field-message>
    </section>

    <section class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <lfx-button
        type="outline"
        button-style="pill"
        size="large"
        class="w-full whitespace-nowrap sm:w-auto"
        :disabled="isSending"
        @click="isModalOpen = false"
      >
        Cancel
      </lfx-button>
      <lfx-button
        type="primary"
        button-style="pill"
        size="large"
        class="w-full whitespace-nowrap sm:w-auto"
        :disabled="$v.$invalid || isSending"
        :aria-busy="isSending"
        :loading="isSending"
        label="Submit request"
        @click="submit()"
      />
    </section>
  </lfx-modal>
</template>

<script lang="ts" setup>
import useVuelidate from '@vuelidate/core';
import { maxLength, required } from '@vuelidate/validators';
import { computed, nextTick, reactive, ref, watch } from 'vue';

import { docsCandidateMeta } from '~/components/modules/project/config/docs-readiness-labels';
import { DOCS_READINESS_API_SERVICE } from '~/components/modules/project/services/docs-readiness.api.service';
import type { DocsReadinessCorrectionContext } from '~/components/modules/project/store/docs-readiness-correction.store';
import LfxButton from '~/components/uikit/button/button.vue';
import LfxFieldMessage from '~/components/uikit/field/field-message.vue';
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxModal from '~/components/uikit/modal/modal.vue';
import LfxRadio from '~/components/uikit/radio/radio.vue';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxTag from '~/components/uikit/tag/tag.vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
import useToastService from '~/components/uikit/toast/toast.service';
import { ToastTypesEnum } from '~/components/uikit/toast/types/toast.types';
import { links } from '~/config/links';
import {
  DOCS_CORRECTION_DESCRIPTION_MAX,
  displayDocsUrl,
  docsUrlErrorMessages,
  validateDocsUrl,
} from '~~/config/docs-url-correction';

const props = defineProps<{
  context: DocsReadinessCorrectionContext;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();

// Top-aligns the radio with the first text line; the uikit default is items-center
const radioClass = 'docs-radio !items-start w-full';
const OTHER = '__other__';
const NONE = '__none__';

const { showToast } = useToastService();

const form = reactive({ picked: '', url: '', description: '' });
const isSending = ref(false);
const submitFailed = ref(false);

const { data, isPending } = DOCS_READINESS_API_SERVICE.fetchCorrectionContext(
  computed(() => props.context.projectSlug),
);

const isModalOpen = computed({
  get: () => true,
  set: (value: boolean) => {
    // Stay open while sending so a failure is never lost behind a closed modal
    if (!value && !isSending.value) emit('close');
  },
});

// Falls back to the opener's value while loading or when the request fails
const currentDocsUrl = computed(() => (data.value ? data.value.currentDocsUrl : props.context.currentDocsUrl));
// Never offer a candidate the server would refuse
const candidates = computed(() =>
  (data.value?.candidates ?? []).filter((c) => c.isCurrent || validateDocsUrl(c.url, null) === null),
);
const currentPicked = computed(() => candidates.value.some((c) => c.isCurrent && c.url === form.picked));
const showNoDocsOption = computed(() => props.context.state !== 'confirmed-no-docs');
const urlError = computed(() =>
  form.picked === OTHER && form.url.trim() ? validateDocsUrl(form.url, currentDocsUrl.value) : null,
);

const rules = computed(() => ({
  picked: { required, notCurrent: () => !currentPicked.value },
  url:
    form.picked === OTHER
      ? {
          required,
          invalid: () => urlError.value !== 'invalid',
          repository: () => urlError.value !== 'repository',
          current: () => urlError.value !== 'current',
        }
      : {},
  description: { maxLength: maxLength(DOCS_CORRECTION_DESCRIPTION_MAX) },
}));

const $v = useVuelidate(rules, form);

const rowClass = (value: string) => (form.picked === value ? 'border-brand-500 bg-brand-50' : 'border-neutral-200');

// Typing in the URL field selects "A different URL" and shows validation as the user types
watch(
  () => form.url,
  async () => {
    form.picked = OTHER;
    await nextTick();
    $v.value.url.$touch();
  },
);

const submit = async () => {
  if (isSending.value || $v.value.$invalid) return;

  isSending.value = true;
  submitFailed.value = false;

  try {
    let requestedDocsUrl: string | null = form.picked;
    if (form.picked === NONE) requestedDocsUrl = null;
    else if (form.picked === OTHER) requestedDocsUrl = form.url.trim();

    const issueUrl = await DOCS_READINESS_API_SERVICE.submitCorrection({
      projectSlug: props.context.projectSlug,
      url: window.location.href,
      requestedDocsUrl,
      description: form.description,
    });
    emit('close');
    showToast(
      'Thanks! The LF team will review it. Once approved, the next evaluation uses the new URL.',
      ToastTypesEnum.positive,
      'circle-check',
      15000,
      {
        title: 'Correction request submitted',
        actionLabel: 'View issue',
        actionUrl: issueUrl,
      },
    );
  } catch {
    submitFailed.value = true;
  } finally {
    isSending.value = false;
  }
};
</script>

<script lang="ts">
export default {
  name: 'LfxDocsReadinessCorrectionModal',
};
</script>

<style lang="scss" scoped>
.docs-radio {
  // 3px offset, as in the design, lines the indicator up with the first text line
  :deep(.c-radio__indicator) {
    margin-top: 3px;
  }

  :deep(.c-radio__label) {
    min-width: 0;
  }
}
</style>
