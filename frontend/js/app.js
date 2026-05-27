const API_URL = 'http://localhost:5000/api';
const DEFAULT_USER_ID = 1; // Simulated authentication flow context

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  setupGlobalAudioEngine();
  
  const page = window.location.pathname.split("/").pop();
  if (page === 'index.html' || page === '') loadFeaturedProducts();
  if (page === 'instruments.html') loadInstrumentsView(true);
  if (page === 'shop.html') loadInstrumentsView(false);
  if (page === 'cart.html') renderCartView();
  if (page === 'payment.html') handleCheckoutFlow();
  if (page === 'orders.html') renderOrdersHistory();
  if (page === 'thankyou.html') renderInvoiceDetails();
});

/* Theme Custom Engine */
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
  if(toggle) {
    toggle.addEventListener('click', () => links.classList.toggle('active'));
  }
}

/* Audio Player Utility Controller */
let activeAudio = null;
function setupGlobalAudioEngine() {
  window.toggleSoundPreview = function(url, button) {
    if (activeAudio && activeAudio.src === url) {
      if (!activeAudio.paused) {
        activeAudio.pause();
        button.innerText = '🎵 Play Sound';
        return;
      } else {
        activeAudio.play();
        button.innerText = '⏸️ Pause';
        return;
      }
    }
    if (activeAudio) { activeAudio.pause(); document.querySelectorAll('.btn-preview').forEach(b => b.innerText = '🎵 Play Sound'); }
    activeAudio = new Audio(url);
    activeAudio.play().then(() => { button.innerText = '⏸️ Pause'; }).catch(() => showToast('Audio file failed to load.'));
    activeAudio.onended = () => { button.innerText = '🎵 Play Sound'; };
  };
}

/* Toast Messages Generator */
function showToast(message) {
  let container = document.getElementById('toast-container');
  if(!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* Product Loading & State Handling Rules */
async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    return await res.json();
  } catch (err) {
    showToast("Error establishing sync with server backend.");
    return [];
  }
}

async function loadFeaturedProducts() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  const products = await fetchProducts();
  grid.innerHTML = products.slice(0, 4).map(p => createProductCardElement(p, false)).join('');
}

async function loadInstrumentsView(includeMetadata = false) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const products = await fetchProducts();
  
  window.allProductsData = products; // Memory local storage assignment for sorting/filtering runtime
  renderFilteredGrid(products, includeMetadata);

  // Setup Event Bindings
  document.getElementById('searchBar')?.addEventListener('input', (e) => filterProducts(includeMetadata));
  document.getElementById('categoryFilter')?.addEventListener('change', (e) => filterProducts(includeMetadata));
  document.getElementById('priceSort')?.addEventListener('change', (e) => filterProducts(includeMetadata));
}

function createProductCardElement(p, detailed = false) {
  return `
    <div class="card">
      <div class="card-img-container">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="card-body">
        <span class="logo" style="font-size:0.8rem; color:var(--accent);">${p.category}</span>
        <h3 class="card-title">${p.name}</h3>
        ${detailed ? `<p style="font-size:0.9rem; margin-bottom:0.5rem; opacity:0.8;"><b>Origin:</b> ${p.history}</p>` : ''}
        ${detailed ? `<p style="font-size:0.9rem; margin-bottom:0.5rem; opacity:0.8;"><b>Acoustics:</b> ${p.characteristics}</p>` : ''}
        <p style="font-size:0.9rem; margin-bottom:1rem; opacity:0.9;">${p.description}</p>
        <div class="card-price">₹${parseFloat(p.price).toLocaleString('en-IN')}</div>
        <button class="btn-primary btn-preview" onclick="toggleSoundPreview('${p.sound_url}', this)">🎵 Play Sound</button>
        <div class="card-actions">
          <button class="btn-primary" onclick="addToCart(${p.id}, '${p.name}', ${p.price}, '${p.image}')">Add To Cart</button>
          <button class="btn-secondary" onclick="buyNow(${p.id}, '${p.name}', ${p.price}, '${p.image}')">Buy Now</button>
        </div>
      </div>
    </div>
  `;
}

