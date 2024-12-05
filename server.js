const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://yannismartinils:D5HMpNx1wVCZyfme@vape-db.y7lnc.mongodb.net/?retryWrites=true&w=majority&appName=vape-db";
const client = new MongoClient(uri);

const defaultData = {
    stock: { robin: 0, robink: 0, adrian: 0, andreas: 0, martin: 0 },
    sales: { robin: 0, robink: 0, adrian: 0, andreas: 0, martin: 0 },
    consumed: { robin: 0, robink: 0, adrian: 0, andreas: 0, martin: 0 },
    payments: { robin: 0, robink: 0, adrian: 0, andreas: 0, martin: 0 },
    totalQuantity: 0,
    logs: []
};

let dbConnection;

async function connectDB() {
    if (!dbConnection) {
        await client.connect();
        dbConnection = client.db('vape-db');
        console.log('Connected to MongoDB');
    }
    return dbConnection;
}

app.get('/api/data', async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection('vape-data');
        let data = await collection.findOne({});
        if (!data) {
            await collection.insertOne(defaultData);
            data = defaultData;
        }
        res.json(data);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const db = await connectDB();
        const collection = db.collection('vape-data');
        await collection.updateOne({}, { $set: req.body }, { upsert: true });
        res.json({ success: true });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server läuft auf Port 3000');
});
