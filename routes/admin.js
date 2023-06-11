import express from "express";
import { ADMIN } from "../src/database.js";
import { jwtSign, auth } from "../src/auth.js";
import { HttpError } from "../src/error.js";

const router = express.Router();
const roles = ['admin', 'instructor']

function checkRole(role) {
    if (!roles.includes(role))
        throw new HttpError(403, `Expected role: 'admin' or 'instructor', But got ${role}`);
}

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        let user = await ADMIN.findOne({ _id: email });

        if (!user || user.password != password)
            throw new HttpError(401, 'invalid email or password');

        res.json({ token: jwtSign({ email, role: user.role }) })
    } catch (err) {
        next(err);
    }
})

router.post('/register', async (req, res, next) => {
    try {
        const { email, password, role, ...rest } = req.body;
        // TODO: Verify email and pass
        checkRole(role);

        await ADMIN.insertOne({ _id: email, password, role, ...rest });
        res.json({ token: jwtSign({ email, role }) })
    } catch (err) {
        next(err);
    }
})

router.post('/promote', auth, async (req, res, next) => {
    try {
        if (req.authData.role != "admin") {
            throw new HttpError(401, "You are not admin.")
        }
        const { email, role } = req.body;
        checkRole(role);

        await ADMIN.findOneAndUpdate({ _id: email }, { $set: { role } });
        res.json({ message: 'Operation successful' })
    } catch (err) {
        next(err);
    }
})

export default router;