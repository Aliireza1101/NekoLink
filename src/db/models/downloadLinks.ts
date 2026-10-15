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
import bcrypt from "bcrypt";
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
    declare password: CreationOptional<string>;
    declare fileId: CreationOptional<number>;
    declare file: NonAttribute<File>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    async matchPassword(candidatePassword: string) {
        return await bcrypt.compare(candidatePassword, this.password);
    }

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
        password: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                len: {
                    args: [8, 32],
                    msg: "Password must be at least 8 characters long and shorter than 32 characters",
                },
            },
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
            async beforeSave(downloadLink, options) {
                if (
                    (downloadLink.isNewRecord ||
                        downloadLink.changed("password")) &&
                    downloadLink.password
                ) {
                    downloadLink.password = await bcrypt.hash(
                        downloadLink.password,
                        12,
                    );

                    options.validate = false;
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
