import dotenv from 'dotenv';
import express from 'express';
import axios, { AxiosInstance } from 'axios';
import promBundle from 'express-prom-bundle';
import { register } from 'prom-client';
import { validateEnv } from './config';
import { logger } from './logger';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './health';
import { metricsRateLimitRouter } from './metrics-ratelimit';
import { createWebhookRouter } from './webhook';

dotenv.config();

// Configure metrics middleware
const metricsMiddleware = promBundle({
    includeMethod: true,
    includePath: true,
    promRegistry: register
});

export function createApp(customClient?: AxiosInstance) {
    const env = validateEnv();
    const app = express();

    // Basic middleware
    app.use(express.json());
    app.use(metricsMiddleware);

    // Configure Nextcloud Talk client
    const nextcloudClient: AxiosInstance = customClient || axios.create({
        baseURL: env.NEXTCLOUD_URL,
        auth: {
            username: env.NEXTCLOUD_BOT_USERNAME,
            password: env.NEXTCLOUD_BOT_PASSWORD
        }
    });

    // Mount routers
    app.use('/health', healthRouter);
    app.use('/metrics/ratelimit', metricsRateLimitRouter);
    app.use('/webhook', createWebhookRouter(nextcloudClient));

    // Error handling middleware should be last
    app.use(errorHandler);

    return app;
}

/* istanbul ignore if */
if (require.main === module) {
    const env = validateEnv();
    const app = createApp();

    app.listen(env.PORT, () => {
        logger.info({ port: env.PORT }, 'Server started');
    });
}