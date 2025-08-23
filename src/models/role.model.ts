import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

export interface roleAttributes {
  id: string;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type rolePk = "id";
export type roleId = role[rolePk];
export type roleOptionalAttributes = "description" | "created_at" | "updated_at";
export type roleCreationAttributes = Optional<roleAttributes, roleOptionalAttributes>;

export class role extends Model<roleAttributes, roleCreationAttributes> implements roleAttributes {
  id!: string;
  name!: string;
  description?: string;

  created_at?: Date;
  updated_at?: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof role {
    return role.init(
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
        tableName: "roles",
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
    const Role: typeof role = models.role;

    Role.hasMany(models.user, { foreignKey: "role_id", as: "users" });
    Role.belongsToMany(models.permission, {
      through: models.rolespermission,
      foreignKey: "role_id",
      otherKey: "permission_id",
      as: "permissions",
    });
  }
}

export default role;
