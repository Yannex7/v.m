const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// NEUE MongoDB URI
const uri = "mongodb+srv://yannismartinils:D5HMpNx1wVCZyfme@inventar-management.0smtgi4.mongodb.net/?retryWrites=true&w=majority&appName=Inventar-Management";

// Test-Endpunkt
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ Server läuft!', 
        time: new Date(),
        database: 'inventar-management'
    });
});

// Alle Bestellungen abrufen
app.get('/api/orders', async (req, res) => {
    console.log('📥 GET /api/orders aufgerufen');
    let client;
    
    try {
        client = new MongoClient(uri);
        await client.connect();
        console.log('✅ MongoDB verbunden');
        
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const orders = await collection.find({}).toArray();
        
        console.log(`📦 ${orders.length} Bestellungen gefunden`);
        res.json(orders);
        
    } catch (error) {
        console.error('❌ GET /api/orders Fehler:', error.message);
        res.status(500).json({ 
            error: 'Datenbankfehler beim Laden',
            details: error.message,
            timestamp: new Date()
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Neue Bestellung erstellen
app.post('/api/orders', async (req, res) => {
    console.log('📥 POST /api/orders aufgerufen');
    console.log('📋 Daten:', req.body);
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
        console.error('❌ POST /api/orders Fehler:', error.message);
        res.status(500).json({ 
            error: 'Fehler beim Erstellen der Bestellung',
            details: error.message 
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Bestellung aktualisieren
app.put('/api/orders/:id', async (req, res) => {
    console.log('📥 PUT /api/orders/:id aufgerufen');
    console.log('🆔 ID:', req.params.id);
    let client;
    
    try {
        client = new MongoClient(uri);
        await client.connect();
        
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
        console.error('❌ PUT /api/orders Fehler:', error.message);
        res.status(500).json({ 
            error: 'Fehler beim Aktualisieren der Bestellung',
            details: error.message 
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Bestellung löschen
app.delete('/api/orders/:id', async (req, res) => {
    console.log('📥 DELETE /api/orders/:id aufgerufen');
    console.log('🆔 ID:', req.params.id);
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
        console.error('❌ DELETE /api/orders Fehler:', error.message);
        res.status(500).json({ 
            error: 'Fehler beim Löschen der Bestellung',
            details: error.message 
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Alle Daten löschen (nur für Admin)
app.delete('/api/orders/reset-all', async (req, res) => {
    console.log('📥 DELETE /api/orders/reset-all aufgerufen');
    let client;
    
    try {
        client = new MongoClient(uri);
        await client.connect();
        
        const database = client.db('inventar-db');
        const collection = database.collection('orders');
        const result = await collection.deleteMany({});
        
        console.log('💥 Alle Daten gelöscht:', result.deletedCount, 'Dokumente');
        res.json({ 
            message: 'Alle Bestellungen erfolgreich gelöscht',
            deletedCount: result.deletedCount 
        });
        
    } catch (error) {
        console.error('❌ DELETE reset-all Fehler:', error.message);
        res.status(500).json({ 
            error: 'Fehler beim Löschen aller Daten',
            details: error.message 
        });
    } finally {
        if (client) {
            await client.close();
        }
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Inventar-Management Server läuft auf Port ${PORT}`);
    console.log(`📍 Test-URL: /api/test`);
    console.log(`📦 Orders-URL: /api/orders`);
});
