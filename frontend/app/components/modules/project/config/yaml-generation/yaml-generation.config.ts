// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {Component} from "vue";
import minimum from './minimum/minimum-yaml.config'
import full from './full/full-yaml.config'
import repositoryProject from './repository-project/repository-project-yaml.config'
import repositoryProjectReuse from './repository-project-reuse/repository-project-reuse-yaml.config'

export interface YamlGenerationStep {
    label: string; // Name of the step
    component: Component // Component to show in the step
}
export interface YamlGenerationConfig {
    label: string; // Name of the configuration displayed in the first selector
    steps: YamlGenerationStep[]; // list of steps
    template: object; // starting template with all the defaults
}

export const yamlGenerationConfig: Record<string, YamlGenerationConfig> = {
    minimum,
    full,
    repositoryProject,
    repositoryProjectReuse,
}