function filterProducts(includeMetadata) {
  const searchTxt = document.getElementById('searchBar').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const sortOrder = document.getElementById('priceSort').value;

  let filtered = window.allProductsData.filter(p => {
    return p.name.toLowerCase().includes(searchTxt) && (category === '' || p.category === category);
  });

  if(sortOrder === 'low') filtered.sort((a,b) => a.price - b.price);
  if(sortOrder === 'high') filtered.sort((a,b) => b.price - a.price);

  renderFilteredGrid(filtered, includeMetadata);
}

function renderFilteredGrid(data, includeMetadata) {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = data.map(p => createProductCardElement(p, includeMetadata)).join('');
}

/* Local Cart Engineering & Core Storage Engine Context */
window.addToCart = function(id, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  const matches = cart.find(item => item.id === id);
  if(matches) { matches.quantity += 1; } 
  else { cart.push({ id, name, price, image, quantity: 1 }); }
  localStorage.setItem('cart', JSON.stringify(cart));
  showToast(`${name} added directly to Cart!`);
};

window.buyNow = function(id, name, price, image) {
  addToCart(id, name, price, image);
  window.location.href = 'cart.html';
};

function renderCartView() {
  const wrapper = document.getElementById('cart-wrapper');
  if(!wrapper) return;
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  if(cart.length === 0) {
    wrapper.innerHTML = `<h2>Your shopping cart is currently empty.</h2><br><a href="shop.html" class="btn-primary">Browse Shop</a>`;
    return;
  }

  let subtotal = 0;
  let itemsHtml = cart.map(item => {
    subtotal += item.price * item.quantity;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>₹${parseFloat(item.price).toLocaleString('en-IN')}</p>
        </div>
        <div class="quantity-control">
          <button onclick="changeQty(${item.id}, -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
        </div>
        <div>₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
        <button class="btn-secondary" style="padding:0.4rem;" onclick="removeCartItem(${item.id})">Remove</button>
      </div>
    `;
  }).join('');

  let gst = subtotal * 0.18; // Standardized GST processing calculations
  let grandTotal = subtotal + gst;

  wrapper.innerHTML = `
    <div class="cart-container">
      <div>${itemsHtml}</div>
      <div class="card data-theme-card" style="padding:2rem; height: fit-content;">
        <h3>Order Summary</h3><br>
        <p>Subtotal: <span style="float:right;">₹${subtotal.toLocaleString('en-IN')}</span></p><br>
        <p>GST (18%): <span style="float:right;">₹${gst.toLocaleString('en-IN')}</span></p><hr style="margin:1rem 0; border:1px solid var(--glass-border);">
        <h4>Total Amount: <span style="float:right; color:var(--primary);">₹${grandTotal.toLocaleString('en-IN')}</span></h4><br>
        <button class="btn-primary" style="width:100%;" onclick="proceedToCheckout(${grandTotal})">Proceed To Checkout</button>
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
  let cart = JSON.parse(localStorage.getItem('cart'));
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartView();
};

window.proceedToCheckout = function(grandTotal) {
  localStorage.setItem('checkout_total', grandTotal);
  window.location.href = 'payment.html';
};

/* Payment Pipeline processing & Animations Gateway routing mapping */
function handleCheckoutFlow() {
  const form = document.getElementById('payment-form');
  if(!form) return;
  
  document.getElementById('amount-due').innerText = parseFloat(localStorage.getItem('checkout_total')).toLocaleString('en-IN');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI Loading Animation State Switch
    const payBtn = document.getElementById('pay-btn');
    payBtn.innerText = "Processing Transaction Securely...";
    payBtn.disabled = true;

    const paymentMethod = document.getElementById('payment_method').value;
    const cart = JSON.parse(localStorage.getItem('cart'));
    const total = localStorage.getItem('checkout_total');

    // Mock Payload Compilation Context
    const payload = {
      user_id: DEFAULT_USER_ID,
      total_amount: total,
      payment_method: paymentMethod,
      items: cart
    };

    setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const orderData = await res.json();
        
        if(orderData.success) {
          localStorage.setItem('last_order', JSON.stringify({
            order_id: orderData.order_id,
            total: total,
            date: new Date().toLocaleDateString('en-IN'),
            items: cart
          }));
          localStorage.removeItem('cart');
          window.location.href = 'thankyou.html';
        }
      } catch (err) {
        showToast("Order transaction verification failure error.");
        payBtn.innerText = "Place Order";
        payBtn.disabled = false;
      }
    }, 2000); // 2 second operational delay for loading animation effect
  });
}

