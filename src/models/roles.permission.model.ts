import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface rolespermissionAttributes {
  id: string;
  role_id: string;
  permission_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export type rolespermissionPk = "id";
export type rolespermissionId = rolespermission[rolespermissionPk];
export type rolespermissionOptionalAttributes = "created_at" | "updated_at";
export type rolespermissionCreationAttributes = Optional<
  rolespermissionAttributes,
  rolespermissionOptionalAttributes
>;

export class rolespermission
  extends Model<rolespermissionAttributes, rolespermissionCreationAttributes>
  implements rolespermissionAttributes
{
  id!: string;
  role_id!: string;
  permission_id!: string;

  created_at?: Date;
  updated_at?: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof rolespermission {
    return rolespermission.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: Sequelize.literal("uuid_generate_v4()"),
          primaryKey: true,
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
        permission_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "permissions",
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
        tableName: "rolespermissions",
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [{ name: "id" }],
          },
          {
            name: "role_permission_unique",
            unique: true,
            using: "BTREE",
            fields: [{ name: "role_id" }, { name: "permission_id" }],
          },
        ],
      }
    );
  }

  static associate(models: any) {
    const RolesPermission: typeof rolespermission = models.rolespermission;

    RolesPermission.belongsTo(models.role, {
      foreignKey: "role_id",
      as: "role",
    });

    RolesPermission.belongsTo(models.permission, {
      foreignKey: "permission_id",
      as: "permission",
    });
  }
}

export default rolespermission;
