import express from "express";
import { ADMIN_OR_INSTRUCTOR } from "../src/database.js";

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        res.json(await ADMIN_OR_INSTRUCTOR.find({ role: 'instructor' }).sort({ number_of_students: -1 }).toArray())
    } catch (err) {
        next(err);
    }
})

export default router;