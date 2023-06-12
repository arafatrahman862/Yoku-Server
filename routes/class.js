import express from "express";
import { CLASS } from "../src/database.js";
import { auth } from "../src/auth.js";
import { HttpError } from "../src/error.js";

const router = express.Router();

router.get('/', async (_req, res, next) => {
    try {
        res.json(await CLASS.find({}).toArray())
    } catch (err) {
        next(err);
    }
})

router.post('/', async (req, res, next) => {
    try {
        let { find, limit, sort, skip } = req.body;
        res.json(await CLASS.find(find).limit(limit).sort(sort).skip(skip).toArray())
    } catch (err) {
        next(err);
    }
})

router.get('/available/seats', async (_req, res, next) => {
    try {
        const cursor = await CLASS.aggregate([
            { "$group": { "_id": null, "totalSeats": { "$sum": "$available_seat" } } }
        ]);
        res.json((await cursor.toArray())[0].totalSeats)
    } catch (err) {
        next(err);
    }
})

router.post('/approve', auth, async (_req, res, next) => {
    try {
        if (req.authData.role != 'admin') {
            throw new HttpError(401, `only admin can approve new class request, But you are '${req.authData.role}.`)
        }
        const { class_id, status } = req.body;
        if (['approved', 'denied'].includes(status)) {
            throw new HttpError(403, `Expected action: 'approved', 'denied', But got '${status}.`)
        }
        await CLASS.updateOne({ _id: class_id }, { $set: { status } });
        res.json({ message: 'done' });
    } catch (err) {
        next(err);
    }
})

router.post('/add', auth, async (req, res, next) => {
    try {
        if (!['admin', 'instructor'].includes(req.authData.role)) {
            throw new HttpError(401, `only admin and instructor can add new class, But you are '${req.authData.role}.`)
        }
        const { ...data } = req.body;
        await CLASS.insertOne({
            ...data,
            status: req.authData.role ? 'approved' : 'pending',
            number_of_students: 0,
        });
        res.json({ message: 'Done' })
    } catch (err) {
        next(err);
    }
})

export default router;