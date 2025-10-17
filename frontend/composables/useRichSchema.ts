// Copyright (c) 2025 The Linux Foundation and each contributor.
// SPDX-License-Identifier: MIT

import type { Project } from '../types/project';
import type { Collection } from '../types/collection';
import {
    defineWebSite,
    defineWebApplication,
    useSchemaOrg,
    useRuntimeConfig
} from '#imports';

export function useRichSchema() {
    const config = useRuntimeConfig();
    const baseUrl = config.public.appUrl;

    const addSitewideSchema = () => {
        useSchemaOrg([
            defineWebSite({
                name: 'LFX Insights',
                url: baseUrl,
            }),
            defineWebApplication({
                name: 'LFX Insights',
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'Web',
                url: baseUrl,
                offers: {
                    '@type': 'Offer',
                    price: 0,
                    priceCurrency: 'USD',
                },
            }),
        ]);
    };

    const addProjectSchema = (project: Project) => {
        const projectUrl = `${baseUrl}/project/${project.slug}`;

        // Build sameAs array with GitHub links
        const sameAs: string[] = [];

        // Add GitHub org link
        if (project.repositories && project.repositories.length > 0) {
            const firstRepo = project.repositories[0];
            if (firstRepo.url) {
                // Extract org from GitHub URL
                const urlMatch = firstRepo.url.match(/github\.com\/([^/]+)/);
                if (urlMatch) {
                    const org = urlMatch[1];
                    sameAs.push(`https://github.com/${org}`);
                    // Add main repo link if it exists
                    sameAs.push(`https://github.com/${org}/${org}`);
                }
            }
        }

        // Build about array with SoftwareSourceCode entries
        const about: Record<string, unknown>[] = [];

        if (project.repositories && project.repositories.length > 0) {
            const firstRepo = project.repositories[0];
            if (firstRepo.url) {
                const urlMatch = firstRepo.url.match(/github\.com\/([^/]+)/);
                if (urlMatch) {
                    const org = urlMatch[1];

                    // Main repository
                    const mainRepoEntry: Record<string, unknown> = {
                        '@type': 'SoftwareSourceCode',
                        name: org,
                        codeRepository: `https://github.com/${org}/${org}`,
                        url: `https://github.com/${org}/${org}`,
                    };

                    // Add programming language if available
                    if (project.languages && project.languages.length > 0) {
                        mainRepoEntry.programmingLanguage = project.languages[0].name;
                    }

                    about.push(mainRepoEntry);

                    // GitHub org
                    about.push({
                        '@type': 'SoftwareSourceCode',
                        name: `${project.name} GitHub org`,
                        codeRepository: `https://github.com/${org}`,
                        url: `https://github.com/${org}`,
                    });
                }
            }
        }

        const schemaGraph: Record<string, unknown>[] = [
            {
                '@type': 'CreativeWork',
                '@id': `${projectUrl}/#project`,
                name: project.name,
                url: projectUrl,
                description: `Project contributors, popularity, development, and security metrics ` +
                    `from LFX Insights for ${project.name}.`,
                publisher: { '@id': `${baseUrl}/#organization` },
                isPartOf: { '@id': `${baseUrl}/#website` },
            },
            {
                '@type': 'Dataset',
                '@id': `${baseUrl}/dataset/project-${project.slug}`,
                name: `LFX Insights metrics for ${project.name}`,
                url: projectUrl,
                creator: { '@id': `${baseUrl}/#organization` },
                isPartOf: { '@id': `${baseUrl}/dataset/open-source-index` },
                measurementTechnique: [
                    'Contributor activity over rolling windows',
                    'Repository event aggregation',
                    'Controls assessment based on documented standards',
                    'OpenSSF Criticality reference',
                ],
                variableMeasured: [
                    'active_contributors',
                    'active_organizations',
                    'contributor_dependency',
                    'organization_dependency',
                    'quarterly_contributor_retention',
                    'geographical_distribution',
                    'github_stars',
                    'github_forks',
                    'social_mentions',
                    'github_mentions',
                    'press_mentions',
                    'search_queries_volume',
                    'package_downloads',
                    'package_dependency',
                    'issues_opened',
                    'issues_closed',
                    'issue_resolution_time',
                    'pull_requests_opened',
                    'pull_requests_closed',
                    'pull_requests_merged',
                    'pull_requests_rejected',
                    'active_days',
                    'contributions_outside_work_hours_share',
                    'merge_lead_time',
                    'review_time_by_pr_size',
                    'average_time_to_merge',
                    'wait_time_for_first_review',
                    'code_review_engagement',
                    'controls_assessment_vulnerability_management',
                    'controls_assessment_access_control',
                    'controls_assessment_governance',
                    'controls_assessment_legal',
                    'controls_assessment_quality',
                    'controls_assessment_build_and_release',
                    'controls_assessment_documentation',
                ],
            },
        ];

        // Add sameAs and about to the CreativeWork if they exist
        if (sameAs.length > 0) {
            schemaGraph[0].sameAs = sameAs;
        }
        if (about.length > 0) {
            schemaGraph[0].about = about;
        }

        useSchemaOrg(schemaGraph);
    };

    const addCollectionSchema = (collection: Collection) => {
        const collectionUrl = `${baseUrl}/collection/${collection.slug}`;

        // Build description - use first 1-2 sentences
        let description = collection.description || `Critical projects in the Open Source Index`;
        if (description) {
            const sentences = description.match(/[^.!?]+[.!?]+/g) || [description];
            if (sentences.length > 0 && sentences[0].trim().length <= 160) {
                description = sentences[0].trim();
            } else if (sentences.length > 1) {
                const twoSentences = (sentences[0] + ' ' + sentences[1]).trim();
                if (twoSentences.length <= 160) {
                    description = twoSentences;
                } else {
                    description = description.substring(0, 157).trim() + '...';
                }
            }
        }

        // Build hasPart array with project references
        const hasPart: Record<string, unknown>[] = [];
        if (collection.featuredProjects && collection.featuredProjects.length > 0) {
            collection.featuredProjects.forEach((project) => {
                hasPart.push({ '@id': `${baseUrl}/project/${project.slug}/#project` });
            });
        }

        const schemaGraph: Record<string, unknown>[] = [
            {
                '@type': 'Collection',
                '@id': `${collectionUrl}/#collection`,
                name: collection.name,
                url: collectionUrl,
                description,
                publisher: { '@id': `${baseUrl}/#organization` },
                isPartOf: { '@id': `${baseUrl}/#website` },
            },
        ];

        // Add hasPart if it exists
        if (hasPart.length > 0) {
            schemaGraph[0].hasPart = hasPart;
        }

        useSchemaOrg(schemaGraph);
    };

    return {
        addSitewideSchema,
        addProjectSchema,
        addCollectionSchema,
    };
}
