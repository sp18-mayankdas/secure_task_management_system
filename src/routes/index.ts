import express from "express";
import authRoutes from "../auth/auth.routes";
import userRoutes from "../user/user.routes";
import taskRoutes from "../task/task.routes";

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

export default router;