const repositories = [
    {
        name: 'kubernetes/kubernetes',
        projectSlug: 'kubernetes'
    },
    {
        name: 'kubernetes/helm',
        projectSlug: 'kubernetes'
    },
    {
        name: 'CrowdDotDev/crowd-kube',
        projectSlug: 'crowdDotDev'
    },
    {
        name: 'CrowdDotDev/crowd.dev',
        projectSlug: 'crowdDotDev'
    },
];

export default defineEventHandler(async (event) => {
    const {slug} = event.context.params as Record<string, string>;

    const repos = repositories.filter(
        (repository) => repository.projectSlug === slug
    );

    return {
        name: slug ? (slug?.at(0) || '').toUpperCase() + slug.slice(1) : '',
        slug,
        repositories: repos,
        logo: 'https://c8.alamy.com/comp/2M8NCEE/kubernetes-logo-white-background-2M8NCEE.jpg',
    }
});
