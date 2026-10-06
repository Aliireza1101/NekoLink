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
import bcrypt from "bcrypt";

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
            validate: {
                len: {
                    args: [3, 32],
                    msg: "First name must be between 3 to 32 characters",
                },
            },
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [3, 32],
                    msg: "Last name must be between 3 to 32 characters",
                },
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: {
                    msg: "Invalid Email",
                },
            },
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
            validate: {
                len: {
                    args: [8, 32],
                    msg: "Password must be at least 8 and characters long and shorter than 32 characters",
                },
            },
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
        hooks: {
            beforeCreate: async (user) => {
                user.password = await bcrypt.hash(user.password, 12);
            },
        },
    },
);

export default User;
