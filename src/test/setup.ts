// Set required environment variables for tests
process.env.NODE_ENV = 'production';
process.env.NEXTCLOUD_URL = 'https://nextcloud.example.com';
process.env.NEXTCLOUD_TALK_ROOM = 'test-room';
process.env.NEXTCLOUD_BOT_USERNAME = 'testbot';
process.env.NEXTCLOUD_BOT_PASSWORD = 'testpass';
process.env.RATE_LIMIT_PER_MINUTE = '120';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.LOG_LEVEL = 'info';

// Mock pino logger
jest.mock('../logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
    }
}));