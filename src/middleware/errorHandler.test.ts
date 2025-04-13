import { Request, Response } from 'express';
import { errorHandler } from './errorHandler';

describe('Error Handler Middleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: jest.Mock;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn().mockReturnThis();
        statusMock = jest.fn().mockReturnThis();
        mockRequest = {};
        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };
        mockNext = jest.fn();
    });

    it('should handle errors with falsy message', () => {
        // Create Error without message using Object.create
        const error = Object.create(Error.prototype);
        
        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            mockNext
        );

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            status: 'error',
            message: 'Internal server error'
        });
    });
});