<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="blog-author-container">
    <div class="author-info">
      <img 
        v-if="authorImage" 
        :src="authorImage" 
        :alt="authorName"
        class="author-avatar"
      >
      <div class="author-details">
        <div class="author-name">{{ authorName }}</div>
        <div
          v-if="authorCompany"
          class="author-company"
        >{{ authorCompany }}</div>
        <div
          v-if="datePublished"
          class="publish-date"
        >{{ formattedDate }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  authorName?: string
  authorImage?: string
  authorCompany?: string
  datePublished?: string
}

const props = withDefaults(defineProps<Props>(), {
  authorName: '',
  authorImage: '',
  authorCompany: '',
  datePublished: ''
})

const formattedDate = computed(() => {
  if (!props.datePublished) return ''
  
  try {
    const date = new Date(props.datePublished)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return props.datePublished
  }
})
</script>

<style lang="scss" scoped>
.blog-author-container {
  margin-top: 1.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background-color: #f9fafb;
}

.author-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  text-align: center;
}

.author-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.author-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: center;
}

.author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.author-company,
.publish-date {
  font-size: 0.75rem;
  font-weight: 500;
  color: #4b5563;
}

.publish-date {
  margin-top: 0.25rem;
}
</style>
