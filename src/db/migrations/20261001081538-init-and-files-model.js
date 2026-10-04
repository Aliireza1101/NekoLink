"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("files", {
            id: {
                type: Sequelize.INTEGER.UNSIGNED,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
                unique: true,
            },
            original_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            filename: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            mime_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            size: { type: Sequelize.BIGINT, allowNull: false },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("files");
    },
};
