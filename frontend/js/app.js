const API_URL = 'http://localhost:5000/api';
const DEFAULT_USER_ID = 1;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  setupGlobalAudioEngine();
  
  const page = window.location.pathname.split("/").pop();
  if (page === 'index.html' || page === '') loadFeaturedProducts();
  if (page === 'instruments.html') loadHeritageGalleryView();
  if (page === 'details.html') loadIndividualDetailsView();
  if (page === 'shop.html') loadRetailShopView();
  if (page === 'cart.html') renderCartView();
  if (page === 'payment.html') handleCheckoutFlow();
  if (page === 'orders.html') renderOrdersHistory();
  if (page === 'thankyou.html') renderInvoiceDetails();
});

function initTheme() {
  const toggleBtn = document.querySelector('.theme-btn');
  if(!toggleBtn) return;
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);
  toggleBtn.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
  toggleBtn.addEventListener('click', () => {
    const nextTheme = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
    toggleBtn.innerHTML = nextTheme === 'dark' ? '☀️' : '🌙';
  });
}

function initMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const links = document.querySelector('.nav-links');
  if(toggle) toggle.addEventListener('click', () => links.classList.toggle('active'));
}

let activeAudio = null;
function setupGlobalAudioEngine() {
  window.toggleSoundPreview = function(url, button) {
    if (activeAudio && activeAudio.src === url) {
      if (!activeAudio.paused) { activeAudio.pause(); button.innerText = '🔊 Listen Tonal Preview'; return; }
      else { activeAudio.play(); button.innerText = '⏸️ Stop Audio'; return; }
    }
    if (activeAudio) { activeAudio.pause(); document.querySelectorAll('.btn-preview-audio').forEach(b => b.innerText = '🔊 Listen Tonal Preview'); }
    activeAudio = new Audio(url);
    activeAudio.play().then(() => { button.innerText = '⏸️ Stop Audio'; }).catch(() => alert('Audio file offline.'));
    activeAudio.onended = () => { button.innerText = '🔊 Listen Tonal Preview'; };
  };
}

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    return await res.json();
  } catch (err) { return []; }
}

async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const products = await fetchProducts();
  grid.innerHTML = products.slice(0, 4).map(p => `
    <div class="card" style="padding: 1rem;">
      <img src="${p.image}" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">
      <h3 style="margin-top:0.5rem;">${p.name}</h3>
      <p style="color:var(--primary); font-weight:bold; margin-top:0.25rem;">₹${parseFloat(p.price).toLocaleString('en-IN')}</p>
    </div>
  `).join('');
}

/* Heritage Museum Display Controller */
async function loadHeritageGalleryView() {
  const root = document.getElementById('instruments-gallery-root');
  if (!root) return;
  const products = await fetchProducts();
  
  root.innerHTML = products.map(p => `
    <div class="gallery-card">
      <img src="${p.image}" alt="${p.name}">
      <div class="gallery-title">${p.name}</div>
      <a href="details.html?id=${p.id}" class="btn-know-more">Know More</a>
    </div>
  `).join('');
}

/* Deep Dive Description Component Engine */
async function loadIndividualDetailsView() {
  const container = document.getElementById('details-view-container');
  if (!container) return;
  
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  
  const products = await fetchProducts();
  const instrument = products.find(p => p.id === productId);
  
  if(!instrument) {
    container.innerHTML = "<h2>Document file not found.</h2>";
    return;
  }

  container.innerHTML = `
    <div>
      <img src="${instrument.image}" class="details-img" alt="${instrument.name}">
    </div>
    <div>
      <h1 style="font-family: Georgia, serif; font-size: 3rem; color: var(--primary);">${instrument.name}</h1>
      <span style="color: var(--accent); font-weight: bold; letter-spacing: 1px;">CATEGORY: ${instrument.category.toUpperCase()}</span>
      
      <p style="font-size: 1.1rem; line-height: 1.7; margin-top: 1.5rem; opacity: 0.85;">${instrument.description}</p>
      
      <div class="meta-box">
        <div class="meta-item">
          <span class="meta-title">📜 History & Cultural Origins</span>
          <p>${instrument.history || 'Ancient origin linked natively to traditional music systems.'}</p>
        </div>
        <div class="meta-item">
          <span class="meta-title">🪵 Materials & Craftsmanship</span>
          <p>${instrument.materials || 'Sourced with premium acoustic materials.'}</p>
        </div>
        <div class="meta-item">
          <span class="meta-title">🎵 Structural Tone & Acoustics</span>
          <p>${instrument.characteristics || 'Produces beautiful resonant harmonics.'}</p>
        </div>
      </div>
      
      <br>
      <button class="btn-primary btn-preview-audio" style="width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 30px;" 
        onclick="toggleSoundPreview('${instrument.sound_url}', this)">🔊 Listen Tonal Preview</button>
    </div>
  `;
}

