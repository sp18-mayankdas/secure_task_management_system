import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { AuthValidator } from './auth.validator';

const router = Router();

router.post('/register', AuthValidator.validateRegistration, AuthController.register);
router.post('/login', AuthValidator.validateLogin, AuthController.login);
router.get('/profile', AuthMiddleware.authenticate, AuthController.getProfile);
router.post('/admin/create-user', 
  AuthMiddleware.authenticate, 
  AuthMiddleware.requireAdmin, 
  AuthValidator.validateAdminUserCreation, 
  AuthController.createUser
);

export default router;
