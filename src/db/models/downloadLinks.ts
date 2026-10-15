import {
    InferCreationAttributes,
    InferAttributes,
    Model,
    CreationOptional,
    DataTypes,
    NonAttribute,
    Op,
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
    declare isActive: CreationOptional<boolean | undefined>;
    declare expiresAt: CreationOptional<Date | null | undefined>;
    declare maxDownloads: CreationOptional<number | null | undefined>;
    declare downloadCount: CreationOptional<number>;
    declare fileId: CreationOptional<number>;
    declare file: NonAttribute<File>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    generateToken() {
        return crypto.randomBytes(5).toString("hex");
    }
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
            validate: {
                notEmpty: true,
                len: [1, 64],
            },
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            validate: {
                isDate: true,
            },
        },
        maxDownloads: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            validate: {
                min: 1,
            },
        },
        downloadCount: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
            },
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
                if (!downloadLink.token) {
                    downloadLink.token = downloadLink.generateToken();
                }
            },
        },
        scopes: {
            notExpired: () => ({
                where: {
                    [Op.or]: [
                        { expiresAt: null },
                        { expiresAt: { [Op.gt]: new Date() } },
                    ],
                },
            }),
        },
    },
);

export default DownloadLink;
