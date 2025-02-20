import type {Collection} from "~/components/modules/collection/types/Collection";

const collections: Collection[] = [
    {
        slug: 'cncf',
        name: 'Cloud Native Computing Foundation',
        description: 'Driving innovation with open-source projects for scalable, resilient cloud-native systems',
        contributorsCount: 2612,
        organizationsCount: 800,
        projectsCount: 20,
        softwareValueCount: 43000000000,
        featuredProjects: [
            {
                name: 'Kubernetes',
                slug: 'kubernetes',
                logo: 'https://c8.alamy.com/comp/2M8NCEE/kubernetes-logo-white-background-2M8NCEE.jpg'
            },
            {
                name: 'Prometheus',
                slug: 'prometheus',
                logo: 'https://c8.alamy.com/comp/2M8NCEE/kubernetes-logo-white-background-2M8NCEE.jpg'
            },
            {
                name: 'Envoy',
                slug: 'envoy',
                logo: ''
            }
        ]
    },
    {
        slug: 'crowdDotDev',
        name: 'Crowd.dev',
        description: 'Crowd-sourced software development',
        contributorsCount: 100,
        organizationsCount: 20,
        projectsCount: 5,
        softwareValueCount: 1000000,
        featuredProjects: [
            {
                name: 'CrowdKube',
                slug: 'crowdKube',
                logo: ''
            },
            {
                name: 'CrowdSQL',
                slug: 'crowdSQL',
                logo: ''
            },
            {
                name: 'CrowdML',
                slug: 'crowdML',
                logo: ''
            }
        ]
    },
]

export default defineEventHandler(async (event) => {
    const sort: string = getQuery(event)?.sort as string || '';
    const [field, order] = sort.split('_');
    return {
        page: 1,
        pageSize: 10,
        total: 2,
        data: collections.sort((a, b) => {
            const fieldA = a[field as keyof Collection];
            const fieldB = b[field as keyof Collection];
            if (fieldA < fieldB) {
                return order === 'ASC' ? -1 : 1;
            }
            if (fieldA > fieldB) {
                return order === 'ASC' ? 1 : -1;
            }
            return 0;
        })
    };
});
