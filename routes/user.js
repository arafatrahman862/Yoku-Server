import express from "express";
import { USER } from "../src/database.js";

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        
    } catch (err) {
        next(err);
    }
})

export default router;