<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-brand-600">Repository details</p>
      <p class="text-lg font-semibold text-neutral-900">Release information</p>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Provide key details about the repository release process so contributors can verify,
        understand, and safely use published versions.
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <!-- Changelog URL -->
      <lfx-field label="Changelog URL template">
        <p class="text-xs font-normal leading-4 text-neutral-500">
          Reference to the changelog location or template used to track release changes.
        </p>
        <lfx-input
          v-model="model.repository.release.changelog"
          :invalid="
            $v.repository.release.changelog.$invalid && $v.repository.release.changelog.$dirty
          "
          @blur="$v.repository.release.changelog.$touch()"
          @input="$v.repository.release.changelog.$touch()"
        />
        <lfx-field-messages
          :validation="$v.repository.release.changelog"
          :error-messages="{ url: 'Invalid URL' }"
        />
      </lfx-field>

      <!-- Automated Pipeline Checkbox -->
      <lfx-checkbox
        v-model="model.repository.release['automated-pipeline']"
        class="!items-start"
      >
        <p class="-mt-0.5 text-sm pl-1.5">Automated pipeline</p>
      </lfx-checkbox>

      <!-- Attestations Section -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-base font-semibold leading-6 text-neutral-900">Attestations</p>
          <p class="text-xs font-normal leading-4 text-neutral-500">
            Evidence or metadata (such as signed statements or provenance files) that verify how and
            when a release was built.
          </p>
        </div>

        <!-- Attestation Items -->
        <lfx-yaml-attestation-item
          v-for="(_, index) of model.repository.release.attestations"
          :key="index"
          v-model="model.repository.release.attestations[index]"
        >
          <p class="text-sm font-bold text-neutral-900">Attestation #{{ index + 1 }}</p>
          <lfx-icon-button
            v-if="model.repository.release.attestations.length > 1"
            type="default"
            icon="trash-can"
            size="small"
            @click="model.repository.release.attestations.splice(index, 1)"
          />
        </lfx-yaml-attestation-item>

        <!-- Add Attestation Button -->
        <div class="flex items-center justify-center">
          <lfx-button
            type="transparent"
            button-style="pill"
            @click="addAttestation"
          >
            <lfx-icon name="plus" />
            Add attestation
          </lfx-button>
        </div>
      </div>

      <!-- Distribution Points Section -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-base font-semibold leading-6 text-neutral-900">Distribution points</p>
          <p class="text-xs font-normal leading-4 text-neutral-500">
            Official sources where releases can be downloaded or accessed, such as package
            registries, artifact repositories, or release pages.
          </p>
        </div>

        <!-- Distribution Point Items -->
        <lfx-yaml-distribution-point-item
          v-for="(_, index) of model.repository.release['distribution-points']"
          :key="index"
          v-model="model.repository.release['distribution-points'][index]"
        >
          <p class="text-sm font-bold text-neutral-900">Distribution point #{{ index + 1 }}</p>
          <lfx-icon-button
            v-if="model.repository.release['distribution-points'].length > 1"
            type="default"
            icon="trash-can"
            size="small"
            @click="model.repository.release['distribution-points'].splice(index, 1)"
          />
        </lfx-yaml-distribution-point-item>

        <!-- Add Distribution Point Button -->
        <div class="flex items-center justify-center">
          <lfx-button
            type="transparent"
            button-style="pill"
            @click="addDistributionPoint"
          >
            <lfx-icon name="plus" />
            Add distribution point
          </lfx-button>
        </div>
      </div>

      <!-- Release License Section -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-base font-semibold leading-6 text-neutral-900">Release license</p>
          <p class="text-xs font-normal leading-4 text-neutral-500">
            Specify the license under which your repository is distributed. This information helps
            users understand how they can use, modify, and distribute your code.
          </p>
        </div>

        <!-- License URL -->
        <lfx-field label="License URL">
          <p class="text-xs font-normal leading-4 text-neutral-500">
            URL to the full text of your project's license
          </p>
          <lfx-input
            v-model="model.repository.release.license.url"
            placeholder="https://opensource.org/licenses/MIT"
            :invalid="
              $v.repository.release.license.url.$invalid && $v.repository.release.license.url.$dirty
            "
            @blur="$v.repository.release.license.url.$touch()"
            @input="$v.repository.release.license.url.$touch()"
          />
          <lfx-field-messages
            :validation="$v.repository.release.license.url"
            :error-messages="{ url: 'Invalid URL' }"
          />
        </lfx-field>

        <!-- License Expression -->
        <lfx-field label="License expression">
          <p class="text-xs font-normal leading-4 text-neutral-500">
            SPDX license identifier (e.g., MIT, Apache-2.0, GPL-3.0, BSD-3-Clause)
          </p>
          <lfx-input
            v-model="model.repository.release.license.expression"
            placeholder="MIT"
          />
        </lfx-field>

        <!-- Common License Examples Info Box -->
        <div class="flex flex-col gap-2">
          <div class="flex gap-1 items-center">
            <lfx-icon
              name="info-circle"
              :size="14"
              class="text-brand-600"
            />
            <p class="text-xs font-semibold text-brand-600">Common license examples</p>
          </div>
          <div class="text-xs font-normal leading-4 text-neutral-600">
            <p class="mb-0">
              <span class="font-semibold">MIT:</span> Permissive license with minimal restrictions
            </p>
            <p class="mb-0">
              <span class="font-semibold">Apache-2.0:</span> Permissive license with patent
              protection
            </p>
            <p class="mb-0">
              <span class="font-semibold">GPL-3.0:</span> Copyleft license requiring derivative
              works to be open source
            </p>
            <p class="mb-0">
              <span class="font-semibold">BSD-3-Clause:</span> Permissive license similar to MIT
              with additional clause
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { url } from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'
import LfxField from '~/components/uikit/field/field.vue'
import LfxInput from '~/components/uikit/input/input.vue'
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue'
import LfxYamlAttestationItem from
  '~/components/modules/project/config/yaml-generation/shared/components/yaml-attestation-item.vue'
import LfxYamlDistributionPointItem from
  '~/components/modules/project/config/yaml-generation/shared/components/yaml-distribution-point-item.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
})

const rules = {
  repository: {
    release: {
      changelog: {
        url,
      },
      license: {
        url: {
          url,
        },
      },
    },
  },
}

const $v = useVuelidate(rules, model)

const addAttestation = () => {
  model.value.repository.release.attestations.push({
    name: '',
    'predicate-uri': '',
    location: '',
    comment: '',
  })
}

const addDistributionPoint = () => {
  model.value.repository.release['distribution-points'].push({
    uri: '',
    comment: '',
  })
}
</script>
