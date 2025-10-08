// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import {DateTime} from 'luxon';
import YamlComprehensiveProject
    from "./yaml-comprehensive-project.vue";
import YamlComprehensiveProjectSteward
    from "./yaml-comprehensive-project-steward.vue";
import YamlComprehensiveProjectAdministrators
    from "./yaml-comprehensive-project-administrators.vue";
import YamlComprehensiveProjectDocumentation
    from "./yaml-comprehensive-project-documentation.vue";
import YamlComprehensiveProjectRepositories
    from "./yaml-comprehensive-project-repositories.vue";
import YamlComprehensiveProjectVulnerability
    from "./yaml-comprehensive-project-vulnerability.vue";
import YamlHeaderInformation
    from "~/components/modules/project/config/yaml-generation/shared/yaml-header-information.vue";
import type {YamlGenerationConfig} from "~/components/modules/project/config/yaml-generation/yaml-generation.config";

const comprehensiveYamlGenerationConfig: YamlGenerationConfig = {
    label: 'Comprehensive',
    icon: 'file-shield',
    description: 'Comprehensive security documentation and planning.',
    features: [
        'Use as a reference for all possible specification sections.',
        'Ideal for identifying areas for future improvement.',
        'Helps plan long-term security investments and prioritisation.'
    ],
    steps: [
        {
            label: 'Header information',
            component: YamlHeaderInformation,
        },
        {
            label: 'Project details',
            component: YamlComprehensiveProject,
        },
        {
            label: 'Project details | Steward',
            component: YamlComprehensiveProjectSteward,
        },
        {
            label: 'Project details | Administrators',
            component: YamlComprehensiveProjectAdministrators,
        },
        {
            label: 'Project details | Documentation',
            component: YamlComprehensiveProjectDocumentation,
        },
        {
            label: 'Project details | Repositories',
            component: YamlComprehensiveProjectRepositories,
        },
        {
            label: 'Project details | Vulnerability reporting',
            component: YamlComprehensiveProjectVulnerability,
        },
        // {
        //     label: 'Repository details',
        //     component: YamlComprehensiveRepository,
        // },
        // {
        //     label: 'Repository details | Core team members',
        //     component: YamlComprehensiveRepositoryTeamMembers,
        // },
        // {
        //     label: 'Repository details | License information',
        //     component: YamlComprehensiveRepositoryLicence,
        // },
        // {
        //     label: 'Repository details | Security self-assessment',
        //     component: YamlComprehensiveRepositorySecurity,
        // },
    ],
    template: {
        header: {
            'schema-version': '2.0.0',
            'last-updated': DateTime.now().toISODate(),
            'last-reviewed': DateTime.now().toISODate(),
            url: '',
            comment:
                'This file contains all possible information for both project and repository,\n' +
                'though it is not required to include all of this information every time.\n' +
                'Nor is it required to include both a project and repository section if the project\n' +
                'section is intended to be inherited by repositories via header.project-si-source'
        },
        project: {
            name: '',
            homepage: '',
            funding: '',
            roadmap: '',
            steward: {
                uri: '',
                comment: ''
            },
            administrators: [
                {
                    name: '',
                    affiliation: '',
                    email: '',
                    social: '',
                    primary: false
                }
            ],
            documentation: {
                'quickstart-guide': '',
                'detailed-guide': '',
                'code-of-conduct': '',
                'release-process': '',
                'support-policy': '',
                'signature-verification': ''
            },
            repositories: [
                {
                    name: '',
                    url: '',
                    comment: '',
                }
            ],
            'vulnerability-reporting': {
                'reports-accepted': false,
                'bug-bounty-available': false,
                'bug-bounty-program': '',
                contact: {
                    name: '',
                    email: '',
                    primary: false
                },
                'security-policy': '',
                'in-scope': [''],
                'out-of-scope': [''],
                'pgp-key': '',
                comment: ''
            }
        },
        repository: {
            url: '',
            status: '',
            'bug-fixes-only': false,
            'accepts-change-request': false,
            'accepts-automated-change-request': false,
            'no-third-party-packages': false,
            'core-team': [
                {
                    name: '',
                    affiliation: '',
                    email: '',
                    social: '',
                    primary: false,
                }
            ],
            documentation: {
                'contributing-guide': '',
                'review-policy': '',
                'security-policy': '',
                governance: '',
                'dependency-management-policy': ''
            },
            license: {
                url: '',
                expression: ''
            },
            release: {
                changelog: '',
                'automated-pipeline': true,
                attestations: [
                    {
                        name: '',
                        'predicate-uri': '',
                        location: '',
                        comment: ''
                    }
                ],
                'distribution-points': [
                    {
                        uri: '',
                        comment: ''
                    }
                ],
                license: {
                    url: '',
                    expression: ''
                }
            },
            security: {
                assessments: {
                    self: {
                        evidence: '',
                        date: '',
                        comment: ''
                    },
                    'third-party': [
                        {
                            evidence: '',
                            date: '',
                            comment: ''
                        }
                    ]
                },
                champions: [
                    {
                        name: '',
                        email: '',
                        primary: false,
                    }
                ],
                tools: [
                    {
                        name: '',
                        type: '',
                        version: '',
                        rulesets: [
                            ''
                        ],
                        results: {
                            adhoc: {
                                name: '',
                                'predicate-uri': '',
                                location: '',
                                comment: ''
                            },
                            ci: {
                                name: '',
                                'predicate-uri': '',
                                location: '',
                                comment: ''
                            },
                            release: {
                                name: '',
                                'predicate-uri': '',
                                location: '',
                                comment: ''
                            }
                        },
                        integration: {
                            adhoc: false,
                            ci: false,
                            release: false
                        },
                        comment: 'foo bar'
                    }
                ]
            }
        }
    }
}

export default comprehensiveYamlGenerationConfig;
