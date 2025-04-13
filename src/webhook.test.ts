import request from 'supertest';
import { createApp } from './index';
import { AxiosInstance } from 'axios';
import { PrometheusAlert } from './types';

describe('Webhook Endpoint', () => {
    let mockNextcloudClient: jest.Mocked<AxiosInstance>;
    let validAlert: PrometheusAlert;
    const originalEnv = process.env;

    beforeEach(() => {
        mockNextcloudClient = {
            post: jest.fn().mockResolvedValue({ data: {} }),
        } as any;

        validAlert = {
            status: 'firing',
            labels: {
                alertname: 'HighCPUUsage',
                severity: 'critical'
            },
            annotations: {
                description: 'CPU usage is above 90%'
            },
            startsAt: '2025-04-12T10:00:00Z',
            endsAt: '2025-04-12T11:00:00Z',
            generatorURL: 'http://prometheus'
        };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Rate Limiting', () => {
        const RATE_LIMIT = 5;
        
        beforeEach(() => {
            process.env = {
                ...originalEnv,
                RATE_LIMIT_PER_MINUTE: RATE_LIMIT.toString(),
                RATE_LIMIT_WINDOW_MS: '60000',
                NODE_ENV: 'production',
                NEXTCLOUD_URL: 'https://nextcloud.example.com',
                NEXTCLOUD_TALK_ROOM: 'test-room',
                NEXTCLOUD_BOT_USERNAME: 'testbot',
                NEXTCLOUD_BOT_PASSWORD: 'testpass'
            };
        });

        it('should enforce rate limiting', async () => {
            const app = createApp(mockNextcloudClient);
            
            // Make requests sequentially to ensure consistent rate limiting
            for (let i = 0; i < RATE_LIMIT; i++) {
                const response = await request(app)
                    .post('/webhook')
                    .send({ alerts: [validAlert] });
                expect(response.status).toBe(200);
            }

            // Additional request should be rate limited
            const rateLimitedResponse = await request(app)
                .post('/webhook')
                .send({ alerts: [validAlert] });

            expect(rateLimitedResponse.status).toBe(429);
            expect(rateLimitedResponse.body).toEqual({
                status: 'error',
                message: 'Too many requests'
            });
        });
    });

    describe('POST /webhook', () => {
        it('should process valid alerts and forward to Nextcloud Talk', async () => {
            const app = createApp(mockNextcloudClient);
            const response = await request(app)
                .post('/webhook')
                .send({ alerts: [validAlert] });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                processed: 1
            });

            expect(mockNextcloudClient.post).toHaveBeenCalledWith(
                `/ocs/v2.php/apps/spreed/api/v1/chat/test-room`,
                {
                    message: expect.stringContaining('FIRING Alert - critical')
                },
                expect.any(Object)
            );
        });

        it('should handle empty alerts array', async () => {
            const app = createApp(mockNextcloudClient);
            const response = await request(app)
                .post('/webhook')
                .send({ alerts: [] });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                status: 'success',
                processed: 0
            });

            expect(mockNextcloudClient.post).not.toHaveBeenCalled();
        });

        it('should handle Nextcloud Talk API errors', async () => {
            mockNextcloudClient.post.mockRejectedValueOnce(new Error('API Error'));
            
            const app = createApp(mockNextcloudClient);
            const response = await request(app)
                .post('/webhook')
                .send({ alerts: [validAlert] });

            expect(response.status).toBe(500);
            expect(response.body).toEqual({
                status: 'error',
                message: 'API Error'
            });
        });

        it('should reject invalid alert payload', async () => {
            const app = createApp(mockNextcloudClient);
            const response = await request(app)
                .post('/webhook')
                .send({
                    alerts: [{
                        // Missing required fields
                        status: 'firing'
                    }]
                });

            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                status: 'error',
                message: 'Invalid request payload',
                details: expect.any(Array)
            });
        });

        it('should reject payload without alerts field', async () => {
            const app = createApp(mockNextcloudClient);
            const response = await request(app)
                .post('/webhook')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
        });

        it('should handle rate limiting', async () => {
            const app = createApp(mockNextcloudClient);
            const requests = Array(121).fill(null).map(() => 
                request(app)
                    .post('/webhook')
                    .send({ alerts: [validAlert] })
            );

            const responses = await Promise.all(requests);
            const rateLimited = responses.filter(r => r.status === 429);
            
            expect(rateLimited.length).toBe(1);
            expect(rateLimited[0].body).toEqual({
                status: 'error',
                message: 'Too many requests'
            });
        });

        it('should handle alerts without labels (unknown severity)', async () => {
            const alertWithoutLabels = {
                ...validAlert,
                labels: undefined
            };

            const app = createApp(mockNextcloudClient);
            await request(app)
                .post('/webhook')
                .send({ alerts: [alertWithoutLabels] })
                .expect(200);

            expect(mockNextcloudClient.post).toHaveBeenCalledWith(
                `/ocs/v2.php/apps/spreed/api/v1/chat/test-room`,
                {
                    message: expect.stringContaining('FIRING Alert - unknown')
                },
                expect.any(Object)
            );
        });

        it('should handle alerts without description', async () => {
            const alertWithoutDescription = {
                ...validAlert,
                annotations: {}
            };

            const app = createApp(mockNextcloudClient);
            await request(app)
                .post('/webhook')
                .send({ alerts: [alertWithoutDescription] })
                .expect(200);

            expect(mockNextcloudClient.post).toHaveBeenCalledWith(
                `/ocs/v2.php/apps/spreed/api/v1/chat/test-room`,
                {
                    message: expect.stringContaining('No description provided')
                },
                expect.any(Object)
            );
        });
    });
});