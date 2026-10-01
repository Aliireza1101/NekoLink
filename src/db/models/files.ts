import {
    InferCreationAttributes,
    InferAttributes,
    Model,
    CreationOptional,
    DataTypes,
} from "sequelize";
import sequelize from "../config/database";

class File extends Model<InferAttributes<File>, InferCreationAttributes<File>> {
    declare id: CreationOptional<number>;
    declare originalName: string;
    declare filename: string;
    declare mimType: string;
    declare size: number;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt?: CreationOptional<Date>;
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
        mimType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: { type: DataTypes.INTEGER, allowNull: false },
        createdAt: {
            type: DataTypes.NOW,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize: sequelize,
        modelName: "files",
        timestamps: false,
        underscored: true,
    },
);

export default File;
