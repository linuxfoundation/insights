// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import type {Component} from "vue";

interface YamlGenerationStep {
    label: string;
    component: Component
}
interface YamlGenerationConfig {
    label: string;
    steps: YamlGenerationStep[];
}

export const yamlGenerationConfig: Record<string, YamlGenerationConfig> = {
    minimum: {
        label: 'Starting out with a single repository project',
        steps: [],
    },
    full: {
        label: 'Comprehensive security documentation and planning',
        steps: [],
    },
    repositoryProject: {
        label: 'Multi-repository projects with centralized security policies',
        steps: [],
    },
    repositoryProjectReuse: {
        label: 'Individual repositories in a multi-repo project',
        steps: [],
    },
}
