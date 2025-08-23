import sequelize from '../config/database';

// Import models
import user from "./user.model";
import role from "./role.model";
import permission from "./permission.model";
import rolespermission from "./roles.permission.model";
import Task from "./task.model";

// Initialize models
const User = user.initModel(sequelize);
const Role = role.initModel(sequelize);
const Permission = permission.initModel(sequelize);
const RolesPermission = rolespermission.initModel(sequelize);
const TaskModel = Task.initModel(sequelize);

// Set up associations
User.associate({ user: User, role: Role, task: TaskModel });
Role.associate({ role: Role, user: User, permission: Permission, rolespermission: RolesPermission });
Permission.associate({ permission: Permission, role: Role, rolespermission: RolesPermission });
RolesPermission.associate({ rolespermission: RolesPermission, role: Role, permission: Permission });
TaskModel.associate({ task: TaskModel, user: User });

const db = {
  sequelize,
  Sequelize: sequelize.constructor,
  user: User,
  role: Role,
  permission: Permission,
  rolespermission: RolesPermission,
  task: TaskModel,
};

export default db;
