import { Request, Response, NextFunction } from 'express';
import { user as User } from '../models/user.model';
import logger from '../config/logger';

export class TaskValidator {
  static async validateTaskCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, priority, assigned_to, due_date } = req.body;
      const errors: string[] = [];

      if (!title || typeof title !== 'string' || title.trim() === "") {
        errors.push('Title is required and must be a non-empty string.');
      }

      if (description !== undefined) {
        if (typeof description !== 'string' || description.length > 1000) {
          errors.push('Description must be less than 1000 characters');
        }
      }

      if (!priority || !['low', 'medium', 'high'].includes(priority)) {
        errors.push('Priority must be low, medium, or high');
      }

      if (!assigned_to || typeof assigned_to !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assigned_to)) {
        errors.push('Assigned user ID must be a valid UUID');
      } else {
        const assignedUser = await User.findByPk(assigned_to);
        if (!assignedUser) {
          errors.push('Assigned user not found');
        }
      }

      if (due_date !== undefined) {
        if (typeof due_date !== 'string' || isNaN(Date.parse(due_date))) {
          errors.push('Due date must be a valid ISO date');
        }
      }

      if (errors.length > 0) {
        logger.warn('Task creation validation failed', { 
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
      logger.error('Task creation validation error', { 
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

  static async validateTaskUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, status, priority, assigned_to, due_date } = req.body;
      const errors: string[] = [];

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === "") {
          errors.push('Title must be between 1 and 100 characters');
        }
      }

      if (description !== undefined) {
        if (typeof description !== 'string' || description.length > 1000) {
          errors.push('Description must be less than 1000 characters');
        }
      }

      if (status !== undefined) {
        if (!['pending', 'in_progress', 'completed'].includes(status)) {
          errors.push('Status must be pending, in_progress, or completed');
        }
      }

      if (priority !== undefined) {
        if (!['low', 'medium', 'high'].includes(priority)) {
          errors.push('Priority must be low, medium, or high');
        }
      }

      if (assigned_to !== undefined) {
        if (typeof assigned_to !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assigned_to)) {
          errors.push('Assigned user ID must be a valid UUID');
        } else {
          const assignedUser = await User.findByPk(assigned_to);
          if (!assignedUser) {
            errors.push('Assigned user not found');
          }
        }
      }

      if (due_date !== undefined) {
        if (typeof due_date !== 'string' || isNaN(Date.parse(due_date))) {
          errors.push('Due date must be a valid ISO date');
        }
      }

      if (errors.length > 0) {
        logger.warn('Task update validation failed', { 
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
      logger.error('Task update validation error', { 
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
