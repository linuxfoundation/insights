import { defineStore } from 'pinia';
import { ref } from 'vue';
import {lfxProjectDateOptions} from "~/components/modules/project/config/date-options";

export const useProjectStore = defineStore('project', () => {
    const startDate = ref<string | null>(lfxProjectDateOptions[0]?.startDate || null);
    const endDate = ref<string | null>(lfxProjectDateOptions[0]?.endDate || null);

    return {
        startDate,
        endDate,
    }
})
