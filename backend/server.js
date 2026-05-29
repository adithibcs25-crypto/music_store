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
// Fetches all dynamic instrument catalog rows including detailed columns
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
// Syncs temporary frontend cart operations with backend reference logs
app.post('/api/cart', async (req, res, next) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    
    // Check if the item already exists in this specific user's cart row
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
    res.json({ success: true, message: 'Cart metrics tracked successfully.' });
  } catch (error) { 
    next(error); 
  }
});

// ==========================================
// 3. POST /api/orders
// ==========================================
// Processes checkouts and performs relational mapping across orders and items
app.post('/api/orders', async (req, res, next) => {
  try {
    const { user_id, total_amount, payment_method, items } = req.body;
    
    // Step A: Insert master transaction record ticket block
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount, payment_method, order_status) VALUES (?, ?, ?, "Paid")',
      [user_id, total_amount, payment_method]
    );
    const orderId = orderResult.insertId;

    // Step B: Loop items array to write to sub-relational order items table
    if (items && items.length > 0) {
      for (const item of items) {
        const subtotal = item.price * item.quantity;
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
          [orderId, item.id, item.quantity, subtotal]
        );
        
        // Step C: Adjust active storage catalog inventories safely
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
// 4. GET /api/orders
// ==========================================
// Performs advanced relational database multi-table joins to serve full log profiles
app.get('/api/orders', async (req, res, next) => {
  try {
    const userId = 1; // Simulated Authorized Session User Context
    
    // Fetch base historical invoice tickets
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', 
      [userId]
    );
    
    // Hydrate each order ticket container with its corresponding bought items metadata
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
// Global Central Intercepting Error Handler
// ==========================================
app.use((err, req, res, next) => {
  console.error("Critical Server Log Exception Stack: ", err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || 'Critical internal operational backend failure.' 
  });
});

// Port Server Listener Hook
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🎵 Saptaswara Core Full-Stack Server Backend Live!`);
  console.log(`🚀 REST API Endpoints active at: http://localhost:${PORT}`);
  console.log(`===================================================`);
});