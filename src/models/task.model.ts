import * as Sequelize from "sequelize";
import { DataTypes, Model, Optional } from "sequelize";

interface TaskAttributes {
  id: string;
  title: string;
  description?: string | null;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: Date | null;
  assigned_to: string;
  created_at?: Date;
  updated_at?: Date;
}

interface TaskCreationAttributes
  extends Optional<
    TaskAttributes,
    "id" | "description" | "due_date" | "created_at" | "updated_at"
  > { }

export class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes {
  public id!: string;
  public title!: string;
  public description!: string | null;
  public status!: "pending" | "in_progress" | "completed";
  public priority!: "low" | "medium" | "high";
  public due_date!: Date | null;
  public assigned_to!: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof Task {
    return Task.init(
      {
        id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM("pending", "in_progress", "completed"),
          allowNull: false,
          defaultValue: "pending",
        },
        priority: {
          type: DataTypes.ENUM("low", "medium", "high"),
          allowNull: false,
          defaultValue: "medium",
        },
        due_date: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        assigned_to: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
        tableName: "tasks",
        timestamps: false,
      }
    );
  }

  static associate(models: any) {
    Task.belongsTo(models.user, { foreignKey: "assigned_to", as: "assignee" });
  }
}
