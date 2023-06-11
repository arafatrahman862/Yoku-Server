import express from "express";
import { ADMIN } from "../src/database.js";

const router = express.Router();

router.post('/admin/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // TODO: Verify email and pass
        await ADMIN.insertOne({ _id: email, password });
    } catch (err) {
        next(err);
    }
})

router.post('/admin/login', async (req, res, next) => {
    try {
    } catch (err) {
        next(err);
    }
})

export default router;