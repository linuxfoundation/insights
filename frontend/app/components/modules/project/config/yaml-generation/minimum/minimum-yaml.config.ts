// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from 'luxon';
import type {YamlGenerationConfig} from "~/components/modules/project/config/yaml-generation/yaml-generation.config";
import YamlHeaderInformation
    from "~/components/modules/project/config/yaml-generation/shared/yaml-header-information.vue";

const minimumYamlGenerationConfig: YamlGenerationConfig = {
    label: 'Starting out with a single repository project',
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
            comment:
                'This file contains the minimum information for both project and repository.\n' +
                'It not required to include both a project and repository section if the project\n' +
                'section is intended to be inherited by repositories via header.project-si-source'
        },
        project: {
            name: '',
            administrators: [],
            repositories: [],
            'vulnerability-reporting': {}
        },
        repository: {
            url: '',
            status: '',
            'accepts-change-request': true,
            'accepts-automated-change-request': true,
            'core-team': [],
            license: {},
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

export default minimumYamlGenerationConfig;
