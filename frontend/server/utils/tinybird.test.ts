import {
describe, expect, it, vi
} from 'vitest';
import { fetchTinybird } from './tinybird';

const mockRuntimeConfig = (baseUrl: string | null, token: string | null) => {
    vi.stubGlobal('useRuntimeConfig', vi.fn().mockReturnValue({
        tinybirdBaseUrl: baseUrl,
        tinybirdToken: token,
    }));
};

describe('fetchTinybird', () => {
    vi.stubGlobal('$fetch', vi.fn().mockResolvedValue({success: true}));

    it('throws if tinybirdBaseUrl is not defined', async () => {
        mockRuntimeConfig(null, 'mockToken');
        await expect(
            fetchTinybird('/mock-path', {key: 'value'})
        ).rejects.toThrowError('Tinybird base URL is not defined');
    });

    it('throws if tinybirdToken is not defined', async () => {
        mockRuntimeConfig('https://api.tinybird.co', null);
        await expect(
            fetchTinybird('/mock-path', {key: 'value'})
        ).rejects.toThrowError('Tinybird token is not defined');
    });

    it('makes a request with the correct URL and query', async () => {
        mockRuntimeConfig('https://api.tinybird.co', 'mockToken');

        const result = await fetchTinybird<{ key: string }>('/mock-path', {
            key: 'value',
        });

        expect($fetch).toHaveBeenCalledWith('https://api.tinybird.co/mock-path', {
            query: {token: 'mockToken', key: 'value'},
        });
        expect(result).toEqual({success: true});
    });
});
