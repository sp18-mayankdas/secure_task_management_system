'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("rolespermissions", [
      // Super Admin - All permissions
      {
        id: "super-admin-user-create",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-user-read",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-user-update",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "c3d4e5f6-g7h8-9012-cdef-345678901234",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-user-delete",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "d4e5f6g7-h8i9-0123-defg-456789012345",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-task-create",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "e5f6g7h8-i9j0-1234-efgh-567890123456",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-task-read",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "f6g7h8i9-j0k1-2345-fghi-678901234567",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-task-update",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "g7h8i9j0-k1l2-3456-ghij-789012345678",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-task-delete",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "h8i9j0k1-l2m3-4567-hijk-890123456789",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-role-manage",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "i9j0k1l2-m3n4-5678-ijkl-901234567890",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "super-admin-system-admin",
        role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
        permission_id: "j0k1l2m3-n4o5-6789-jklm-012345678901",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Admin - User management + task management
      {
        id: "admin-user-create",
        role_id: "e390f1ee-6c54-4b01-90e6-d701748f0852",
        permission_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "admin-user-read",
        role_id: "e390f1ee-6c54-4b01-90e6-d701748f0852",
        permission_id: "b2c3d4e5-f6g7-8901-bcde-f23456789012",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "admin-user-update",
        role_id: "e390f1ee-6c54-4b01-90e6-d701748f0852",
        permission_id: "c3d4e5f6-g7h8-9012-cdef-345678901234",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "admin-user-delete",
        role_id: "e390f1ee-6c54-4b01-90e6-d701748f0852",
        permission_id: "d4e5f6g7-h8i9-0123-defg-456789012345",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "admin-task-create",
        role_id: "e390f1ee-6c54-4b01-90e6-d701748f0852",
        permission_id: "e5f6g7h8-i9j0-1234-efgh-567890123456",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "admin-task-read",
        role_id: "e390f1ee-6c54-4b01-90e6-d701748f0852",
        permission_id: "f6g7h8i9-j0k1-2345-fghi-678901234567",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "admin-task-update",
        role_id: "e390f1ee-6c54-4b01-90e6-d701748f0852",
        permission_id: "g7h8i9j0-k1l2-3456-ghij-789012345678",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "admin-task-delete",
        role_id: "e390f1ee-6c54-4b01-90e6-d701748f0852",
        permission_id: "h8i9j0k1-l2m3-4567-hijk-890123456789",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Manager - Task management only
      {
        id: "manager-task-create",
        role_id: "f490f1ee-6c54-4b01-90e6-d701748f0853",
        permission_id: "e5f6g7h8-i9j0-1234-efgh-567890123456",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "manager-task-read",
        role_id: "f490f1ee-6c54-4b01-90e6-d701748f0853",
        permission_id: "f6g7h8i9-j0k1-2345-fghi-678901234567",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "manager-task-update",
        role_id: "f490f1ee-6c54-4b01-90e6-d701748f0853",
        permission_id: "g7h8i9j0-k1l2-3456-ghij-789012345678",
        created_at: new Date(),
        updated_at: new Date(),
      },

      // Employee - Basic task permissions (read own tasks, update own tasks)
      {
        id: "employee-task-read",
        role_id: "g590f1ee-6c54-4b01-90e6-d701748f0854",
        permission_id: "f6g7h8i9-j0k1-2345-fghi-678901234567",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: "employee-task-update",
        role_id: "g590f1ee-6c54-4b01-90e6-d701748f0854",
        permission_id: "g7h8i9j0-k1l2-3456-ghij-789012345678",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("rolespermissions", {}, {});
  },
};
