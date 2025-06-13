const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://yannismartinils:Inv3nt4r2024!Mgmt@inventar-management.0smtgi4.mongodb.net/?retryWrites=true&w=majority&appName=Inventar-Management";
const client = new MongoClient(uri);

let isConnected = false;

async function connectToMongoDB() {
    if (!isConnected) {
        try {
            await client.connect();
            isConnected = true;
            console.log('✅ MongoDB erfolgreich verbunden');
        } catch (error) {
            console.error('❌ MongoDB Verbindungsfehler:', error);
            isConnected = false;
        }
    }
}

app.get('/api/orders', async (req, res) => {
    try {
        await connectToMongoDB();
        const database = client.db('inventar-management');
        const collection = database.collection('orders');
        const orders = await collection.find({}).toArray();
        console.log(`📦 ${orders.length} Bestellungen geladen`);
        res.json(orders);
    } catch (error) {
        console.error('❌ GET /api/orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        await connectToMongoDB();
        const database = client.db('inventar-management');
        const collection = database.collection('orders');
        
        console.log('📝 Neue Bestellung wird erstellt:', req.body.name);
        const result = await collection.insertOne(req.body);
        const createdOrder = await collection.findOne({ _id: result.insertedId });
        
        console.log('✅ Bestellung erstellt mit ID:', result.insertedId);
        res.json(createdOrder);
    } catch (error) {
        console.error('❌ POST /api/orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        await connectToMongoDB();
        const database = client.db('inventar-management');
        const collection = database.collection('orders');
        
        await collection.updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        const updatedOrder = await collection.findOne({ _id: new ObjectId(req.params.id) });
        res.json(updatedOrder);
    } catch (error) {
        console.error('❌ PUT /api/orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await connectToMongoDB();
        const database = client.db('inventar-management');
        const collection = database.collection('orders');
        
        await collection.deleteOne({ _id: new ObjectId(req.params.id) });
        console.log('🗑️ Bestellung gelöscht:', req.params.id);
        res.json({ message: 'Bestellung gelöscht' });
    } catch (error) {
        console.error('❌ DELETE /api/orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/orders/reset-all', async (req, res) => {
    try {
        await connectToMongoDB();
        const database = client.db('inventar-management');
        const collection = database.collection('orders');
        
        const result = await collection.deleteMany({});
        console.log('💥 Alle Daten gelöscht:', result.deletedCount, 'Dokumente');
        res.json({ message: 'Alle Daten gelöscht' });
    } catch (error) {
        console.error('❌ DELETE /api/orders/reset-all Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
