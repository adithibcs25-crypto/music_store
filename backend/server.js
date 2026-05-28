const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/products', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) { next(error); }
});

app.post('/api/cart', async (req, res, next) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    const [existing] = await db.query('SELECT * FROM cart WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
    if (existing.length > 0) {
      await db.query('UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?', [quantity || 1, user_id, product_id]);
    } else {
      await db.query('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity || 1]);
    }
    res.json({ success: true, message: 'Cart metrics tracked successfully.' });
  } catch (error) { next(error); }
});

app.post('/api/orders', async (req, res, next) => {
  try {
    const { user_id, total_amount, payment_method, items } = req.body;
    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_amount, payment_method, order_status) VALUES (?, ?, ?, "Paid")',
      [user_id, total_amount, payment_method]
    );
    const orderId = orderResult.insertId;

    if (items && items.length > 0) {
      for (const item of items) {
        await db.query(
          'INSERT INTO order_items (order_id, product_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
          [orderId, item.id, item.quantity, (item.price * item.quantity)]
        );
      }
    }
    res.status(201).json({ success: true, order_id: orderId });
  } catch (error) { next(error); }
});

app.get('/api/orders', async (req, res, next) => {
  try {
    const userId = 1;
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`, [order.id]
      );
      order.items = items;
    }
    res.json(orders);
  } catch (error) { next(error); }
});

app.use((err, req, res, next) => {
  res.status(500).json({ success: false, message: err.message || 'Critical internal backend error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Swaranjali execution portal live on port ${PORT}`));