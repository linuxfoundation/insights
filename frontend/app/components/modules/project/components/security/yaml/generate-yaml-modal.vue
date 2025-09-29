<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <lfx-modal
    v-model="isModalOpen"
    width="1200px"
    type="cover"
    class="!justify-center"
    content-class="!h-screen"
  >
    <div class="flex h-full">
      <lf-security-generate-yaml-sidebar />

      <!-- Main content area -->
      <div class="w-2/3 flex flex-col">
        <!-- Header -->
        <div class="border-b border-neutral-200 px-6 pt-4 pb-5">
          <div class="flex justify-between items-center mb-3">
            <h1 class="text-2xl font-secondary font-bold text-neutral-900 leading-8">
              Generate YAML security file
            </h1>
            <lfx-icon-button
              icon="close"
              @click="isModalOpen = false"
            />
          </div>
          <div class="flex flex-col gap-2">
            <p class="text-sm text-neutral-600 leading-5">
              Step 1/8 - Header Information
            </p>
            <div class="relative">
              <div class="bg-brand-50 h-1.5 rounded-full w-full" />
              <div
                class="bg-brand-500 h-1.5 rounded-full absolute top-0 left-0"
                :style="{width: `${(1 / 8) * 100}%`}"
              />
            </div>
          </div>
        </div>

        <!-- Form content -->
        <div class="flex-1 p-6 overflow-auto">
          <lf-security-generate-yaml-preview :data="getYaml()" />
        </div>

        <!-- Footer -->
        <div class="border-t border-neutral-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <lfx-button
              type="tertiary"
              button-style="pill"
            >
              <lfx-icon name="angle-left" />
              Previous
            </lfx-button>
            <div class="flex items-center gap-3">
              <lfx-button
                type="tertiary"
                button-style="pill"
                @click="copyToClipboard"
              >
                <lfx-icon name="clone" />
                Copy to clipboard
              </lfx-button>
              <lfx-button
                button-style="pill"
                @click="downloadYamlFile"
              >
                <lfx-icon name="arrow-down-to-bracket" />
                Download YAML file
              </lfx-button>
              <lfx-button
                button-style="pill"
                type="primary"
              >
                Next
                <lfx-icon name="angle-right" />
              </lfx-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </lfx-modal>
</template>

<script setup lang="ts">
import {computed, reactive} from 'vue'
import {dump} from "js-yaml";
import LfxModal from '~/components/uikit/modal/modal.vue'
import LfxButton from '~/components/uikit/button/button.vue'
import LfxIconButton from '~/components/uikit/icon-button/icon-button.vue'
import LfSecurityGenerateYamlSidebar
  from "~/components/modules/project/components/security/yaml/generate-yaml-sidebar.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import LfSecurityGenerateYamlPreview
  from "~/components/modules/project/components/security/yaml/generate-yaml-preview.vue";

const props = withDefaults(defineProps<{
  modelValue: boolean
}>(), {
  modelValue: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isModalOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const form = reactive({
  projectUrl: '1234',
  lastUpdated: '25-05-2024',
  metadata: {
    name: 'Sample Project',
    description: 'A sample security project',
    projectWebsite: 'https://example.com',
    category: 'Development Tools'
  },
  repository: {
    url: 'https://github.com/organization/repo',
    language: 'TypeScript',
    securityPolicyUrl: 'https://github.com/organization/repo/security/policy',
    maintainers: ['maintainer1', 'maintainer2']
  },
  administrator: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1-555-0123',
    timezone: 'UTC-5'
  },
  coreTeam: [
    {
      name: 'Jane Smith',
      role: 'Lead Developer',
      email: 'jane.smith@example.com',
      github: 'janesmith'
    },
    {
      name: 'Bob Johnson',
      role: 'Security Engineer',
      email: 'bob.johnson@example.com',
      github: 'bjohnson'
    }
  ]
});

const getYaml = () => {
  let yaml = dump(form, {
    indent: 2,
    lineWidth: 80,
    noRefs: true,
    sortKeys: false,
    noArrayIndent: false
  })
  yaml = yaml.replace(/\n\s*-\n\s+/g, '\n  - ');
  return yaml;
}

const copyToClipboard = async () => {
  if(navigator.clipboard){
    const yamlContent = getYaml()
    await navigator.clipboard.writeText(yamlContent)
  }
}

const downloadYamlFile = () => {
  try {
    const yamlContent = getYaml()
    // eslint-disable-next-line no-undef
    const blob = new Blob([yamlContent], { type: 'application/x-yaml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'security-insights.yaml'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download YAML file:', error)
  }
}


</script>

<script lang="ts">
export default {
  name: 'LfSecurityGenerateYamlModal'
}
</script>
