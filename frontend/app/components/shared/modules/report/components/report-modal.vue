<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    class="p-6"
  >
    <section class="pb-8">
      <div class="flex justify-between pb-3">
        <div class="bg-warning-50 h-12 w-12 rounded-full flex items-center justify-center">
          <lfx-icon
            name="comment-exclamation"
            class="text-warning-600"
            :size="24"
          />
        </div>
        <lfx-icon-button
          icon="close"
          size="small"
          @click="isModalOpen = false"
        />
      </div>
      <h3 class="text-heading-3 font-secondary font-bold pb-1">
        Report issue
      </h3>
      <p class="text-body-2 text-neutral-500">
        Help is improve our data by reporting any issues or bugs you’ve encountered.
      </p>
    </section>

    <section class="flex flex-col gap-6 pb-8">
      <article v-if="!form.hideArea">
        <lfx-field
          label="Select area"
          :required="true"
        >
          <div class="flex flex-wrap gap-3">
            <lfx-chip
              v-for="(area, areaKey) in lfxWidgetArea"
              :key="areaKey"
              type="bordered"
              class="cursor-pointer transition-all"
              :class="{'!bg-brand-50 !border-brand-200': form.area === areaKey}"
              @click="form.area = areaKey"
            >
              {{area.label}}
            </lfx-chip>
          </div>

          <lfx-field-messages
            :validation="$v.area"
            :error-messages="{ required: 'This field is required' }"
          />
        </lfx-field>
      </article>
      <article v-if="(lfxWidgetArea[form.area as WidgetArea]?.widgets || []).length > 0 && !form.hideArea">
        <lfx-field
          label="Data insight"
          placeholder="Select option"
        >
          <lfx-select
            v-model="form.widget"
            placeholder="Select option"
          >
            <lfx-option
              v-for="widget of (lfxWidgetArea[form.area as WidgetArea]?.widgets || [])"
              :key="widget"
              :value="widget"
              :label="lfxWidgets[widget]?.name"
            />
          </lfx-select>
        </lfx-field>
      </article>
      <article>
        <lfx-field
          label="Description"
          :required="true"
        >
          <p class="text-xs text-neutral-500 leading-4">
            Help us troubleshoot by providing a clear and detailed explanation of the issue you found.
          </p>
          <lfx-textarea
            v-model="form.description"
            placeholder="Enter description..."
            class="min-h-25"
            :invalid="$v.description.$invalid && $v.description.$dirty"
            @blur="$v.description.$touch()"
            @change="$v.description.$touch()"
          />
          <lfx-field-messages
            :validation="$v.description"
            :error-messages="{ required: 'This field is required' }"
          />
        </lfx-field>
      </article>

      <article class="flex items-center gap-4">
        <div class="h-px flex grow bg-neutral-200" />
        <div>
          <p class="text-xs leading-5 font-medium mb-1">
            Want to be notified once the issue is resolved?
          </p>
          <p class="text-xs leading-4 text-neutral-500">
            Provide your contact and we’ll keep you updated
          </p>

        </div>
        <div class="h-px flex grow bg-neutral-200" />
      </article>

      <article>
        <lfx-input
          v-model="form.email"
          placeholder="Enter email address"
          type="email"
          autocomplete="email"
          :invalid="$v.email.$invalid && $v.email.$dirty"
          @blur="$v.email.$touch()"
        />
        <lfx-field-messages
          :validation="$v.email"
          :error-messages="{ email: 'Invalid email' }"
        />
      </article>
    </section>

    <section class="flex justify-end">
      <lfx-button
        variant="primary"
        size="large"
        class="!rounded-full"
        :disabled="$v.$invalid"
        :loading="isSending"
        @click="submit()"
      >
        Report issue
      </lfx-button>
    </section>
  </lfx-modal>
</template>

<script lang="ts" setup>
import {computed, watch} from "vue";
import { required, email } from '@vuelidate/validators'
import useVuelidate from "@vuelidate/core";
import {storeToRefs} from "pinia";
import LfxModal from "~/components/uikit/modal/modal.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfxIconButton from "~/components/uikit/icon-button/icon-button.vue";
import LfxField from "~/components/uikit/field/field.vue";
import LfxChip from "~/components/uikit/chip/chip.vue";
import LfxSelect from "~/components/uikit/select/select.vue";
import LfxOption from "~/components/uikit/select/option.vue";
import LfxTextarea from "~/components/uikit/textarea/textarea.vue";
import LfxInput from "~/components/uikit/input/input.vue";
import LfxButton from "~/components/uikit/button/button.vue";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import type {ReportRequest} from "~~/types/report/requests.types";
import useToastService from "~/components/uikit/toast/toast.service";
import {ToastTypesEnum} from "~/components/uikit/toast/types/toast.types";
import LfxFieldMessages from "~/components/uikit/field/field-messages.vue";
import {lfxWidgetArea} from "~/components/modules/widget/config/widget-area.config";
import type {Widget} from "~/components/modules/widget/types/widget";
import type {ReportDataForm} from "~/components/shared/modules/report/types/report.types";
import {lfxWidgets} from "~/components/modules/widget/config/widget.config";
import type {WidgetArea} from "~/components/modules/widget/types/widget-area";

const props = defineProps<{
  modelValue: boolean;
  defaults: Partial<ReportDataForm>
}>()

const emit = defineEmits<{(e: 'update:modelValue', value: boolean): void;
}>();

const {project, selectedRepository} = storeToRefs(useProjectStore());
const {showToast} = useToastService();

const isSending = ref(false);

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value);
  },
})

const form = reactive<ReportDataForm>({
  area: '',
  widget: '',
  description: '',
  email: '',
  hideArea: false,
  ...props.defaults,
})

const rules = computed(() => ({
  area: form.hideArea ? {} : {
    required,
  },
  description: {
    required
  },
  email: {
    email,
  },
}))

const $v = useVuelidate(rules, form);

const submit = () => {
  const data: ReportRequest = {
    area: lfxWidgetArea[form.area as WidgetArea]?.label || form.area,
    widget: lfxWidgets[form.widget as Widget]?.name || form.widget,
    description: form.description,
    email: form.email,
    url: window?.location?.href,
    projectSlug: project.value?.slug,
    projectName: project.value?.name,
    repositoryUrl: selectedRepository.value,
    pageTitle: document.title,
  }

  if(isSending.value) {
    return;
  }

  isSending.value = true;

  $fetch('/api/report', {
    method: 'POST',
    body: data,
  })
      .then((res) => {
        isModalOpen.value = false;
        showToast('Issue successfully reported', ToastTypesEnum.positive, undefined, 3000)
      })
      .catch(() => {
        showToast(
          'There was an error reporting issue, please try again later',
          ToastTypesEnum.negative,
          undefined,
          3000
        )
      })
      .finally(() => {
        isSending.value = false;
      })
}

watch(() => form.area, () => {
  form.widget = '';
})
</script>

<script lang="ts">
export default {
  name: 'LfxReportModal',
};
</script>
