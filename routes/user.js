import express, { json } from "express";
import { ADMIN } from "../src/database.js";

const router = express.Router();

router.get('/', async (_req, res, next) => {
    try {
        res.json(await ADMIN.find({}).toArray())
    } catch (err) {
        next(err);
    }
})

export default router;