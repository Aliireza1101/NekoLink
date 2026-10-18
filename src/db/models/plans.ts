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
    declare storageSize: CreationOptional<number | null>;
    declare fileRetentionMinutes: CreationOptional<number | null>;
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
            unique: true,
        },
        maxUploadSize: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        storageSize: {
            type: DataTypes.BIGINT,
            allowNull: true,
        },
        fileRetentionMinutes: {
            type: DataTypes.INTEGER,
            allowNull: true,
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
