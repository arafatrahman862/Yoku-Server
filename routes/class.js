import express from "express";
import { CLASS } from "../src/database.js";
import { auth } from "../src/auth.js";
import { HttpError } from "../src/error.js";

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        res.json(await CLASS.find({}).toArray())
    } catch (err) {
        next(err);
    }
})

router.get('/popular', async (req, res, next) => {
    try {
        res.json(await CLASS.find({}).limit(6).sort({ number_of_students: -1 }).toArray())
    } catch (err) {
        next(err);
    }
})

router.get('/available/seats', async (req, res, next) => {
    try {
        let results = await CLASS.aggregate([
            { "$group": { "_id": null, "totalSeats": { "$sum": "$available_seat" } } }
        ]);
        res.json((await results.toArray())[0].totalSeats)
    } catch (err) {
        next(err);
    }
})

router.post('/add', auth, async (req, res, next) => {
    try {
        if (!['admin', 'instructor'].includes(req.authData.role)) {
            throw new HttpError(401, `only admin and instructor can add new class, But you are '${req.authData.role}'.`)
        }
        let { ...data } = req.body;
        await CLASS.insertOne({ ...data, status: req.authData.role ? 'approved' : 'pending' });
        res.json({ message: 'Done' })
    } catch (err) {
        next(err);
    }
})

export default router;