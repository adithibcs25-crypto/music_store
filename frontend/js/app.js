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
    activeAudio.play().then(() => { button.innerText = '⏸️ Stop Audio'; }).catch(() => alert('Audio stream link configuration error.'));
    activeAudio.onended = () => { button.innerText = '🔊 Listen Tonal Preview'; };
  };
}

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    return await res.json();
  } catch (err) { return []; }
}

/* Home Section: Clicking Masterpiece card navigates user directly to Retail Purchase Marketplace */
async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const products = await fetchProducts();
  grid.innerHTML = products.slice(0, 4).map(p => `
    <div class="card" style="padding: 1.25rem; cursor: pointer; transition: transform 0.2s;" onclick="window.location.href='shop.html'">
      <img src="${p.image}" style="width:100%; height:200px; object-fit:cover; border-radius:8px;">
      <h3 style="margin-top:0.75rem; font-family: Georgia, serif;">${p.name}</h3>
      <p style="color:var(--primary); font-weight:bold; margin-top:0.25rem; font-size:1.1rem;">₹${parseFloat(p.price).toLocaleString('en-IN')}</p>
      <span style="color: var(--accent); font-size: 0.85rem; display:block; margin-top: 0.5rem; font-weight: bold;">Click to Purchase &rarr;</span>
    </div>
  `).join('');
}

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

async function loadIndividualDetailsView() {
  const container = document.getElementById('details-view-container');
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get('id'));
  const products = await fetchProducts();
  const instrument = products.find(p => p.id === productId);
  
  if(!instrument) { container.innerHTML = "<h2>Specification Document File Missing.</h2>"; return; }

  container.innerHTML = `
    <div><img src="${instrument.image}" class="details-img" alt="${instrument.name}"></div>
    <div>
      <h1 style="font-family: Georgia, serif; font-size: 3rem; color: var(--primary);">${instrument.name}</h1>
      <span style="color: var(--accent); font-weight: bold; letter-spacing: 1px;">CATEGORY: ${instrument.category.toUpperCase()}</span>
      <p style="font-size: 1.1rem; line-height: 1.7; margin-top: 1.5rem; opacity: 0.85;">${instrument.description}</p>
      <div class="meta-box">
        <div class="meta-item"><span class="meta-title">📜 History & Cultural Origins</span><p>${instrument.history}</p></div>
        <div class="meta-item"><span class="meta-title">🪵 Materials Used in Craftsmanship</span><p>${instrument.materials}</p></div>
        <div class="meta-item"><span class="meta-title">🎵 Structural Tone & Acoustics</span><p>${instrument.characteristics}</p></div>
      </div><br>
      <button class="btn-primary btn-preview-audio" style="width: 100%; padding: 1rem; font-size: 1.1rem; border-radius: 30px;" onclick="toggleSoundPreview('${instrument.sound_url}', this)">🔊 Listen Tonal Preview</button>
    </div>
  `;
}

