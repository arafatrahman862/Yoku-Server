// index.js
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db(process.env.MONGO_DATABASE || "assignment12");
        const usersCollection = db.collection("users");
        const classCollection = db.collection("class");

        // -------------------------------------------------
        // JWT: Issue token
        // -------------------------------------------------
        app.post("/jwt", (req, res) => {
            const user = req.body;
            if (!user?.email) return res.status(400).send({ message: "Email required" });

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: "1h",
            });

            res.send({ token });
        });

        // -------------------------------------------------
        // Middlewares
        // -------------------------------------------------
        const verifyToken = (req, res, next) => {
            const authHeader = req.headers.authorization;
            if (!authHeader) return res.status(401).send({ message: "Unauthorized" });

            const token = authHeader.split(" ")[1];

            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
                if (err) return res.status(401).send({ message: "Unauthorized" });

                req.decoded = decoded;
                next();
            });
        };

        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const user = await usersCollection.findOne({ email });

            if (user?.role !== "admin") {
                return res.status(403).send({ message: "Forbidden" });
            }

            next();
        };

        const verifyInstructor = async (req, res, next) => {
            const email = req.decoded.email;
            const user = await usersCollection.findOne({ email });

            if (user?.role !== "instructor") {
                return res.status(403).send({ message: "Forbidden" });
            }

            next();
        };

        // -------------------------------------------------
        // Root
        // -------------------------------------------------
        app.get("/", (_req, res) => {
            res.send("🎉 Backend is Running with JWT Auth");
        });

        // -------------------------------------------------
        // User Registration / Sync (Firebase + Backend)
        // -------------------------------------------------
        app.post("/user", verifyToken, async (req, res) => {
            try {
                const tokenEmail = req.decoded.email;
                const { email, name, photoURL } = req.body;

                if (!email || email !== tokenEmail)
                    return res.status(403).send({ message: "Access denied" });

                const existing = await usersCollection.findOne({ email });

                const userData = {
                    email,
                    name: name || existing?.name || "",
                    photoURL: photoURL || existing?.photoURL || "",
                    role: existing?.role || "student", // NEVER overwrite role
                    joined_classes: existing?.joined_classes || [],
                    createdAt: existing?.createdAt || new Date(),
                    updatedAt: new Date(),
                };

                await usersCollection.updateOne(
                    { email },
                    { $set: userData },
                    { upsert: true }
                );

                res.send({ message: "User synced", user: userData });
            } catch (err) {
                console.log(err);
                res.status(500).send({ message: "Server error" });
            }
        });

        // -------------------------------------------------
        // Admin & Instructor Validation Routes
        // -------------------------------------------------
        app.get("/users/admin/:email", verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.send({ admin: false });
            }

            const user = await usersCollection.findOne({ email });
            res.send({ admin: user?.role === "admin" });
        });

        app.get("/users/instructor/:email", verifyToken, async (req, res) => {
            const email = req.params.email;

            if (email !== req.decoded.email) {
                return res.send({ instructor: false });
            }

            const user = await usersCollection.findOne({ email });
            res.send({ instructor: user?.role === "instructor" });
        });

        // -------------------------------------------------
        // Manage Users (Admin)
        // -------------------------------------------------
        app.get("/users", verifyToken, verifyAdmin, async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        });

        // Promote to admin
        app.patch("/users/admin/:email", verifyToken, verifyAdmin, async (req, res) => {
            const email = req.params.email;

            const result = await usersCollection.updateOne(
                { email },
                { $set: { role: "admin" } }
            );

            res.send({ message: "Promoted to admin", result });
        });

        // Promote to instructor
        app.patch("/users/instructor/:email", verifyToken, verifyAdmin, async (req, res) => {
            const email = req.params.email;

            const result = await usersCollection.updateOne(
                { email },
                { $set: { role: "instructor" } }
            );

            res.send({ message: "Promoted to instructor", result });
        });

        // -------------------------------------------------
        // Public Instructor List
        // -------------------------------------------------
        app.get("/instructors", async (_req, res) => {
            const instructors = await usersCollection.find({ role: "instructor" }).toArray();
            res.send(instructors);
        });

        // -------------------------------------------------
        // Class Routes
        // -------------------------------------------------
        app.post("/class", verifyToken, async (req, res) => {
            const email = req.decoded.email;
            const user = await usersCollection.findOne({ email });

            if (!user || !["admin", "instructor"].includes(user.role)) {
                return res.status(403).send({ message: "Forbidden" });
            }

            const classData = req.body;
            classData.status = user.role === "admin" ? "approved" : "pending";
            classData.number_of_students = classData.number_of_students || 0;

            const result = await classCollection.insertOne(classData);
            res.send(result);
        });

        app.get("/class", async (req, res) => {
            const classes = await classCollection.find().toArray();
            res.send(classes);
        });

        app.get("/class/available/seats", async (req, res) => {
            const agg = await classCollection
                .aggregate([
                    { $group: { _id: null, totalSeats: { $sum: "$available_seat" } } },
                ])
                .toArray();

            res.send({ totalSeats: agg[0]?.totalSeats || 0 });
        });

        // -------------------------------------------------
        // Student Routes
        // -------------------------------------------------
        app.post("/student/join", verifyToken, async (req, res) => {
            const { class_id } = req.body;
            const email = req.decoded.email;

            await usersCollection.updateOne(
                { email },
                { $addToSet: { joined_classes: class_id } }
            );

            res.send({ message: "Class joined" });
        });

        app.post("/student/remove", verifyToken, async (req, res) => {
            const { class_id } = req.body;
            const email = req.decoded.email;

            await usersCollection.updateOne(
                { email },
                { $pull: { joined_classes: class_id } }
            );

            res.send({ message: "Class removed" });
        });

        app.get("/student/classes", verifyToken, async (req, res) => {
            const email = req.decoded.email;
            const user = await usersCollection.findOne({ email });

            if (!user?.joined_classes?.length) return res.send([]);

            const ids = user.joined_classes.map(id => new ObjectId(id));
            const classes = await classCollection.find({ _id: { $in: ids } }).toArray();

            res.send(classes);
        });

    } finally {
        // no client.close(); keep server alive
    }
}
run().catch(console.dir);

// Server
app.listen(port, () => {
    console.log(`🚀 Backend running on port ${port}`);
});
