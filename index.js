// --- INITIALIZE SUPABASE ---
const SUPABASE_URL = "https://vrzlcfszahsxhjiyomee.supabase.co";
const SUPABASE_KEY = "sb_publishable_T96vtoe0I2R5n7BLCE_DfA_Zw8S-ltj";
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- GLOBAL STATE ---
let state = {
    user: null,
    profile: null,
    products: [],
    orders: [],
    cart: [],
    view: 'user', 
    filters: { category: 'All' },
    heroIndex: 0,
    authMode: 'login',
    lastEmail: ''
};

// --- DOM ELEMENTS HELPER ---
const getElements = () => ({
    userView: document.getElementById('user-view'),
    adminView: document.getElementById('admin-view'),
    productGrid: document.getElementById('product-grid'),
    filterBar: document.getElementById('filter-bar'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    cartBadge: document.getElementById('cart-badge'),
    authBtn: document.getElementById('auth-btn'),
    logoutHeaderBtn: document.getElementById('logout-header-btn'),
    authModal: document.getElementById('auth-modal'),
    authClose: document.getElementById('auth-close'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartClose: document.getElementById('cart-close'),
    adminOrders: document.getElementById('admin-orders-list'),
    adminProducts: document.getElementById('admin-products-list'),
    authForm: document.getElementById('auth-form'),
    verifyForm: document.getElementById('verify-form'),
    authTitle: document.getElementById('auth-title'),
    authToggleBtn: document.getElementById('auth-toggle-btn'),
    signupFields: document.getElementById('signup-fields'),
    authMsg: document.getElementById('auth-msg'),
    userDisplay: document.getElementById('user-display'),
    roleDisplay: document.getElementById('role-display'),
    loggedInBox: document.getElementById('logged-in-box'),
    formContainer: document.getElementById('auth-form-container'),
    logoBtn: document.getElementById('logo-btn'),
    cartTrigger: document.getElementById('cart-trigger'),
    authOverlay: document.getElementById('auth-overlay'),
    cartOverlay: document.getElementById('cart-overlay'),
    logoutBtn: document.getElementById('logout-btn'),
    addProductBtn: document.getElementById('add-product-btn'),
    checkoutBtn: document.getElementById('checkout-btn'),
    completeOrderBtn: document.getElementById('complete-order-btn'),
    verifyBackBtn: document.getElementById('verify-back-btn'),
    secretInput: document.getElementById('admin-secret-code'),
    adminToggleBox: document.getElementById('admin-toggle-box'),
    isAdminCheckbox: document.getElementById('is-admin-checkbox')
});

let elements = {};

// --- AUTH FLOW ---
const toggleAuthMode = () => {
    state.authMode = state.authMode === 'login' ? 'signup' : 'login';
    const els = getElements();
    els.authTitle.innerText = state.authMode === 'login' ? 'Sign In' : 'Create Account';
    els.authToggleBtn.innerText = state.authMode === 'login' ? 'Create Account' : 'Back to Login';
    document.getElementById('auth-toggle-text').innerText = state.authMode === 'login' ? "Don't have an account?" : 'Already have an account?';
    els.signupFields.classList.toggle('hidden', state.authMode === 'login');
    document.getElementById('auth-submit-btn').innerText = state.authMode === 'login' ? 'Sign In' : 'Register';
    els.authMsg.innerText = '';
    
    // Reset admin unlock UI
    els.secretInput.value = '';
    els.adminToggleBox.classList.add('hidden');
    els.isAdminCheckbox.checked = false;
};

const updateSession = async () => {
    const { data: { session }, error } = await _supabase.auth.getSession();
    const els = getElements();

    if (session) {
        state.user = session.user;
        const { data: profile } = await _supabase.from('profiles').select('*').eq('id', session.user.id).single();
        state.profile = profile;

        els.authBtn.innerText = "Account";
        els.logoutHeaderBtn.classList.remove('hidden');
        els.userDisplay.innerText = state.profile?.full_name || state.user.email;
        els.roleDisplay.innerText = state.profile?.role === 'admin' ? 'Administrator' : 'Premium Member';
        
        els.formContainer.classList.add('hidden');
        els.loggedInBox.classList.remove('hidden');

        if (state.profile?.role === 'admin') {
            state.view = 'admin';
            els.adminView.classList.add('active');
            els.userView.classList.remove('active');
        } else {
            state.view = 'user';
            els.adminView.classList.remove('active');
            els.userView.classList.add('active');
        }
        loadData();
    } else {
        state.user = null;
        state.profile = null;
        els.authBtn.innerText = "Sign In";
        els.logoutHeaderBtn.classList.add('hidden');
        els.formContainer.classList.remove('hidden');
        els.loggedInBox.classList.add('hidden');
        els.adminView.classList.remove('active');
        els.userView.classList.add('active');
    }
};

const handleAuth = async (e) => {
    e.preventDefault();
    const els = getElements();
    els.authMsg.innerText = "Establishing secure connection...";
    els.authMsg.classList.remove('text-red-500');

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value || 'New Customer';
    
    // Check for secret code and checkbox
    const role = (els.isAdminCheckbox.checked && els.secretInput.value === '251025') ? 'admin' : 'user';
    
    state.lastEmail = email;

    if (state.authMode === 'signup') {
        const { error } = await _supabase.auth.signUp({
            email,
            password,
            options: { 
                data: { 
                    full_name: name,
                    role: role // This is picked up by our SQL trigger
                } 
            }
        });
        
        if (error) {
            els.authMsg.innerText = error.message;
            els.authMsg.classList.add('text-red-500');
            return;
        }

        els.authForm.classList.add('hidden');
        els.verifyForm.classList.remove('hidden');
        els.authMsg.innerText = "Success! Verification code sent to your email.";
        els.authMsg.classList.remove('text-red-500');
    } else {
        // Login
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) {
            els.authMsg.innerText = "Access denied: Invalid credentials.";
            els.authMsg.classList.add('text-red-500');
            return;
        }
        await updateSession();
        toggleModal('auth', false);
    }
};

const handleVerify = async (e) => {
    e.preventDefault();
    const els = getElements();
    const token = document.getElementById('verify-token').value.trim();
    
    // Robust validation for 8 characters (Supabase default is 6, but user specified 8)
    if (token.length < 6) {
        els.authMsg.innerText = "The code is incomplete.";
        els.authMsg.classList.add('text-red-500');
        return;
    }

    els.authMsg.innerText = "Verifying imperial token...";
    els.authMsg.classList.remove('text-red-500');

    const { error } = await _supabase.auth.verifyOtp({
        email: state.lastEmail,
        token: token,
        type: 'signup' // or 'email' depending on Supabase version
    });

    if (error) {
        els.authMsg.innerText = "Verification failed: " + error.message;
        els.authMsg.classList.add('text-red-500');
        console.error("Verification error:", error);
        return;
    }

    els.authMsg.innerText = "Success! Profile established.";
    els.authMsg.classList.remove('text-red-500');
    
    setTimeout(async () => {
        await updateSession();
        els.verifyForm.classList.add('hidden');
        els.authForm.classList.remove('hidden');
        toggleModal('auth', false);
    }, 1500);
};

// --- DATA HANDLERS ---
const loadData = async () => {
    const { data: products } = await _supabase.from('products').select('*');
    state.products = products || [];
    renderProducts();

    if (state.profile?.role === 'admin') {
        const { data: orders } = await _supabase.from('orders').select('*').order('created_at', { ascending: false });
        state.orders = orders || [];
        renderAdminDashboard();
        renderAdminStaff();
    }
};

const renderProducts = () => {
    const els = getElements();
    if (!els.productGrid) return;
    els.productGrid.innerHTML = '';
    const filtered = state.products.filter(p => state.filters.category === 'All' || p.category === state.filters.category);
    
    if (filtered.length === 0) {
        els.productGrid.innerHTML = '<div class="col-span-full py-20 text-center opacity-30 italic">No items found in this collection.</div>';
    }

    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'glass-card rounded-[2.5rem] overflow-hidden group shadow-2xl flex flex-col border border-white/5 transition-all hover:-translate-y-1';
        div.innerHTML = `
            <div class="relative overflow-hidden aspect-[3/4]">
                <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" loading="lazy">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onclick="window.addToCart('${p.id}')" class="bg-amber-500 text-black px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all">Add to Cart</button>
                </div>
            </div>
            <div class="p-6">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-[10px] font-bold text-white uppercase tracking-widest">${p.name}</h4>
                    <span class="text-amber-500 font-bold text-[10px]">Rs. ${p.price.toLocaleString()}</span>
                </div>
                <p class="text-[8px] uppercase tracking-widest text-white/20">${p.category}</p>
            </div>
        `;
        els.productGrid.appendChild(div);
    });
};

