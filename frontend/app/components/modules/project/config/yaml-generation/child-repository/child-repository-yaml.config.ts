// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from 'luxon';
import type {YamlGenerationConfig} from "~/components/modules/project/config/yaml-generation/yaml-generation.config";
import YamlHeaderInformation
    from "~/components/modules/project/config/yaml-generation/shared/yaml-header-information.vue";

const childRepositoryYamlGenerationConfig: YamlGenerationConfig = {
    label: 'Child repository',
    icon: 'book',
    description: 'Individual repositories in a multi-repository project.',
    features: [
        'Use in secondary repositories to inherit configuration from a centralized parent repository',
        'Must include header.project-si-source URL that points to the parent configuration file',
        'Reduces configuration duplication while ensuring consistency across multiple repositories'
    ],
    steps: [
        {
            label: 'Header information',
            component: YamlHeaderInformation,
        }
    ],
    template: {
        header: {
            'schema-version': '2.0.0',
            'last-updated': DateTime.now().toISODate(),
            'last-reviewed': DateTime.now().toISODate(),
            url: '',
            'project-si-source': ''
        },
        repository: {
            url: '',
            status: '',
            'accepts-change-request': true,
            'accepts-automated-change-request': true,
            'core-team': [],
            license: {
                url: '',
                expression: ''
            },
            security: {
                assessments: {
                    self: {
                        comment: ''
                    }
                }
            }
        }
    }
}

export default childRepositoryYamlGenerationConfig;
