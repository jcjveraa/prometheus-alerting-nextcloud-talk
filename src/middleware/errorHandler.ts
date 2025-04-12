import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { logger } from '../logger';

export const errorHandler: ErrorRequestHandler = (
    error: Error,
    req,
    res,
    next
) => {
    if (error instanceof ZodError) {
        logger.warn({ 
            path: req.path,
            errors: error.errors 
        }, 'Validation error');

        res.status(400).json({
            status: 'error',
            message: 'Invalid request payload',
            details: error.errors
        });
        return;
    }

    logger.error({ 
        err: error,
        path: req.path,
        method: req.method
    }, 'Unhandled error');
    
    res.status(500).json({
        status: 'error',
        message: error.message || 'Internal server error'
    });
    return;
};