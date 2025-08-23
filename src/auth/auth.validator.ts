import { Request, Response, NextFunction } from 'express';
import { user as User } from '../models/user.model';
import { role as Role } from '../models/role.model';
import logger from '../config/logger';

export class AuthValidator {
  static async validateRegistration(req: Request, res: Response, next: NextFunction): Promise<void> {
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
        } else {
          if (role.name.toLowerCase() !== 'employee') {
            errors.push('Self-registration is only allowed for employee role');
          }
        }
      }
    
      if (email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          errors.push('User with this email already exists');
        }
      }

      if (errors.length > 0) {
        logger.warn('Registration validation failed', { 
          errors,
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
      logger.error('Registration validation error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  }

  static async validateAdminUserCreation(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      if (email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          errors.push('User with this email already exists');
        }
      }

      if (errors.length > 0) {
        logger.warn('Admin user creation validation failed', { 
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
      logger.error('Admin user creation validation error', { 
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

  static validateLogin(req: Request, res: Response, next: NextFunction): void {
    try {
      const { email, password } = req.body;
      const errors: string[] = [];

      if (!email || typeof email !== 'string') {
        errors.push('Email is required');
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push('Must be a valid email');
        }
      }

      if (!password || typeof password !== 'string') {
        errors.push('Password is required');
      }

      if (errors.length > 0) {
        logger.warn('Login validation failed', { 
          errors,
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
      logger.error('Login validation error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Validation error occurred'
      });
    }
  }
}
