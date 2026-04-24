<!--
Copyright (c) 2025 The Linux Foundation and each contributor.
SPDX-License-Identifier: MIT
-->
<template>
  <div class="w-full">
    <div v-if="isLoading">
      <div class="flex flex-col gap-2">
        <lfx-skeleton
          v-for="i in 10"
          :key="i"
          height="48px"
          width="100%"
        />
      </div>
    </div>

    <div
      v-else-if="leaderboardData.length === 0"
      class="flex items-center justify-center h-[200px]"
    >
      <div class="text-neutral-500">No project data available.</div>
    </div>

    <div
      v-else
      class="overflow-x-auto"
    >
      <div class="flex items-center justify-end mb-3 gap-3">
        <div
          class="flex items-center gap-2"
          :class="!(sortColumn in DELTA_FIELD) ? 'opacity-40 pointer-events-none' : ''"
        >
          <span class="text-xs text-neutral-500 whitespace-nowrap">Sort by</span>
          <lfx-tabs
            v-model="sortMode"
            :tabs="sortModeOptions"
            width-type="inline"
          />
        </div>

        <!-- Column picker -->
        <lfx-popover
          v-model:visibility="showColumnPicker"
          placement="bottom-end"
          :spacing="6"
        >
          <button
            type="button"
            class="flex items-center gap-1 text-xs font-medium text-neutral-600 border border-neutral-200 rounded px-2 py-1 hover:bg-neutral-50"
          >
            Columns
            <lfx-icon
              :name="showColumnPicker ? 'chevron-up' : 'chevron-down'"
              :size="12"
            />
          </button>
          <template #content>
            <div
              class="bg-white border border-neutral-200 rounded shadow-lg p-4 w-[340px] max-h-[80vh] overflow-y-auto"
            >
              <template
                v-for="group in COLUMN_GROUPS"
                :key="group"
              >
                <div class="mb-4 last:mb-0">
                  <p class="text-xs uppercase tracking-wide text-neutral-400 font-semibold mb-2">
                    {{ group }}
                  </p>
                  <div class="grid grid-cols-2 gap-x-4 gap-y-2">
                    <label
                      v-for="col in columnsByGroup(group)"
                      :key="col.key"
                      class="flex items-center gap-2 cursor-pointer text-body-2 text-neutral-700 hover:text-neutral-900 select-none"
                    >
                      <lfx-checkbox
                        :model-value="activeColumns.includes(col.key)"
                        @update:model-value="toggleColumn(col.key)"
                      />
                      {{ col.label }}
                    </label>
                  </div>
                </div>
              </template>
              <div class="border-t border-neutral-100 pt-2 mt-1 flex justify-end">
                <button
                  type="button"
                  class="text-xs text-primary-500 hover:text-primary-700"
                  @click="resetColumns"
                >
                  Reset to defaults
                </button>
              </div>
            </div>
          </template>
        </lfx-popover>
      </div>

      <table class="w-full text-body-2">
        <thead>
          <tr class="border-b border-neutral-200">
            <th
              class="text-left py-3 px-2 font-semibold text-neutral-700 w-12 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('rank')"
            >
              <div class="flex items-center gap-1">
                #
                <lfx-icon
                  v-if="sortColumn === 'rank'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              class="text-left py-3 px-2 font-semibold text-neutral-700 min-w-[180px] cursor-pointer hover:bg-neutral-50"
              @click="sortBy('name')"
            >
              <div class="flex items-center gap-1">
                Project
                <lfx-icon
                  v-if="sortColumn === 'name'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th class="text-left py-3 px-2 font-semibold text-neutral-700 min-w-[140px]">Layer</th>
            <th
              v-if="activeColumns.includes('stars')"
              key="col-stars"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('stars')"
            >
              <div class="flex items-center justify-end gap-1">
                Stars
                <lfx-icon
                  v-if="sortColumn === 'stars'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('forks')"
              key="col-forks"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('forks')"
            >
              <div class="flex items-center justify-end gap-1">
                Forks
                <lfx-icon
                  v-if="sortColumn === 'forks'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('downloads')"
              key="col-downloads"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('downloads')"
            >
              <div class="flex items-center justify-end gap-1">
                Downloads
                <lfx-icon
                  v-if="sortColumn === 'downloads'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('dockerHubPulls')"
              key="col-dockerHubPulls"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('dockerHubPulls')"
            >
              <div class="flex items-center justify-end gap-1">
                Docker Pulls
                <lfx-icon
                  v-if="sortColumn === 'dockerHubPulls'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('dependentRepositories')"
              key="col-dependentRepositories"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('dependentRepositories')"
            >
              <div class="flex items-center justify-end gap-1">
                Dependent Repos
                <lfx-icon
                  v-if="sortColumn === 'dependentRepositories'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('dependentPackages')"
              key="col-dependentPackages"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('dependentPackages')"
            >
              <div class="flex items-center justify-end gap-1">
                Dependent Pkgs
                <lfx-icon
                  v-if="sortColumn === 'dependentPackages'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('commits')"
              key="col-commits"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('commits')"
            >
              <div class="flex items-center justify-end gap-1">
                Commits
                <lfx-icon
                  v-if="sortColumn === 'commits'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('contributors')"
              key="col-contributors"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('contributors')"
            >
              <div class="flex items-center justify-end gap-1">
                Contributors
                <lfx-icon
                  v-if="sortColumn === 'contributors'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('newContributors')"
              key="col-newContributors"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('newContributors')"
            >
              <div class="flex items-center justify-end gap-1">
                New Contributors
                <lfx-icon
                  v-if="sortColumn === 'newContributors'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('githubReleases')"
              key="col-githubReleases"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('githubReleases')"
            >
              <div class="flex items-center justify-end gap-1">
                Releases
                <lfx-icon
                  v-if="sortColumn === 'githubReleases'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('mergeRate')"
              key="col-mergeRate"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('mergeRate')"
            >
              <div class="flex items-center justify-end gap-1">
                Merge Rate
                <lfx-icon
                  v-if="sortColumn === 'mergeRate'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('prTimeToResolve')"
              key="col-prTimeToResolve"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('prTimeToResolve')"
            >
              <div class="flex items-center justify-end gap-1">
                PR Resolve Time
                <lfx-icon
                  v-if="sortColumn === 'prTimeToResolve'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('timeToClose')"
              key="col-timeToClose"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('timeToClose')"
            >
              <div class="flex items-center justify-end gap-1">
                Time to Close
                <lfx-icon
                  v-if="sortColumn === 'timeToClose'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('issueResponseTime')"
              key="col-issueResponseTime"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('issueResponseTime')"
            >
              <div class="flex items-center justify-end gap-1">
                Issue Response
                <lfx-icon
                  v-if="sortColumn === 'issueResponseTime'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('noResponseIssues')"
              key="col-noResponseIssues"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('noResponseIssues')"
            >
              <div class="flex items-center justify-end gap-1">
                No Response
                <lfx-icon
                  v-if="sortColumn === 'noResponseIssues'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('totalVulnerabilities')"
              key="col-totalVulnerabilities"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('totalVulnerabilities')"
            >
              <div class="flex items-center justify-end gap-1">
                Vulnerabilities
                <lfx-icon
                  v-if="sortColumn === 'totalVulnerabilities'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
            <th
              v-if="activeColumns.includes('cocomoValue')"
              key="col-cocomoValue"
              class="text-right py-3 px-2 font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50"
              @click="sortBy('cocomoValue')"
            >
              <div class="flex items-center justify-end gap-1">
                COCOMO Value
                <lfx-icon
                  v-if="sortColumn === 'cocomoValue'"
                  :name="sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'"
                  :size="14"
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in sortedData"
            :key="row.slug"
            class="border-b border-neutral-100 hover:bg-neutral-50"
          >
            <td class="py-3 px-2 text-neutral-500">
              {{ i + 1 }}
            </td>
            <td class="py-3 px-2">
              <div class="flex items-center gap-2">
                <span class="font-medium text-neutral-900">{{ row.name }}</span>
                <a
                  v-if="row.githubUrl"
                  :href="row.githubUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-neutral-400 hover:text-neutral-600"
                  :aria-label="`View ${row.name} on GitHub`"
                  @click.stop
                >
                  <lfx-icon
                    name="github"
                    type="brands"
                    :size="16"
                  />
                </a>
              </div>
            </td>
            <td class="py-3 px-2">
              <span
                v-if="row.layer"
                class="inline-flex px-2 py-1 rounded text-xs font-medium border"
                :style="getLayerBadgeStyle(row.layer)"
              >
                {{ row.layer }}
              </span>
            </td>
            <!-- Growth columns -->
            <td
              v-if="activeColumns.includes('stars')"
              key="col-stars"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.stars) ? formatNumberShort(row.stars) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.starsDelta !== null && row.starsDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.starsDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('forks')"
              key="col-forks"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.forks) ? formatNumberShort(row.forks) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.forksDelta !== null && row.forksDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.forksDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('downloads')"
              key="col-downloads"
              class="py-3 px-2 text-right"
            >
              {{ hasData(row.downloads) ? formatNumberShort(row.downloads) : '-' }}
            </td>
            <td
              v-if="activeColumns.includes('dockerHubPulls')"
              key="col-dockerHubPulls"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.dockerHubPulls) ? formatNumberShort(row.dockerHubPulls) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.dockerHubPullsDelta !== null && row.dockerHubPullsDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.dockerHubPullsDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('dependentRepositories')"
              key="col-dependentRepositories"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{
                  hasData(row.dependentRepositories) ? formatNumberShort(row.dependentRepositories) : '-'
                }}</span>
                <lfx-tooltip
                  v-if="row.dependentRepositoriesDelta !== null && row.dependentRepositoriesDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.dependentRepositoriesDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('dependentPackages')"
              key="col-dependentPackages"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.dependentPackages) ? formatNumberShort(row.dependentPackages) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.dependentPackagesDelta !== null && row.dependentPackagesDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.dependentPackagesDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <!-- Community columns -->
            <td
              v-if="activeColumns.includes('commits')"
              key="col-commits"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.commits) ? formatNumberShort(row.commits) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.commitsDelta !== null && row.commitsDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.commitsDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('contributors')"
              key="col-contributors"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.contributors) ? formatNumberShort(row.contributors) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.contributorsDelta !== null && row.contributorsDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.contributorsDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('newContributors')"
              key="col-newContributors"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.newContributors) ? formatNumberShort(row.newContributors) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.newContributorsDelta !== null && row.newContributorsDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.newContributorsDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('githubReleases')"
              key="col-githubReleases"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.githubReleases) ? formatNumberShort(row.githubReleases) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.githubReleasesDelta !== null && row.githubReleasesDelta !== 0"
                  content="last 30 days"
                >
                  <delta-indicator :value="row.githubReleasesDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <!-- Health columns -->
            <td
              v-if="activeColumns.includes('mergeRate')"
              key="col-mergeRate"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.mergeRate) ? formatPercent(row.mergeRate) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.mergeRateDelta !== null"
                  content="last 30 days"
                >
                  <span class="text-neutral-400 text-xs">{{ formatPercent(row.mergeRateDelta) }}</span>
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('prTimeToResolve')"
              key="col-prTimeToResolve"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.prTimeToResolve) ? formatDays(row.prTimeToResolve) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.prTimeToResolveDelta !== null"
                  content="last 30 days"
                >
                  <span class="text-neutral-400 text-xs">{{ formatDays(row.prTimeToResolveDelta) }}</span>
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('timeToClose')"
              key="col-timeToClose"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.timeToClose) ? formatDays(row.timeToClose) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.timeToCloseDelta !== null"
                  content="last 30 days"
                >
                  <span class="text-neutral-400 text-xs">{{ formatDays(row.timeToCloseDelta) }}</span>
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('issueResponseTime')"
              key="col-issueResponseTime"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.issueResponseTime) ? formatDays(row.issueResponseTime) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.issueResponseTimeDelta !== null"
                  content="last 30 days"
                >
                  <span class="text-neutral-400 text-xs">{{ formatDays(row.issueResponseTimeDelta) }}</span>
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('noResponseIssues')"
              key="col-noResponseIssues"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.noResponseIssues) ? formatNumberShort(row.noResponseIssues) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.noResponseIssuesDelta !== null"
                  content="last 30 days"
                >
                  <span class="text-neutral-400 text-xs">{{ formatNumberShort(row.noResponseIssuesDelta) }}</span>
                </lfx-tooltip>
              </div>
            </td>
            <td
              v-if="activeColumns.includes('totalVulnerabilities')"
              key="col-totalVulnerabilities"
              class="py-3 px-2 text-right"
            >
              <div class="flex items-center justify-end gap-1">
                <span>{{ hasData(row.totalVulnerabilities) ? formatNumberShort(row.totalVulnerabilities) : '-' }}</span>
                <lfx-tooltip
                  v-if="row.totalVulnerabilitiesDelta !== null && row.totalVulnerabilitiesDelta !== 0"
                  content="last 30 days"
                >
                  <vuln-delta-indicator :value="row.totalVulnerabilitiesDelta" />
                </lfx-tooltip>
              </div>
            </td>
            <!-- Value columns -->
            <td
              v-if="activeColumns.includes('cocomoValue')"
              key="col-cocomoValue"
              class="py-3 px-2 text-right"
            >
              {{ hasData(row.cocomoValue) ? formatNumberCurrency(row.cocomoValue, 'USD') : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, h, type FunctionalComponent } from 'vue';
import { getLayerBadgeStyle } from '../config/layer-colors';
import LfxSkeleton from '~/components/uikit/skeleton/skeleton.vue';
import LfxIcon from '~/components/uikit/icon/icon.vue';
import LfxTabs from '~/components/uikit/tabs/tabs.vue';
import LfxTooltip from '~/components/uikit/tooltip/tooltip.vue';
import LfxPopover from '~/components/uikit/popover/popover.vue';
import LfxCheckbox from '~/components/uikit/checkbox/checkbox.vue';
import { formatNumberCurrency, formatNumberShort } from '~/components/shared/utils/formatter';
import type { AgenticEnrichedProject, ProjectLeaderboardRow } from '~~/types/report/agentic-ai-momentum.types';

const props = defineProps<{
  tbProjects: AgenticEnrichedProject[];
  isLoading: boolean;
}>();

// Column configuration with groups
const COLUMN_GROUPS = ['Growth', 'Community', 'Health', 'Value'] as const;
type ColumnGroup = (typeof COLUMN_GROUPS)[number];

const COLUMN_CONFIG = [
  { key: 'stars', label: 'Stars', defaultOn: true, group: 'Growth' as ColumnGroup },
  { key: 'forks', label: 'Forks', defaultOn: false, group: 'Growth' as ColumnGroup },
  { key: 'downloads', label: 'Downloads', defaultOn: true, group: 'Growth' as ColumnGroup },
  { key: 'dockerHubPulls', label: 'Docker Pulls', defaultOn: false, group: 'Growth' as ColumnGroup },
  { key: 'dependentRepositories', label: 'Dependent Repos', defaultOn: false, group: 'Growth' as ColumnGroup },
  { key: 'dependentPackages', label: 'Dependent Pkgs', defaultOn: false, group: 'Growth' as ColumnGroup },
  { key: 'commits', label: 'Commits', defaultOn: true, group: 'Community' as ColumnGroup },
  { key: 'contributors', label: 'Contributors', defaultOn: true, group: 'Community' as ColumnGroup },
  { key: 'newContributors', label: 'New Contributors', defaultOn: false, group: 'Community' as ColumnGroup },
  { key: 'githubReleases', label: 'Releases', defaultOn: false, group: 'Community' as ColumnGroup },
  { key: 'mergeRate', label: 'Merge Rate', defaultOn: false, group: 'Health' as ColumnGroup },
  { key: 'prTimeToResolve', label: 'PR Resolve Time', defaultOn: false, group: 'Health' as ColumnGroup },
  { key: 'timeToClose', label: 'Time to Close', defaultOn: true, group: 'Health' as ColumnGroup },
  { key: 'issueResponseTime', label: 'Issue Response', defaultOn: false, group: 'Health' as ColumnGroup },
  { key: 'noResponseIssues', label: 'No-Response Issues', defaultOn: false, group: 'Health' as ColumnGroup },
  { key: 'totalVulnerabilities', label: 'Vulnerabilities', defaultOn: false, group: 'Health' as ColumnGroup },
  { key: 'cocomoValue', label: 'COCOMO Value', defaultOn: true, group: 'Value' as ColumnGroup },
] as const;

type ColumnKey = (typeof COLUMN_CONFIG)[number]['key'];

const activeColumns = ref<ColumnKey[]>(COLUMN_CONFIG.filter((c) => c.defaultOn).map((c) => c.key));
const showColumnPicker = ref(false);

function columnsByGroup(group: ColumnGroup) {
  return COLUMN_CONFIG.filter((c) => c.group === group);
}

// Sort mode toggle
const sortMode = ref<'level' | 'delta'>('level');

function toggleColumn(key: ColumnKey) {
  const idx = activeColumns.value.indexOf(key);
  if (idx === -1) {
    activeColumns.value.push(key);
  } else {
    activeColumns.value.splice(idx, 1);
  }
}

function resetColumns() {
  activeColumns.value = COLUMN_CONFIG.filter((c) => c.defaultOn).map((c) => c.key);
}

// Delta indicator: standard (green=positive, red=negative)
const DeltaIndicator: FunctionalComponent<{ value: number; format?: string; invert?: boolean }> = (componentProps) => {
  const { value, format = 'number', invert = false } = componentProps;
  const isPositive = invert ? value < 0 : value > 0;
  const colorClass = isPositive ? 'text-positive-500' : 'text-negative-500';
  let display: string;
  if (format === 'percent') {
    display = `${value > 0 ? '+' : ''}${(value * 100).toFixed(0)}%`;
  } else if (format === 'days') {
    display = `${value > 0 ? '+' : ''}${value.toFixed(0)}d`;
  } else {
    display = value > 0 ? `+${formatNumberShort(value)}` : formatNumberShort(value);
  }
  return h('span', { class: `${colorClass} text-xs` }, display);
};
DeltaIndicator.props = ['value', 'format', 'invert'];

// Vulnerability delta: increases are always red (bad), no green state
const VulnDeltaIndicator: FunctionalComponent<{ value: number }> = (componentProps) => {
  const { value } = componentProps;
  if (value > 0) {
    return h('span', { class: 'text-violet-500 text-xs' }, `+${formatNumberShort(value)}`);
  }
  return null;
};
VulnDeltaIndicator.props = ['value'];

type SortColumn =
  | 'rank'
  | 'name'
  | 'stars'
  | 'forks'
  | 'commits'
  | 'contributors'
  | 'newContributors'
  | 'githubReleases'
  | 'mergeRate'
  | 'timeToClose'
  | 'issueResponseTime'
  | 'noResponseIssues'
  | 'downloads'
  | 'dockerHubPulls'
  | 'dependentRepositories'
  | 'dependentPackages'
  | 'cocomoValue'
  | 'prTimeToResolve'
  | 'totalVulnerabilities';

const sortColumn = ref<SortColumn>('contributors');
const sortDirection = ref<'asc' | 'desc'>('desc');

function sortBy(column: SortColumn) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortColumn.value = column;
    sortDirection.value = column === 'rank' || column === 'name' ? 'asc' : 'desc';
  }
}

