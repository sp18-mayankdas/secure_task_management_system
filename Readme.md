# Secure Task Management System

A comprehensive, secure task management system built with Node.js, Express, Sequelize, and PostgreSQL. Features JWT authentication, role-based access control (RBAC), and attribute-based access control (ABAC).

## 🚀 Features

### Authentication & Security
- **JWT-based Authentication**: Secure user login with JSON Web Tokens
- **Password Hashing**: Bcrypt password encryption
- **Security Headers**: Helmet.js for security HTTP headers
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Support**: Cross-origin resource sharing configuration

### Access Control
- **Role-Based Access Control (RBAC)**: User roles (Super Admin, Admin, Manager, Employee)
- **Attribute-Based Access Control (ABAC)**: Task priority control based on user roles
- **Dynamic Permissions**: Flexible permission system for future extensibility

### User Management
- **Self-Registration**: Users can register themselves (Employee role only)
- **Admin User Creation**: Super Admins can create users with any role
- **Profile Management**: Users can view and update their own profiles
- **Role Assignment**: Dynamic role assignment system

### Task Management
- **CRUD Operations**: Full task lifecycle management
- **Priority Control**: High priority tasks restricted to Managers and Admins
- **Assignment System**: Tasks assigned to specific users
- **Status Tracking**: Task status (pending, in_progress, completed)
- **Priority Levels**: Low, Medium, High priority support

### System Features
- **Comprehensive Logging**: Winston-based logging system
- **Error Handling**: Global error handling middleware
- **Input Validation**: Express-validator for request validation
- **Database Migrations**: Sequelize migrations for schema management
- **Seeding**: Pre-populated roles, permissions, and super admin

## 🏗️ Architecture

### Database Schema
```
users (id, name, email, password, role_id, created_at, updated_at)
roles (id, name, description, created_at, updated_at)
permissions (id, name, description, created_at, updated_at)
rolespermissions (id, role_id, permission_id, created_at, updated_at)
tasks (id, title, description, status, priority, due_date, assigned_to, created_at, updated_at)
```

### Role Hierarchy
1. **Super Admin**: Full system access, can create any user
2. **Admin**: User management + task management
3. **Manager**: Task management only
4. **Employee**: View and update assigned tasks only

### Permission System
- **user.create**: Create new users
- **user.read**: Read user information
- **user.update**: Update user information
- **user.delete**: Delete users
- **task.create**: Create new tasks
- **task.read**: Read task information
- **task.update**: Update task information
- **task.delete**: Delete tasks
- **role.manage**: Manage roles and permissions
- **system.admin**: Full system administration

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT, bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd secure_task_management
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=3000
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=secure_task_management
   DB_HOST=localhost
   DB_PORT=5432
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb secure_task_management
   
   # Run migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed:all
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User self-registration (Employee only)
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/admin/create-user` - Admin user creation

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create task (Manager/Admin only)
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin only)
- `GET /api/tasks/status/:status` - Get tasks by status
- `GET /api/tasks/priority/:priority` - Get tasks by priority

## 🔐 Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt
- Token-based session management

### Authorization
- Role-based access control (RBAC)
- Attribute-based access control (ABAC)
- Permission-based authorization

### Input Validation
- Request body validation
- SQL injection prevention
- XSS protection

### Rate Limiting
- API rate limiting (20 requests per 15 minutes)
- IP-based rate limiting
- Configurable limits

## 📊 Database Management

### Migrations
```bash
# Create new migration
npx sequelize-cli migration:generate --name migration-name

# Run migrations
npm run db:migrate

# Undo last migration
npx sequelize-cli db:migrate:undo
```

### Seeding
```bash
# Run all seeders
npm run db:seed:all

# Run specific seeder
npx sequelize-cli db:seed --seed seeder-name

# Undo seeding
npx sequelize-cli db:seed:undo:all
```

### Database Reset
```bash
# Complete database reset (DANGER: destroys all data)
npm run db:reset
```

## 🚨 Important Notes

1. **Super Admin Account**: The system creates a super admin account automatically:
   - Email: `superadmin@example.com`
   - Password: `SuperAdmin@123`

2. **Role Restrictions**: 
   - Self-registration is limited to Employee role only
   - High priority tasks can only be assigned by Managers and Admins
   - Employees can only view and update their assigned tasks

3. **Security**: 
   - Change default passwords in production
   - Use strong JWT secrets
   - Configure proper CORS settings for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.