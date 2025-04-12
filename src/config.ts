import { z } from 'zod';

const envSchema = z.object({
    PORT: z.string().default('3000'),
    // ref https://nodejs.org/en/learn/getting-started/nodejs-the-difference-between-development-and-production - not using production even in development is an antipattern
    NODE_ENV: z.literal('production').default('production'),
    NEXTCLOUD_URL: z.string().url(),
    NEXTCLOUD_TALK_ROOM: z.string(),
    NEXTCLOUD_BOT_USERNAME: z.string(),
    NEXTCLOUD_BOT_PASSWORD: z.string(),
    RATE_LIMIT_PER_MINUTE: z.string().default('120'),
    RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    LOG_PRETTY: z.enum(['0', '1']).default('0'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.errors, null, 2));
        process.exit(1);
    }

    return parsed.data;
}