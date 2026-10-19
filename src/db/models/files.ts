import {
    InferCreationAttributes,
    InferAttributes,
    Model,
    CreationOptional,
    DataTypes,
    NonAttribute,
    HasManyCreateAssociationMixin,
} from "sequelize";
import sequelize from "../config/database";

import DownloadLink from "./downloadLinks";
import User from "./users";

class File extends Model<InferAttributes<File>, InferCreationAttributes<File>> {
    declare id: CreationOptional<number>;
    declare originalName: string;
    declare filename: string;
    declare mimeType: string;
    declare size: number;
    declare expiresAt: CreationOptional<Date>;
    declare userId: CreationOptional<number>;
    declare downloadLinks: NonAttribute<DownloadLink[]>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt?: CreationOptional<Date>;
    declare deletedAt: CreationOptional<Date>;

    declare user: NonAttribute<User>;
    declare createDownloadLink: HasManyCreateAssociationMixin<DownloadLink>;
}

File.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            unique: true,
            primaryKey: true,
        },
        originalName: {
            type: DataTypes.STRING,
            unique: false,
            allowNull: false,
        },
        filename: { type: DataTypes.STRING, unique: true, allowNull: false },
        mimeType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: { type: DataTypes.BIGINT, allowNull: false },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: true,
            },
        },
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize: sequelize,
        modelName: "files",
        timestamps: true,
        underscored: true,
        paranoid: true,
        defaultScope: {
            attributes: { exclude: ["deletedAt", "updatedAt", "userId"] },
        },
    },
);

export default File;