/* Standard Online Shop Rendering */
async function loadRetailShopView() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const products = await fetchProducts();
  
  grid.innerHTML = products.map(p => `
    <div class="card" style="padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
      <img src="${p.image}" style="width:100%; height:220px; object-fit:cover; border-radius:12px;">
      <div style="margin-top:1rem;">
        <h3>${p.name}</h3>
        <p style="font-size:0.9rem; opacity:0.8; margin:0.5rem 0;">${p.description}</p>
        <div style="font-size:1.3rem; color:var(--primary); font-weight:bold; margin-bottom:1rem;">₹${parseFloat(p.price).toLocaleString('en-IN')}</div>
      </div>
      <div style="display:flex; gap:0.5rem;">
        <button class="btn-primary" style="flex:1;" onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.image}')">Add to Cart</button>
        <button class="btn-secondary" style="flex:1;" onclick="buyNow(${p.id}, '${p.name}', ${p.price}, '${p.image}')">Buy Now</button>
      </div>
    </div>
  `).join('');
}

window.addToCart = function(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const matches = cart.find(item => item.id === id);
  if(matches) { matches.quantity += 1; } 
  else { cart.push({ id, name, price, image, quantity: 1 }); }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${name} added to cart!`);
};

window.buyNow = function(id, name, price, image) {
  addToCart(id, name, price, image);
  window.location.href = 'cart.html';
};

function renderCartView() {
  const wrapper = document.getElementById('cart-wrapper');
  if(!wrapper) return;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  if(cart.length === 0) { wrapper.innerHTML = `<h2>Your cart is empty.</h2>`; return; }
  let subtotal = 0;
  let html = cart.map(item => {
    subtotal += item.price * item.quantity;
    return `<div class="cart-item"><h4>${item.name} (x${item.quantity})</h4><div>₹${(item.price * item.quantity).toLocaleString('en-IN')}</div></div>`;
  }).join('');
  wrapper.innerHTML = `${html}<br><h3>Total Amount (inc. GST): ₹${(subtotal * 1.18).toLocaleString('en-IN')}</h3><br><button class="btn-primary" onclick="localStorage.setItem('checkout_total',${subtotal * 1.18}); window.location.href='payment.html'">Proceed to Payment</button>`;
}

function handleCheckoutFlow() {
  const form = document.getElementById('payment-form');
  if(!form) return;
  document.getElementById('amount-due').innerText = parseFloat(localStorage.getItem('checkout_total')).toLocaleString('en-IN');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    localStorage.setItem('last_order', JSON.stringify({ order_id: Math.floor(Math.random()*10000), total: localStorage.getItem('checkout_total'), date: new Date().toLocaleDateString(), items: JSON.parse(localStorage.getItem('cart')) }));
    localStorage.removeItem('cart');
    window.location.href = 'thankyou.html';
  });
}

async function renderOrdersHistory() {
  const container = document.getElementById('orders-container');
  if(!container) return;
  container.innerHTML = "<p>No orders recorded in this offline test session.</p>";
}
function renderInvoiceDetails() {
  const data = JSON.parse(localStorage.getItem('last_order'));
  if(!data) return;
  document.getElementById('invoice-order-id').innerText = 'SWARANJALI-' + data.order_id;
}