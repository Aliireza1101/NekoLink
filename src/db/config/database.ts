import { Sequelize } from "sequelize";
import configs from "./config";

const env = (process.env.NODE_ENV ?? "development") as keyof typeof configs;
const config = {
    ...configs[env],
};

const sequelize = new Sequelize(config as any);

export default sequelize;
