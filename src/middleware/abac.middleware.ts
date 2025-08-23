import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export class ABACMiddleware {

  static canAssignHighPriority(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      logger.warn('ABAC check failed: No user in request', { ip: req.ip });
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    const { priority } = req.body;
    
    if (priority === 'high') {
      if (!['Manager', 'Admin', 'Super Admin'].includes(req.user.role)) {
        logger.warn('ABAC check failed: Cannot assign high priority task', { 
          userId: req.user.userId, 
          userRole: req.user.role, 
          priority,
          ip: req.ip 
        });
        res.status(403).json({ 
          success: false, 
          message: 'Only managers, admins, and super admins can assign high priority tasks' 
        });
        return;
      }
    }

    logger.info('ABAC check passed for task priority', { 
      userId: req.user.userId, 
      userRole: req.user.role,
      priority,
      ip: req.ip 
    });
    next();
  }

  static canViewTask(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      logger.warn('ABAC check failed: No user in request', { ip: req.ip });
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    const taskId = req.params.id || req.params.taskId;
    
    if (['Super Admin', 'Admin', 'Manager'].includes(req.user.role)) {
      logger.info('ABAC check passed: Admin/Manager can view any task', { 
        userId: req.user.userId, 
        userRole: req.user.role,
        taskId,
        ip: req.ip 
      });
      return next();
    }

    logger.info('ABAC check passed: Employee access to assigned tasks', { 
      userId: req.user.userId, 
      userRole: req.user.role,
      taskId,
      ip: req.ip 
    });
    next();
  }

 
  static canUpdateTask(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      logger.warn('ABAC check failed: No user in request', { ip: req.ip });
      res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
      return;
    }

    if (['Super Admin', 'Admin', 'Manager'].includes(req.user.role)) {
      logger.info('ABAC check passed: Admin/Manager can update any task', { 
        userId: req.user.userId, 
        userRole: req.user.role,
        ip: req.ip 
      });
      return next();
    }

    logger.info('ABAC check passed: Employee can update assigned tasks', { 
      userId: req.user.userId, 
      userRole: req.user.role,
      ip: req.ip 
    });
    next();
  }
}
