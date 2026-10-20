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
        url: process.env.DATABASE_URL,
        dialect: "postgres",
        logging: false,
        dialectOptions:
            process.env.DB_SSL === "true"
                ? {
                      ssl: {
                          require: true,
                      },
                  }
                : {},
    },
};
