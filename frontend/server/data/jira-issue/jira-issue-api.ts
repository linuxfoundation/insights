import {useRuntimeConfig} from "#imports";

export async function createJiraIssue(
    title: string,
    description: object,
    labels: string[] = [],
    issueType: string = 'Bug',
    priority: string = 'Medium',
) {
    const config = useRuntimeConfig();

    const {
        jiraIssueReporterApiUrl,
        jiraIssueReporterApiTokenEmail,
        jiraIssueReporterApiToken,
        jiraIssueReporterProjectKey
    } = config;

    if (!jiraIssueReporterApiUrl) {
        throw new Error('JIRA API URL is not defined');
    }

    if (!jiraIssueReporterApiTokenEmail) {
        throw new Error('JIRA API Token Email is not defined');
    }

    if (!jiraIssueReporterApiToken) {
        throw new Error('JIRA API Token is not defined');
    }

    if (!jiraIssueReporterProjectKey) {
        throw new Error('JIRA Project key is not defined');
    }

    const url = `${jiraIssueReporterApiUrl}/issue`;
    const authorization = `Basic ${Buffer.from(
        `${jiraIssueReporterApiTokenEmail}:${jiraIssueReporterApiToken}`,
    ).toString('base64')}`

    return await $fetch(url, {
        method: 'POST',
        headers: {
            Authorization: authorization,
        },
        body: {
            fields: {
                project: {
                    key: jiraIssueReporterProjectKey,
                },
                summary: title,
                description: {
                    version: 1,
                    type: 'doc',
                    content: description,
                },
                issuetype: {
                    name: issueType,
                },
                priority: {
                    name: priority
                },
                labels,
            },
        }
    });
}
