import { Request, Response, NextFunction } from 'express';
import { role as Role } from '../models/role.model';
import logger from '../config/logger';

export class UserValidator {
  static async validateUserUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, roleId } = req.body;
      const errors: string[] = [];

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === "") {
          errors.push('Name is required and must be a non-empty string.');
        }
      }

      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !emailRegex.test(email)) {
          errors.push('Must be a valid email');
        }
      }

      if (roleId !== undefined) {
        if (typeof roleId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleId)) {
          errors.push('Role ID must be a valid UUID');
        } else {
          const role = await Role.findByPk(roleId);
          if (!role) {
            errors.push('Role not found');
          }
        }
      }

      if (errors.length > 0) {
        logger.warn('User update validation failed', { 
          errors,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('User update validation error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  }

  static async validateUserCreation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, roleId } = req.body;
      const errors: string[] = [];

      if (!name || typeof name !== 'string' || name.trim() === "") {
        errors.push('Name is required and must be a non-empty string.');
      }

      if (!email || typeof email !== 'string') {
        errors.push('Email is required');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push('Must be a valid email');
        }
      }

      if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password must be at least 6 characters');
      }

      if (!roleId || typeof roleId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roleId)) {
        errors.push('Role ID must be a valid UUID');
      } else {
        const role = await Role.findByPk(roleId);
        if (!role) {
          errors.push('Role not found');
        }
      }

      if (errors.length > 0) {
        logger.warn('User creation validation failed', { 
          errors,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
        return;
      }

      next();
    } catch (error) {
      logger.error('User creation validation error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  }
}
