import { UserController } from '../../src/user/user.controller';
import { Request, Response } from 'express';

// Mock the models and dependencies
jest.mock('../../src/models/user.model');
jest.mock('../../src/models/role.model');
jest.mock('../../src/config/logger');

describe('UserController', () => {
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

  describe('getAllUsers', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully retrieve all users for admin', async () => {
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        
        user.findAll = jest.fn().mockResolvedValue([
          {
            id: 'user-1',
            name: 'User 1',
            email: 'user1@example.com',
            userRole: { role_name: 'employee' }
          },
          {
            id: 'user-2',
            name: 'User 2',
            email: 'user2@example.com',
            userRole: { role_name: 'manager' }
          }
        ]);

        await UserController.getAllUsers(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: [
            {
              id: 'user-1',
              name: 'User 1',
              email: 'user1@example.com',
              userRole: { role_name: 'employee' }
            },
            {
              id: 'user-2',
              name: 'User 2',
              email: 'user2@example.com',
              userRole: { role_name: 'manager' }
            }
          ]
        });
      });

      it('should return empty array when no users exist', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        
        user.findAll = jest.fn().mockResolvedValue([]);

        await UserController.getAllUsers(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: []
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 500 if database query fails', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        
        user.findAll = jest.fn().mockRejectedValue(new Error('Database error'));

        await UserController.getAllUsers(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to retrieve users'
        });
      });
    });
  });

  describe('getUserById', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully retrieve user by ID for admin', async () => {
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'user-123' };
        
        user.findByPk = jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          userRole: { role_name: 'employee' }
        });

        await UserController.getUserById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            userRole: { role_name: 'employee' }
          }
        });
      });

      it('should allow employee to view their own profile', async () => {
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'employee-123' };
        
        user.findByPk = jest.fn().mockResolvedValue({
          id: 'employee-123',
          name: 'Employee User',
          email: 'employee@example.com',
          userRole: { role_name: 'employee' }
        });

        await UserController.getUserById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: {
            id: 'employee-123',
            name: 'Employee User',
            email: 'employee@example.com',
            userRole: { role_name: 'employee' }
          }
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 403 if employee tries to access other user profile', async () => {
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'other-user-123' };

        await UserController.getUserById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Access denied: You can only view your own profile'
        });
      });

      it('should return 404 if user not found', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'nonexistent-user' };
        
        user.findByPk = jest.fn().mockResolvedValue(null);

        await UserController.getUserById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'User not found'
        });
      });

      it('should return 500 if database query fails', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'user-123' };
        
        user.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

        await UserController.getUserById(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to retrieve user'
        });
      });
    });
  });

  describe('updateUser', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully update user for admin', async () => {
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'user-123' };
        mockRequest.body = {
          name: 'Updated Name',
          email: 'updated@example.com'
        };
        
        user.findByPk = jest.fn()
          .mockResolvedValueOnce({
            id: 'user-123',
            name: 'Old Name',
            email: 'old@example.com'
          })
          .mockResolvedValueOnce({
            id: 'user-123',
            name: 'Updated Name',
            email: 'updated@example.com',
            userRole: { role_name: 'employee' }
          });

        await UserController.updateUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'User updated successfully',
          data: {
            id: 'user-123',
            name: 'Updated Name',
            email: 'updated@example.com',
            userRole: { role_name: 'employee' }
          }
        });
      });

      it('should allow employee to update their own profile', async () => {
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'employee-123' };
        mockRequest.body = {
          name: 'Updated Employee Name'
        };
        
        user.findByPk = jest.fn()
          .mockResolvedValueOnce({
            id: 'employee-123',
            name: 'Old Employee Name',
            email: 'employee@example.com'
          })
          .mockResolvedValueOnce({
            id: 'employee-123',
            name: 'Updated Employee Name',
            email: 'employee@example.com',
            userRole: { role_name: 'employee' }
          });

        await UserController.updateUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'User updated successfully',
          data: {
            id: 'employee-123',
            name: 'Updated Employee Name',
            email: 'employee@example.com',
            userRole: { role_name: 'employee' }
          }
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 403 if employee tries to update other user profile', async () => {
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'other-user-123' };
        mockRequest.body = {
          name: 'Updated Name'
        };

        await UserController.updateUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Access denied: You can only update your own profile'
        });
      });

      it('should return 403 if employee tries to change their role', async () => {
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'employee-123' };
        mockRequest.body = {
          roleId: 'manager-role-id'
        };

        await UserController.updateUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(403);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Access denied: You cannot change your role'
        });
      });

      it('should return 404 if user not found for update', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'nonexistent-user' };
        mockRequest.body = {
          name: 'Updated Name'
        };
        
        user.findByPk = jest.fn().mockResolvedValue(null);

        await UserController.updateUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'User not found'
        });
      });

      it('should return 500 if database update fails', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'user-123' };
        mockRequest.body = {
          name: 'Updated Name'
        };
        
        user.findByPk = jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Old Name',
          email: 'old@example.com'
        });
        
        user.update = jest.fn().mockRejectedValue(new Error('Update failed'));

        await UserController.updateUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to update user'
        });
      });
    });
  });

  describe('deleteUser', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully delete user for admin', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'user-to-delete-123' };
        
        user.findByPk = jest.fn().mockResolvedValue({
          id: 'user-to-delete-123',
          name: 'User to Delete',
          email: 'delete@example.com'
        });

        await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'User deleted successfully'
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 400 if user tries to delete themselves', async () => {
        mockRequest.user = {
          userId: 'user-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'user-123' };

        await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Cannot delete your own account'
        });
      });

      it('should return 404 if user not found for deletion', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'nonexistent-user' };
        
        user.findByPk = jest.fn().mockResolvedValue(null);

        await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'User not found'
        });
      });

      it('should return 500 if database deletion fails', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'user-to-delete-123' };
        
        user.findByPk = jest.fn().mockResolvedValue({
          id: 'user-to-delete-123',
          name: 'User to Delete',
          email: 'delete@example.com'
        });
        
        user.destroy = jest.fn().mockRejectedValue(new Error('Deletion failed'));

        await UserController.deleteUser(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to delete user'
        });
      });
    });
  });
});
