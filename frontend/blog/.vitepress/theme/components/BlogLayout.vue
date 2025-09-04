<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div v-if="shouldShowAuthor">
    <!-- Debug info -->
    <!-- <div style="background: yellow; padding: 10px; margin: 10px;">
      DEBUG: authorName={{ frontmatter.authorName }}, filePath={{ page.filePath }}
    </div> -->
    
    <!-- Render author information if this is a blog post with author frontmatter -->
    <BlogAuthor
      :author-name="frontmatter.authorName"
      :author-image="frontmatter.authorImage"
      :author-title="frontmatter.authorTitle"
      :date-published="frontmatter.datePublished"
    />
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'
import BlogAuthor from './BlogAuthor.vue'

const { frontmatter } = useData()

// Show author info if authorName exists in frontmatter
const shouldShowAuthor = computed(() => {
  return !!frontmatter.value.authorName
})
</script>

<style lang="scss" scoped>
/* Add any blog-specific styling here */
</style>
