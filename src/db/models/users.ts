import sequelize from "../config/database";
import {
    DataTypes,
    InferAttributes,
    InferCreationAttributes,
    Model,
    CreationOptional,
    NonAttribute,
    BelongsToGetAssociationMixin,
} from "sequelize";
import Plan from "./plans";
import File from "./files";
import bcrypt from "bcrypt";
import crypto from "crypto";

const roles = ["USER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>;
    declare firstName: string;
    declare lastName: CreationOptional<string>;
    declare email: string;
    declare role: CreationOptional<Role>;
    declare planId: CreationOptional<number>;
    declare plan: NonAttribute<Plan>;
    declare password: string;
    declare passwordChangedAt: CreationOptional<Date>;
    declare passwordResetToken: CreationOptional<string | null>;
    declare passwordTokenExpiresAt: CreationOptional<Date | null>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare files: NonAttribute<File[]>;

    declare getPlan: BelongsToGetAssociationMixin<Plan>;

    async matchPassword(candidatePassword: string) {
        return await bcrypt.compare(candidatePassword, this.password);
    }

    hasPasswordChanged(iat: number) {
        if (!this.passwordChangedAt) return false;

        return this.passwordChangedAt.getTime() / 1000 > iat;
    }

    generatePasswordResetToken() {
        const token = crypto.randomBytes(32).toString("hex");
        this.passwordResetToken = crypto.hash("sha256", token);

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);
        this.passwordTokenExpiresAt = expiresAt;
        return token;
    }
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
        role: {
            type: DataTypes.ENUM(...roles),
            allowNull: false,
            defaultValue: "USER",
            validate: { isIn: roles as readonly any[] },
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
                    msg: "Password must be at least 8 characters long and shorter than 32 characters",
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
            beforeUpdate(user) {
                if (user.changed("password")) {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() - 1);
                    user.passwordChangedAt = now;
                }
            },
            async beforeSave(user, options) {
                if (user.isNewRecord || user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 12);

                    // Somehow ORM validates once before (beforeSave) hook and once after it?
                    // What the actual fuck was going on
                    options.validate = false; // off because it is has been validated before and it's gonna validate again after this hook
                }
            },
            async beforeCreate(user) {
                const freePlan = await Plan.findOne({
                    where: { title: "free" },
                });
                user.planId = freePlan?.id!;
            },
        },
        defaultScope: {
            attributes: {
                exclude: [
                    "password",
                    "passwordChangedAt",
                    "passwordResetToken",
                    "passwordTokenExpiresAt",
                    "planId",
                ],
            },
        },
    },
);

export default User;
