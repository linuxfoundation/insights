<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="h-full overflow-auto rounded">
    <table class="min-w-full text-xs">
      <thead class="bg-white sticky top-0 z-10 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-neutral-200">
        <tr>
          <th
            v-for="(col, colIdx) in Object.keys(data![0] || {})"
            :key="colIdx"
            class="px-3 py-4 text-left font-medium text-neutral-500"
          >
            {{ normalizedColumnHeader(col) }}
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
            v-for="(col, colIdx) in Object.keys(data![0] || {})"
            :key="colIdx"
            class="px-3 py-4"
          >
            {{ row[col] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { MessageData } from '../../types/copilot.types';

defineProps<{
  data: MessageData[] | null
}>()

const normalizedColumnHeader = (header: string) => {
  // Replace underscores and camelCase with spaces, then capitalize only the first character
  const formatted = header
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase to space
    .replace(/_/g, ' ') // snake_case to space
    .replace(/\s+/g, ' ') // collapse multiple spaces
    .trim();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
</script>

<script lang="ts">
export default {
  name: 'LfxCopilotTableResults'
}
</script>
