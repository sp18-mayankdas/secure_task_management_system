import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class ErrorMiddleware {

  static handleError(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    logger.error('Unhandled error occurred', {
      error: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId || 'anonymous'
    });

  }
  
  //404 error
  static handleNotFound(req: Request, res: Response): void {
    logger.warn('Route not found', {
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  //validation errors
  static handleValidationError(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      logger.warn('Validation error', {
        error: error.message,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userId: req.user?.userId || 'anonymous'
      });

      const errors = error.errors?.map((err: any) => ({
        field: err.path,
        message: err.message
      })) || [];

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }

    next(error);
  }
}
