import { MongoClient, ServerApiVersion } from "mongodb";
import { MONGO_DATABASE_NAME, MONGO_URI } from "./config.js";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Connect the client to the server	(optional starting in v4.7)
await client.connect();
await client.db("admin").command({ ping: 1 });
console.log("Pinged your deployment. You successfully connected to MongoDB!");

export const DB = client.db(MONGO_DATABASE_NAME);
export const CLASS = DB.collection("class");
export const STUDENT = DB.collection("student");
export const ADMIN_OR_INSTRUCTOR = DB.collection("admin");