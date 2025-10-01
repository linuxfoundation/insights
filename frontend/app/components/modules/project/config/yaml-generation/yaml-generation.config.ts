// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {Component} from "vue";
import basic from './basic/basic-yaml.config'
import comprehensive from './comprehensive/comprehensive-yaml.config'
import multiRepository from './multi-repository/multi-repository-yaml.config'
import childRepository from './child-repository/child-repository-yaml.config'

export interface YamlGenerationStep {
    label: string; // Name of the step
    component: Component // Component to show in the step
}
export interface YamlGenerationConfig {
    label: string; // Name of the configuration displayed in the first selector
    icon: string; // Icon to display for the yaml file type
    recommended?: boolean;
    description?: string; // Description of the configuration
    features?: string[]; // List of features/benefits
    steps: YamlGenerationStep[]; // list of steps
    template: object; // starting template with all the defaults
}

export const yamlGenerationConfig: Record<string, YamlGenerationConfig> = {
    basic,
    comprehensive,
    multiRepository,
    childRepository,
}
