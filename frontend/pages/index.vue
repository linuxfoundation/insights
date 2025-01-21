<template>
  <div>
    <h1 class="border text-primary-500 bg-white p-32">Sample Page</h1>
    <h1>{{ sampleFunction() }}</h1>
  </div>
</template>

<script setup lang="ts">
const test = "test";
const sampleFunction = () => {
    return test;
};
</script>
