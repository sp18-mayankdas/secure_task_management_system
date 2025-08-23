import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface userAttributes {
  id?: string;
  name: string;
  email: string;
  password: string;
  role_id: string;     
  created_at?: Date;
  updated_at?: Date;
}

export interface userWithRole extends userAttributes {
  userRole?: {
    id: string;
    name: string;
    description?: string;
  };
}

export type userPk = "id";
export type userId = user[userPk];
export type userOptionalAttributes = "created_at" | "updated_at";
export type userCreationAttributes = Optional<userAttributes, userOptionalAttributes>;

export class user extends Model<userAttributes, userCreationAttributes> implements userAttributes {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  role_id!: string;

  created_at?: Date;
  updated_at?: Date;

  // Virtual fields for associations
  userRole?: any;

  static initModel(sequelize: Sequelize.Sequelize): typeof user {
    return user.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        role_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "roles",
            key: "id",
          },
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      },
      {
        sequelize,
        tableName: "users",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "email",
            unique: true,
            using: "BTREE",
            fields: [{ name: "email" }],
          },
          {
            name: "role_id",
            using: "BTREE",
            fields: [{ name: "role_id" }],
          },
        ],
      }
    );
  }

  static associate(models: any) {
    const User: typeof user = models.user;

    User.belongsTo(models.role, { foreignKey: "role_id", as: "userRole" });
    User.hasMany(models.task, { foreignKey: "assigned_to", as: "tasks" });
  }
}

export default user;
