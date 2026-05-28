const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();

// Global Application Middleware
app.use(cors());
app.use(express.json());

// ==========================================
// 1. GET /api/products
// ==========================================
// Fetches all instruments including history, acoustics, materials, and audio links.
app.get('/api/products', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) { 
    next(error); 
  }
});

// ==========================================
// 2. POST /api/cart
// ==========================================
// Handles background synchronization for user shopping carts.
app.post('/api/cart', async (req, res, next) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    
    // Check if item already exists in this user's cart
    const [existing] = await db.query(
      'SELECT * FROM cart WHERE user_id = ? AND product_id = ?', 
      [user_id, product_id]
    );
    
    if (existing.length > 0) {
      await db.query(
        'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?', 
        [quantity || 1, user_id, product_id]
      );
    } else {
      await db.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', 
        [user_id, product_id, quantity || 1]
      );
    }
    res.json({ success: true, message: 'Cart metrics modified successfully.' });
  } catch (error) { 
    next(error); 
  }
});

// ==========================================
// 3. POST /api/payment
// ==========================================
// Simulates checking credit cards or UPI strings before completing an order.
app.post('/api/payment', (req, res) => {
  const { cardNumber, nameOnCard, paymentMethod } = req.body;
  
  // Basic mock gateway rule check
  if (paymentMethod === 'Credit Card' && cardNumber && cardNumber.replace(/\s/g, '').length < 16) {
    return res.status(400).json({ success: false, message: 'Invalid transactional data architecture.' });
  }
  
  res.json({ 
    success: true, 
    transactionId: 'TXN-' + Math.floor(Math.random() * 10000000) 
  });
});

// ==========================================
// 4. POST /api/orders
// ==========================================
// Handles multi-table relational entry logic for fresh checkout tickets.
app.post('/api/orders', async (req, res, next) => {
  try {
    const { user_id, total_amount, payment_method, items } = req.body;
    
    // Step A: Insert master transaction record ticket block
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount, payment_method, order_status) VALUES (?, ?, ?, "Paid")',
      [user_id, total_amount, payment_method]
    );
    const orderId = orderResult.insertId;

    // Step B: Loop items array to write out sub-relational mapping entries
    if (items && items.length > 0) {
      for (const item of items) {
        const subtotal = item.price * item.quantity;
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
          [orderId, item.id, item.quantity, subtotal]
        );
        
        // Step C: Deduct items safely out of active storage inventories
        await db.query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.id]
        );
      }
    }
    
    res.status(201).json({ success: true, order_id: orderId });
  } catch (error) { 
    next(error); 
  }
});

// ==========================================
// 5. GET /api/orders
// ==========================================
// Performs advanced database joins to assemble complete transaction logs for users.
app.get('/api/orders', async (req, res, next) => {
  try {
    const userId = 1; // Simulated Authorized Session Context for current demo state
    
    // Fetch all base orders placed by the user
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', 
      [userId]
    );
    
    // Hydrate each order ticket with its full item rows through a sub-query join
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`, 
        [order.id]
      );
      order.items = items;
    }
    
    res.json(orders);
  } catch (error) { 
    next(error); 
  }
});

// ==========================================
// Centralized Intercepting Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error("Internal Server Stack Trace: ", err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Critical internal operational server failure.' 
  });
});

// Start Server Activation Link
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🎵 Swaranjali Core Full-Stack Portal Is Activated!`);
  console.log(`🚀 REST API Service Listening On: http://localhost:${PORT}`);
  console.log(`===================================================`);
});