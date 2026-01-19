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
    authMode: 'login', // 'login' or 'signup'
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
    cartOverlay: document.getElementById('cart-overlay-el'),
    logoutBtn: document.getElementById('logout-btn'),
    promoteAdminBtn: document.getElementById('promote-admin-btn'),
    addProductBtn: document.getElementById('add-product-btn'),
    checkoutBtn: document.getElementById('checkout-btn'),
    completeOrderBtn: document.getElementById('complete-order-btn'),
    verifyBackBtn: document.getElementById('verify-back-btn')
});

let elements = {};

// --- AUTH FLOW ---
const toggleAuthMode = () => {
    state.authMode = state.authMode === 'login' ? 'signup' : 'login';
    if (elements.authTitle) elements.authTitle.innerText = state.authMode === 'login' ? 'Sign In' : 'Sign Up';
    if (elements.authToggleBtn) elements.authToggleBtn.innerText = state.authMode === 'login' ? 'Sign Up for Access' : 'Back to Login';
    
    const toggleText = document.getElementById('auth-toggle-text');
    if (toggleText) toggleText.innerText = state.authMode === 'login' ? "Don't have an account?" : 'Already have an account?';
    
    if (elements.signupFields) elements.signupFields.classList.toggle('hidden', state.authMode === 'login');
    
    const submitBtn = document.getElementById('auth-submit-btn');
    if (submitBtn) submitBtn.innerText = state.authMode === 'login' ? 'Sign In' : 'Create Account';
};

const updateSession = async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (session) {
        state.user = session.user;
        const { data: profile } = await _supabase.from('profiles').select('*').eq('id', session.user.id).single();
        state.profile = profile;
        
        // HARDCODED ADMIN PROMOTION
        if (state.user.email === 'adithayashenali25@gmail.com' && (!state.profile || state.profile.role !== 'admin')) {
            await _supabase.from('profiles').upsert({ id: state.user.id, email: state.user.email, role: 'admin' });
            state.profile = { ...state.profile, role: 'admin' };
        }

        if (elements.authBtn) elements.authBtn.innerText = "My Profile";
        if (elements.logoutHeaderBtn) elements.logoutHeaderBtn.classList.remove('hidden');
        if (elements.userDisplay) elements.userDisplay.innerText = state.profile?.full_name || state.user.email;
        if (elements.roleDisplay) elements.roleDisplay.innerText = state.profile?.role === 'admin' ? 'Administrator' : 'Premium Member';
        
        if (elements.formContainer) elements.formContainer.classList.add('hidden');
        if (elements.loggedInBox) elements.loggedInBox.classList.remove('hidden');

        if (state.profile?.role === 'admin') {
            state.view = 'admin';
            if (elements.adminView) elements.adminView.classList.add('active');
            if (elements.userView) elements.userView.classList.remove('active');
        } else {
            state.view = 'user';
            if (elements.adminView) elements.adminView.classList.remove('active');
            if (elements.userView) elements.userView.classList.add('active');
        }
        loadData();
    } else {
        state.user = null;
        state.profile = null;
        if (elements.authBtn) elements.authBtn.innerText = "Sign In";
        if (elements.logoutHeaderBtn) elements.logoutHeaderBtn.classList.add('hidden');
        if (elements.formContainer) elements.formContainer.classList.remove('hidden');
        if (elements.loggedInBox) elements.loggedInBox.classList.add('hidden');
        if (elements.adminView) elements.adminView.classList.remove('active');
        if (elements.userView) elements.userView.classList.add('active');
    }
};

const handleAuth = async (e) => {
    e.preventDefault();
    const msg = elements.authMsg;
    msg.innerText = "Please wait...";
    msg.classList.remove('text-red-500');

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value || 'Guest Member';
    state.lastEmail = email;

    if (state.authMode === 'signup') {
        const { data, error } = await _supabase.auth.signUp({
            email, password, options: { data: { full_name: name } }
        });
        
        if (error) {
            msg.innerText = error.message;
            msg.classList.add('text-red-500');
            return;
        }

        // Switch to OTP verify view
        elements.authForm.classList.add('hidden');
        elements.verifyForm.classList.remove('hidden');
        msg.innerText = "Code sent to your email.";
    } else {
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) {
            msg.innerText = "Login failed: " + error.message;
            msg.classList.add('text-red-500');
            return;
        }
        updateSession();
        toggleModal('auth', false);
    }
};

