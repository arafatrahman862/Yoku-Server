import express from "express";
import { ADMIN } from "../src/database.js";
import { jwtSign, auth } from "../src/auth.js";
import { HttpError } from "../src/error.js";

const router = express.Router();

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        let admin = await ADMIN.findOne({ _id: email });

        if (!admin || admin.password != password)
            throw new HttpError(401, 'invalid email or password');

        res.json({ token: jwtSign({ email }) })
    } catch (err) {
        next(err);
    }
})

router.post('/register', async (req, res, next) => {
    try {
        const { email, password, } = req.body;
        // TODO: Verify email and pass
        await ADMIN.insertOne({ _id: email, password, });
        res.json({ token: jwtSign({ email }) })
    } catch (err) {
        next(err);
    }
})

router.post('/action', auth, async (req, res, next) => {
    try {
        const { email, privilege } = req.body;
        // TODO: Verify email and pass
        // await ADMIN.insertOne({ _id: email, password, });
        // res.json({ token: jwtSign({ email }) })
    } catch (err) {
        next(err);
    }
})

export default router;