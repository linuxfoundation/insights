<template>
  <div
    class="flex items-center gap-2 cursor-pointer text-sm leading-5 font-medium
    py-2 px-3 transition hover:bg-neutral-50 rounded-lg"
    :class="isOpen ? 'bg-neutral-50' : ''"
    @click="toggle"
  >
    <lfx-icon name="calendar" :size="16" />
    Past 90 days
    <lfx-icon name="angle-down" :size="12" class="text-neutral-500" />
  </div>
  <lfx-popover ref="options" v-model:is-open="isOpen">
    <div class="flex flex-col p-1 gap-1 w-80">
      <article
        v-for="option of lfxProjectDateOptions"
        :key="option.label"
        class="py-2 px-3 flex justify-between items-center rounded-md cursor-pointer hover:bg-neutral-50 transition"
        @click="changeSelected(option)">
        <div class="flex items-center">
          <lfx-icon
            name="check" :size="16" class="text-brand-500"
            :class="selected === option.key ? 'visible' : 'invisible'" />
          <p
            class="text-sm leading-5  pl-3"
            :class="selected === option.key ? 'font-medium' : 'font-normal'">
            {{option.label}}
          </p>
        </div>
        <p v-if="option.description" class="text-xs leading-5 text-neutral-400">
          {{option.description}}
        </p>
      </article>
      <div class="h-px bg-neutral-100 w-full" />
      <article
        v-for="option of lfxProjectDateOptionsPrevious"
        :key="option.label"
        class="py-2 px-3 flex justify-between items-center rounded-md cursor-pointer hover:bg-neutral-50 transition"
        @click="changeSelected(option)">
        <div class="flex items-center">
          <lfx-icon
            name="check" :size="16" class="text-brand-500"
            :class="selected === option.key ? 'visible' : 'invisible'" />
          <p
            class="text-sm leading-5  pl-3"
            :class="selected === option.key ? 'font-medium' : 'font-normal'">
            {{option.label}}
          </p>
        </div>
        <p v-if="option.description" class="text-xs leading-5 text-neutral-400">
          {{option.description}}
        </p>
      </article>
      <div class="h-px bg-neutral-100 w-full" />

      <article
        v-for="option of [alltimeOption]"
        :key="option.label"
        class="py-2 px-3 flex items-center rounded-md cursor-pointer hover:bg-neutral-50 transition"
        @click="changeSelected(option)">
        <lfx-icon
          name="check" :size="16" class="text-brand-500"
          :class="selected === option.key ? 'visible' : 'invisible'" />
        <p
          class="text-sm leading-5  pl-3"
          :class="selected === option.key ? 'font-medium' : 'font-normal'">
          {{option.label}}
        </p>
      </article>
    </div>
  </lfx-popover>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {storeToRefs} from "pinia";
import LfxPopover from "~/components/uikit/popover/popover.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {
  type DateOptionConfig,
  lfxProjectDateOptions,
  lfxProjectDateOptionsPrevious
} from "~/components/modules/project/config/date-options";
import {useProjectStore} from "~/components/modules/project/store/project.store";

const {dateStart, dateEnd} = storeToRefs(useProjectStore())

const options = ref();
const isOpen = ref(false);

const selected = ref(lfxProjectDateOptions[0]?.key || 'past90days');

const alltimeOption: DateOptionConfig = {
  key: 'alltime',
  label: 'All time',
  dateStart: null,
  dateEnd: null,
};

const toggle = (event: MouseEvent) => {
  options.value.toggle(event);
};

const changeSelected = (option: DateOptionConfig) => {
  selected.value = option.key;
  dateStart.value = option.dateStart;
  dateEnd.value = option.dateEnd;
  options.value.hide();
}
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDateRangePicker'
};
</script>
