import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProjectStore = defineStore('project', () => {
    const startDate = ref<string | null>(null);
    const endDate = ref<string | null>(null);

    return {
        startDate,
        endDate,
    }
})
