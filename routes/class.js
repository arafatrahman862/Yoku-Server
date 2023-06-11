import express from "express";
import { CLASS } from "../src/database.js";

const router = express.Router();

router.get('/class', async (req, res, next) => {
    try {
        res.json(await CLASS.find({}).toArray())
    } catch (err) {
        next(err);
    }
})

export default router;