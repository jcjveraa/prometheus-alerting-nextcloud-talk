import request from 'supertest';
import { createApp } from './index';
import { AxiosInstance } from 'axios';

describe('Application Setup', () => {
    let mockNextcloudClient: jest.Mocked<AxiosInstance>;

    beforeEach(() => {
        mockNextcloudClient = {
            post: jest.fn().mockResolvedValue({ data: {} }),
        } as any;
    });

    it('should create an Express app with all middlewares and routes', async () => {
        const app = createApp(mockNextcloudClient);
        
        // Test prometheus metrics middleware is installed
        const metricsResponse = await request(app).get('/metrics');
        expect(metricsResponse.status).toBe(200);
        expect(metricsResponse.headers['content-type']).toMatch(/^text\/plain/);
        
        // Test error handling middleware
        const invalidResponse = await request(app)
            .post('/webhook')
            .send({ invalid: 'payload' });
        expect(invalidResponse.status).toBe(400);
        
        // Test all routes are mounted
        const healthResponse = await request(app).get('/health');
        expect(healthResponse.status).toBe(200);
        
        const rateLimitMetricsResponse = await request(app).get('/metrics/ratelimit');
        expect(rateLimitMetricsResponse.status).toBe(200);
    });

    it('should handle undefined custom client', () => {
        expect(() => createApp()).not.toThrow();
    });
});