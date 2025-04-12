import { Request, Response, NextFunction } from 'express';
import { AlertManagerPayloadSchema } from '../types';

export function validatePayload(
    req: Request,
    _res: Response,
    next: NextFunction
) {
    try {
        AlertManagerPayloadSchema.parse(req.body);
        next();
    } catch (error) {
        next(error);
    }
}