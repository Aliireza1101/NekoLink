import { File } from "../db/models";
import { Op } from "sequelize";
import fs from "fs/promises";

const deleteExpiredFiles = async () => {
    const files = await File.findAll({
        where: { expiresAt: { [Op.lt]: new Date() } },
        attributes: ["id", "filename"],
    });
    await Promise.all(
        files.map(async (file) => {
            try {
                await fs.rm(`uploads/tmp/${file.filename}`);
            } catch (err) {
                console.error(
                    `Error while deleting ${file.filename}\nError details: ${err}\n\n`,
                );
            }
            await file.destroy();
        }),
    );
};

export default deleteExpiredFiles;