const renderAdminDashboard = () => {
    const els = getElements();
    if (!els.adminOrders) return;
    els.adminOrders.innerHTML = '';
    state.orders.forEach(o => {
        const div = document.createElement('div');
        div.className = 'stat-card flex flex-col md:flex-row justify-between items-center gap-6';
        div.innerHTML = `
            <div class="text-center md:text-left">
                <p class="text-[10px] text-amber-500/50 uppercase tracking-widest">Order #${o.id.slice(0,8)}</p>
                <p class="text-sm font-bold gold-gradient truncate max-w-[200px]">${o.customer_email}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/40 mt-1">${o.status} &bull; Rs. ${o.total.toLocaleString()}</p>
            </div>
            <select onchange="window.updateOrderStatus('${o.id}', this.value)" class="bg-black border border-amber-500/20 rounded-xl px-4 py-2 text-[10px] uppercase text-amber-500 outline-none cursor-pointer">
                <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            </select>
        `;
        els.adminOrders.appendChild(div);
    });

    const revenue = state.orders.reduce((s,o) => s + o.total, 0);
    const stock = state.products.reduce((s,p) => s + (p.stock || 0), 0);
    document.getElementById('stat-revenue').innerText = `Rs. ${revenue.toLocaleString()}`;
    document.getElementById('stat-orders').innerText = state.orders.length;
    document.getElementById('stat-stock').innerText = stock;

    els.adminProducts.innerHTML = '';
    state.products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'stat-card flex items-center gap-5';
        div.innerHTML = `
            <img src="${p.image}" class="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg">
            <div class="flex-grow">
                <p class="text-xs font-bold uppercase">${p.name}</p>
                <p class="text-[9px] text-amber-500/50 mt-1">Stock: ${p.stock || 0} &bull; ${p.category}</p>
            </div>
            <button onclick="window.editProduct('${p.id}')" class="text-[10px] uppercase text-amber-500 font-bold hover:scale-110 transition-all">Edit</button>
        `;
        els.adminProducts.appendChild(div);
    });
};

