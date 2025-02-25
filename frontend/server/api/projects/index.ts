import type {Project} from "~/components/modules/project/types/project";

const projects: Project[] = [
    {
        slug: 'kubernetes',
        name: 'Kubernetes',
        description: 'Driving innovation with open-source projects for scalable, resilient cloud-native systems',
        logo: 'https://c8.alamy.com/comp/2M8NCEE/kubernetes-logo-white-background-2M8NCEE.jpg',
        contributorsCount: 2612,
        organizationsCount: 800,
        softwareValueCount: 43000000000,
        repositories: [],
    },
    {
        slug: 'crowdDotDev',
        name: 'Crowd.dev',
        description: 'Crowd-sourced software development',
        contributorsCount: 100,
        organizationsCount: 20,
        softwareValueCount: 1000000,
        logo: 'https://avatars.githubusercontent.com/u/85551972?v=4',
        repositories: [],
    },
]

export default defineEventHandler(async (event) => {
    const sort: string = getQuery(event)?.sort as string || '';
    const page: string = getQuery(event)?.page as string || '';
    const pageSize: string = getQuery(event)?.pageSize as string || '';
    // const isLfx: boolean = getQuery(event)?.isLfx === true || false;
    const [field, order] = sort.split('_');
    return {
        page: +page,
        pageSize: +pageSize,
        total: 2,
        data: projects.sort((a, b) => {
            const fieldA = a[field as keyof Project];
            const fieldB = b[field as keyof Project];
            if (fieldA < fieldB) {
                return order === 'ASC' ? -1 : 1;
            }
            if (fieldA > fieldB) {
                return order === 'ASC' ? 1 : -1;
            }
            return 0;
        }).map((project) => ({
                ...project,
                name: `${project.name} (${page})`,
            }))
    };
});
