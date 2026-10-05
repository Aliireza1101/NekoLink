import sequelize from "../config/database";
import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    CreationOptional,
    NonAttribute,
} from "sequelize";
import User from "./users";

class Plan extends Model<InferAttributes<Plan>, InferCreationAttributes<Plan>> {
    declare id: CreationOptional<number>;
    declare title: string;
    declare maxUploadSize: number;
    declare price: number;
    declare users: NonAttribute<User[]>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

Plan.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        maxUploadSize: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize: sequelize,
        modelName: "plans",
        timestamps: true,
        underscored: true,
    },
);

export default Plan;
