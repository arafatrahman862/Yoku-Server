import express from "express";
import cors from "cors";

import { } from "./src/database.js";
import { } from "./src/auth.js";
import { PORT } from "./src/config.js";
import { errorHandler } from "./src/error.js";

import classRouter from "./routes/class.js";

const app = express();

app.listen(PORT, () => console.info(`listening on port ${PORT}`));

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.send('assingment12'))
app.use("/", classRouter);

// catch 404 and forward to `errorHandler`
app.use((_req, _res, next) => next(404));
app.use(errorHandler);