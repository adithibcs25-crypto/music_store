-- Create the main database container if it doesn't exist
CREATE DATABASE IF NOT EXISTS music_store;
USE music_store;

-- ==========================================
-- 1. USERS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT
);

-- ==========================================
-- 2. PRODUCTS TABLE (Updated with Materials Column)
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  history TEXT,
  characteristics TEXT,
  materials TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 10,
  image VARCHAR(255),
  sound_url VARCHAR(255)
);

-- ==========================================
-- 3. CART TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1
);

-- ==========================================
-- 4. ORDERS MASTER TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  order_status VARCHAR(50) DEFAULT 'Processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. ORDER ITEMS RELATION TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- ==========================================
-- 6. DATA INJECTION: PREMIUM SAMPLE PRODUCTS
-- ==========================================
-- Clear out old records if resetting the database to prevent duplicate error entries
DELETE FROM products;

INSERT INTO products (name, category, description, history, characteristics, materials, price, stock, image, sound_url) VALUES
(
  'Sitar', 
  'String', 
  'Premium Teakwood Classical Concert Sitar.', 
  'Dates back to the 14th century, evolving from the ancient Veena and Persian Tritantri.', 
  'Sympathetic strings creating bright, deeply resonant, meditative drone overtones with sweeping meend capabilities.', 
  'Premium seasoned Burma Teakwood, seasoned gourd resonator (tumba), and hand-plucked German steel/brass strings.',
  35000.00, 
  5, 
  'https://images.unsplash.com/photo-1615140228704-517df4eb5b1b?w=500', 
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
),
(
  'Tabla', 
  'Percussion', 
  'Professional Concert-Grade Heavy Sheesham Tabla Set.', 
  'Evolved in the Indian subcontinent around the 18th century as the primary rhythm companion for classical arts.', 
  'Deep, warm clear bass tones (Bayan) paired with incredibly crisp, high-pitched metallic treble rim hits (Dayan).', 
  'Heavy seasoned dark Sheesham (Rosewood) for the Dayan, heavy polished copper for the Bayan, and hand-woven goat skin heads.',
  18000.00, 
  8, 
  'https://images.unsplash.com/photo-1588449668338-d134ac7a315f?w=500', 
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
),
(
  'Bansuri', 
  'Wind', 
  'Premium Concert Bamboo Flute (Scale E Medium).', 
  'Ancient, highly revered musical instrument associated inherently with divine folklore and pastoral Indian melodies.', 
  'Warm, organic, deeply ethereal breath textures and highly expressive acoustic tone gliding smoothly across octaves.', 
  'Naturally seasoned, straight Assamese premium reed bamboo sticks with hand-bored, precision-calibrated tonal holes.',
  35000.00, 
  15, 
  'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=500', 
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
),
(
  'Harmonium', 
  'Keyboard', 
  '3.5 Octave Double Bellow Rich Brass Reeds Harmonium.', 
  'Adapted into the Indian Classical music framework during the 19th century from Western hand-pumped reed structures.', 
  'Sustained, vibrant, dense drone chord structures featuring rich harmonics that support vocalists flawlessly.', 
  'Polished Kail wood frame, high-grade sustained-resonance English brass reeds, and layered genuine leather hand-bellows.',
  22000.00, 
  4, 
  'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500', 
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
);

-- ==========================================
-- 7. DATA INJECTION: MOCK USER ACCOUNT
-- ==========================================
DELETE FROM users;
INSERT INTO users (id, name, email, phone, address) VALUES 
(1, 'Rohan Sharma', 'rohan@example.com', '9876543210', '12, MG Road, Bengaluru, Karnataka');