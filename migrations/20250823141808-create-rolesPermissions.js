'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("rolespermissions", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("uuid_generate_v4()"),
        primaryKey: true,
        allowNull: false,
        comment: "Primary key for role_permissions mapping"
      },
      role_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "roles",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "Role ID"
      },
      permission_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "permissions",
          key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        comment: "Permission ID"
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
    await queryInterface.dropTable("rolespermissions");
  }
};
