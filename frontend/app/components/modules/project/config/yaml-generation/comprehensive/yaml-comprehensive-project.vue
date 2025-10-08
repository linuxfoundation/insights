<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header Section -->
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold leading-7 text-neutral-900">
        Project details
      </h2>
      <p class="text-body-2 text-neutral-500">
        Basic project information and online references on how it is supported and developed over time.
      </p>
    </div>

    <!-- Project name -->
    <lfx-field label="Project name">
      <lfx-input
        v-model="model.project.name"
      />
    </lfx-field>

    <!-- Project homepage -->
    <div class="flex flex-col gap-1">
      <lfx-field label="Project homepage">
        <p class="text-body-2 text-neutral-500 mb-1">
          Project or repository main website
        </p>
        <lfx-input
          v-model="model.project.homepage"
          :invalid="$v.project.homepage.$invalid && $v.project.homepage.$dirty"
          @blur="$v.project.homepage.$touch()"
          @input="$v.project.homepage.$touch()"
        />
        <lfx-field-messages
          :validation="$v.project.homepage"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>
    </div>

    <!-- Funding URL -->
    <div class="flex flex-col gap-1">
      <lfx-field label="Funding URL">
        <p class="text-body-2 text-neutral-500 mb-1">
          Project sponsorship website
        </p>
        <lfx-input
          v-model="model.project.funding"
          :invalid="$v.project.funding.$invalid && $v.project.funding.$dirty"
          @blur="$v.project.funding.$touch()"
          @input="$v.project.funding.$touch()"
        />
        <lfx-field-messages
          :validation="$v.project.funding"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>
    </div>

    <!-- Roadmap URL -->
    <div class="flex flex-col gap-1">
      <lfx-field label="Roadmap URL">
        <p class="text-body-2 text-neutral-500 mb-1">
          Website containing future plans, milestones, or feature goals.
        </p>
        <lfx-input
          v-model="model.project.roadmap"
          :invalid="$v.project.roadmap.$invalid && $v.project.roadmap.$dirty"
          @blur="$v.project.roadmap.$touch()"
          @input="$v.project.roadmap.$touch()"
        />
        <lfx-field-messages
          :validation="$v.project.roadmap"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>
    </div>
  </div>
</template>

<script setup lang="ts">
import {url} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import LfxField from '~/components/uikit/field/field.vue';
import LfxInput from '~/components/uikit/input/input.vue';
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
  project:{
    homepage: {
      url,
    },
    funding: {
      url,
    },
    roadmap: {
      url,
    },
  }
}

const $v = useVuelidate(rules, model);
</script>
