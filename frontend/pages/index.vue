<template>
  <div>
    <h1 class="border text-primary-500 bg-white p-32">Sample Page</h1>
    <h1>{{ sampleFunction() }}</h1>
    <div class="flex flex-row gap-2">
      <lfx-button>
        Primary
      </lfx-button>
      <lfx-button type="secondary">
        Secondary
      </lfx-button>
      <lfx-button type="success">
        Success
      </lfx-button>
      <lfx-button type="info">
        Info
      </lfx-button>
      <lfx-button type="warn">
        Warn
      </lfx-button>
      <lfx-button type="help">
        Help
      </lfx-button>
      <lfx-button type="danger">
        Danger
      </lfx-button>
      <lfx-button type="contrast">
        Contrast
      </lfx-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LfxButton from '~/components/uikit/lfx-button/LfxButton.vue';
const test = "test";
const sampleFunction = () => {
    return test;
};
</script>