async function loadRetailShopView() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const products = await fetchProducts();
  grid.innerHTML = products.map(p => `
    <div class="card" style="padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
      <img src="${p.image}" style="width:100%; height:220px; object-fit:cover; border-radius:12px;">
      <div style="margin-top:1rem;">
        <h3 style="font-family: Georgia, serif;">${p.name}</h3>
        <p style="font-size:0.9rem; opacity:0.8; margin:0.5rem 0; line-height:1.4;">${p.description}</p>
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
  alert(`${name} successfully registered into your selection Cart!`);
};

window.buyNow = function(id, name, price, image) {
  addToCart(id, name, price, image);
  window.location.href = 'cart.html';
};

/* Cart View Engine featuring direct, clean removal capability rules */
function renderCartView() {
  const wrapper = document.getElementById('cart-wrapper');
  if(!wrapper) return;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if(cart.length === 0) {
    wrapper.innerHTML = `<h2>Your shopping selection bag is completely empty.</h2><br><a href="shop.html" class="btn-primary">Browse Shop</a>`;
    return;
  }

  let subtotal = 0;
  let itemsHtml = cart.map(item => {
    subtotal += item.price * item.quantity;
    return `
      <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--glass-border); padding: 1rem 0;">
        <h4>${item.name}</h4>
        <div class="quantity-control">
          <button onclick="changeQty(${item.id}, -1)">-</button>
          <span style="margin: 0 0.5rem;">${item.quantity}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <div>₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        <button class="btn-secondary" style="padding: 0.25rem 0.75rem; border-color: red; color: red;" onclick="removeCartItem(${item.id})">❌ Remove</button>
      </div>
    `;
  }).join('');

  let gst = subtotal * 0.18;
  let grandTotal = subtotal + gst;

  wrapper.innerHTML = `
    <div class="cart-container">
      <div>${itemsHtml}</div>
      <div class="card" style="padding:2rem; height: fit-content; margin-top:2rem;">
        <h3>Order Balance Summary</h3><br>
        <p>Base Pricing Total: <span style="float:right;">₹${subtotal.toLocaleString('en-IN')}</span></p><br>
        <p>Statutory GST (18%): <span style="float:right;">₹${gst.toLocaleString('en-IN')}</span></p><hr style="margin:1rem 0; border:1px solid var(--glass-border);">
        <h4>Grand Net Payable: <span style="float:right; color:var(--primary);">₹${grandTotal.toLocaleString('en-IN')}</span></h4><br>
        <button class="btn-primary" style="width:100%;" onclick="localStorage.setItem('checkout_total', ${grandTotal}); window.location.href='payment.html'">Proceed to Payment Checkout</button>
      </div>
    </div>
  `;
}

window.changeQty = function(id, delta) {
  let cart = JSON.parse(localStorage.getItem('cart'));
  let target = cart.find(i => i.id === id);
  if(target) {
    target.quantity += delta;
    if(target.quantity <= 0) cart = cart.filter(i => i.id !== id);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartView();
  }
};

window.removeCartItem = function(id) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartView();
};

function handleCheckoutFlow() {
  const form = document.getElementById('payment-form');
  if(!form) return;
  document.getElementById('amount-due').innerText = parseFloat(localStorage.getItem('checkout_total')).toLocaleString('en-IN');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cart = JSON.parse(localStorage.getItem('cart'));
    const total = localStorage.getItem('checkout_total');
    
    const payload = {
      user_id: DEFAULT_USER_ID,
      total_amount: total,
      payment_method: document.getElementById('payment_method').value,
      items: cart
    };

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const orderData = await res.json();
      
      if(orderData.success) {
        localStorage.setItem('last_order', JSON.stringify({ order_id: orderData.order_id, total: total, date: new Date().toLocaleDateString('en-IN'), items: cart }));
        localStorage.removeItem('cart');
        window.location.href = 'thankyou.html';
      }
    } catch (err) { alert("Checkout system failure exception."); }
  });
}

/* Orders Dashboard History Hydrator */
async function renderOrdersHistory() {
  const container = document.getElementById('orders-container');
  if(!container) return;
  
  container.innerHTML = "<h3>Syncing tracking metrics with master relational server database...</h3>";
  try {
    const res = await fetch(`${API_URL}/orders`);
    const orders = await res.json();
    
    if(orders.length === 0) { container.innerHTML = "<p>No transaction tickets recorded in this dashboard profile.</p>"; return; }

    container.innerHTML = orders.map(o => `
      <div class="card" style="padding:2rem; margin-bottom:2rem; width:100%;">
        <div style="display:flex; justify-content:space-between; border-bottom:1px solid var(--glass-border); padding-bottom:1rem; margin-bottom:1rem;">
          <div><strong>Order Number ID:</strong> SWARANJALI-${o.id}</div>
          <div><strong>Date:</strong> ${new Date(o.created_at).toLocaleDateString('en-IN')}</div>
          <div><strong>Routing Status:</strong> <span style="color:green; font-weight:bold;">${o.order_status}</span></div>
        </div>
        <div>
          ${o.items.map(i => `<p style="margin-bottom:0.5rem;">• ${i.name} (x${i.quantity}) - <span style="opacity:0.8;">Subtotal: ₹${parseFloat(i.subtotal).toLocaleString('en-IN')}</span></p>`).join('')}
        </div>
        <div style="text-align:right; margin-top:1rem; font-size:1.1rem; font-weight:bold; color:var(--primary);">Net Disbursed: ₹${parseFloat(o.total_amount).toLocaleString('en-IN')}</div>
      </div>
    `).join('');
  } catch (err) { container.innerHTML = "<p>Error rendering database historical data logs.</p>"; }
}

/* Invoice Renderer using native window printing to generate PDFs without external library constraints */
function renderInvoiceDetails() {
  const data = JSON.parse(localStorage.getItem('last_order'));
  if(!data) return;
  document.getElementById('invoice-order-id').innerText = 'SWARANJALI-' + data.order_id;
  
  window.downloadInvoicePDF = function() {
    const originalBody = document.body.innerHTML;
    
    let printableContent = `
      <div style="padding: 3rem; font-family: 'Segoe UI', sans-serif; color: #333; line-height: 1.6;">
        <h1 style="color: #800020; font-family: Georgia, serif; text-align:center; border-bottom: 3px double #FF8C00; padding-bottom: 1rem;">OFFICIAL INVOICE RECEIPT</h1>
        <p style="margin-top: 2rem;"><strong>Receipt ID reference:</strong> SWARANJALI-${data.order_id}</p>
        <p><strong>Transaction Date Log:</strong> ${data.date}</p>
        <hr style="border: 0; border-top: 1px dashed #ccc; margin: 2rem 0;">
        <h3>Purchased Inventory Registry:</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem; text-align: left;">
          <thead>
            <tr style="background: #f9f9f9; border-bottom: 2px solid #333;">
              <th style="padding: 0.5rem;">Instrument Model Description</th>
              <th style="padding: 0.5rem;">Quantity Purchased</th>
              <th style="padding: 0.5rem; text-align: right;">Total Layout Outlay Balance</th>
            </tr>
          </thead>
          <tbody>
            ${data.items.map(item => `
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 0.75rem 0.5rem;">${item.name}</td>
                <td style="padding: 0.75rem 0.5rem;">${item.quantity}</td>
                <td style="padding: 0.75rem 0.5rem; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="text-align: right; margin-top: 3rem; font-size: 1.3rem; font-weight: bold; color: #800020;">
          Net Certified Paid Amount (Inc. GST): ₹${parseFloat(data.total).toLocaleString('en-IN')}
        </div>
        <div style="margin-top: 5rem; text-align: center; font-size: 0.85rem; opacity: 0.7;">
          Thank you for choosing Swaranjali, sustaining classical sound art preservation. This document acts as an authentic transaction verification.
        </div>
      </div>
    `;

    document.body.innerHTML = printableContent;
    window.print();
    
    // Restore layout instantly upon printer pipeline suspension/completion
    document.body.innerHTML = originalBody;
    window.location.reload();
  };
}