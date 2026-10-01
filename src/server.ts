import { config } from "dotenv";
config();

import app from "./app";

const main = async () => {
    app.listen(process.env.PORT);
};

main()
    .then(() => {
        console.log(`Server is running on PORT ${process.env.PORT}`);
    })
    .catch((err) => {
        console.error(`Something went wrong running the server:\n${err}`);
    });
