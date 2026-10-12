import {
    InferCreationAttributes,
    InferAttributes,
    Model,
    CreationOptional,
    DataTypes,
    NonAttribute,
} from "sequelize";
import sequelize from "../config/database";

import crypto from "node:crypto";
import File from "./files";

class DownloadLink extends Model<
    InferAttributes<DownloadLink>,
    InferCreationAttributes<DownloadLink>
> {
    declare id: CreationOptional<number>;
    declare token: CreationOptional<string>;
    declare isActive: CreationOptional<boolean>;
    declare expiresAt: CreationOptional<Date>;
    declare maxDownloads: CreationOptional<number>;
    declare downloadCount: CreationOptional<number>;
    declare fileId: CreationOptional<number>;
    declare file: NonAttribute<File>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
}

DownloadLink.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
        },
        token: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        maxDownloads: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
        },
        downloadCount: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        fileId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            references: {
                model: "files",
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
    },
    {
        sequelize,
        modelName: "download_links",
        timestamps: true,
        underscored: true,
        hooks: {
            beforeValidate(downloadLink) {
                downloadLink.token = crypto.randomBytes(5).toString("hex");
            },
        },
    },
);

export default DownloadLink;
