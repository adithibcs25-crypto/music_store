CREATE DATABASE IF NOT EXISTS music_store;
USE music_store;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  history TEXT,
  characteristics TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 10,
  image VARCHAR(255),
  sound_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  order_status VARCHAR(50) DEFAULT 'Processing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insert Sample Products with online placeholder sound files
INSERT INTO products (name, category, description, history, characteristics, price, stock, image, sound_url) VALUES
('Sitar', 'String', 'Premium Teakwood Classical Sitar.', 'Dates back to the 14th century, evolving from the Veena.', 'Sympathetic strings creating bright, resonant, meditative drone overtones.', 35000.00, 5, 'https://images.unsplash.com/photo-1615140228704-517df4eb5b1b?w=500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
('Tabla', 'Percussion', 'Professional Concert-Grade Heavy Sheesham Tabla Set.', 'Evolved in the Indian subcontinent around the 18th century.', 'Deep clear bass (Bayan) paired with crisp metallic treble hits (Dayan).', 18000.00, 8, 'https://images.unsplash.com/photo-1588449668338-d134ac7a315f?w=500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
('Bansuri', 'Wind', 'Premium Assamese Bamboo Flute (Scale E Medium).', 'Ancient musical instrument associated with Lord Krishna.', 'Warm, organic, deeply ethereal and highly expressive acoustic tone.', 35000.00, 15, 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'),
('Harmonium', 'Keyboard', '3.5 Octave Double Bellow Rich Brass Reeds Harmonium.', 'Adapted into Indian Classical music context during the 19th century.', 'Sustained, vibrant, dense drone chord structures with rich harmonics.', 22000.00, 4, 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3');

-- Insert a Mock User for demonstration flow
INSERT INTO users (id, name, email, phone, address) VALUES (1, 'Rohan Sharma', 'rohan@example.com', '9876543210', '12, MG Road, Bengaluru, Karnataka');