// Build leaderboard rows directly from flat TB data
const leaderboardData = computed<ProjectLeaderboardRow[]>(() => {
  return props.tbProjects.map((p) => ({
    rank: p.rank,
    slug: p.slug,
    name: p.name,
    layer: p.layer,
    license: p.license,
    githubUrl: p.githubRepoLink,
    stars: p.stars,
    starsDelta: p.stars30d,
    forks: p.forks,
    forksDelta: p.forks30d,
    commits: p.commits,
    commitsDelta: p.commits30d,
    contributors: p.contributors,
    contributorsDelta: p.contributors30d,
    newContributors: p.newContributors30d,
    newContributorsDelta: null,
    githubReleases: p.githubReleases,
    githubReleasesDelta: p.githubReleases30d,
    dockerHubPulls: p.dockerPulls,
    dockerHubPullsDelta: p.dockerPulls30d,
    dependentRepositories: p.dependentRepos,
    dependentRepositoriesDelta: null,
    dependentPackages: p.dependentPackages,
    dependentPackagesDelta: null,
    mergeRate: p.mergeRate,
    mergeRateDelta: p.mergeRate30d,
    timeToClose: p.issueCloseTimeDays,
    timeToCloseDelta: p.issueCloseTimeDays30d,
    issueResponseTime: p.issueResponseTimeDays,
    issueResponseTimeDelta: p.issueResponseTimeDays30d,
    noResponseIssues: p.noResponseIssues,
    noResponseIssuesDelta: p.noResponseIssues30d,
    downloads: p.downloads,
    downloadsDelta: p.downloads30d,
    cocomoValue: p.cocomoValue,
    prTimeToResolve: p.prResolveTimeDays,
    prTimeToResolveDelta: p.prResolveTimeDays30d,
    totalVulnerabilities: p.vulnerabilities,
    totalVulnerabilitiesDelta: p.vulnerabilities30d,
  }));
});

