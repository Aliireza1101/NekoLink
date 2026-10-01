import { config } from "dotenv";
config();

import app from "./app";
import sequelize from "./db/config/database";

const main = async () => {
    console.log("Connecting to database");
    sequelize.authenticate();
    console.log("Connected to database");
    app.listen(process.env.PORT);
};

main()
    .then(() => {
        console.log(`Server is running on PORT ${process.env.PORT}`);
    })
    .catch((err) => {
        console.error(`Something went wrong running the server:\n${err}`);
    });
