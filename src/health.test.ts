import request from 'supertest';
import { createApp } from './index';

describe('Health Check Endpoint', () => {
    describe('GET /health', () => {
        it('should return healthy status', async () => {
            const app = createApp();
            const response = await request(app).get('/health');
            
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'healthy' });
        });
    });
});