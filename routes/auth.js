import express from "express";
import { ADMIN_OR_INSTRUCTOR, STUDENT } from "../src/database.js";
import { jwtSign, auth } from "../src/auth.js";
import { HttpError } from "../src/error.js";

const router = express.Router();

function checkRole(role, roles = []) {
    if (!roles.includes(role))
        throw new HttpError(403, `Expected role: ${roles.join(', ')}. But got ${role}`);
}

router.post('/login', async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        checkRole(role, ['admin', 'instructor', 'student']);

        const isStudent = role == 'student';
        const collection = isStudent ? STUDENT : ADMIN_OR_INSTRUCTOR;
        const user = await collection.findOne({ _id: email });

        if (!user || user.password != password)
            throw new HttpError(401, 'invalid email or password');

        res.json({ token: jwtSign({ email, role: isStudent ? role : user.role }) })
    } catch (err) {
        next(err);
    }
})

router.post('/register', async (req, res, next) => {
    try {
        const { email, password, role, ...data } = req.body;
        // TODO: Verify email and pass
        checkRole(role, ['admin', 'instructor', 'student']);

        if (role == 'student') {
            await STUDENT.insertOne({
                ...data,
                _id: email,
                password,
                joined_classes: []
            });
        } else {
            await ADMIN_OR_INSTRUCTOR.insertOne({ ...data, _id: email, password, role, });
        }
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
        checkRole(role, ['admin', 'instructor']);

        await ADMIN_OR_INSTRUCTOR.findOneAndUpdate({ _id: email }, { $set: { role } });
        res.json({ message: 'Operation successful' })
    } catch (err) {
        next(err);
    }
})

export default router;