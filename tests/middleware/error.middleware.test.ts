import { ErrorMiddleware } from '../../src/middleware/error.middleware';
import { Request, Response, NextFunction } from 'express';

// Mock dependencies
jest.mock('../../src/config/logger');

// interface ValidationError extends Error {
//   error?: Array<{ path?: string; message: string }>;
// }

describe('ErrorMiddleware', () => {
  let mockRequest: Partial<Request> & { user?: any };
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      url: '/test-endpoint',
      method: 'GET',
      ip: '127.0.0.1',
      get: jest.fn()
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();
    
    jest.clearAllMocks();
  });

  describe('handleError', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should handle generic errors in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const testError = new Error('Test error message');
        testError.stack = 'Error stack trace';

        ErrorMiddleware.handleError(
          testError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Test error message',
          stack: 'Error stack trace'
        });

        process.env.NODE_ENV = originalEnv;
      });

      it('should handle generic errors in production mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        
        const testError = new Error('Test error message');

        ErrorMiddleware.handleError(
          testError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Internal server error'
        });

        process.env.NODE_ENV = originalEnv;
      });

      it('should handle errors with user information when available', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        mockRequest.user = {
          userId: 'user-123',
          email: 'test@example.com'
        };
        
        const testError = new Error('User-specific error');

        ErrorMiddleware.handleError(
          testError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'User-specific error',
          stack: testError.stack
        });

        process.env.NODE_ENV = originalEnv;
      });

      it('should handle errors without user information gracefully', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        mockRequest.user = undefined;
        
        const testError = new Error('No user error');

        ErrorMiddleware.handleError(
          testError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'No user error',
          stack: testError.stack
        });

        process.env.NODE_ENV = originalEnv;
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should handle errors with missing stack trace', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const testError = new Error('Error without stack');
        testError.stack = undefined;

        ErrorMiddleware.handleError(
          testError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Error without stack',
          stack: 'No stack trace'
        });

        process.env.NODE_ENV = originalEnv;
      });

      it('should handle errors with missing request properties', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const incompleteRequest = {
          url: undefined,
          method: undefined,
          ip: undefined,
          get: jest.fn()
        } as Partial<Request>;
        
        const testError = new Error('Incomplete request error');

        ErrorMiddleware.handleError(
          testError,
          incompleteRequest as unknown as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Incomplete request error',
          stack: testError.stack
        });

        process.env.NODE_ENV = originalEnv;
      });
    });
  });

  describe('handleNotFound', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should return 404 for any non-existent route', () => {
        mockRequest.url = '/nonexistent-route';
        mockRequest.method = 'GET';

        ErrorMiddleware.handleNotFound(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Route not found'
        });
      });

      it('should handle different HTTP methods', () => {
        const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
        
        methods.forEach(method => {
          mockRequest.method = method;
          mockRequest.url = `/test-${method}`;
          
          ErrorMiddleware.handleNotFound(mockRequest as Request, mockResponse as Response);
          
          expect(mockResponse.status).toHaveBeenCalledWith(404);
          expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            message: 'Route not found'
          });
        });
      });

      it('should handle complex URLs', () => {
        mockRequest.url = '/api/v1/users/123/posts/456/comments?page=1&limit=10';
        mockRequest.method = 'GET';

        ErrorMiddleware.handleNotFound(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Route not found'
        });
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should handle missing URL gracefully', () => {
        mockRequest.url = undefined;
        mockRequest.method = 'GET';

        ErrorMiddleware.handleNotFound(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Route not found'
        });
      });

      it('should handle missing method gracefully', () => {
        mockRequest.url = '/test-route';
        mockRequest.method = undefined;

        ErrorMiddleware.handleNotFound(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Route not found'
        });
      });
    });
  });

  describe('handleValidationError', () => {
    
    // Positive test cases
    describe('Positive Cases', () => {
      it('should handle SequelizeValidationError', () => {
        const ValidationError = new Error('Validation failed');
        ValidationError.name = 'SequelizeValidationError';
        ValidationError.error = [
          { path: 'email', message: 'Email is invalid' },
          { path: 'name', message: 'Name is required' }
        ];

        ErrorMiddleware.handleValidationError(
          ValidationError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
          errors: [
            { field: 'email', message: 'Email is invalid' },
            { field: 'name', message: 'Name is required' }
          ]
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle SequelizeUniqueConstraintError', () => {
        const uniqueError = new Error('Unique constraint failed');
        uniqueError.name = 'SequelizeUniqueConstraintError';
        uniqueError.errors = [
          { path: 'email', message: 'Email must be unique' }
        ];

        ErrorMiddleware.handleValidationError(
          uniqueError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
          errors: [
            { field: 'email', message: 'Email must be unique' }
          ]
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should handle validation errors with missing errors array', () => {
        const validationError = new Error('Validation failed');
        validationError.name = 'SequelizeValidationError';
        validationError.errors = undefined;

        ErrorMiddleware.handleValidationError(
          validationError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
          errors: []
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should call next() for non-Sequelize errors', () => {
        const regularError = new Error('Regular error');
        regularError.name = 'RegularError';

        ErrorMiddleware.handleValidationError(
          regularError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(regularError);
      });

      it('should handle validation errors with missing name property', () => {
        const validationError = new Error('Validation failed');
        // Missing name property
        validationError.errors = [
          { path: 'email', message: 'Email is invalid' }
        ];

        ErrorMiddleware.handleValidationError(
          validationError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).not.toHaveBeenCalled();
        expect(mockResponse.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(validationError);
      });

      it('should handle validation errors with missing path in error objects', () => {
        const validationError = new Error('Validation failed');
        validationError.name = 'SequelizeValidationError';
        validationError.errors = [
          { message: 'Email is invalid' }, // Missing path
          { path: 'name', message: 'Name is required' }
        ];

        ErrorMiddleware.handleValidationError(
          validationError,
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Validation failed',
          errors: [
            { field: undefined, message: 'Email is invalid' },
            { field: 'name', message: 'Name is required' }
          ]
        });
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle null error gracefully', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      ErrorMiddleware.handleError(
        null as any,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
              expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Unknown error',
          stack: 'No stack trace'
        });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle undefined error gracefully', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      ErrorMiddleware.handleError(
        undefined as any,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
              expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Unknown error',
          stack: 'No stack trace'
        });

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle errors with non-string messages', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const testError = new Error('Test error');
      testError.message = 123 as any; // Non-string message

      ErrorMiddleware.handleError(
        testError,
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 123,
        stack: testError.stack
      });

      process.env.NODE_ENV = originalEnv;
    });
  });
});
