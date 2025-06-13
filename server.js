const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = "mongodb+srv://yannismartinils:KzzZCnH4SMRvIL5l@inventar-management.0smtgi4.mongodb.net/inventar-db?retryWrites=true&w=majority&appName=Inventar-Management";

// Test Endpunkt
app.get('/api/test', (req, res) => {
    res.json({ message: '✅ Server läuft!', time: new Date() });
});

// DB Test
app.get('/api/db-test', async (req, res) => {
    let client;
    try {
        client = new MongoClient(uri);
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        res.json({ status: '✅ MongoDB OK!', time: new Date() });
    } catch (error) {
        res.status(500).json({ status: '❌ MongoDB Fehler', error: error.message });
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
        console.log(`📦 ${orders.length} Bestellungen geladen`);
        res.json(orders);
    } catch (error) {
        console.error('❌ GET Orders Fehler:', error);
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
        console.error('❌ POST Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (client) await client.close();
    }
});

// Bestellung aktualisieren - REPARIERT!
app.put('/api/orders/:id', async (req, res) => {
    let client;
    try {
        console.log('🔄 PUT Request für ID:', req.params.id);
        console.log('📋 Update Daten:', JSON.stringify(req.body, null, 2));
        
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        
        // Prüfe ob ID gültig ist
        if (!ObjectId.isValid(req.params.id)) {
            console.error('❌ Ungültige ObjectId:', req.params.id);
            return res.status(400).json({ error: 'Ungültige Order ID' });
        }
        
        const objectId = new ObjectId(req.params.id);
        
        // Update durchführen
        const updateResult = await collection.updateOne(
            { _id: objectId }, 
            { $set: req.body }
        );
        
        console.log('📊 Update Result:', updateResult);
        
        if (updateResult.matchedCount === 0) {
            console.error('❌ Bestellung nicht gefunden:', req.params.id);
            return res.status(404).json({ error: 'Bestellung nicht gefunden' });
        }
        
        // Aktualisierte Bestellung laden
        const updatedOrder = await collection.findOne({ _id: objectId });
        
        if (!updatedOrder) {
            console.error('❌ Bestellung nach Update nicht gefunden');
            return res.status(404).json({ error: 'Bestellung nach Update nicht gefunden' });
        }
        
        console.log('✅ Bestellung erfolgreich aktualisiert:', updatedOrder.name);
        res.json(updatedOrder);
        
    } catch (error) {
        console.error('❌ PUT Orders Fehler:', error);
        console.error('❌ Error Stack:', error.stack);
        res.status(500).json({ 
            error: 'Fehler beim Aktualisieren',
            details: error.message,
            id: req.params.id
        });
    } finally {
        if (client) await client.close();
    }
});

// Bestellung löschen
app.delete('/api/orders/:id', async (req, res) => {
    let client;
    try {
        if (!ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ error: 'Ungültige Order ID' });
        }
        
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        
        const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Bestellung nicht gefunden' });
        }
        
        console.log('🗑️ Bestellung gelöscht');
        res.json({ message: 'Bestellung erfolgreich gelöscht' });
    } catch (error) {
        console.error('❌ DELETE Orders Fehler:', error);
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
            message: 'Alle Bestellungen gelöscht',
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        console.error('❌ RESET Fehler:', error);
        res.status(500).json({ error: error.message });
    } finally {
        if (client) await client.close();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
