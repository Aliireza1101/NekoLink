import express from "express";
import { globalErrorHandler } from "./contorllers/errors";
import filesRouter from "./routs/files";

const app = express();

app.use("/api/files", filesRouter);

// Error handler
app.use(globalErrorHandler);

export default app;
