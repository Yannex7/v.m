const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'orders.json');

// Hilfsfunktionen
async function loadOrders() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('📁 Keine orders.json gefunden, erstelle neue...');
        return [];
    }
}

async function saveOrders(orders) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(orders, null, 2));
        console.log('💾 Daten gespeichert');
        return true;
    } catch (error) {
        console.error('❌ Fehler beim Speichern:', error);
        return false;
    }
}

function generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Test Endpunkt
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ JSON-File Server läuft!', 
        time: new Date(),
        storage: 'JSON-File'
    });
});

// Alle Bestellungen abrufen
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await loadOrders();
        console.log(`📦 ${orders.length} Bestellungen geladen`);
        res.json(orders);
    } catch (error) {
        console.error('❌ GET Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Neue Bestellung erstellen
app.post('/api/orders', async (req, res) => {
    try {
        const orders = await loadOrders();
        const newOrder = {
            ...req.body,
            _id: generateId(),
            createdAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        const saved = await saveOrders(orders);
        
        if (saved) {
            console.log('✅ Neue Bestellung erstellt:', newOrder.name);
            res.json(newOrder);
        } else {
            res.status(500).json({ error: 'Fehler beim Speichern' });
        }
    } catch (error) {
        console.error('❌ POST Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bestellung aktualisieren
app.put('/api/orders/:id', async (req, res) => {
    try {
        console.log('🔄 PUT Request für ID:', req.params.id);
        
        const orders = await loadOrders();
        const orderIndex = orders.findIndex(order => order._id === req.params.id);
        
        if (orderIndex === -1) {
            console.error('❌ Bestellung nicht gefunden:', req.params.id);
            return res.status(404).json({ error: 'Bestellung nicht gefunden' });
        }
        
        // Bestellung aktualisieren
        orders[orderIndex] = {
            ...orders[orderIndex],
            ...req.body,
            _id: req.params.id, // ID beibehalten
            updatedAt: new Date().toISOString()
        };
        
        const saved = await saveOrders(orders);
        
        if (saved) {
            console.log('✅ Bestellung aktualisiert:', orders[orderIndex].name);
            res.json(orders[orderIndex]);
        } else {
            res.status(500).json({ error: 'Fehler beim Speichern' });
        }
    } catch (error) {
        console.error('❌ PUT Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bestellung löschen
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const orders = await loadOrders();
        const orderIndex = orders.findIndex(order => order._id === req.params.id);
        
        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Bestellung nicht gefunden' });
        }
        
        const deletedOrder = orders.splice(orderIndex, 1)[0];
        const saved = await saveOrders(orders);
        
        if (saved) {
            console.log('🗑️ Bestellung gelöscht:', deletedOrder.name);
            res.json({ message: 'Bestellung erfolgreich gelöscht' });
        } else {
            res.status(500).json({ error: 'Fehler beim Speichern' });
        }
    } catch (error) {
        console.error('❌ DELETE Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Alle Daten löschen
app.delete('/api/orders/reset-all', async (req, res) => {
    try {
        const saved = await saveOrders([]);
        
        if (saved) {
            console.log('💥 Alle Daten gelöscht');
            res.json({ 
                message: 'Alle Bestellungen gelöscht',
                deletedCount: 'alle'
            });
        } else {
            res.status(500).json({ error: 'Fehler beim Löschen' });
        }
    } catch (error) {
        console.error('❌ RESET Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Backup erstellen
app.get('/api/backup', async (req, res) => {
    try {
        const orders = await loadOrders();
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=orders-backup.json');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 JSON-File Server läuft auf Port ${PORT}`);
    console.log(`💾 Daten werden in orders.json gespeichert`);
});
