import { AuthController } from '../../src/auth/auth.controller';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';

// Mock the models and dependencies
jest.mock('../../src/models/user.model');
jest.mock('../../src/models/role.model');
jest.mock('../../src/config/jwt');
jest.mock('../../src/config/logger');
jest.mock('bcryptjs');

describe('AuthController', () => {
  let mockRequest: Partial<Request> & { user?: any };
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      body: {},
      ip: '127.0.0.1'
    };
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully register a new user with valid data', async () => {
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        
        user.findOne = jest.fn().mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
        user.create = jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedPassword123',
          role: 'role-123'
        });
        role.findByPk = jest.fn().mockResolvedValue({
          id: 'role-123',
          role_name: 'employee',
          description: 'Employee role'
        });

        mockRequest.body = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          roleId: 'role-123'
        };

        await AuthController.register(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'User registered successfully',
          data: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'employee'
          }
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 400 if email already exists', async () => {
        const { user } = require('../../src/models/user.model');
        user.findOne = jest.fn().mockResolvedValue({ id: 'existing-user-id' });

        mockRequest.body = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          roleId: 'role-id'
        };

        await AuthController.register(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'User with this email already exists'
        });
      });

      it('should return 500 if bcrypt hashing fails', async () => {
        const { user } = require('../../src/models/user.model');
        user.findOne = jest.fn().mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing failed'));

        mockRequest.body = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          roleId: 'role-id'
        };

        await AuthController.register(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to register user'
        });
      });

      it('should return 500 if user creation fails', async () => {
        const { user } = require('../../src/models/user.model');
        user.findOne = jest.fn().mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
        user.create = jest.fn().mockRejectedValue(new Error('Database error'));

        mockRequest.body = {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          roleId: 'role-id'
        };

        await AuthController.register(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to register user'
        });
      });
    });
  });

  describe('login', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully login user with valid credentials', async () => {
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        const { generateToken } = require('../../src/config/jwt');
        
        user.findOne = jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedPassword123',
          userRole: {
            role_name: 'employee'
          }
        });
        
        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        generateToken.mockReturnValue('jwt-token-123');

        mockRequest.body = {
          email: 'test@example.com',
          password: 'password123'
        };

        await AuthController.login(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          message: 'Login successful',
          data: {
            token: 'jwt-token-123',
            user: {
              id: 'user-123',
              name: 'Test User',
              email: 'test@example.com',
              role: 'employee'
            }
          }
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 401 if user not found', async () => {
        const { user } = require('../../src/models/user.model');
        user.findOne = jest.fn().mockResolvedValue(null);

        mockRequest.body = {
          email: 'nonexistent@example.com',
          password: 'password123'
        };

        await AuthController.login(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Invalid credentials'
        });
      });

      it('should return 401 if password is incorrect', async () => {
        const { user } = require('../../src/models/user.model');
        
        user.findOne = jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashedPassword123',
          userRole: {
            role_name: 'employee'
          }
        });
        
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        mockRequest.body = {
          email: 'test@example.com',
          password: 'wrongpassword'
        };

        await AuthController.login(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Invalid credentials'
        });
      });

      it('should return 500 if database query fails', async () => {
        const { user } = require('../../src/models/user.model');
        user.findOne = jest.fn().mockRejectedValue(new Error('Database error'));

        mockRequest.body = {
          email: 'test@example.com',
          password: 'password123'
        };

        await AuthController.login(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Failed to login'
        });
      });
    });
  });

  describe('getProfile', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should successfully return user profile when authenticated', async () => {
        const { user } = require('../../src/models/user.model');
        const { role } = require('../../src/models/role.model');
        
        mockRequest.user = {
          userId: 'user-123',
          email: 'test@example.com',
          role: 'employee'
        };
        
        user.findByPk = jest.fn().mockResolvedValue({
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
          userRole: {
            role_name: 'employee'
          }
        });

        await AuthController.getProfile(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            role: 'employee'
          }
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 401 if user is not authenticated', async () => {
        mockRequest.user = undefined;

        await AuthController.getProfile(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'Authentication required'
        });
      });

      it('should return 404 if user not found in database', async () => {
        const { user } = require('../../src/models/user.model');
        
        mockRequest.user = {
          userId: 'user-123',
          email: 'test@example.com',
          role: 'employee'
        };
        
        user.findByPk = jest.fn().mockResolvedValue(null);

        await AuthController.getProfile(mockRequest as Request, mockResponse as Response);

        expect(mockStatus).toHaveBeenCalledWith(404);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: 'User not found'
        });
      });
    });
  });
});
