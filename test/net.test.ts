import { request, RequestError } from "../src/net";
import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import ky, { KyResponse } from 'ky';

// Mock ky
vi.mock('ky', () => ({
    default: vi.fn(),
}));

describe('Network requests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should make a successful request', async () => {
        const mockResponse = { data: 'test' };
        ((ky as unknown) as Mock).mockResolvedValue({
            json: () => Promise.resolve(mockResponse),
            status: 200
        } as KyResponse);

        const res = await request({ 
            endpoint: '/catalog/products', 
            storeHash: 'test', 
            accessToken: 'test' 
        });

        expect(res).toEqual(mockResponse);

        expect(ky).toHaveBeenCalledWith(
            expect.stringContaining('test/v3/catalog/products'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'X-Auth-Token': 'test'
                })
            })
        );
    });

    it('should handle rate limiting', async () => {
        const mockResponse = { data: 'test' };
        let callCount = 0;

        ((ky as unknown) as Mock).mockImplementation(() => {
            callCount++;
            if (callCount === 1) {
                throw {
                    response: {
                        status: 429,
                        text: () => Promise.resolve('{"error": "rate limit"}'),
                        headers: new Map([
                            ['X-Rate-Limit-Time-Reset-Ms', '100']
                        ])
                    }
                };
            }
            return {
                json: () => Promise.resolve(mockResponse),
                status: 200
            } as KyResponse;
        });

        const res = await request({ 
            endpoint: '/catalog/products', 
            storeHash: 'test', 
            accessToken: 'test',
            maxDelay: 1000
        });

        expect(res).toEqual(mockResponse);
        expect(callCount).toBe(2);
    });

    it('should throw RequestError on failed request', async () => {
        ((ky as unknown) as Mock).mockRejectedValue({
            response: {
                status: 400,
                text: () => Promise.resolve('{"error": "bad request"}'),
                headers: new Map()
            }
        });

        await expect(request({ 
            endpoint: '/catalog/products', 
            storeHash: 'test', 
            accessToken: 'test' 
        })).rejects.toThrow(RequestError);
    });

    it('should throw RequestError when URL is too long', async () => {
        // Create a query that will make the URL too long
        const longQuery = Array.from({ length: 100 }, (_, i) => [`param${i}`, 'x'.repeat(20)]).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        await expect(request({
            endpoint: '/catalog/products',
            storeHash: 'test',
            accessToken: 'test',
            query: longQuery
        })).rejects.toThrow(RequestError);

        // Verify the error message contains the length information
        try {
            await request({
                endpoint: '/catalog/products',
                storeHash: 'test',
                accessToken: 'test',
                query: longQuery
            });
        } catch (error) {
            expect(error).toBeInstanceOf(RequestError);
            expect((error as RequestError<unknown>).message).toContain('URL too long');
            expect((error as RequestError<unknown>).data).toContain('exceeds maximum allowed length');
        }
    });
});
