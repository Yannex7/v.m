const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Konfiguration
const supabaseUrl = 'https://sokascyxzvkvwaknxzww.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNva2FzY3l4enZrdndha254end3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDI3MTksImV4cCI6MjA2NTQ3ODcxOX0.BCF2ZtNvHEdI9FhIGUOro1QJKHt7tplL-1WX8GOAMZ4';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test Endpunkt
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ Supabase Server läuft!', 
        time: new Date(),
        database: 'Supabase PostgreSQL'
    });
});

// Alle Bestellungen abrufen
app.get('/api/orders', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log(`📦 ${orders.length} Bestellungen geladen`);
        res.json(orders || []);
    } catch (error) {
        console.error('❌ GET Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Neue Bestellung erstellen
app.post('/api/orders', async (req, res) => {
    try {
        const orderData = {
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        const { data: newOrder, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select()
            .single();
        
        if (error) throw error;
        
        console.log('✅ Neue Bestellung erstellt:', newOrder.name);
        res.json(newOrder);
    } catch (error) {
        console.error('❌ POST Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bestellung aktualisieren
app.put('/api/orders/:id', async (req, res) => {
    try {
        console.log('🔄 PUT Request für ID:', req.params.id);
        
        const updateData = {
            ...req.body,
            updated_at: new Date().toISOString()
        };
        
        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Bestellung nicht gefunden' });
        }
        
        console.log('✅ Bestellung aktualisiert:', updatedOrder.name);
        res.json(updatedOrder);
    } catch (error) {
        console.error('❌ PUT Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Bestellung löschen
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', req.params.id);
        
        if (error) throw error;
        
        console.log('🗑️ Bestellung gelöscht');
        res.json({ message: 'Bestellung erfolgreich gelöscht' });
    } catch (error) {
        console.error('❌ DELETE Orders Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

// Alle Daten löschen
app.delete('/api/orders/reset-all', async (req, res) => {
    try {
        const { error } = await supabase
            .from('orders')
            .delete()
            .neq('id', 0);
        
        if (error) throw error;
        
        console.log('💥 Alle Daten gelöscht');
        res.json({ message: 'Alle Bestellungen gelöscht' });
    } catch (error) {
        console.error('❌ RESET Fehler:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Supabase Server läuft auf Port ${PORT}`);
});
