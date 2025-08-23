import { ABACMiddleware } from '../../src/middleware/abac.middleware';
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
jest.mock('../../src/config/logger');

describe('ABACMiddleware', () => {
  let mockRequest: Partial<Request> & { user?: any };
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      ip: '127.0.0.1'
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('canAssignHighPriority', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should call next() when admin assigns low priority task', () => {
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.body = {
          priority: 'low'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when admin assigns medium priority task', () => {
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.body = {
          priority: 'medium'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when admin assigns high priority task', () => {
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.body = {
          priority: 'high'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when manager assigns high priority task', () => {
        mockRequest.user = {
          userId: 'manager-123',
          role: 'manager'
        };
        mockRequest.body = {
          priority: 'high'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when employee assigns low priority task', () => {
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.body = {
          priority: 'low'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when employee assigns medium priority task', () => {
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.body = {
          priority: 'medium'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 401 when user is not authenticated', () => {
        mockRequest.user = undefined;
        mockRequest.body = {
          priority: 'high'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Authentication required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 when employee tries to assign high priority task', () => {
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.body = {
          priority: 'high'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Only managers and admins can assign high priority tasks'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 when user with unknown role tries to assign high priority task', () => {
        mockRequest.user = {
          userId: 'unknown-123',
          role: 'unknown'
        };
        mockRequest.body = {
          priority: 'high'
        };

        ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Only managers and admins can assign high priority tasks'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('canViewTask', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should call next() when admin views any task', () => {
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };
        mockRequest.params = { id: 'task-123' };

        ABACMiddleware.canViewTask(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when manager views any task', () => {
        mockRequest.user = {
          userId: 'manager-123',
          role: 'manager'
        };
        mockRequest.params = { id: 'task-123' };

        ABACMiddleware.canViewTask(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when employee views task (access control handled in controller)', () => {
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };
        mockRequest.params = { id: 'task-123' };

        ABACMiddleware.canViewTask(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 401 when user is not authenticated', () => {
        mockRequest.user = undefined;
        mockRequest.params = { id: 'task-123' };

        ABACMiddleware.canViewTask(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Authentication required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('canUpdateTask', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should call next() when admin updates any task', () => {
        mockRequest.user = {
          userId: 'admin-123',
          role: 'admin'
        };

        ABACMiddleware.canUpdateTask(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when manager updates any task', () => {
        mockRequest.user = {
          userId: 'manager-123',
          role: 'manager'
        };

        ABACMiddleware.canUpdateTask(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when employee updates task (access control handled in controller)', () => {
        mockRequest.user = {
          userId: 'employee-123',
          role: 'employee'
        };

        ABACMiddleware.canUpdateTask(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 401 when user is not authenticated', () => {
        mockRequest.user = undefined;

        ABACMiddleware.canUpdateTask(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Authentication required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing priority in body gracefully', () => {
      mockRequest.user = {
        userId: 'employee-123',
        role: 'employee'
      };
      mockRequest.body = {};

      ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle missing task ID in params gracefully', () => {
      mockRequest.user = {
        userId: 'employee-123',
        role: 'employee'
      };
      mockRequest.params = {};

      ABACMiddleware.canViewTask(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle null priority gracefully', () => {
      mockRequest.user = {
        userId: 'employee-123',
        role: 'employee'
      };
      mockRequest.body = {
        priority: null
      };

      ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle undefined priority gracefully', () => {
      mockRequest.user = {
        userId: 'employee-123',
        role: 'employee'
      };
      mockRequest.body = {
        priority: undefined
      };

      ABACMiddleware.canAssignHighPriority(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
