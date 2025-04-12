import request from 'supertest';
import { createApp } from './index';

describe('Rate Limit Metrics Endpoint', () => {
    describe('GET /metrics/ratelimit', () => {
        it('should return rate limit metrics', async () => {
            const app = createApp();
            const response = await request(app).get('/metrics/ratelimit');
            
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                windowMs: 60000,
                max: 120,
                current: expect.any(Number),
                usage: expect.any(Number)
            });
        });
    });
});