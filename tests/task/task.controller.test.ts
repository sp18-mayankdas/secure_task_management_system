import { TaskController } from '../../src/task/task.controller';
import { Request, Response } from 'express';

// Mock the models and dependencies
jest.mock('../../src/models/task.model');
jest.mock('../../src/models/user.model');
jest.mock('../../src/models/role.model');
jest.mock('../../src/config/logger');

describe('TaskController', () => {
  let mockRequest: Partial<Request> & { user?: any };
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      body: {},
      params: {},
      ip: '127.0.0.1'
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    jest.clearAllMocks();
  });

  describe('getAllTasks', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should return all tasks for admin user', async () => {
        const { Task } = require('../../src/models/task.model');
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        
        Task.findAll = jest.fn().mockResolvedValue([
          {
            id: 'task-1',
            title: 'Task 1',
            assignedUser: {
              id: 'user-1',
              name: 'User 1',
              userRole: { role_name: 'employee' }
            }
          }
        ]);

        await TaskController.getAllTasks(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: [
            {
              id: 'task-1',
              title: 'Task 1',
              assignedUser: {
                id: 'user-1',
                name: 'User 1',
                userRole: { role_name: 'employee' }
              }
            }
          ]
        });
      });

      it('should return only assigned tasks for employee user', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        
        Task.findAll = jest.fn().mockResolvedValue([
          {
            id: 'task-1',
            title: 'Assigned Task',
            assignedUser: {
              id: 'employee-123',
              name: 'Employee',
              userRole: { role_name: 'employee' }
            }
          }
        ]);

        await TaskController.getAllTasks(mockRequest as Request, mockResponse as Response);

        expect(Task.findAll).toHaveBeenCalledWith({
          where: { assigned_to: 'employee-123' },
          include: expect.any(Array),
          order: [['created_at', 'DESC']]
        });
        expect(mockStatus).toHaveBeenCalledWith(200);
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 500 if database query fails', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        
        Task.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

        await TaskController.getAllTasks(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to retrieve tasks'
        });
      });
    });
  });

  describe('getTaskById', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should return task for admin user', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'task-123' };
        
        Task.findByPk = jest.fn().mockResolvedValue({
          id: 'task-123',
          title: 'Test Task',
          assigned_to: 'user-123',
          assignedUser: {
            id: 'user-123',
            name: 'User',
            userRole: { role_name: 'employee' }
          }
        });

        await TaskController.getTaskById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: {
            id: 'task-123',
            title: 'Test Task',
            assigned_to: 'user-123',
            assignedUser: {
              id: 'user-123',
              name: 'User',
              userRole: { role_name: 'employee' }
            }
          }
        });
      });

      it('should return task for assigned employee', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'task-123' };
        
        Task.findByPk = jest.fn().mockResolvedValue({
          id: 'task-123',
          title: 'Assigned Task',
          assigned_to: 'employee-123',
          assignedUser: {
            id: 'employee-123',
            name: 'Employee',
            userRole: { role_name: 'employee' }
          }
        });

        await TaskController.getTaskById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 404 if task not found', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'nonexistent-task' };
        
        Task.findByPk = jest.fn().mockResolvedValue(null);

        await TaskController.getTaskById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Task not found'
        });
      });

      it('should return 403 if employee tries to access unassigned task', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'task-123' };
        
        Task.findByPk = jest.fn().mockResolvedValue({
          id: 'task-123',
          title: 'Unassigned Task',
          assigned_to: 'other-employee-123',
          assignedUser: {
            id: 'other-employee-123',
            name: 'Other Employee',
            userRole: { role_name: 'employee' }
          }
        });

        await TaskController.getTaskById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Access denied: You can only view tasks assigned to you'
        });
      });

      it('should return 500 if database query fails', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'task-123' };
        
        Task.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

        await TaskController.getTaskById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to retrieve task'
        });
      });
    });
  });

  describe('createTask', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully create task for manager', async () => {
        const { Task } = require('../../src/models/task.model');
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'manager-123',
          role: 'manager'
        };
        mockRequest.body = {
          title: 'New Task',
          description: 'Task description',
          priority: 'medium',
          assigned_to: 'employee-123',
          due_date: '2024-12-31'
        };
        
        user.findByPk = jest.fn().mockResolvedValue({
          id: 'employee-123',
          name: 'Employee',
          email: 'employee@example.com'
        });
        
        Task.create = jest.fn().mockResolvedValue({
          id: 'new-task-123',
          title: 'New Task',
          description: 'Task description',
          priority: 'medium',
          assigned_to: 'employee-123',
          due_date: '2024-12-31',
          status: 'pending'
        });
        
        Task.findByPk = jest.fn().mockResolvedValue({
          id: 'new-task-123',
          title: 'New Task',
          assignedUser: {
            id: 'employee-123',
            name: 'Employee',
            userRole: { role_name: 'employee' }
          }
        });

        await TaskController.createTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Task created successfully',
          data: expect.any(Object)
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 400 if assigned user not found', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'manager-123',
          role: 'manager'
        };
        mockRequest.body = {
          title: 'New Task',
          assigned_to: 'nonexistent-user'
        };
        
        user.findByPk = jest.fn().mockResolvedValue(null);

        await TaskController.createTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Assigned user not found'
        });
      });

      it('should return 500 if task creation fails', async () => {
        const { Task } = require('../../src/models/task.model');
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'manager-123',
          role: 'manager'
        };
        mockRequest.body = {
          title: 'New Task',
          assigned_to: 'employee-123'
        };
        
        user.findByPk = jest.fn().mockResolvedValue({
          id: 'employee-123',
          name: 'Employee'
        });
        
        Task.create = jest.fn().mockRejectedValue(new Error('Creation failed'));

        await TaskController.createTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to create task'
        });
      });
    });
  });

  describe('updateTask', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully update task for admin', async () => {
        const { Task } = require('../../src/models/task.model');
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'task-123' };
        mockRequest.body = {
          title: 'Updated Task',
          status: 'in_progress'
        };
        
        Task.findByPk = jest.fn()
          .mockResolvedValueOnce({
            id: 'task-123',
            title: 'Old Task',
            assigned_to: 'employee-123'
          })
          .mockResolvedValueOnce({
            id: 'task-123',
            title: 'Updated Task',
            assignedUser: {
              id: 'employee-123',
              name: 'Employee',
              userRole: { role_name: 'employee' }
            }
          });

        await TaskController.updateTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Task updated successfully',
          data: expect.any(Object)
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 404 if task not found for update', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'nonexistent-task' };
        mockRequest.body = {
          title: 'Updated Task'
        };
        
        Task.findByPk = jest.fn().mockResolvedValue(null);

        await TaskController.updateTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Task not found'
        });
      });

      it('should return 403 if employee tries to update unassigned task', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'task-123' };
        mockRequest.body = {
          status: 'completed'
        };
        
        Task.findByPk = jest.fn().mockResolvedValue({
          id: 'task-123',
          title: 'Unassigned Task',
          assigned_to: 'other-employee-123'
        });

        await TaskController.updateTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Access denied: You can only update tasks assigned to you'
        });
      });
    });
  });

  describe('deleteTask', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully delete task for admin', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'task-123' };
        
        Task.findByPk = jest.fn().mockResolvedValue({
          id: 'task-123',
          title: 'Task to Delete'
        });

        await TaskController.deleteTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Task deleted successfully'
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 404 if task not found for deletion', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'nonexistent-task' };
        
        Task.findByPk = jest.fn().mockResolvedValue(null);

        await TaskController.deleteTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Task not found'
        });
      });

      it('should return 500 if task deletion fails', async () => {
        const { Task } = require('../../src/models/task.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'task-123' };
        
        Task.findByPk = jest.fn().mockResolvedValue({
          id: 'task-123',
          title: 'Task to Delete'
        });
        
        Task.destroy = jest.fn().mockRejectedValue(new Error('Deletion failed'));

        await TaskController.deleteTask(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to delete task'
        });
      });
    });
  });
});
