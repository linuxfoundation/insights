// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from 'luxon';
import type {YamlGenerationConfig} from "~/components/modules/project/config/yaml-generation/yaml-generation.config";
import YamlHeaderInformation
    from "~/components/modules/project/config/yaml-generation/shared/yaml-header-information.vue";

const repositoryProjectReuseYamlGenerationConfig: YamlGenerationConfig = {
    label: 'Individual repositories in a multi-repo project',
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

export default repositoryProjectReuseYamlGenerationConfig;
