import { Router } from 'express';
import { AxiosInstance } from 'axios';
import rateLimit from 'express-rate-limit';
import { validateEnv } from './config';
import { logger } from './logger';
import { validatePayload } from './middleware/validatePayload';
import { AlertManagerPayload, PrometheusAlert } from './types';
import { rateLimitCounter } from './metrics-ratelimit';

function formatAlertMessage(alert: PrometheusAlert): string {
    const status = alert.status.toUpperCase();
    const severity = alert.labels?.severity || 'unknown';
    return `🚨 *${status} Alert - ${severity}*\n` +
           `*Alert:* ${alert.labels?.alertname}\n` +
           `*Description:* ${alert.annotations?.description || 'No description provided'}\n` +
           `*Started:* ${new Date(alert.startsAt).toLocaleString()}`;
}

export function createWebhookRouter(nextcloudClient: AxiosInstance) {
    const env = validateEnv();
    const webhookRouter = Router();

    const limiter = rateLimit({
        windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
        max: parseInt(env.RATE_LIMIT_PER_MINUTE),
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn({ 
                path: req.path, 
                ip: req.ip 
            }, 'Rate limit exceeded');
            rateLimitCounter.inc();
            res.status(429).json({
                status: 'error',
                message: 'Too many requests'
            });
        }
    });

    webhookRouter.post('/',
        limiter,
        validatePayload,
        async (req, res, next) => {
            try {
                const payload = req.body as AlertManagerPayload;
                const alerts = payload.alerts;

                logger.info({ alertCount: alerts.length }, 'Processing alerts');
                
                for (const alert of alerts) {
                    const message = formatAlertMessage(alert);
                    
                    logger.debug({ 
                        alertName: alert.labels?.alertname,
                        severity: alert.labels?.severity 
                    }, 'Sending alert to Nextcloud Talk');

                    await nextcloudClient.post(
                        `/ocs/v2.php/apps/spreed/api/v1/chat/${env.NEXTCLOUD_TALK_ROOM}`,
                        { message },
                        {
                            headers: {
                                'OCS-APIRequest': 'true',
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            }
                        }
                    );
                }
                
                logger.info({ 
                    processed: alerts.length 
                }, 'Successfully processed alerts');

                res.status(200).json({ 
                    status: 'success', 
                    processed: alerts.length 
                });
            } catch (error) {
                logger.error(error, 'Error processing alerts');
                next(error);
            }
        }
    );

    return webhookRouter;
}