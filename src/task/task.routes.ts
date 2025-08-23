import { Router } from 'express';
import { TaskController } from './task.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ABACMiddleware } from '../middleware/abac.middleware';
import { TaskValidator } from './task.validator';

const router = Router();

router.use(AuthMiddleware.authenticate);
router.get('/', TaskController.getAllTasks);
router.get('/:id', ABACMiddleware.canViewTask, TaskController.getTaskById);
router.post('/',
  AuthMiddleware.requireManager,
  TaskValidator.validateTaskCreate,
  ABACMiddleware.canAssignHighPriority,
  TaskController.createTask
);
router.put('/:id',
  TaskValidator.validateTaskUpdate,
  ABACMiddleware.canUpdateTask,
  ABACMiddleware.canAssignHighPriority,
  TaskController.updateTask
);
router.delete('/:id', AuthMiddleware.requireAdmin, TaskController.deleteTask);
router.get('/status/:status', TaskController.getTasksByStatus);
router.get('/priority/:priority', TaskController.getTasksByPriority);

export default router;
