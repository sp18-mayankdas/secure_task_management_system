'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("roles", [
      {
        id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        name: "Super Admin",
        description: "Super admin with all permissions",
        created_at: new Date(),
        updated_at: new Date(),
      },

    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", {name: "Super Admin"}, {});
  },
};
