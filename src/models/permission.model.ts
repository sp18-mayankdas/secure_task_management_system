import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface permissionAttributes {
  id: string;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type permissionPk = "id";
export type permissionId = permission[permissionPk];
export type permissionOptionalAttributes =
  | "description"
  | "created_at"
  | "updated_at";
export type permissionCreationAttributes = Optional<
  permissionAttributes,
  permissionOptionalAttributes
>;

export class permission
  extends Model<permissionAttributes, permissionCreationAttributes>
  implements permissionAttributes
{
  id!: string;
  name!: string;
  description?: string;

  created_at?: Date;
  updated_at?: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof permission {
    return permission.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: Sequelize.literal("uuid_generate_v4()"),
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        description: {
          type: DataTypes.STRING(255),
          allowNull: true,
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
        tableName: "permissions",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "name",
            unique: true,
            using: "BTREE",
            fields: [{ name: "name" }],
          },
        ],
      }
    );
  }

  static associate(models: any) {
    const Permission: typeof permission = models.permission;

    Permission.belongsToMany(models.role, {
      through: models.rolespermission,
      foreignKey: "permission_id",
      otherKey: "role_id",
      as: "roles",
    });
  }
}

export default permission;
