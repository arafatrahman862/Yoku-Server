require('dotenv').config();
const express = require('express')
const app = express();
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bfg6ad4.mongodb.net/?retryWrites=true&w=majority`;

app.use(cors())
app.use(express.json())

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const DB = client.db("assignment12");
const CLASS = DB.collection('class');

async function main() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
main().catch(console.error);


app.get('/', (req, res) => {
  res.send('assingment12')
})

app.get('/class', async (req, res) => {
  try {
    res.json(await CLASS.find({}).toArray())
  } catch (error) {
    res.statusCode = 501;
    res.json({ error: 'Server error', reason: error?.message })
  }
})

app.listen(port, () => {
  console.log(`assingment12  is on port ${port}`)
})