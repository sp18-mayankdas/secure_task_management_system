import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../config/jwt';
import logger from '../config/logger';
import { user as User } from '../models/user.model';
import { role as Role } from '../models/role.model';

export class AuthController {

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, roleId } = req.body;
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role_id: roleId
      });

      const userRole = await Role.findByPk(roleId);
      logger.info('User registered successfully', {
        userId: user.id,
        email: user.email,
        role: userRole?.name,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRole?.name
        }
      });
    } catch (error) {
      logger.error('Registration error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip
      });
      res.status(500).json({
        success: false,
        message: 'Failed to register user'
      });
    }
  }

  static async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, roleId } = req.body;
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role_id: roleId
      });

      // Get user role details
      const userRole = await Role.findByPk(roleId);

      logger.info('Admin created user successfully', {
        createdUserId: user.id,
        email: user.email,
        role: userRole?.name,
        adminUserId: req.user?.userId,
        ip: req.ip
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRole?.name
        }
      });
    } catch (error) {
      logger.error('Admin user creation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminUserId: req.user?.userId,
        ip: req.ip
      });
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }

  /**
   * User login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: 'userRole' }]
      });

      if (!user) {
        logger.warn('Login failed: User not found', { email, ip: req.ip });
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        logger.warn('Login failed: Invalid password', { email, ip: req.ip });
        res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
        return;
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.userRole?.name || 'unknown'
      });

      logger.info('User logged in successfully', {
        userId: user.id,
        email: user.email,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.userRole?.name
          }
        }
      });
    } catch (error) {
      logger.error('Login error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip
      });
      res.status(500).json({
        success: false,
        message: 'Failed to login'
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const user = await User.findByPk(req.user.userId, {
        include: [{ model: Role, as: 'userRole' }],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      logger.info('Profile retrieved successfully', {
        userId: user.id,
        ip: req.ip
      });

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.userRole?.name
        }
      });
    } catch (error) {
      logger.error('Get profile error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: req.ip
      });
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }
}