const handleVerify = async (e) => {
    e.preventDefault();
    const token = document.getElementById('verify-token').value;
    const msg = elements.authMsg;
    msg.innerText = "Verifying code...";

    // 8 characters check
    if (token.length < 6) {
        msg.innerText = "Enter a valid code.";
        return;
    }

    const { data, error } = await _supabase.auth.verifyOtp({
        email: state.lastEmail,
        token: token,
        type: 'signup'
    });

    if (error) {
        msg.innerText = "Invalid Code: " + error.message;
        msg.classList.add('text-red-500');
        return;
    }

    msg.innerText = "Verified successfully.";
    setTimeout(() => {
        updateSession();
        elements.verifyForm.classList.add('hidden');
        elements.authForm.classList.remove('hidden');
        toggleModal('auth', false);
    }, 1500);
};

// --- DATA & RENDERERS ---
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
    if (!elements.productGrid) return;
    elements.productGrid.innerHTML = '';
    const filtered = state.products.filter(p => state.filters.category === 'All' || p.category === state.filters.category);
    
    filtered.forEach(p => {
        const div = document.createElement('div');
        div.className = 'glass-royal rounded-[2.5rem] overflow-hidden group shadow-2xl flex flex-col border border-white/5 transform transition-all hover:-translate-y-2';
        div.innerHTML = `
            <div class="relative overflow-hidden aspect-[3/4]">
                <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onclick="window.addToCart('${p.id}')" class="bg-amber-500 text-black px-8 py-3 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-xl">Add to Cart</button>
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
        elements.productGrid.appendChild(div);
    });
};

const renderAdminDashboard = () => {
    if (!elements.adminOrders) return;
    elements.adminOrders.innerHTML = '';
    state.orders.forEach(o => {
        const div = document.createElement('div');
        div.className = 'admin-stat-card flex flex-col md:flex-row justify-between items-center gap-6';
        div.innerHTML = `
            <div class="text-center md:text-left">
                <p class="text-[10px] text-amber-500/50 uppercase tracking-widest">Order #${o.id.slice(0,8)}</p>
                <p class="text-sm font-bold gold-gradient">${o.customer_email}</p>
                <p class="text-[9px] uppercase tracking-widest text-white/40 mt-1">${o.status} &bull; Rs. ${o.total.toLocaleString()}</p>
            </div>
            <select onchange="window.updateOrderStatus('${o.id}', this.value)" class="bg-black border border-amber-500/20 rounded-xl px-4 py-2 text-[9px] uppercase text-amber-500 outline-none">
                <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            </select>
        `;
        elements.adminOrders.appendChild(div);
    });

    const revenue = state.orders.reduce((s,o) => s + o.total, 0);
    const stock = state.products.reduce((s,p) => s + (p.stock || 0), 0);
    if (document.getElementById('stat-revenue')) document.getElementById('stat-revenue').innerText = `Rs. ${revenue.toLocaleString()}`;
    if (document.getElementById('stat-orders')) document.getElementById('stat-orders').innerText = state.orders.length;
    if (document.getElementById('stat-stock')) document.getElementById('stat-stock').innerText = stock;

    if (!elements.adminProducts) return;
    elements.adminProducts.innerHTML = '';
    state.products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'admin-stat-card flex items-center gap-5';
        div.innerHTML = `
            <img src="${p.image}" class="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg">
            <div class="flex-grow">
                <p class="text-xs font-bold uppercase">${p.name}</p>
                <p class="text-[9px] text-amber-500/50 mt-1">Stock: ${p.stock || 0} &bull; ${p.category}</p>
            </div>
            <button onclick="window.editProduct('${p.id}')" class="text-[9px] uppercase text-amber-500 font-bold hover:scale-110 transition-all">Edit</button>
        `;
        elements.adminProducts.appendChild(div);
    });
};

const renderAdminStaff = async () => {
    const { data: staff } = await _supabase.from('profiles').select('*').eq('role', 'admin');
    const container = document.getElementById('admin-staff-list');
    if (container && staff) {
        container.innerHTML = staff.map(s => `
            <div class="flex justify-between items-center text-[10px] text-white/50 bg-white/5 p-4 rounded-2xl border border-amber-500/10">
                <span class="truncate w-40">${s.email}</span>
                <span class="text-[8px] text-amber-500 font-bold uppercase tracking-widest border border-amber-500/30 px-2 py-1 rounded-full">Admin</span>
            </div>
        `).join('');
    }
};

window.promoteAdmin = async () => {
    const emailInput = document.getElementById('new-admin-email');
    const email = emailInput ? emailInput.value : '';
    if (!email) return;
    const { error } = await _supabase.from('profiles').update({ role: 'admin' }).eq('email', email);
    if (error) alert("Error: " + error.message);
    else { 
        alert(`Admin status granted to ${email}.`); 
        loadData(); 
        emailInput.value = '';
    }
};

// --- CORE ---
window.addToCart = (id) => {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    const existing = state.cart.find(x => x.id === id);
    if (existing) existing.qty++; else state.cart.push({...p, qty: 1});
    updateCartUI();
    toggleDrawer('cart', true);
};

const updateCartUI = () => {
    if (!elements.cartItems) return;
    elements.cartItems.innerHTML = '';
    let total = 0;
    state.cart.forEach(item => {
        total += item.price * item.qty;
        const div = document.createElement('div');
        div.className = 'flex space-x-4 items-center bg-white/5 p-4 rounded-3xl border border-white/5';
        div.innerHTML = `
            <img src="${item.image}" class="w-16 h-20 object-cover rounded-2xl">
            <div class="flex-grow">
                <p class="text-xs font-bold uppercase truncate">${item.name}</p>
                <p class="text-amber-400 text-[10px] mt-1">Rs. ${item.price.toLocaleString()} x ${item.qty}</p>
            </div>
            <button onclick="window.removeFromCart('${item.id}')" class="text-white/20 hover:text-white">✕</button>
        `;
        elements.cartItems.appendChild(div);
    });
    if (elements.cartTotal) elements.cartTotal.innerText = `Rs. ${total.toLocaleString()}`;
    if (elements.cartBadge) {
        elements.cartBadge.innerText = state.cart.reduce((s,i) => s + i.qty, 0);
        elements.cartBadge.classList.toggle('hidden', state.cart.length === 0);
    }
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
    updateSession();
    
    if (elements.authBtn) elements.authBtn.onclick = () => toggleModal('auth', true);
    if (elements.logoutHeaderBtn) elements.logoutHeaderBtn.onclick = async () => { await _supabase.auth.signOut(); updateSession(); };
    if (elements.authClose) elements.authClose.onclick = () => toggleModal('auth', false);
    if (elements.authOverlay) elements.authOverlay.onclick = () => toggleModal('auth', false);
    if (elements.authToggleBtn) elements.authToggleBtn.onclick = toggleAuthMode;
    if (elements.authForm) elements.authForm.onsubmit = handleAuth;
    if (elements.verifyForm) elements.verifyForm.onsubmit = handleVerify;
    if (elements.verifyBackBtn) elements.verifyBackBtn.onclick = () => {
        elements.verifyForm.classList.add('hidden');
        elements.authForm.classList.remove('hidden');
    };

    if (elements.logoutBtn) elements.logoutBtn.onclick = async () => { await _supabase.auth.signOut(); updateSession(); };
    if (elements.promoteAdminBtn) elements.promoteAdminBtn.onclick = window.promoteAdmin;

    if (elements.logoBtn) elements.logoBtn.onclick = () => {
        elements.userView.classList.add('active');
        elements.adminView.classList.remove('active');
    };

    if (elements.cartTrigger) elements.cartTrigger.onclick = () => toggleDrawer('cart', true);
    if (elements.cartClose) elements.cartClose.onclick = () => toggleDrawer('cart', false);
    if (elements.cartOverlay) elements.cartOverlay.onclick = () => toggleDrawer('cart', false);
    
    if (elements.checkoutBtn) elements.checkoutBtn.onclick = () => {
        if (!state.user) return toggleModal('auth', true);
        document.getElementById('cart-footer').classList.add('hidden');
        document.getElementById('payment-section').classList.remove('hidden');
    };

    if (elements.completeOrderBtn) elements.completeOrderBtn.onclick = async () => {
        const total = state.cart.reduce((s,i) => s + (i.price * i.qty), 0);
        const { error } = await _supabase.from('orders').insert({
            user_id: state.user.id,
            customer_email: state.user.email,
            items: state.cart,
            total: total,
            status: 'Pending'
        });
        if (!error) {
            alert("Payment successful. Your order is being processed.");
            state.cart = []; updateCartUI();
            toggleDrawer('cart', false);
            document.getElementById('cart-footer').classList.remove('hidden');
            document.getElementById('payment-section').classList.add('hidden');
        } else {
            alert("Error: " + error.message);
        }
    };

    const cats = ['All', 'Evening Wear', 'Royal Occasions', 'Business Elite', 'Imperial Bridal', 'Casual Luxe'];
    if (elements.filterBar) {
        cats.forEach(c => {
            const b = document.createElement('button');
            b.className = "px-6 py-2.5 text-[9px] uppercase tracking-widest rounded-full border border-white/5 text-white/30 whitespace-nowrap hover:border-amber-500/50 transition-all";
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
    
    if (elements.addProductBtn) elements.addProductBtn.onclick = () => {
        const name = prompt("Product Name:");
        const price = prompt("Price (Rs):");
        const category = prompt("Category:", "Evening Wear");
        const image = prompt("Image URL:");
        if (name && price && image) {
            _supabase.from('products').insert({
                name, price: parseInt(price), category, image, stock: 5
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
