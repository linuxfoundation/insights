<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <table class="min-w-full border border-neutral-200 rounded text-xs">
    <thead>
      <tr class="bg-neutral-50">
        <th
          v-for="(col, colIdx) in Object.keys(data[0] || {})"
          :key="colIdx"
          class="px-3 py-2 border-b border-neutral-200 text-left font-semibold text-neutral-700"
        >
          {{ col }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(row, rowIdx) in data"
        :key="rowIdx"
        class="hover:bg-neutral-50"
      >
        <td
          v-for="(col, colIdx) in Object.keys(data[0] || {})"
          :key="colIdx"
          class="px-3 py-2 border-b border-neutral-100"
        >
          {{ row[col] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import type { MessageData } from '../../types/copilot.types';

defineProps<{
  data: MessageData[] | null
}>()
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotTableResults'
}
</script>
