const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// Application Layer Middleware Config
app.use(cors());
app.use(express.json());

// 1. GET /api/products -> Fetches full details (description, origin, acoustic properties, audio URLs)
app.get('/api/products', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) { 
    next(error); 
  }
});

// 2. POST /api/cart -> Manages synchronized baseline user cart adjustments
app.post('/api/cart', async (req, res, next) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    const [existing] = await db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
    
    if (existing.length > 0) {
      await db.query('UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?', [quantity || 1, user_id, product_id]);
    } else {
      await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity || 1]);
    }
    res.json({ success: true, message: 'Cart metrics modified successfully.' });
  } catch (error) { 
    next(error); 
  }
});

// 3. POST /api/payment -> Evaluates standard card configurations 
app.post('/api/payment', (req, res) => {
  const { cardNumber } = req.body;
  if(cardNumber && cardNumber.replace(/\s/g, '').length < 16) {
    return res.status(400).json({ success: false, message: 'Invalid transactional data architecture.' });
  }
  res.json({ success: true, transactionId: 'TXN-' + Math.floor(Math.random() * 10000000) });
});

// 4. POST /api/orders -> Atomic entry generator for client checkouts
app.post('/api/orders', async (req, res, next) => {
  try {
    const { user_id, total_amount, payment_method, items } = req.body;
    
    // Create master order ticket block
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount, payment_method, order_status) VALUES (?, ?, ?, "Paid")',
      [user_id, total_amount, payment_method]
    );
    const orderId = orderResult.insertId;

    // Loop items to write to sub-relational order items mapping table
    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, (item.price * item.quantity)]
      );
    }
    
    res.status(201).json({ success: true, order_id: orderId });
  } catch (error) { 
    next(error); 
  }
});

// 5. GET /api/orders -> Assembles multi-table joins to compute customer history logs
app.get('/api/orders', async (req, res, next) => {
  try {
    const userId = 1; // Simulated Authorized Session Context
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image FROM order_items oi 
         JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`, [order.id]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (error) { 
    next(error); 
  }
});

// Centralized Intercepting Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Internal Server Stack trace: ", err.stack);
  res.status(500).json({ success: false, message: err.message || 'Critical internal operational failure.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Swaranjali REST API running cleanly on port ${PORT}`));