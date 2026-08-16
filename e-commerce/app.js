
const PRODUCTS = [
    { id: 'p1', name: 'Finca Vista Hermosa', origin: 'Huehuetenango, Guatemala', batch: '#214-A', roast: 0.28, notes: 'Stone fruit, brown sugar, soft citrus finish.', price: 19.5 },
    { id: 'p2', name: 'Yirgacheffe Konga', origin: 'Gedeo Zone, Ethiopia', batch: '#214-B', roast: 0.18, notes: 'Jasmine, bergamot, bright and tea-like.', price: 21.0 },
    { id: 'p3', name: 'Sul de Minas', origin: 'Minas Gerais, Brazil', batch: '#213-D', roast: 0.62, notes: 'Toasted hazelnut, dark chocolate, low acidity.', price: 17.0 },
    { id: 'p4', name: 'Kintamani Reserve', origin: 'Bali, Indonesia', batch: '#213-C', roast: 0.55, notes: 'Cedar, clove, dried fig, syrupy body.', price: 22.5 },
    { id: 'p5', name: 'Tarrazú Los Santos', origin: 'San José, Costa Rica', batch: '#212-A', roast: 0.4, notes: 'Red apple, honey, clean crisp finish.', price: 20.0 },
    { id: 'p6', name: 'Mandheling Deep Cut', origin: 'Sumatra, Indonesia', batch: '#212-F', roast: 0.82, notes: 'Molasses, dark cocoa, smoky finish.', price: 18.5 },
];

let cart = {}; // id -> qty

function roastLabel(r) {
    if (r < 0.35) return 'Light';
    if (r < 0.6) return 'Medium';
    return 'Dark';
}

function roastCurveSVG(r) {
    // r in [0,1]: lower = long flat curve (light), higher = short steep curve (dark)
    const endX = 8 + (1 - r) * 44; // where curve peaks, light = further right
    const peakY = 4 + r * 2;
    return `<svg viewBox="0 0 60 20" fill="none"><path d="M2 18 C ${endX * 0.4} 17, ${endX * 0.7} ${10 - r * 4}, ${endX + 8} ${peakY}" stroke="#C89B3C" stroke-width="1.4"/><circle cx="${endX + 8}" cy="${peakY}" r="1.6" fill="#C89B3C"/></svg>`;
}

function renderGrid() {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = PRODUCTS.map(p => `
    <div class="card">
      <div class="card-photo" style="background:linear-gradient(160deg, ${roastColor(p.roast)} 0%, #241A12 100%);">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#F4EDE1" stroke-opacity="0.5" stroke-width="1.3">
          <ellipse cx="12" cy="12" rx="7" ry="9"/><path d="M12 3v18"/>
        </svg>
      </div>
      <div class="card-body">
        <div class="card-top">
          <div>
            <div class="card-title">${p.name}</div>
            <div class="card-origin">${p.origin}</div>
          </div>
          <div class="card-batch">${p.batch}</div>
        </div>
        <div class="roast-mini">${roastCurveSVG(p.roast)}<span>${roastLabel(p.roast)} roast</span></div>
        <div class="card-notes">${p.notes}</div>
        <div class="card-bottom">
          <div class="price">$${p.price.toFixed(2)} <span>/ 12oz</span></div>
          <button class="add-btn" onclick="addToCart('${p.id}')">Add to bag</button>
        </div>
      </div>
    </div>
  `).join('');
}

function roastColor(r) {
    // interpolate from light tan to dark espresso
    const light = [201, 166, 120], dark = [43, 27, 18];
    const c = light.map((v, i) => Math.round(v + (dark[i] - v) * r));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    renderCart();
    openCart();
}
function changeQty(id, delta) {
    cart[id] = (cart[id] || 0) + delta;
    if (cart[id] <= 0) delete cart[id];
    renderCart();
}
function removeItem(id) {
    delete cart[id];
    renderCart();
}

