import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProjectStore = defineStore('project', () => {
    const dateStart = ref<string | null>(null);
    const dateEnd = ref<string | null>(null);

    return {
        dateStart,
        dateEnd,
    }
})
