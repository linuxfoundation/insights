<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <Layout>
    <template #aside-outline-after>
      <BlogAuthor
        v-if="frontmatter.authorName"
        :author-name="frontmatter.authorName"
        :author-image="frontmatter.authorImage"
        :author-company="frontmatter.authorCompany"
        :date-published="frontmatter.datePublished"
      />
    </template>
    
    <template #layout-bottom>
      <CustomLfxFooter />
    </template>
    
    <template #not-found>
      <CustomNotFound />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import BlogAuthor from './BlogAuthor.vue'
import CustomLfxFooter from './CustomLfxFooter.vue'
import CustomNotFound from './CustomNotFound.vue'

const { frontmatter } = useData()
const { Layout } = DefaultTheme
</script>
