const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://yannismartinils:D5HMpNx1wVCZyfme@vape-db.y7lnc.mongodb.net/?retryWrites=true&w=majority&appName=vape-db";
const client = new MongoClient(uri);

// Alle Bestellungen abrufen
app.get('/api/orders', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const orders = await collection.find({}).toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Neue Bestellung erstellen
app.post('/api/orders', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const result = await collection.insertOne(req.body);
        const createdOrder = await collection.findOne({ _id: result.insertedId });
        res.json(createdOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bestellung aktualisieren
app.put('/api/orders/:id', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        const updatedOrder = await collection.findOne({ _id: new ObjectId(req.params.id) });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Einzelne Bestellung löschen
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Bestellung gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Alle Daten löschen
app.delete('/api/orders/reset-all', async (req, res) => {
    try {
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        await collection.deleteMany({});
        res.json({ message: 'Alle Daten gelöscht' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
