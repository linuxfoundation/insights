<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1">
      <p class="text-sm font-semibold text-brand-600">Repository details</p>
      <p class="text-lg font-semibold text-neutral-900">Security assessments</p>
      <p class="text-xs font-normal leading-4 text-neutral-500">
        Provide additional context about your repository security posture, such as self-assessment
        and third-party assessments.
      </p>
    </div>

    <div class="flex flex-col gap-6">
      <!-- Self-assessment Section -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-base font-semibold leading-6 text-neutral-900">Self-assessment</p>
          <p class="text-xs font-normal leading-4 text-neutral-500">
            Describe your repository security practices, any security reviews conducted, known
            limitation, or other relevant security information.
          </p>
        </div>

        <!-- Evidence URL -->
        <div class="flex gap-6">
          <lfx-field
            label="Evidence URL"
            class="w-2/3"
          >
            <lfx-input
              v-model="model.repository.security.assessments.self.evidence"
              :invalid="
                $v.repository.security.assessments.self.evidence.$invalid &&
                  $v.repository.security.assessments.self.evidence.$dirty
              "
              @blur="$v.repository.security.assessments.self.evidence.$touch()"
              @input="$v.repository.security.assessments.self.evidence.$touch()"
            />
            <lfx-field-messages
              :validation="$v.repository.security.assessments.self.evidence"
              :error-messages="{ url: 'Invalid URL' }"
            />
          </lfx-field>

          <!-- Date -->
          <lfx-field
            label="Date"
            class="w-1/3"
          >
            <lfx-input
              v-model="model.repository.security.assessments.self.date"
              placeholder="mm/dd/yyyy"
            />
          </lfx-field>
        </div>

        <!-- Comment -->
        <lfx-field label="Comment">
          <lfx-textarea
            v-model="model.repository.security.assessments.self.comment"
            class="min-h-27"
          />
        </lfx-field>

        <!-- Self-assessment Tips Info Box -->
        <div class="flex flex-col gap-2">
          <div class="flex gap-1 items-center">
            <lfx-icon
              name="lightbulb"
              type="light"
              :size="14"
              class="text-brand-600"
            />
            <p class="text-xs font-semibold text-brand-600">Self-assessment tips</p>
          </div>
          <ul class="text-xs font-normal leading-4 text-neutral-600 list-disc pl-[18px]">
            <li>Mention any security audits or penetration testing performed;</li>
            <li>Describe your secure coding practices and review processes;</li>
            <li>Note any security-focused dependencies or tools used;</li>
            <li>Be transparent about known security limitations;</li>
            <li>Include information about your incident response process.</li>
          </ul>
        </div>
      </div>

      <!-- Third-party Assessment Section -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-base font-semibold leading-6 text-neutral-900">Third-party assessment</p>
          <p class="text-xs text-neutral-500 leading-4">
            Provide information about independent security audits, code reviews, or certifications
            performed by external parties.
          </p>
        </div>

        <!-- Third-party Assessment Items -->
        <lfx-yaml-third-party-assessment-item
          v-for="(_, index) of model.repository.security.assessments['third-party']"
          :key="index"
          v-model="model.repository.security.assessments['third-party'][index]"
        >
          <p class="text-sm font-bold text-neutral-900">Third-party assessment #{{ index + 1 }}</p>
          <lfx-icon-button
            v-if="model.repository.security.assessments['third-party'].length > 1"
            type="default"
            icon="trash-can"
            size="small"
            @click="model.repository.security.assessments['third-party'].splice(index, 1)"
          />
        </lfx-yaml-third-party-assessment-item>

        <!-- Add Assessment Button -->
        <div class="flex items-center justify-center">
          <lfx-button
            type="transparent"
            button-style="pill"
            @click="addThirdPartyAssessment"
          >
            <lfx-icon name="plus" />
            Add assessment
          </lfx-button>
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
import LfxTextarea from '~/components/uikit/textarea/textarea.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import LfxIcon from '~/components/uikit/icon/icon.vue'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue'
import LfxYamlThirdPartyAssessmentItem from
  '~/components/modules/project/config/yaml-generation/shared/components/yaml-third-party-assessment-item.vue'

const props = defineProps<{
  modelValue: object
}>()

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>()

const model = computed<object>({
  get: () => props.modelValue as object,
  set: (value: object) => emit('update:modelValue', value),
})

const rules = {
  repository: {
    security: {
      assessments: {
        self: {
          evidence: {
            url,
          },
        },
      },
    },
  },
}

const $v = useVuelidate(rules, model)

const addThirdPartyAssessment = () => {
  model.value.repository.security.assessments['third-party'].push({
    evidence: '',
    date: '',
    comment: '',
  })
}
</script>
