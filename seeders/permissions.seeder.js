'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("permissions", [
      // User management permissions
      {
        id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "user.create",
        description: "Create new users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
        name: "user.read",
        description: "Read user information",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "c3d4e5f6-g7h8-9012-cdef-345678901234",
        name: "user.update",
        description: "Update user information",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "d4e5f6g7-h8i9-0123-defg-456789012345",
        name: "user.delete",
        description: "Delete users",
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Task management permissions
      {
        id: "e5f6g7h8-i9j0-1234-efgh-567890123456",
        name: "task.create",
        description: "Create new tasks",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "f6g7h8i9-j0k1-2345-fghi-678901234567",
        name: "task.read",
        description: "Read task information",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "g7h8i9j0-k1l2-3456-ghij-789012345678",
        name: "task.update",
        description: "Update task information",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "h8i9j0k1-l2m3-4567-hijk-890123456789",
        name: "task.delete",
        description: "Delete tasks",
        created_at: new Date(),
        updated_at: new Date(),
      },
      // Role management permissions
      {
        id: "i9j0k1l2-m3n4-5678-ijkl-901234567890",
        name: "role.manage",
        description: "Manage roles and permissions",
        created_at: new Date(),
        updated_at: new Date(),
      },
      // System permissions
      {
        id: "j0k1l2m3-n4o5-6789-jklm-012345678901",
        name: "system.admin",
        description: "Full system administration",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("permissions", {}, {});
  },
};
