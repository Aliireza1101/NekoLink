import cron from "node-cron";
import deleteExpiredFiles from "./jobs/deleteExpiredFiles";

cron.schedule("*/15  * * * *", deleteExpiredFiles);
