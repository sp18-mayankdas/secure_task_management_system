'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
    async up(queryInterface) {
        const passwordHashed = await bcrypt.hash("SuperAdmin@123", 10);

        await queryInterface.bulkInsert("users", [
            {
                id: "a190f1ee-6c54-4b01-90e6-d701748f0850",
                name: "Super Admin",
                email: "superadmin@example.com",
                password: passwordHashed,
                role_id: "d290f1ee-6c54-4b01-90e6-d701748f0851",
                created_at: new Date(),
                updated_at: new Date(),
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete("users", { email: "superadmin@example.com" }, {});
    },
};
