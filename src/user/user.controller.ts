import { Request, Response } from 'express';
import { user as User } from '../models/user.model';
import { role as Role } from '../models/role.model';
import logger from '../config/logger';

export class UserController {
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.findAll({
        include: [{ model: Role, as: 'userRole' }],
        attributes: { exclude: ['password'] },
        order: [['created_at', 'DESC']]
      });

      logger.info('All users retrieved successfully', { 
        userId: req.user?.userId,
        userRole: req.user?.role,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        data: users
      });
    } catch (error) {
      logger.error('Get all users error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve users'
      });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (req.user?.role === 'Employee' && req.user.userId !== id) {
        logger.warn('User access denied: Employee trying to access other user profile', { 
          userId: req.user.userId,
          targetUserId: id,
          ip: req.ip 
        });
        res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own profile'
        });
        return;
      }

      const user = await User.findByPk(id, {
        include: [{ model: Role, as: 'userRole' }],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        logger.warn('User not found', { 
          targetUserId: id,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      logger.info('User profile retrieved successfully', { 
        userId: req.user?.userId,
        targetUserId: id,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user by ID error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        targetUserId: req.params.id,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user'
      });
    }
  }

  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      if (req.user?.role === 'Employee' && req.user.userId !== id) {
        logger.warn('User update denied: Employee trying to update other user profile', { 
          userId: req.user.userId,
          targetUserId: id,
          ip: req.ip 
        });
        res.status(403).json({
          success: false,
          message: 'Access denied: You can only update your own profile'
        });
        return;
      }
      if (req.user?.role === 'Employee' && updateData.roleId) {
        logger.warn('User update denied: Employee trying to change role', { 
          userId: req.user.userId,
          targetUserId: id,
          ip: req.ip 
        });
        res.status(403).json({
          success: false,
          message: 'Access denied: You cannot change your role'
        });
        return;
      }

      const user = await User.findByPk(id);
      if (!user) {
        logger.warn('User not found for update', { 
          targetUserId: id,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      await user.update(updateData);

      const updatedUser = await User.findByPk(id, {
        include: [{ model: Role, as: 'userRole' }],
        attributes: { exclude: ['password'] }
      });

      logger.info('User updated successfully', { 
        userId: req.user?.userId,
        targetUserId: id,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      logger.error('Update user error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        targetUserId: req.params.id,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (req.user && req.user.userId === id) {
        logger.warn('User deletion denied: User trying to delete themselves', { 
          userId: req.user.userId,
          ip: req.ip 
        });
        res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
        return;
      }

      const user = await User.findByPk(id);
      if (!user) {
        logger.warn('User not found for deletion', { 
          targetUserId: id,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      await user.destroy();

      logger.info('User deleted successfully', { 
        userId: req.user?.userId,
        targetUserId: id,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      logger.error('Delete user error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        targetUserId: req.params.id,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }
}
