/*
GET /api/search
{
  query: string
}
returns: {
projects: Project[],
repositories: Repository[],
collections: Collection[]
}
 */
const projects = [
    {
        slug: 'kubernetes',
        name: 'Kubernetes',
        logo: 'https://c8.alamy.com/comp/2M8NCEE/kubernetes-logo-white-background-2M8NCEE.jpg'
    },
    {slug: 'crowdDotDev', name: 'Crowd.dev', logo: ''},
]
const repositories = [
    {
        slug: 'kubernetes-kubernetes',
        name: 'kubernetes/kubernetes',
        projectName: 'Kubernetes',
        projectSlug: 'kubernetes'
    },
    {
        slug: 'crowddotdev-crowd-kube',
        name: 'CrowdDotDev/crowd-kube',
        projectName: 'Crowd.dev',
        projectSlug: 'crowdDotDev'
    },
]
const collections = [
    {slug: 'collection1', name: 'Collection 1'},
    {slug: 'collection2', name: 'Collection 2'},
]

export default defineEventHandler(async (event) => {
    const query: string = getQuery(event)?.query as string || '';
    return {
        projects: projects.filter((project) => project.name.toLowerCase().includes(query.toLowerCase())),
        repositories: repositories.filter((repository) => repository.name.toLowerCase().includes(query.toLowerCase())),
        collections: collections.filter((collection) => collection.name.toLowerCase().includes(query.toLowerCase())),
    };
});
