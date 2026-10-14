import express from "express";
import { globalErrorHandler } from "./controllers/errors";
import filesRouter from "./routes/files";
import plansRouter from "./routes/plans";
import authRouter from "./routes/auth";
import userRouter from "./routes/users";
import downloadLinkRouter from "./routes/downloadLinks";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/files", filesRouter);
app.use("/api/plans", plansRouter);
app.use("/api/download-links", downloadLinkRouter);

// Error handler
app.use(globalErrorHandler);

export default app;
