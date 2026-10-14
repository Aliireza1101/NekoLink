"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("files", "user_id", {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: true,
            onDelete:"CASCADE",
            onUpdate:"CASCADE",
            references: { model: "users", key: "id", },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn("files", "user_id");
    },
};
