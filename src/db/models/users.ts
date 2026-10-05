import sequelize from "../config/database";
import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    CreationOptional,
    NonAttribute,
} from "sequelize";
import Plan from "./plans";

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare firstName: string;
    declare lastName: CreationOptional<string>;
    declare email: string;
    declare planId: CreationOptional<number>;
    declare plan: NonAttribute<Plan>;
    declare password: string;
    declare passwordChangedAt: CreationOptional<Date>;
    declare passwordResetToken: CreationOptional<string>;
    declare passwordTokenExpiresAt: CreationOptional<Date>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true,
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        planId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "plans",
                key: "id",
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        passwordChangedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        passwordResetToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        passwordTokenExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
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
        modelName: "users",
        timestamps: true,
        underscored: true,
    },
);

export default User;
