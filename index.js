import express from "express";
import cors from "cors";

import { } from "./src/database.js";
import { } from "./src/auth.js";
import { PORT } from "./src/config.js";
import { errorHandler } from "./src/error.js";

import classRouter from "./routes/class.js";
import authRouter from "./routes/auth.js";
import studentRouter from "./routes/student.js";

const app = express();

app.listen(PORT, () => console.info(`listening on port ${PORT}`));

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/student", studentRouter);
app.use("/class", classRouter);

// catch 404 and forward to `errorHandler`
app.use((_req, _res, next) => next(404));
app.use(errorHandler);