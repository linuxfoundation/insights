export const getRepoNameFromUrl = (url: string): string => {
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/').filter(Boolean);

        if (url.includes('gerrit')) {
            if (url.includes('/c/')) {
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
            return pathParts.slice(0, 2).join('/');
        }

        return url;
    } catch {
        return url;
    }
}
