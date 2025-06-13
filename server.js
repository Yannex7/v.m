const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://yannismartinils:D5HMpNx1wVCZyfme@vape-db.y7lnc.mongodb.net/?retryWrites=true&w=majority&appName=vape-db";
let client;

// MongoDB-Verbindung beim Start
async function connectDB() {
    try {
        client = new MongoClient(uri);
        await client.connect();
        console.log('✅ MongoDB verbunden');
    } catch (error) {
        console.error('❌ MongoDB Fehler:', error);
    }
}

// Alle Bestellungen abrufen
app.get('/api/orders', async (req, res) => {
    try {
        if (!client) {
            await connectDB();
        }
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const orders = await collection.find({}).toArray();
        console.log(`📦 ${orders.length} Bestellungen gefunden`);
        res.json(orders);
    } catch (error) {
        console.error('❌ GET /api/orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Neue Bestellung erstellen
app.post('/api/orders', async (req, res) => {
    try {
        if (!client) {
            await connectDB();
        }
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const result = await collection.insertOne(req.body);
        const newOrder = await collection.findOne({ _id: result.insertedId });
        console.log('✅ Neue Bestellung erstellt:', newOrder.name);
        res.json(newOrder);
    } catch (error) {
        console.error('❌ POST /api/orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bestellung aktualisieren
app.put('/api/orders/:id', async (req, res) => {
    try {
        if (!client) {
            await connectDB();
        }
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        
        await collection.updateOne(
            { _id: new ObjectId(req.params.id) }, 
            { $set: req.body }
        );
        
        const updatedOrder = await collection.findOne({ _id: new ObjectId(req.params.id) });
        console.log('✅ Bestellung aktualisiert:', updatedOrder.name);
        res.json(updatedOrder);
    } catch (error) {
        console.error('❌ PUT /api/orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bestellung löschen
app.delete('/api/orders/:id', async (req, res) => {
    try {
        if (!client) {
            await connectDB();
        }
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        console.log('🗑️ Bestellung gelöscht');
        res.json({ message: 'Bestellung gelöscht' });
    } catch (error) {
        console.error('❌ DELETE /api/orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Alle Daten löschen
app.delete('/api/orders/reset-all', async (req, res) => {
    try {
        if (!client) {
            await connectDB();
        }
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        await collection.deleteMany({});
        console.log('💥 Alle Daten gelöscht');
        res.json({ message: 'Alle Daten gelöscht' });
    } catch (error) {
        console.error('❌ DELETE reset-all Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test-Endpunkt
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ Server läuft!', time: new Date() });
});

const PORT = process.env.PORT || 3000;

// Server starten
app.listen(PORT, async () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
    await connectDB();
});
