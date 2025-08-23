import { Request, Response } from 'express';
import { Task } from '../models/task.model';
import { user as User } from '../models/user.model';
import { role as Role } from '../models/role.model';
import logger from '../config/logger';

export class TaskController {

  static async getAllTasks(req: Request, res: Response): Promise<void> {
    try {
      let whereClause: any = {};
      let includeClause = [
        { 
          model: User, 
          as: 'assignedUser',
          include: [{ model: Role, as: 'userRole' }],
          attributes: { exclude: ['password'] }
        }
      ];

      if (req.user?.role === 'Employee') {
        whereClause.assigned_to = req.user.userId;
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: includeClause,
        order: [['created_at', 'DESC']]
      });

      logger.info('Tasks retrieved successfully', { 
        userId: req.user?.userId,
        userRole: req.user?.role,
        taskCount: tasks.length,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      logger.error('Get all tasks error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tasks'
      });
    }
  }

  static async getTaskById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const task = await Task.findByPk(id, {
        include: [
          { 
            model: User, 
            as: 'assignedUser',
            include: [{ model: Role, as: 'userRole' }],
            attributes: { exclude: ['password'] }
          }
        ]
      });

      if (!task) {
        logger.warn('Task not found', { 
          taskId: id,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      if (req.user?.role === 'Employee' && task.assigned_to !== req.user.userId) {
        logger.warn('Task access denied: Employee trying to access unassigned task', { 
          userId: req.user.userId,
          taskId: id,
          ip: req.ip 
        });
        res.status(403).json({
          success: false,
          message: 'Access denied: You can only view tasks assigned to you'
        });
        return;
      }

      logger.info('Task retrieved successfully', { 
        userId: req.user?.userId,
        taskId: id,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        data: task
      });
    } catch (error) {
      logger.error('Get task by ID error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        taskId: req.params.id,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve task'
      });
    }
  }

  static async createTask(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, priority, assigned_to, due_date } = req.body;

      const assignedUser = await User.findByPk(assigned_to);
      if (!assignedUser) {
        logger.warn('Task creation failed: Assigned user not found', { 
          assignedUserId: assigned_to,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(400).json({
          success: false,
          message: 'Assigned user not found'
        });
        return;
      }

      const task = await Task.create({
        title,
        description,
        priority,
        assigned_to,
        due_date,
        status: 'pending'
      });

      const createdTask = await Task.findByPk(task.id, {
        include: [
          { 
            model: User, 
            as: 'assignedUser',
            include: [{ model: Role, as: 'userRole' }],
            attributes: { exclude: ['password'] }
          }
        ]
      });

      logger.info('Task created successfully', { 
        userId: req.user?.userId,
        taskId: task.id,
        priority,
        assignedTo: assigned_to,
        ip: req.ip 
      });

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: createdTask
      });
    } catch (error) {
      logger.error('Create task error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to create task'
      });
    }
  }

  static async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const task = await Task.findByPk(id);
      if (!task) {
        logger.warn('Task not found for update', { 
          taskId: id,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      if (req.user?.role === 'Employee' && task.assigned_to !== req.user.userId) {
        logger.warn('Task update denied: Employee trying to update unassigned task', { 
          userId: req.user.userId,
          taskId: id,
          ip: req.ip 
        });
        res.status(403).json({
          success: false,
          message: 'Access denied: You can only update tasks assigned to you'
        });
        return;
      }

      if (updateData.assigned_to) {
        const assignedUser = await User.findByPk(updateData.assigned_to);
        if (!assignedUser) {
          logger.warn('Task update failed: Assigned user not found', { 
            assignedUserId: updateData.assigned_to,
            userId: req.user?.userId,
            taskId: id,
            ip: req.ip 
          });
          res.status(400).json({
            success: false,
            message: 'Assigned user not found'
          });
          return;
        }
      }

      await task.update(updateData);

      const updatedTask = await Task.findByPk(id, {
        include: [
          { 
            model: User, 
            as: 'assignedUser',
            include: [{ model: Role, as: 'userRole' }],
            attributes: { exclude: ['password'] }
          }
        ]
      });

      logger.info('Task updated successfully', { 
        userId: req.user?.userId,
        taskId: id,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask
      });
    } catch (error) {
      logger.error('Update task error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        taskId: req.params.id,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to update task'
      });
    }
  }

  static async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const task = await Task.findByPk(id);
      if (!task) {
        logger.warn('Task not found for deletion', { 
          taskId: id,
          userId: req.user?.userId,
          ip: req.ip 
        });
        res.status(404).json({
          success: false,
          message: 'Task not found'
        });
        return;
      }

      await task.destroy();

      logger.info('Task deleted successfully', { 
        userId: req.user?.userId,
        taskId: id,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      logger.error('Delete task error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        taskId: req.params.id,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to delete task'
      });
    }
  }

  static async getTasksByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      let whereClause: any = { status };

      if (req.user?.role === 'Employee') {
        whereClause.assigned_to = req.user.userId;
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'assignedUser',
            include: [{ model: Role, as: 'userRole' }],
            attributes: { exclude: ['password'] }
          }
        ],
        order: [['created_at', 'DESC']]
      });

      logger.info('Tasks by status retrieved successfully', { 
        userId: req.user?.userId,
        status,
        taskCount: tasks.length,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      logger.error('Get tasks by status error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        status: req.params.status,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tasks by status'
      });
    }
  }

  static async getTasksByPriority(req: Request, res: Response): Promise<void> {
    try {
      const { priority } = req.params;
      let whereClause: any = { priority };

      if (req.user?.role === 'Employee') {
        whereClause.assigned_to = req.user.userId;
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          { 
            model: User, 
            as: 'assignedUser',
            include: [{ model: Role, as: 'userRole' }],
            attributes: { exclude: ['password'] }
          }
        ],
        order: [['created_at', 'DESC']]
      });

      logger.info('Tasks by priority retrieved successfully', { 
        userId: req.user?.userId,
        priority,
        taskCount: tasks.length,
        ip: req.ip 
      });

      res.status(200).json({
        success: true,
        data: tasks
      });
    } catch (error) {
      logger.error('Get tasks by priority error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.userId,
        priority: req.params.priority,
        ip: req.ip 
      });
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve tasks by priority'
      });
    }
  }
}