const renderAdminStaff = async () => {
    const { data: staff } = await _supabase.from('profiles').select('*').eq('role', 'admin');
    const container = document.getElementById('admin-staff-list');
    if (container && staff) {
        container.innerHTML = staff.map(s => `
            <div class="flex justify-between items-center text-[10px] text-white/50 bg-white/5 p-4 rounded-xl border border-amber-500/10">
                <span class="truncate w-40">${s.email}</span>
                <span class="text-[8px] text-amber-500 font-bold uppercase tracking-widest border border-amber-500/30 px-2 py-1 rounded-full">Admin</span>
            </div>
        `).join('');
    }
};

// --- CORE FUNCTIONS ---
window.addToCart = (id) => {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    const existing = state.cart.find(x => x.id === id);
    if (existing) existing.qty++; else state.cart.push({...p, qty: 1});
    updateCartUI();
    toggleDrawer('cart', true);
};

const updateCartUI = () => {
    const els = getElements();
    els.cartItems.innerHTML = '';
    let total = 0;
    state.cart.forEach(item => {
        total += item.price * item.qty;
        const div = document.createElement('div');
        div.className = 'flex space-x-4 items-center bg-white/5 p-4 rounded-2xl border border-white/5';
        div.innerHTML = `
            <img src="${item.image}" class="w-14 h-18 object-cover rounded-xl">
            <div class="flex-grow">
                <p class="text-[11px] font-bold uppercase truncate">${item.name}</p>
                <p class="text-amber-400 text-[10px] mt-1">Rs. ${item.price.toLocaleString()} x ${item.qty}</p>
            </div>
            <button onclick="window.removeFromCart('${item.id}')" class="text-white/20 hover:text-white transition-colors">✕</button>
        `;
        els.cartItems.appendChild(div);
    });
    els.cartTotal.innerText = `Rs. ${total.toLocaleString()}`;
    els.cartBadge.innerText = state.cart.reduce((s,i) => s + i.qty, 0);
    els.cartBadge.classList.toggle('hidden', state.cart.length === 0);
};

window.removeFromCart = (id) => {
    state.cart = state.cart.filter(x => x.id !== id);
    updateCartUI();
};

window.updateOrderStatus = async (id, status) => {
    await _supabase.from('orders').update({ status }).eq('id', id);
    loadData();
};

window.editProduct = (id) => {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    const newStock = prompt(`Update stock for ${p.name}:`, p.stock);
    if (newStock !== null) _supabase.from('products').update({ stock: parseInt(newStock) }).eq('id', id).then(() => loadData());
};

const toggleModal = (id, show) => {
    const m = document.getElementById(`${id}-modal`);
    if (m) m.classList.toggle('active', show);
};

