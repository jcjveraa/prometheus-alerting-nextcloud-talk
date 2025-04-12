import { Router } from 'express';
import { Counter, Gauge } from 'prom-client';
import { validateEnv } from './config';

export const rateLimitCounter = new Counter({
    name: 'rate_limit_hits_total',
    help: 'Number of requests that hit the rate limit'
});

export const rateLimitGauge = new Gauge({
    name: 'rate_limit_usage_ratio',
    help: 'Current ratio of rate limit usage (0-1)'
});

export const metricsRateLimitRouter = Router();

metricsRateLimitRouter.get('/', async (_req, res) => {
    const env = validateEnv();
    const windowMs = parseInt(env.RATE_LIMIT_WINDOW_MS);
    const max = parseInt(env.RATE_LIMIT_PER_MINUTE);
    const current = await rateLimitCounter.get();
    const usage = current.values[0].value / max;
    
    rateLimitGauge.set(usage);
    
    res.status(200).json({
        windowMs,
        max,
        current: current.values[0].value,
        usage
    });
});