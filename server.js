const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB URI mit NEUEM Passwort
const uri = "mongodb+srv://yannismartinils:KzzZCnH4SMRvIL5l@inventar-management.0smtgi4.mongodb.net/inventar-db?retryWrites=true&w=majority&appName=Inventar-Management";

// MongoDB Connection Test
app.get('/api/db-test', async (req, res) => {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        res.json({ 
            status: '✅ MongoDB Verbindung erfolgreich!',
            cluster: 'inventar-management',
            database: 'inventar-db',
            time: new Date()
        });
    } catch (error) {
        res.status(500).json({ 
            status: '❌ MongoDB Verbindung fehlgeschlagen',
            error: error.message 
        });
    } finally {
        if (client) await client.close();
    }
});

// Alle Bestellungen abrufen
app.get('/api/orders', async (req, res) => {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const orders = await collection.find({}).toArray();
        console.log(`📦 ${orders.length} Bestellungen gefunden`);
        res.json(orders);
    } catch (error) {
        console.error('❌ GET Orders Fehler:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (client) await client.close();
    }
});

// Neue Bestellung erstellen
app.post('/api/orders', async (req, res) => {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const result = await collection.insertOne(req.body);
        const newOrder = await collection.findOne({ _id: result.insertedId });
        console.log('✅ Neue Bestellung erstellt:', newOrder.name);
        res.json(newOrder);
    } catch (error) {
        console.error('❌ POST Orders Fehler:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (client) await client.close();
    }
});

// Bestellung aktualisieren
app.put('/api/orders/:id', async (req, res) => {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        await collection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });
        const updatedOrder = await collection.findOne({ _id: new ObjectId(req.params.id) });
        console.log('✅ Bestellung aktualisiert:', updatedOrder.name);
        res.json(updatedOrder);
    } catch (error) {
        console.error('❌ PUT Orders Fehler:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (client) await client.close();
    }
});

// Bestellung löschen
app.delete('/api/orders/:id', async (req, res) => {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        console.log('🗑️ Bestellung gelöscht');
        res.json({ message: 'Bestellung erfolgreich gelöscht' });
    } catch (error) {
        console.error('❌ DELETE Orders Fehler:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (client) await client.close();
    }
});

// Alle Daten löschen
app.delete('/api/orders/reset-all', async (req, res) => {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const result = await collection.deleteMany({});
        console.log('💥 Alle Daten gelöscht:', result.deletedCount);
        res.json({ 
            message: 'Alle Bestellungen erfolgreich gelöscht',
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error('❌ RESET Fehler:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (client) await client.close();
    }
});

// Server Test
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ Server läuft!', 
        time: new Date(),
        version: '2.0'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Inventar-Management Server läuft auf Port ${PORT}`);
    console.log(`🔗 MongoDB: inventar-management cluster`);
});