const toggleDrawer = (id, show) => {
    const d = document.getElementById(`${id}-drawer`);
    if (d) d.classList.toggle('active', show);
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    elements = getElements();
    await updateSession();
    
    elements.authBtn.onclick = () => toggleModal('auth', true);
    elements.logoutHeaderBtn.onclick = async () => { await _supabase.auth.signOut(); window.location.reload(); };
    elements.authClose.onclick = () => toggleModal('auth', false);
    elements.authOverlay.onclick = () => toggleModal('auth', false);
    elements.authToggleBtn.onclick = toggleAuthMode;
    elements.authForm.onsubmit = handleAuth;
    elements.verifyForm.onsubmit = handleVerify;
    elements.verifyBackBtn.onclick = () => {
        elements.verifyForm.classList.add('hidden');
        elements.authForm.classList.remove('hidden');
        elements.authMsg.innerText = '';
    };

    // Secret Admin Unlock Logic
    elements.secretInput.oninput = (e) => {
        if (e.target.value === '251025') {
            elements.adminToggleBox.classList.remove('hidden');
        } else {
            elements.adminToggleBox.classList.add('hidden');
            elements.isAdminCheckbox.checked = false;
        }
    };

    elements.logoutBtn.onclick = async () => { await _supabase.auth.signOut(); window.location.reload(); };

    elements.logoBtn.onclick = () => {
        elements.userView.classList.add('active');
        elements.adminView.classList.remove('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    elements.cartTrigger.onclick = () => toggleDrawer('cart', true);
    elements.cartClose.onclick = () => toggleDrawer('cart', false);
    elements.cartOverlay.onclick = () => toggleDrawer('cart', false);
    
    elements.checkoutBtn.onclick = () => {
        if (!state.user) return toggleModal('auth', true);
        document.getElementById('cart-footer').classList.add('hidden');
        document.getElementById('payment-section').classList.remove('hidden');
    };

    elements.completeOrderBtn.onclick = async () => {
        const total = state.cart.reduce((s,i) => s + (i.price * i.qty), 0);
        const { error } = await _supabase.from('orders').insert({
            user_id: state.user.id,
            customer_email: state.user.email,
            items: state.cart,
            total: total,
            status: 'Pending'
        });
        if (!error) {
            alert("Order confirmed. Shani Fashion thanks you for your grace.");
            state.cart = []; updateCartUI();
            toggleDrawer('cart', false);
            document.getElementById('cart-footer').classList.remove('hidden');
            document.getElementById('payment-section').classList.add('hidden');
        } else {
            alert("Transaction Error: " + error.message);
        }
    };

    const cats = ['All', 'Evening Wear', 'Occasions', 'Business', 'Bridal', 'Casual'];
    if (elements.filterBar) {
        cats.forEach(c => {
            const b = document.createElement('button');
            b.className = "px-6 py-2 text-[10px] uppercase tracking-widest rounded-full border border-white/5 text-white/30 whitespace-nowrap hover:border-amber-500/50 transition-all";
            b.innerText = c;
            b.onclick = () => {
                state.filters.category = c;
                Array.from(elements.filterBar.children).forEach(ch => {
                    ch.classList.remove('bg-amber-500', 'text-black', 'border-amber-500');
                    ch.classList.add('text-white/30', 'border-white/5');
                });
                b.classList.add('bg-amber-500', 'text-black', 'border-amber-500');
                renderProducts();
            };
            elements.filterBar.appendChild(b);
        });
    }

    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        setInterval(() => {
            slides[state.heroIndex].classList.remove('active');
            state.heroIndex = (state.heroIndex + 1) % slides.length;
            slides[state.heroIndex].classList.add('active');
        }, 6000);
    }
    
    elements.addProductBtn.onclick = () => {
        const name = prompt("Product Name:");
        const price = prompt("Price (Rs):");
        const category = prompt("Category:", "Evening Wear");
        const image = prompt("Image URL:");
        if (name && price && image) {
            _supabase.from('products').insert({
                name, price: parseInt(price), category, image, stock: 10
            }).then(() => loadData());
        }
    };
});

// Particles
const initParticles = () => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('mousemove', (e) => {
        for(let i=0; i<3; i++) particles.push({ x: e.clientX, y: e.clientY, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, life: 1, size: Math.random()*2 });
    });
    const animate = () => {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.01;
            if(p.life <= 0) particles.splice(i, 1);
            ctx.fillStyle = `rgba(180, 138, 62, ${p.life})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(animate);
    };
    animate();
};
initParticles();