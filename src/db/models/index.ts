import File from "./files";
import User from "./users";
import Plan from "./plans";
import DownloadLink from "./downloadLinks";

Plan.hasMany(User, { foreignKey: "planId", as: "users" });
User.belongsTo(Plan, { foreignKey: "planId", as: "plan" });

File.hasMany(DownloadLink, { foreignKey: "fileId", as: "downloadLinks" });
DownloadLink.belongsTo(File, { foreignKey: "fileId", as: "file" });

export { File, User, Plan, DownloadLink };
