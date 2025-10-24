<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <article class="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-4">
    <div class="flex justify-between items-center min-h-7">
      <slot />
    </div>

    <div class="flex flex-col gap-4">
      <!-- Tool name -->
      <lfx-field label="Tool name">
        <lfx-input v-model="model.name" />
      </lfx-field>

      <!-- Tool type and Version -->
      <div class="flex gap-4">
        <lfx-field
          label="Tool type"
          class="flex-1"
        >
          <lfx-input
            v-model="model.type"
            placeholder="e.g. SAST, DAST, dependency scanner"
          />
        </lfx-field>

        <lfx-field
          label="Version"
          class="flex-1"
        >
          <lfx-input v-model="model.version" />
        </lfx-field>
      </div>

      <!-- Rulesets -->
      <div class="flex flex-col gap-1">
        <p class="text-sm font-medium leading-5 text-neutral-900">Rulesets</p>
        <p class="text-body-2 text-neutral-500">
          Specific rules, policies, or configurations applied by the tool
        </p>

        <div class="flex flex-col gap-3 mt-2">
          <lfx-input
            v-for="(_, index) in model.rulesets"
            :key="index"
            v-model="model.rulesets[index]"
          />

          <div
            class="text-xs flex items-center pt-1 gap-1 text-brand-500 font-medium cursor-pointer"
            @click="addRuleset"
          >
            <lfx-icon
              name="plus"
              :size="12"
            />
            Add ruleset
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-neutral-200" />

      <!-- Adhoc results -->
      <div class="flex flex-col gap-4">
        <div
          class="flex items-center justify-between cursor-pointer"
          @click="toggleSection('adhoc')"
        >
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold leading-5 text-neutral-900">Adhoc results</p>
            <p class="text-body-2 text-neutral-500">
              Findings from manual or one-off runs of the tool, typically executed outside of
              automated workflows.
            </p>
          </div>
          <lfx-icon
            :name="expandedSections.adhoc ? 'angle-up' : 'angle-down'"
            type="light"
            :size="20"
          />
        </div>

        <div
          v-if="expandedSections.adhoc"
          class="flex flex-col gap-4"
        >
          <lfx-field label="Name">
            <lfx-input v-model="model.results.adhoc.name" />
          </lfx-field>

          <div class="flex gap-4">
            <lfx-field
              label="Predicate URL"
              class="flex-1"
            >
              <lfx-input
                v-model="model.results.adhoc['predicate-uri']"
                :invalid="
                  $v.results.adhoc['predicate-uri'].$invalid &&
                  $v.results.adhoc['predicate-uri'].$dirty
                "
                @blur="$v.results.adhoc['predicate-uri'].$touch()"
                @input="$v.results.adhoc['predicate-uri'].$touch()"
              />
              <lfx-field-messages
                :validation="$v.results.adhoc['predicate-uri']"
                :error-messages="{ url: 'Invalid URL' }"
              />
            </lfx-field>

            <lfx-field
              label="Location URL"
              class="flex-1"
            >
              <lfx-input
                v-model="model.results.adhoc.location"
                :invalid="$v.results.adhoc.location.$invalid && $v.results.adhoc.location.$dirty"
                @blur="$v.results.adhoc.location.$touch()"
                @input="$v.results.adhoc.location.$touch()"
              />
              <lfx-field-messages
                :validation="$v.results.adhoc.location"
                :error-messages="{ url: 'Invalid URL' }"
              />
            </lfx-field>
          </div>

          <lfx-field label="Comment">
            <lfx-textarea
              v-model="model.results.adhoc.comment"
              rows="3"
            />
          </lfx-field>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-neutral-200" />

      <!-- CI results -->
      <div class="flex flex-col gap-4">
        <div
          class="flex items-center justify-between cursor-pointer"
          @click="toggleSection('ci')"
        >
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold leading-5 text-neutral-900">CI results</p>
            <p class="text-body-2 text-neutral-500">
              Security findings generated automatically during continuous integration builds or pull
              request checks.
            </p>
          </div>
          <lfx-icon
            :name="expandedSections.ci ? 'angle-up' : 'angle-down'"
            type="light"
            :size="20"
          />
        </div>

        <div
          v-if="expandedSections.ci"
          class="flex flex-col gap-4"
        >
          <lfx-field label="Name">
            <lfx-input v-model="model.results.ci.name" />
          </lfx-field>

          <div class="flex gap-4">
            <lfx-field
              label="Predicate URL"
              class="flex-1"
            >
              <lfx-input
                v-model="model.results.ci['predicate-uri']"
                :invalid="
                  $v.results.ci['predicate-uri'].$invalid && $v.results.ci['predicate-uri'].$dirty
                "
                @blur="$v.results.ci['predicate-uri'].$touch()"
                @input="$v.results.ci['predicate-uri'].$touch()"
              />
              <lfx-field-messages
                :validation="$v.results.ci['predicate-uri']"
                :error-messages="{ url: 'Invalid URL' }"
              />
            </lfx-field>

            <lfx-field
              label="Location URL"
              class="flex-1"
            >
              <lfx-input
                v-model="model.results.ci.location"
                :invalid="$v.results.ci.location.$invalid && $v.results.ci.location.$dirty"
                @blur="$v.results.ci.location.$touch()"
                @input="$v.results.ci.location.$touch()"
              />
              <lfx-field-messages
                :validation="$v.results.ci.location"
                :error-messages="{ url: 'Invalid URL' }"
              />
            </lfx-field>
          </div>

          <lfx-field label="Comment">
            <lfx-textarea
              v-model="model.results.ci.comment"
              rows="3"
            />
          </lfx-field>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-neutral-200" />

      <!-- Release results -->
      <div class="flex flex-col gap-4">
        <div
          class="flex items-center justify-between cursor-pointer"
          @click="toggleSection('release')"
        >
          <div class="flex flex-col gap-1">
            <p class="text-sm font-semibold leading-5 text-neutral-900">Release results</p>
            <p class="text-body-2 text-neutral-500">
              Results from checks performed as part of the release process, validating security
              before publishing a new version.
            </p>
          </div>
          <lfx-icon
            :name="expandedSections.release ? 'angle-up' : 'angle-down'"
            type="light"
            :size="20"
          />
        </div>

        <div
          v-if="expandedSections.release"
          class="flex flex-col gap-4"
        >
          <lfx-field label="Name">
            <lfx-input v-model="model.results.release.name" />
          </lfx-field>

          <div class="flex gap-4">
            <lfx-field
              label="Predicate URL"
              class="flex-1"
            >
              <lfx-input
                v-model="model.results.release['predicate-uri']"
                :invalid="
                  $v.results.release['predicate-uri'].$invalid &&
                  $v.results.release['predicate-uri'].$dirty
                "
                @blur="$v.results.release['predicate-uri'].$touch()"
                @input="$v.results.release['predicate-uri'].$touch()"
              />
              <lfx-field-messages
                :validation="$v.results.release['predicate-uri']"
                :error-messages="{ url: 'Invalid URL' }"
              />
            </lfx-field>

            <lfx-field
              label="Location URL"
              class="flex-1"
            >
              <lfx-input
                v-model="model.results.release.location"
                :invalid="
                  $v.results.release.location.$invalid && $v.results.release.location.$dirty
                "
                @blur="$v.results.release.location.$touch()"
                @input="$v.results.release.location.$touch()"
              />
              <lfx-field-messages
                :validation="$v.results.release.location"
                :error-messages="{ url: 'Invalid URL' }"
              />
            </lfx-field>
          </div>

          <lfx-field label="Comment">
            <lfx-textarea
              v-model="model.results.release.comment"
              rows="3"
            />
          </lfx-field>
        </div>
      </div>

      <!-- Divider -->
      <div class="border-t border-neutral-200" />

      <!-- Integration -->
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <p class="text-sm font-semibold leading-5 text-neutral-900">Integration</p>
          <p class="text-body-2 text-neutral-500">
            How the security tool is incorporated into the project's workflow.
          </p>
        </div>

        <div class="flex flex-col gap-4">
          <lfx-checkbox
            v-model="model.integration.adhoc"
            class="!items-start"
          >
            <span class="text-sm pl-1.5 -mt-0.5">Adhoc enabled</span>
          </lfx-checkbox>

          <lfx-checkbox
            v-model="model.integration.ci"
            class="!items-start"
          >
            <span class="text-sm pl-1.5 -mt-0.5">CI enabled</span>
          </lfx-checkbox>

          <lfx-checkbox
            v-model="model.integration.release"
            class="!items-start"
          >
            <span class="text-sm pl-1.5 -mt-0.5">Release enabled</span>
          </lfx-checkbox>

          <lfx-field label="Comment">
            <lfx-textarea
              v-model="model.comment"
              rows="3"
            />
          </lfx-field>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { url } from '@vuelidate/validators';
import LfxInput from '~/components/uikit/input/input.vue';
import LfxField from '~/components/uikit/field/field.vue';
import LfxFieldMessages from '~/components/uikit/field/field-messages.vue';
import LfxTextarea from '~/components/uikit/textarea/textarea.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';

const props = defineProps<{
  modelValue: object;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: object): void }>();

const model = computed<object>({
  get: () => props.modelValue,
  set: (value: object) => emit('update:modelValue', value),
});

const expandedSections = ref({
  adhoc: false,
  ci: false,
  release: false,
});

const toggleSection = (section: 'adhoc' | 'ci' | 'release') => {
  expandedSections.value[section] = !expandedSections.value[section];
};

const addRuleset = () => {
  if (!model.value.rulesets) {
    model.value.rulesets = [];
  }
  model.value.rulesets.push('');
};

const rules = {
  results: {
    adhoc: {
      'predicate-uri': { url },
      location: { url },
    },
    ci: {
      'predicate-uri': { url },
      location: { url },
    },
    release: {
      'predicate-uri': { url },
      location: { url },
    },
  },
};

const $v = useVuelidate(rules, model);
</script>

<script lang="ts">
export default {
  name: 'LfxYamlSecurityToolItem',
};
</script>
