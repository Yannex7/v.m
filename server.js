const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://yannismartinils:D5HMpNx1wVCZyfme@vape-db.y7lnc.mongodb.net/?retryWrites=true&w=majority&appName=vape-db";
const client = new MongoClient(uri);

let currentData = {
    stock: { robin: 0, robink: 0, adrian: 0, andreas: 0 },
    sales: { robin: 0, robink: 0, adrian: 0, andreas: 0 },
    consumed: { robin: 0, robink: 0, adrian: 0, andreas: 0 },
    payments: { robin: 0, robink: 0, adrian: 0, andreas: 0 }
};

app.post('/api/data', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('vape-db');
        const collection = database.collection('vape-data');
        currentData = req.body;
        await collection.updateOne({}, { $set: currentData }, { upsert: true });
        res.json({ success: true, data: currentData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/data', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('vape-db');
        const collection = database.collection('vape-data');
        const data = await collection.findOne({});
        if (data) {
            currentData = data;
        }
        res.json(currentData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server läuft auf Port 3000');
});
