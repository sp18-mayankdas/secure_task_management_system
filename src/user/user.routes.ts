import { Router } from 'express';
import { UserController } from './user.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { UserValidator } from './user.validator';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.get('/', AuthMiddleware.requireAdmin, UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserValidator.validateUserUpdate, UserController.updateUser);
router.delete('/:id', AuthMiddleware.requireAdmin, UserController.deleteUser);

export default router;
