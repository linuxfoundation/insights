<template>
  <div class="container mx-auto">
    <h1 class="text-primary-500 mb-20">Sample Page</h1>
    <lfx-card class="p-5">
      Sample Card
    </lfx-card>

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
    </div>
    <div class="flex flex-row gap-2">
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
import LfxCard from "@/components/uikit/card/Card.vue";
import LfxButton from "~/components/uikit/button/button.vue";

</script>
