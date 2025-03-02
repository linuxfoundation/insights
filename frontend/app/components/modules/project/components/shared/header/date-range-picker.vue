<template>
  <div>
    <div
      class="flex items-center gap-2 cursor-pointer text-sm leading-5 font-medium
    py-2 px-3 transition hover:bg-neutral-50 rounded-lg"
      :class="isOpen ? 'bg-neutral-50' : ''"
      @click="toggle"
    >
      <lfx-icon name="calendar" :size="16" />
      <span v-if="selected !== 'custom'">{{selectedOption?.label}}</span>
      <span v-else>{{date(startDate).format('MMM D, YYYY')}} -> {{date(endDate).format('MMM D, YYYY')}}</span>
      <lfx-icon name="angle-down" :size="12" class="text-neutral-500" />
    </div>
    <lfx-popover ref="options" v-model:is-open="isOpen">
      <div class="flex flex-col p-1 gap-1 w-80">
        <article
          v-for="option of lfxProjectDateOptionsPast"
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
          v-for="option of lfxProjectDateOptionsGeneral"
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

        <article
          class="py-2 px-3 flex items-center rounded-md cursor-pointer hover:bg-neutral-50 transition"
          @click="isCustomSelectorOpen = true; options.hide()">
          <lfx-icon
            name="check" :size="16" class="text-brand-500"
            :class="selected === 'custom' ? 'visible' : 'invisible'" />
          <p
            class="text-sm leading-5  pl-3"
            :class="selected === 'custom' ? 'font-medium' : 'font-normal'">
            Custom
          </p>
        </article>
      </div>
    </lfx-popover>
    <lfx-project-custom-date-range-picker v-model="isCustomSelectorOpen" @select="changeSelected($event)" />
  </div>

</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import {storeToRefs} from "pinia";
import LfxPopover from "~/components/uikit/popover/popover.vue";
import LfxIcon from "~/components/uikit/icon/icon.vue";
import {
  type DateOptionConfig, lfxProjectDateOptions, lfxProjectDateOptionsGeneral,
  lfxProjectDateOptionsPast,
  lfxProjectDateOptionsPrevious
} from "~/components/modules/project/config/date-options";
import {useProjectStore} from "~/components/modules/project/store/project.store";
import LfxProjectCustomDateRangePicker
  from "~/components/modules/project/components/shared/header/custom-date-range-picker.vue";
import useDate from "~/components/shared/utils/date";

const {startDate, endDate} = storeToRefs(useProjectStore())

const options = ref();
const isOpen = ref(false);
const isCustomSelectorOpen = ref(false);

const date = useDate();

const selected = ref(lfxProjectDateOptions[0]?.key || 'past90days');

const selectedOption = computed(() => lfxProjectDateOptions.find((option) => option.key === selected.value));

const toggle = (event: MouseEvent) => {
  options.value.toggle(event);
};

const changeSelected = (option: DateOptionConfig) => {
  selected.value = option.key;
  startDate.value = option.startDate;
  endDate.value = option.endDate;
  options.value.hide();
}
</script>

<script lang="ts">
export default {
  name: 'LfxProjectDateRangePicker'
};
</script>
