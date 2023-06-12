import express from "express";
import { STUDENT, CLASS } from "../src/database.js";
import { auth } from "../src/auth.js";
import { ObjectId } from "mongodb";

const router = express.Router();

router.get('/classes', auth, async (req, res, next) => {
    try {
        const user = await STUDENT.findOne({ _id: req.authData.email });
        const results = await Promise.all(
            user.joined_classes.map(_id => CLASS.findOne({ _id: new ObjectId(_id) }))
        );
        res.json(results)
    } catch (err) {
        next(err)
    }
})

router.post('/join', auth, async (req, res, next) => {
    try {
        const { class_id } = req.body;
        await STUDENT.updateOne(
            { _id: req.authData.email },
            { $addToSet: { joined_classes: class_id } }
        );
        res.json({ message: 'Done' })
    } catch (err) {
        next(err)
    }
})

export default router;