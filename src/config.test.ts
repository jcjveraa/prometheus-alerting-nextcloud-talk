import { validateEnv } from './config';

describe('Environment Configuration', () => {
    const originalEnv = process.env;
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    beforeEach(() => {
        process.env = {
            NODE_ENV: 'production',
            NEXTCLOUD_URL: 'https://nextcloud.example.com',
            NEXTCLOUD_TALK_ROOM: 'test-room',
            NEXTCLOUD_BOT_USERNAME: 'testbot',
            NEXTCLOUD_BOT_PASSWORD: 'testpass',
            RATE_LIMIT_PER_MINUTE: '120',
            RATE_LIMIT_WINDOW_MS: '60000',
            LOG_LEVEL: 'info',
            LOG_PRETTY: '0'
        };
    });

    afterEach(() => {
        process.env = originalEnv;
        jest.clearAllMocks();
    });

    it('should validate valid environment configuration', () => {
        const config = validateEnv();
        expect(config).toBeDefined();
        expect(config.NEXTCLOUD_URL).toBe('https://nextcloud.example.com');
        expect(mockExit).not.toHaveBeenCalled();
    });

    it('should exit with invalid environment configuration', () => {
        delete process.env.NEXTCLOUD_URL;
        
        validateEnv();
        
        expect(mockConsoleError).toHaveBeenCalled();
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should use default values for optional configurations', () => {
        delete process.env.PORT;
        delete process.env.RATE_LIMIT_PER_MINUTE;
        delete process.env.LOG_LEVEL;
        delete process.env.LOG_PRETTY;
        
        const config = validateEnv();
        
        expect(config.PORT).toBe('3000');
        expect(config.RATE_LIMIT_PER_MINUTE).toBe('120');
        expect(config.LOG_LEVEL).toBe('info');
        expect(config.LOG_PRETTY).toBe('0');
    });
});