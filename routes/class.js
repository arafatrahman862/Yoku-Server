import express from "express";
import { CLASS } from "../src/database.js";

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        res.json(await CLASS.find({}).toArray())
    } catch (err) {
        next(err);
    }
})

router.post('/add', async (req, res, next) => {
    try {
        await CLASS.insertOne(req.body);
        res.json({ message: 'Done' })
    } catch (err) {
        next(err);
    }
})

export default router;