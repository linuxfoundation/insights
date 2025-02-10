import {LfxRoutes} from "~/components/shared/types/routes";

interface MenuItem {
    label: string;
    icon?: string;
    route?: LfxRoutes;
    href?: string;
}

interface MenuConfig{
    links: MenuItem[];
    footer: MenuItem;
}

export const lfxMenu: MenuConfig = {
    links: [
        {
        label: 'Explore',
        icon: 'compass',
        route: LfxRoutes.EXPLORE
    }, {
        label: 'Collections',
        icon: 'rectangle-history',
        route: LfxRoutes.COLLECTIONS
    }, {
        label: 'Open Source Index',
        icon: 'globe',
        route: LfxRoutes.OPENSOURCEINDEX
    }
    ],
    footer: {
        label: 'Know more about LFX Platform',
        href: 'https://lfx.linuxfoundation.org'
    },
}
