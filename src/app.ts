import express from "express";
import { globalErrorHandler } from "./controllers/errors";
import filesRouter from "./routes/files";
import plansRouter from "./routes/plans";

const app = express();
app.use(express.json());

app.use("/api/files", filesRouter);
app.use("/api/plans", plansRouter);

// Error handler
app.use(globalErrorHandler);

export default app;
