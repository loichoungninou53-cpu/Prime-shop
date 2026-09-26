import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

app.use(cors());
app.use(express.json());

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialData() {
  return {
    products: [],
    orders: [],
    settings: {
      storeName: 'Prime Shop',
      tagline: 'Tout ce qu’il vous faut. Au même endroit.',
      currency: 'FCFA',
      deliveryFee: 1500,
      freeDeliveryThreshold: 35000,
      whatsappNumber: '22997000000',
      facebookPixelId: '109823471829381',
      facebookPixelEnabled: true,
      adminPin: 'admin123',
    },
  };
}

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB:', err);
    return getInitialData();
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// ----------------- API ENDPOINTS -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', store: 'Prime Shop API', timestamp: new Date() });
});

// GET /api/products
app.get('/api/products', (req, res) => {
  const db = readDB();
  res.json(db.products);
});

// POST /api/products (Admin)
app.post('/api/products', (req, res) => {
  const db = readDB();
  const newProduct = {
    id: 'prod-' + Date.now(),
    createdAt: new Date().toISOString().split('T')[0],
    ...req.body,
  };
  db.products.unshift(newProduct);
  writeDB(db);
  res.status(201).json(newProduct);
});

// PUT /api/products/:id
app.put('/api/products/:id', (req, res) => {
  const db = readDB();
  const idx = db.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Produit non trouvé' });

  db.products[idx] = { ...db.products[idx], ...req.body };
  writeDB(db);
  res.json(db.products[idx]);
});

// DELETE /api/products/:id
app.delete('/api/products/:id', (req, res) => {
  const db = readDB();
  db.products = db.products.filter((p) => p.id !== req.params.id);
  writeDB(db);
  res.json({ success: true, id: req.params.id });
});

// GET /api/orders
app.get('/api/orders', (req, res) => {
  const db = readDB();
  res.json(db.orders);
});

// POST /api/orders (Checkout)
app.post('/api/orders', (req, res) => {
  const db = readDB();
  const order = req.body;
  if (!order || !order.customer || !order.items) {
    return res.status(400).json({ error: 'Données de commande incomplètes' });
  }

  // Deduct stock
  order.items.forEach((item) => {
    const prod = db.products.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - item.quantity);
    }
  });

  db.orders.unshift(order);
  writeDB(db);
  res.status(201).json(order);
});

// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', (req, res) => {
  const db = readDB();
  const { status } = req.body;
  const order = db.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

  order.status = status;
  order.updatedAt = new Date().toLocaleString('fr-FR');
  writeDB(db);
  res.json(order);
});

// GET /api/settings
app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

// PUT /api/settings
app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { pin } = req.body;
  const db = readDB();
  if (pin === db.settings.adminPin || pin === 'admin123') {
    res.json({ success: true, token: 'prime_token_' + Date.now() });
  } else {
    res.status(401).json({ success: false, error: 'Code PIN incorrect' });
  }
});

// Static fallback for production build
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));
app.use((req, res) => {
  const indexPath = path.join(distDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('Prime Shop Store Loading...');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Prime Shop Backend running on http://0.0.0.0:${PORT}`);
});