// Map column keys to their delta fields (null = no delta available)
const DELTA_FIELD: Partial<Record<SortColumn, keyof ProjectLeaderboardRow>> = {
  stars: 'starsDelta',
  forks: 'forksDelta',
  commits: 'commitsDelta',
  contributors: 'contributorsDelta',
  githubReleases: 'githubReleasesDelta',
  dockerHubPulls: 'dockerHubPullsDelta',
  mergeRate: 'mergeRateDelta',
  timeToClose: 'timeToCloseDelta',
  issueResponseTime: 'issueResponseTimeDelta',
  noResponseIssues: 'noResponseIssuesDelta',
  prTimeToResolve: 'prTimeToResolveDelta',
  totalVulnerabilities: 'totalVulnerabilitiesDelta',
};

const sortModeOptions = [
  { value: 'level', label: 'Level' },
  { value: 'delta', label: 'Change' },
];

// Reset to Level when switching to a column with no delta
watch(sortColumn, (col) => {
  if (!(col in DELTA_FIELD)) {
    sortMode.value = 'level';
  }
});

// Null-last numeric comparator: nulls always sort after non-null values, regardless of direction
function cmpNullLast(av: number | null, bv: number | null, dir: 'asc' | 'desc'): number {
  if (av === null && bv === null) return 0;
  if (av === null) return 1;
  if (bv === null) return -1;
  return dir === 'asc' ? av - bv : bv - av;
}

