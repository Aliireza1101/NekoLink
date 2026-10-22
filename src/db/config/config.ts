// Configuration file for sequelize orm
// in current stage we are just developing so i wont use a dedicated database
// sqlite is enough for now.
import { config } from "dotenv";

config({ path: "./.env" });

export = {
    development: {
        dialect: "sqlite",
        storage: process.env.DB_HOST,
        logging: console.log,
    },
    production: {
        database: process.env.DB,
        dialect: process.env.DB_DIALECT,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        dialectOptions: {
            ssl: { rejectUnauthorized: false },
        },
        logging: false,
    },
};
