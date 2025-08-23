'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("tasks", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        comment: "Primary key for tasks table"
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: "Task title"
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Detailed task description"
      },
      status: {
        type: Sequelize.ENUM("pending", "in_progress", "completed"),
        allowNull: false,
        defaultValue: "pending",
        comment: "Task status"
      },
      priority: {
        type: Sequelize.ENUM("low", "medium", "high"),
        allowNull: false,
        defaultValue: "medium",
        comment: "Task priority: low, medium, or high"
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "deadline for the task"
      },
      assigned_to: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "User ID to whom the task is assigned"
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        comment: 'Record creation timestamp'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        comment: 'Record last update timestamp'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("tasks");
  }
};
