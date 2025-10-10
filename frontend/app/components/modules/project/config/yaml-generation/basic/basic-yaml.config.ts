// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT
import { DateTime } from 'luxon'
import YamlBasicProject from './yaml-basic-project.vue'
import YamlBasicProjectRepositories from './yaml-basic-project-repositories.vue'
import YamlBasicProjectVulnerability from './yaml-basic-project-vulnerability.vue'
import YamlBasicRepository from './yaml-basic-repository.vue'
import YamlBasicRepositoryMembers from './yaml-basic-repository-members.vue'
import YamlBasicRepositoryLicense from './yaml-basic-repository-license.vue'
import YamlBasicRepositorySecurity from './yaml-basic-repository-security.vue'
import type { YamlGenerationConfig } from
  '~/components/modules/project/config/yaml-generation/yaml-generation.config'
import YamlHeaderInformation from
  '~/components/modules/project/config/yaml-generation/shared/yaml-header-information.vue'

const basicYamlGenerationConfig: YamlGenerationConfig = {
  label: 'Basic',
  icon: 'file-circle-check',
  description: 'Essential project security specifications',
  features: [
    'Use as the master security insights file in your main repository.',
    'Use when you want to get up and running quickly.',
    'Best for projects just beginning to adopt the specification.',
    'Provides basic security insights coverage.',
  ],
  steps: [
    {
      label: 'Header information',
      component: YamlHeaderInformation,
    },
    {
      label: 'Project details',
      component: YamlBasicProject,
    },
    {
      label: 'Project details | Repositories',
      component: YamlBasicProjectRepositories,
    },
    {
      label: 'Project details | Vulnerability reporting',
      component: YamlBasicProjectVulnerability,
    },
    {
      label: 'Repository details',
      component: YamlBasicRepository,
    },
    {
      label: 'Repository details | Core team members',
      component: YamlBasicRepositoryMembers,
    },
    {
      label: 'Repository details | License information',
      component: YamlBasicRepositoryLicense,
    },
    {
      label: 'Repository details | Security self-assessment',
      component: YamlBasicRepositorySecurity,
    },
  ],
  template: {
    header: {
      'schema-version': '2.0.0',
      'last-updated': DateTime.now().toISODate(),
      'last-reviewed': DateTime.now().toISODate(),
      url: '',
      comment:
        'This file contains the minimum information for both project and repository. ' +
        'It not required to include both a project and repository section if the project ' +
        'section is intended to be inherited by repositories via header.project-si-source',
    },
    project: {
      name: '',
      administrators: [
        {
          name: '',
          affiliation: '',
          email: '',
          social: '',
          primary: false,
        },
      ],
      repositories: [
        {
          name: '',
          url: '',
          comment: '',
        },
      ],
      'vulnerability-reporting': {
        'reports-accepted': false,
        'bug-bounty-available': false,
      },
    },
    repository: {
      url: '',
      status: '',
      'accepts-change-request': false,
      'accepts-automated-change-request': false,
      'core-team': [
        {
          name: '',
          affiliation: '',
          email: '',
          social: '',
          primary: false,
        },
      ],
      license: {
        url: '',
        expression: '',
      },
      security: {
        assessments: {
          self: {
            comment: '',
          },
        },
      },
    },
  },
}

export default basicYamlGenerationConfig