// Sorted data
const sortedData = computed(() => {
  const data = [...leaderboardData.value];
  const col = sortColumn.value;
  const dir = sortDirection.value;
  const useDelta = sortMode.value === 'delta' && col in DELTA_FIELD;

  return data.sort((a, b) => {
    if (useDelta) {
      const deltaKey = DELTA_FIELD[col]!;
      return cmpNullLast(a[deltaKey] as number | null, b[deltaKey] as number | null, dir);
    }

    switch (col) {
      case 'rank':
        return dir === 'asc' ? a.rank - b.rank : b.rank - a.rank;
      case 'name':
        return dir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      case 'stars':
        return cmpNullLast(a.stars, b.stars, dir);
      case 'forks':
        return cmpNullLast(a.forks, b.forks, dir);
      case 'commits':
        return cmpNullLast(a.commits, b.commits, dir);
      case 'contributors':
        return cmpNullLast(a.contributors, b.contributors, dir);
      case 'newContributors':
        return cmpNullLast(a.newContributors, b.newContributors, dir);
      case 'githubReleases':
        return cmpNullLast(a.githubReleases, b.githubReleases, dir);
      case 'mergeRate':
        return cmpNullLast(a.mergeRate, b.mergeRate, dir);
      case 'timeToClose':
        return cmpNullLast(a.timeToClose, b.timeToClose, dir);
      case 'issueResponseTime':
        return cmpNullLast(a.issueResponseTime, b.issueResponseTime, dir);
      case 'noResponseIssues':
        return cmpNullLast(a.noResponseIssues, b.noResponseIssues, dir);
      case 'downloads':
        return cmpNullLast(a.downloads, b.downloads, dir);
      case 'dockerHubPulls':
        return cmpNullLast(a.dockerHubPulls, b.dockerHubPulls, dir);
      case 'dependentRepositories':
        return cmpNullLast(a.dependentRepositories, b.dependentRepositories, dir);
      case 'dependentPackages':
        return cmpNullLast(a.dependentPackages, b.dependentPackages, dir);
      case 'cocomoValue':
        return cmpNullLast(a.cocomoValue, b.cocomoValue, dir);
      case 'prTimeToResolve':
        return cmpNullLast(a.prTimeToResolve, b.prTimeToResolve, dir);
      case 'totalVulnerabilities':
        return cmpNullLast(a.totalVulnerabilities, b.totalVulnerabilities, dir);
      default:
        return 0;
    }
  });
});

// Returns true when a metric has data (not null/undefined)
function hasData(value: number | null | undefined): value is number {
  return value != null;
}

// Format helpers
function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

function formatDays(value: number): string {
  return `${value.toFixed(0)}d`;
}
</script>

<script lang="ts">
export default {
  name: 'LfxAgenticProjectLeaderboard',
};
</script>
