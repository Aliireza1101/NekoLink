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
                unique: true,
                allowNull: false,
            },
            filename: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            mim_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            size: { type: Sequelize.INTEGER, allowNull: false },
            created_at: {
                type: Sequelize.NOW,
                allowNull: false,
            },
            updated_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("files");
    },
};
