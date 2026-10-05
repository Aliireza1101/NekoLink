"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        queryInterface.createTable("users", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
                allowNull: false,
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            plan_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "plans",
                    key: "id",
                },
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password_changed_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            password_reset_token: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            password_token_expires_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
        await queryInterface.createTable("plans", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                unique: true,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            max_upload_size: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            price: {
                type: Sequelize.INTEGER,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("users");
    },
};
