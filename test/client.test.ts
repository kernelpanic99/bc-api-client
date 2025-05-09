import { BigCommerceClient } from '../src/client';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request, Methods } from '../src/net';

// Mock the request function
vi.mock('../src/net', () => ({
    request: vi.fn(),
    Methods: {
        GET: 'GET',
        POST: 'POST',
        PUT: 'PUT',
        DELETE: 'DELETE',
    },
    BASE_URL: 'https://api.bigcommerce.com/stores/',
}));

describe('BigCommerceClient', () => {
    const mockConfig = {
        storeHash: 'test-store',
        accessToken: 'test-token',
    };

    let client: BigCommerceClient;

    beforeEach(() => {
        client = new BigCommerceClient(mockConfig);
        vi.clearAllMocks();
    });

    describe('Basic HTTP Methods', () => {
        it('should make GET requests', async () => {
            const mockResponse = { data: { id: 1, name: 'Test' } };
            vi.mocked(request).mockResolvedValueOnce(mockResponse);

            const result = await client.get('/test', {
                query: { limit: '10' },
            });

            expect(request).toHaveBeenCalledWith({
                endpoint: '/test',
                method: 'GET',
                query: { limit: '10' },
                ...mockConfig,
            });
            expect(result).toEqual(mockResponse);
        });

        it('should make POST requests', async () => {
            const mockResponse = { id: 1 };
            const mockBody = { name: 'Test' };
            vi.mocked(request).mockResolvedValueOnce(mockResponse);

            const result = await client.post('/test', {
                body: mockBody,
            });

            expect(request).toHaveBeenCalledWith({
                endpoint: '/test',
                method: 'POST',
                body: mockBody,
                ...mockConfig,
            });
            expect(result).toEqual(mockResponse);
        });

        it('should make PUT requests', async () => {
            const mockResponse = { id: 1 };
            const mockBody = { name: 'Updated' };
            vi.mocked(request).mockResolvedValueOnce(mockResponse);

            const result = await client.put('/test', {
                body: mockBody,
            });

            expect(request).toHaveBeenCalledWith({
                endpoint: '/test',
                method: 'PUT',
                body: mockBody,
                ...mockConfig,
            });
            expect(result).toEqual(mockResponse);
        });

        it('should make DELETE requests', async () => {
            vi.mocked(request).mockResolvedValueOnce(undefined);

            await client.delete('/test');

            expect(request).toHaveBeenCalledWith({
                endpoint: '/test',
                method: 'DELETE',
                ...mockConfig,
            });
        });
    });

    describe('Collection Methods', () => {
        it('should collect data with pagination', async () => {
            const mockFirstPage = {
                data: [{ id: 1 }, { id: 2 }],
                meta: { pagination: { total_pages: 2 } },
            };
            const mockSecondPage = {
                data: [{ id: 3 }, { id: 4 }],
                meta: { pagination: { total_pages: 2 } },
            };

            vi.mocked(request)
                .mockResolvedValueOnce(mockFirstPage)
                .mockResolvedValueOnce(mockSecondPage);

            const result = await client.collect('/test', {
                query: { limit: '2' },
            });

            expect(result).toHaveLength(4);
            expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        });

        it('should collect v2 data', async () => {
            const mockResponses = [
                [{ id: 1 }, { id: 2 }],
                [{ id: 3 }, { id: 4 }],
                undefined, // Empty response to signal end
            ];

            vi.mocked(request)
                .mockResolvedValueOnce(mockResponses[0])
                .mockResolvedValueOnce(mockResponses[1])
                .mockResolvedValueOnce(mockResponses[2]);

            const result = await client.collectV2('/test', {
                query: { limit: '2' },
            });

            expect(result).toHaveLength(4);
            expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        });
    });

    describe('Query Method', () => {
        it('should handle query with multiple values', async () => {
            const mockResponse1 = {
                data: [{ id: 1 }, { id: 2 }],
                meta: { pagination: { total_pages: 1 } },
            };
            const mockResponse2 = {
                data: [{ id: 3 }, { id: 4 }],
                meta: { pagination: { total_pages: 1 } },
            };

            vi.mocked(request)
                .mockResolvedValueOnce(mockResponse1)
                .mockResolvedValueOnce(mockResponse2);

            const result = await client.query('/test', {
                key: 'id:in',
                values: [1, 2, 3, 4],
                query: { limit: '2' },
            });

            expect(result).toHaveLength(4);
            expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]);
        });
    });

    describe('Concurrent Requests', () => {
        it('should handle concurrent requests with success', async () => {
            const mockResponses = [
                { data: { id: 1 } },
                { data: { id: 2 } },
                { data: { id: 3 } },
            ];

            vi.mocked(request)
                .mockResolvedValueOnce(mockResponses[0])
                .mockResolvedValueOnce(mockResponses[1])
                .mockResolvedValueOnce(mockResponses[2]);

            const requests = [
                { endpoint: '/test1', method: Methods.GET },
                { endpoint: '/test2', method: Methods.GET },
                { endpoint: '/test3', method: Methods.GET },
            ];

            const result = await client.concurrent(requests, { concurrency: 2 });

            expect(result).toHaveLength(3);
            expect(result).toEqual(mockResponses);
        });

        it('should handle concurrent requests with errors', async () => {
            const mockResponses = [
                { data: { id: 1 } },
                new Error('Test error'),
                { data: { id: 3 } },
            ];

            vi.mocked(request)
                .mockResolvedValueOnce(mockResponses[0])
                .mockRejectedValueOnce(mockResponses[1])
                .mockResolvedValueOnce(mockResponses[2]);

            const requests = [
                { endpoint: '/test1', method: Methods.GET },
                { endpoint: '/test2', method: Methods.GET },
                { endpoint: '/test3', method: Methods.GET },
            ];

            await expect(client.concurrent(requests, { concurrency: 2 }))
                .rejects.toThrow('Test error');
        });

        it('should skip errors when skipErrors is true', async () => {
            const mockResponses = [
                { data: { id: 1 } },
                new Error('Test error'),
                { data: { id: 3 } },
            ];

            vi.mocked(request)
                .mockResolvedValueOnce(mockResponses[0])
                .mockRejectedValueOnce(mockResponses[1])
                .mockResolvedValueOnce(mockResponses[2]);

            const requests = [
                { endpoint: '/test1', method: Methods.GET },
                { endpoint: '/test2', method: Methods.GET },
                { endpoint: '/test3', method: Methods.GET },
            ];

            const result = await client.concurrent(requests, { 
                concurrency: 2,
                skipErrors: true 
            });

            expect(result).toHaveLength(2);
            expect(result).toContainEqual(mockResponses[0]);
            expect(result).toContainEqual(mockResponses[2]);
        });
    });
}); 