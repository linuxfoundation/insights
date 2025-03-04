export const getRepoNameFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        console.log(pathParts);

        if (url.includes('gerrit')) {
            if (url.includes('/c/')) {
                // Match URLs like: https://gerrit.automotivelinux.org/gerrit/c/AGL/AGL-repo/+/10035
                return pathParts.slice(2, 4).join('/');
            }
            if (url.includes('/q/project:')) {
                const last = pathParts.at(-1) as string;
                if(last.includes('project:')) {
                    return last.split(':').at(-1) as string;
                }
                return pathParts.at(-1) as string;
            }
        } else if (url.includes('github.com')) {
            // Match URLs like: https://github.com/CrowdDotDev/crowd.dev
            return pathParts.slice(0, 2).join('/');
        }

        return url; // Return null if the format is unknown
    } catch (error) {
        console.error('Invalid URL:', error);
        return url;
    }
}
