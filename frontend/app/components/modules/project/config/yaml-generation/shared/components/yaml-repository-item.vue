<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article
    class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4"
  >
    <div class="flex justify-between items-center min-h-7">
      <slot />
    </div>
    <lfx-field label="Repository name">
      <lfx-input
        v-model="model.name"
        placeholder=" "
      />
    </lfx-field>

    <lfx-field label="Repository URL">
      <lfx-input
        v-model="model.url"
        placeholder="https://github.com/your-project/your-repository"
        :invalid="$v.url.$invalid && $v.url.$dirty"
        @blur="$v.url.$touch()"
        @input="$v.url.$touch()"
      />
      <lfx-field-messages
        :validation="$v.url"
        :error-messages="{ url: 'Invalid URL' }"
      />
    </lfx-field>

    <lfx-field label="Repository comment">
      <lfx-textarea
        v-model="model.comment"
        placeholder="Brief description of the repository purpose and scope"
        class="min-h-18"
      />
    </lfx-field>
  </article>
</template>

<script setup lang="ts">
import useVuelidate from "@vuelidate/core";
import { url} from '@vuelidate/validators'
import LfxInput from "~/components/uikit/input/input.vue";
import LfxField from "~/components/uikit/field/field.vue";
import LfxTextarea from "~/components/uikit/textarea/textarea.vue";
import LfxFieldMessages from "~/components/uikit/field/field-messages.vue";

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{(e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value)
})

const rules = {
  url: {
    url,
  }
}

const $v = useVuelidate(rules, model);
</script>

<script lang="ts">
export default {
  name: 'LfxYamlRepositoryItem',
}
</script>