function renderCart() {
    const ids = Object.keys(cart);
    const countEl = document.getElementById('cartCount');
    const itemsEl = document.getElementById('drawerItems');
    const subtotalEl = document.getElementById('subtotalAmt');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const totalCount = ids.reduce((s, id) => s + cart[id], 0);
    countEl.textContent = totalCount;

    if (ids.length === 0) {
        itemsEl.innerHTML = '<div class="empty-cart">Your bag is empty.<br>Add a roast to get started.</div>';
        checkoutBtn.disabled = true;
    } else {
        itemsEl.innerHTML = ids.map(id => {
            const p = PRODUCTS.find(x => x.id === id);
            return `
      <div class="drawer-item">
        <div class="drawer-item-photo" style="background:linear-gradient(160deg, ${roastColor(p.roast)} 0%, #241A12 100%);"></div>
        <div class="drawer-item-info">
          <div class="name">${p.name}</div>
          <div class="meta">${p.batch} · $${p.price.toFixed(2)}</div>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty('${id}',-1)">–</button>
            <span class="qty-num">${cart[id]}</span>
            <button class="qty-btn" onclick="changeQty('${id}',1)">+</button>
            <span class="remove-link" onclick="removeItem('${id}')">Remove</span>
          </div>
        </div>
      </div>`;
        }).join('');
        checkoutBtn.disabled = false;
    }

    const subtotal = ids.reduce((s, id) => s + cart[id] * PRODUCTS.find(x => x.id === id).price, 0);
    subtotalEl.textContent = '$' + subtotal.toFixed(2);
}

function openCart() {
    document.getElementById('drawer').classList.add('open');
    document.getElementById('overlay').classList.add('open');
}
function closeCart() {
    document.getElementById('drawer').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
}

function getSubtotal() {
    return Object.keys(cart).reduce((s, id) => s + cart[id] * PRODUCTS.find(x => x.id === id).price, 0);
}

function openCheckout() {
    const subtotal = getSubtotal();
    const shipping = subtotal > 40 ? 0 : 6.5;
    const total = subtotal + shipping;
    document.getElementById('modalContent').innerHTML = `
    <h3>Checkout</h3>
    <div class="sub">Demo form — no payment is processed and no order is sent anywhere.</div>
    <div class="field"><label>Full name</label><input type="text" placeholder="Jane Roaster"></div>
    <div class="field"><label>Email</label><input type="email" placeholder="jane@example.com"></div>
    <div class="field"><label>Shipping address</label><input type="text" placeholder="123 Drum Street"></div>
    <div class="field-row">
      <div class="field" style="flex:1"><label>City</label><input type="text" placeholder="Bhopal"></div>
      <div class="field" style="flex:1"><label>ZIP</label><input type="text" placeholder="462001"></div>
    </div>
    <div class="order-total">
      <span>Subtotal</span><span class="mono">$${subtotal.toFixed(2)}</span>
    </div>
    <div class="order-total" style="border-top:none; margin-top:-24px; padding-top:0;">
      <span>Shipping</span><span class="mono">${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</span>
    </div>
    <div class="order-total" style="border-top:1px solid #d9cbb0;">
      <span>Total</span><b>$${total.toFixed(2)}</b>
    </div>
    <button class="place-order-btn" onclick="placeOrder()">Place order</button>
    <div class="modal-note">This is a static demo — connect a real payment provider to go live.</div>
  `;
    document.getElementById('checkoutModal').classList.add('open');
}

function placeOrder() {
    document.getElementById('modalContent').innerHTML = `
    <div class="confirm-view">
      <div class="check"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5C6B4F" stroke-width="2"><path d="M4 12l5 5L20 6"/></svg></div>
      <h3 class="display">Order placed</h3>
      <p>This is a demo confirmation. In a live store, a confirmation email and roast batch tracking would follow.</p>
      <button class="close-modal-btn" onclick="finishOrder()">Close</button>
    </div>
  `;
    cart = {};
    renderCart();
}

function finishOrder() {
    document.getElementById('checkoutModal').classList.remove('open');
    closeCart();
}

document.getElementById('checkoutModal').addEventListener('click', (e) => {
    if (e.target.id === 'checkoutModal') e.currentTarget.classList.remove('open');
});

renderGrid();
renderCart();
