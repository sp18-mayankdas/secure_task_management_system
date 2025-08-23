import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../config/jwt';
import logger from '../config/logger';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export class AuthMiddleware {

  static authenticate(req: Request, res: Response, next: NextFunction): void {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('Authentication failed: No token provided', { 
          ip: req.ip, 
          userAgent: req.get('User-Agent') 
        });
        res.status(401).json({ 
          success: false, 
          message: 'Access token required' 
        });
        return;
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        logger.warn('Authentication failed: Invalid token format', { 
          ip: req.ip, 
          userAgent: req.get('User-Agent') 
        });
        res.status(401).json({ 
          success: false, 
          message: 'Invalid token format' 
        });
        return;
      }

      const decoded = verifyToken(token);
      req.user = decoded;
      logger.info('Authentication successful', { 
        userId: decoded.userId, 
        email: decoded.email,
        ip: req.ip 
      });
      
      next();
    } catch (error) {
      logger.error('Authentication failed: Invalid token', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip 
      });
      res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
  }

  static requireRole(allowedRoles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        logger.warn('Role check failed: No user in request', { ip: req.ip });
        res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn('Role check failed: Insufficient permissions', { 
          userId: req.user.userId, 
          userRole: req.user.role, 
          requiredRoles: allowedRoles,
          ip: req.ip 
        });
        res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions' 
        });
        return;
      }

      logger.info('Role check passed', { 
        userId: req.user.userId, 
        userRole: req.user.role,
        ip: req.ip 
      });
      next();
    };
  }

  static requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.requireRole(['Super Admin'])(req, res, next);
  }

  static requireAdmin(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.requireRole(['Super Admin', 'Admin'])(req, res, next);
  }

  static requireManager(req: Request, res: Response, next: NextFunction): void {
    AuthMiddleware.requireRole(['Super Admin', 'Admin', 'Manager'])(req, res, next);
  }
}
