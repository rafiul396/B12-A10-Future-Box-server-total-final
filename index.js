const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require("dotenv").config()
const app = express()
const port = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.abvmfph.mongodb.net/?appName=Cluster0`

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send('Hello FinEase')
})

async function run() {
    try {
        await client.connect();

        const db = client.db("financeDB");
        const dataCollection = db.collection("main-data");

        app.get('/my-transaction', verifyFirebaseToken, async (req, res) => {
            const email = req.query.email;
            const cursor = dataCollection.find({ email : email }).sort({amount : -1});
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/my-transaction', async (req, res) => {
            const data = req.body;
            const result = await dataCollection.insertOne(data)
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Running port is ${port}`);
})