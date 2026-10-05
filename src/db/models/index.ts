import File from "./files";
import User from "./users";
import Plan from "./plans";

Plan.hasMany(User, { foreignKey: "planId", as: "users" });
User.belongsTo(Plan, { foreignKey: "planId", as: "plan" });

export { File, User, Plan };
