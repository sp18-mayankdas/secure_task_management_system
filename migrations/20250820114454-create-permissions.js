'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("permissions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
        comment: "Primary key for permissions table"
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: "Unique permission name (e.g., create_task, delete_user)"
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Optional description of the permission"
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
    await queryInterface.dropTable("permissions");
  }
};
