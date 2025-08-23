'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("roles", {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        comment: "Primary key for roles table"
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        comment: "role name (admin, manager, employee)"
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: "description of the role"
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Record creation timestamp'
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Record last update timestamp'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("roles");
  }
};
