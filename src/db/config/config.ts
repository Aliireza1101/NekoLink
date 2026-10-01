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
};