/* History Logs Parsing Rendering logic block mapping array values elements */
async function renderOrdersHistory() {
  const container = document.getElementById('orders-container');
  if(!container) return;
  
  container.innerHTML = "<h3>Loading order historical metrics...</h3>";
  try {
    const res = await fetch(`${API_URL}/orders`);
    const orders = await res.json();
    
    if(orders.length === 0) {
      container.innerHTML = "<p>No orders matched your historical record profiles.</p>";
      return;
    }

    container.innerHTML = orders.map(o => `
      <div class="card" style="padding:2rem; margin-bottom:2rem; width:100%;">
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; border-bottom:1px solid var(--glass-border); padding-bottom:1rem; margin-bottom:1rem;">
          <div><strong>Order ID:</strong> SWARANJALI-${o.id}</div>
          <div><strong>Date Ordered:</strong> ${new Date(o.created_at).toLocaleDateString('en-IN')}</div>
          <div><strong>Status:</strong> <span style="color:green; font-weight:bold;">${o.order_status}</span></div>
        </div>
        <div>
          ${o.items.map(item => `
            <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.5rem;">
              <img src="${item.image}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;">
              <div>${item.name} (x${item.quantity})</div>
              <div style="margin-left:auto;">₹${parseFloat(item.subtotal).toLocaleString('en-IN')}</div>
            </div>
          `).join('')}
        </div>
        <div style="text-align:right; margin-top:1rem; font-size:1.2rem; font-weight:bold; color:var(--primary);">
          Total Paid: ₹${parseFloat(o.total_amount).toLocaleString('en-IN')}
        </div>
      </div>
    `).join('');
  } catch (err) { container.innerHTML = "<p>Error loading transaction dashboard.</p>"; }
}

function renderInvoiceDetails() {
  const data = JSON.parse(localStorage.getItem('last_order'));
  if(!data) return;
  document.getElementById('invoice-order-id').innerText = 'SWARANJALI-' + data.order_id;
  
  window.downloadInvoice = function() {
    let invoiceContent = `========================================\n`;
    invoiceContent += `       SWARANJALI MUSIC STORES INVOICE    \n`;
    invoiceContent += `========================================\n`;
    invoiceContent += `Order ID   : SWARANJALI-${data.order_id}\n`;
    invoiceContent += `Date       : ${data.date}\n\n`;
    invoiceContent += `Items Purchased:\n`;
    data.items.forEach(i => {
      invoiceContent += `- ${i.name} [Qty: ${i.quantity}] : ₹${(i.price * i.quantity).toLocaleString('en-IN')}\n`;
    });
    invoiceContent += `----------------------------------------\n`;
    invoiceContent += `Total Paid Amount : ₹${parseFloat(data.total).toLocaleString('en-IN')} (Inc. GST)\n`;
    invoiceContent += `========================================\n`;
    invoiceContent += `Thank you for supporting Indian Musical heritage!\n`;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Invoice_Swaranjali_${data.order_id}.txt`;
    link.click();
  };
}