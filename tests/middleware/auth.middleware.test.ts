import { AuthMiddleware } from '../../src/middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../../src/config/jwt';

// Mock dependencies
jest.mock('../../src/config/jwt');
jest.mock('../../src/config/logger');

describe('AuthMiddleware', () => {
  let mockRequest: Partial<Request> & { user?: any };
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
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

  describe('authenticate', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should call next() when valid JWT token is provided', () => {
        const mockToken = 'valid-jwt-token';
        const mockDecoded = {
          userId: 'user-123',
          email: 'test@example.com',
          role: 'admin'
        };
        
        mockRequest.headers = {
          authorization: `Bearer ${mockToken}`
        };
        
        (verifyToken as jest.Mock).mockReturnValue(mockDecoded);

        AuthMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

        expect(verifyToken).toHaveBeenCalledWith(mockToken);
        expect(mockRequest.user).toEqual(mockDecoded);
        expect(mockNext).toHaveBeenCalled();
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 401 when no authorization header is provided', () => {
        mockRequest.headers = {};

        AuthMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Access token required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 when authorization header does not start with Bearer', () => {
        mockRequest.headers = {
          authorization: 'Invalid token'
        };

        AuthMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Access token required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 when JWT verification fails', () => {
        const mockToken = 'invalid-jwt-token';
        
        mockRequest.headers = {
          authorization: `Bearer ${mockToken}`
        };
        
        (verifyToken as jest.Mock).mockImplementation(() => {
          throw new Error('Invalid token');
        });

        AuthMiddleware.authenticate(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Invalid or expired token'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('requireRole', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should call next() when user has required role', () => {
        mockRequest.user = {
          userId: 'user-123',
          role: 'admin'
        };

        const middleware = AuthMiddleware.requireRole(['admin', 'manager']);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 401 when user is not authenticated', () => {
        mockRequest.user = undefined;

        const middleware = AuthMiddleware.requireRole(['admin']);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Authentication required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 when user does not have required role', () => {
        mockRequest.user = {
          userId: 'user-123',
          role: 'employee'
        };

        const middleware = AuthMiddleware.requireRole(['admin', 'manager']);
        middleware(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Insufficient permissions'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('requireAdmin', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should call next() when user is admin', () => {
        mockRequest.user = {
          userId: 'user-123',
          role: 'admin'
        };

        AuthMiddleware.requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 403 when user is not admin', () => {
        mockRequest.user = {
          userId: 'user-123',
          role: 'manager'
        };

        AuthMiddleware.requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Insufficient permissions'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });

  describe('requireManager', () => {
    // Positive test cases
    describe('Positive Cases', () => {
      it('should call next() when user is admin', () => {
        mockRequest.user = {
          userId: 'user-123',
          role: 'admin'
        };

        AuthMiddleware.requireManager(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should call next() when user is manager', () => {
        mockRequest.user = {
          userId: 'user-123',
          role: 'manager'
        };

        AuthMiddleware.requireManager(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    // Negative test cases
    describe('Negative Cases', () => {
      it('should return 403 when user is employee', () => {
        mockRequest.user = {
          userId: 'user-123',
          role: 'employee'
        };

        AuthMiddleware.requireManager(mockRequest as Request, mockResponse as Response, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          success: false,
          message: 'Insufficient permissions'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });
  });
});
