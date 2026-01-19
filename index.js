// --- CONFIGURATION & INITIALIZATION ---
const SUPABASE_URL = "https://vrzlcfszahsxhjiyomee.supabase.co";
const SUPABASE_KEY = "sb_publishable_T96vtoe0I2R5n7BLCE_DfA_Zw8S-ltj";
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let state = {
    user: null,
    profile: null,
    products: [],
    orders: [],
    notifications: [],
    questions: [],
    cart: [],
    currentView: 'user',
    authMode: 'login',
    activeProduct: null
};

// --- CORE UTILITIES ---
window.switchView = (viewName) => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`${viewName}-view`);
    if (target) target.classList.add('active');
    state.currentView = viewName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadData();
};

window.openModal = (id) => {
    const m = document.getElementById(`${id}-modal`);
    if (m) m.classList.add('active');
};

window.closeModal = (id) => {
    const m = document.getElementById(`${id}-modal`);
    if (m) m.classList.remove('active');
};

// --- AUTHENTICATION ---
window.toggleAuthMode = () => {
    state.authMode = state.authMode === 'login' ? 'signup' : 'login';
    const title = document.getElementById('auth-title');
    const toggleBtn = document.getElementById('auth-toggle-btn');
    const signupFields = document.getElementById('signup-only');
    
    title.innerText = state.authMode === 'login' ? 'Sign In' : 'Create Identity';
    toggleBtn.innerText = state.authMode === 'login' ? 'Create Account' : 'Back to Login';
    signupFields.classList.toggle('hidden', state.authMode === 'login');
};

const handleAuth = async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-pass').value;
    const name = document.getElementById('auth-name').value;
    const secret = document.getElementById('admin-secret').value;
    const errorMsg = document.getElementById('auth-error');

    errorMsg.innerText = "Connecting to Atelier...";

    if (state.authMode === 'signup') {
        const role = secret === '251025' ? 'admin' : 'user';
        const { error } = await _supabase.auth.signUp({
            email, password, options: { data: { full_name: name, role: role } }
        });
        if (error) return errorMsg.innerText = error.message;
        
        document.getElementById('auth-main').classList.add('hidden');
        document.getElementById('auth-otp').classList.remove('hidden');
        errorMsg.innerText = "Verification code dispatched.";
    } else {
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) return errorMsg.innerText = "Invalid credentials.";
        await updateSession();
        window.closeModal('auth');
    }
};

window.verifyOTP = async () => {
    const email = document.getElementById('auth-email').value;
    const token = document.getElementById('otp-code').value;
    const { error } = await _supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) return alert("Verification failed.");
    await updateSession();
    window.closeModal('auth');
};

const updateSession = async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        state.user = session.user;
        const { data: profile } = await _supabase.from('profiles').select('*').eq('id', session.user.id).single();
        state.profile = profile;
        
        document.getElementById('auth-btn').innerText = profile?.role === 'admin' ? "Master" : "Member";
        document.getElementById('nav-profile-btn').classList.remove('hidden');
        if (profile?.role === 'admin') document.getElementById('nav-admin-btn').classList.remove('hidden');
        
        // Fill profile edit fields
        if (profile) {
            document.getElementById('edit-name').value = profile.full_name || '';
            document.getElementById('edit-phone').value = profile.phone || '';
            document.getElementById('edit-address').value = profile.address || '';
            document.getElementById('profile-name-display').innerText = profile.full_name || 'Member';
            document.getElementById('profile-email-display').innerText = state.user.email;
        }

        loadData();
    }
};

window.logout = async () => {
    await _supabase.auth.signOut();
    location.reload();
};

// --- PROFILE MANAGEMENT ---
window.updateProfile = async () => {
    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;
    const address = document.getElementById('edit-address').value;

    const { error } = await _supabase.from('profiles').update({
        full_name: name, phone, address
    }).eq('id', state.user.id);

    if (!error) {
        alert("Imperial records updated.");
        await updateSession();
    }
};

// --- DATA LOADING & RENDERING ---
const loadData = async () => {
    const { data: products } = await _supabase.from('products').select('*').order('created_at', { ascending: false });
    state.products = products || [];
    renderCollection();

    if (state.user) {
        const { data: orders } = await _supabase.from('orders').select('*').eq('user_id', state.user.id).order('created_at', { ascending: false });
        state.orders = orders || [];
        renderOrders();

        const { data: notices } = await _supabase.from('notifications').select('*').eq('user_id', state.user.id).order('created_at', { ascending: false });
        state.notifications = notices || [];
        renderNotifications();
    }

    if (state.profile?.role === 'admin') {
        const { data: allOrders } = await _supabase.from('orders').select('*').order('created_at', { ascending: false });
        const { data: allQA } = await _supabase.from('questions').select('*').order('created_at', { ascending: false });
        renderAdminConsole(allOrders || [], allQA || []);
    }
};

const renderCollection = () => {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    grid.innerHTML = state.products.map(p => `
        <div onclick="window.showProductDetail('${p.id}')" class="glass rounded-[2rem] overflow-hidden group cursor-pointer border border-white/5 hover:border-amber-500/20 transition-all transform hover:-translate-y-1">
            <div class="aspect-[3/4] overflow-hidden relative">
                <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]">
                ${p.stock < 5 ? '<span class="absolute top-4 right-4 bg-red-500 text-white text-[8px] px-3 py-1 rounded-full uppercase font-bold">Rare</span>' : ''}
            </div>
            <div class="p-5">
                <div class="flex justify-between items-start mb-1">
                    <h4 class="text-[10px] uppercase font-bold tracking-widest truncate w-32">${p.name}</h4>
                    <span class="text-amber-500 text-[10px] font-bold">Rs. ${p.price.toLocaleString()}</span>
                </div>
                <p class="text-[8px] uppercase text-white/30 tracking-widest">${p.category}</p>
            </div>
        </div>
    `).join('');
};

window.showProductDetail = async (id) => {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    state.activeProduct = p;
    const { data: qa } = await _supabase.from('questions').select('*').eq('product_id', id).order('created_at', { ascending: true });
    
    const body = document.getElementById('detail-body');
    body.innerHTML = `
        <div class="flex flex-col md:flex-row h-full">
            <div class="w-full md:w-1/2 aspect-[3/4] md:aspect-auto">
                <img src="${p.image}" class="w-full h-full object-cover">
            </div>
            <div class="w-full md:w-1/2 p-8 md:p-12 space-y-8 flex flex-col justify-center">
                <div class="space-y-2">
                    <p class="text-[10px] text-amber-500 font-bold uppercase tracking-[0.5em]">${p.category}</p>
                    <h2 class="text-4xl font-royal gold-gradient">${p.name}</h2>
                    <p class="text-xs text-white/40 uppercase tracking-widest">Stock: ${p.stock > 0 ? 'In Ateliers' : 'Vaulted'}</p>
                </div>
                <p class="text-xs leading-relaxed text-white/60 tracking-wider font-light italic">${p.description || "A masterwork from the Shani Atelier."}</p>
                <div class="pt-6 border-t border-white/10">
                    <div class="flex justify-between items-end mb-6">
                        <span class="text-3xl font-royal gold-gradient">Rs. ${p.price.toLocaleString()}</span>
                        <button onclick="window.addToCart('${p.id}')" class="btn-gold px-10 py-4 text-[10px]">Acquire</button>
                    </div>
                </div>
                <div class="pt-10 space-y-6">
                    <h4 class="text-[10px] uppercase text-amber-500 font-bold tracking-widest">Concierge Inquiries</h4>
                    <div class="max-h-48 overflow-y-auto no-scrollbar space-y-4">
                        ${(qa || []).map(q => `
                            <div class="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p class="text-[10px] text-white/80 font-bold mb-1">Q: ${q.question}</p>
                                <p class="text-[9px] text-amber-500/70">A: ${q.answer || 'Consulting the master...'}</p>
                            </div>
                        `).join('')}
                    </div>
                    ${state.user ? `
                        <div class="flex gap-2">
                            <input type="text" id="q-input" placeholder="Ask the Atelier..." class="form-input flex-grow">
                            <button onclick="window.askOracle('${p.id}')" class="btn-gold px-4">Post</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    window.openModal('detail');
};

const renderOrders = () => {
    const list = document.getElementById('order-history');
    if (!list) return;
    if (!state.orders.length) return list.innerHTML = `<div class="glass p-12 text-center text-white/20 italic uppercase tracking-widest text-xs">No records found.</div>`;
    
    list.innerHTML = state.orders.map(o => {
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentIdx = statuses.indexOf(o.status);
        const progress = ((currentIdx + 1) / statuses.length) * 100;

        return `
            <div class="glass p-8 rounded-[2rem] space-y-6">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Order #${o.id.slice(0,8)}</p>
                        <p class="text-xs text-white/40 mt-1">${new Date(o.created_at).toLocaleDateString()}</p>
                    </div>
                    <p class="text-xl font-royal gold-gradient">Rs. ${o.total.toLocaleString()}</p>
                </div>
                <div class="space-y-3">
                    <div class="flex justify-between text-[8px] uppercase tracking-widest text-white/20">
                        ${statuses.map(s => `<span class="${o.status === s ? 'text-amber-500 font-bold' : ''}">${s}</span>`).join('')}
                    </div>
                    <div class="tracking-bar">
                        <div class="tracking-progress" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

const renderNotifications = () => {
    const list = document.getElementById('notification-list');
    if (!list) return;
    list.innerHTML = state.notifications.map(n => `
        <div class="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <p class="text-[10px] text-amber-500 font-bold uppercase tracking-widest">${n.title}</p>
            <p class="text-[9px] text-white/60 mt-1">${n.message}</p>
        </div>
    `).join('');
};

const renderAdminConsole = (orders, qa) => {
    const orderList = document.getElementById('admin-order-list');
    if (orderList) orderList.innerHTML = orders.map(o => `
        <div class="glass p-6 rounded-2xl flex justify-between items-center gap-4">
            <div class="flex-grow">
                <p class="text-[10px] font-bold text-amber-500 uppercase tracking-widest">#${o.id.slice(0,8)}</p>
                <p class="text-xs text-white/60 truncate w-32">${o.customer_email}</p>
            </div>
            <select onchange="window.updateOrderStatus('${o.id}', this.value, '${o.user_id}')" class="bg-black border border-white/10 text-amber-500 text-[10px] p-2 rounded-lg outline-none cursor-pointer">
                <option value="Pending" ${o.status==='Pending'?'selected':''}>Pending</option>
                <option value="Processing" ${o.status==='Processing'?'selected':''}>Processing</option>
                <option value="Shipped" ${o.status==='Shipped'?'selected':''}>Shipped</option>
                <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
            </select>
        </div>
    `).join('');

    const qaList = document.getElementById('admin-qa-list');
    if (qaList) qaList.innerHTML = qa.map(q => `
        <div class="glass p-6 rounded-2xl space-y-3">
            <p class="text-[10px] text-white/40 font-bold uppercase">${q.user_email}</p>
            <p class="text-xs italic text-amber-500">"${q.question}"</p>
            <div class="flex gap-2">
                <input type="text" id="ans-${q.id}" placeholder="Master Answer..." class="form-input flex-grow text-[10px]">
                <button onclick="window.answerQuestion('${q.id}')" class="btn-gold px-4 text-[10px]">Post</button>
            </div>
        </div>
    `).join('');

    document.getElementById('admin-revenue').innerText = "Rs. " + orders.reduce((s,o)=>s+o.total, 0).toLocaleString();
    document.getElementById('admin-order-count').innerText = orders.length;
    document.getElementById('admin-product-count').innerText = state.products.length;
    document.getElementById('admin-qa-count').innerText = qa.length;
};

// --- ACTION HANDLERS ---
window.askOracle = async (productId) => {
    const question = document.getElementById('q-input').value;
    if (!question) return;
    await _supabase.from('questions').insert({
        product_id: productId,
        user_id: state.user.id,
        user_email: state.user.email,
        question: question
    });
    alert("Inquiry received.");
    window.showProductDetail(productId);
};

window.answerQuestion = async (id) => {
    const answer = document.getElementById(`ans-${id}`).value;
    if (!answer) return;
    await _supabase.from('questions').update({ answer }).eq('id', id);
    alert("Response dispatched.");
    loadData();
};

window.updateOrderStatus = async (id, status, userId) => {
    const { error } = await _supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
        await _supabase.from('notifications').insert({
            user_id: userId,
            title: "Imperial Fulfillment",
            message: `Your Order #${id.slice(0,8)} status updated to ${status}.`
        });
        alert("Status updated & user notified.");
        loadData();
    }
};

window.addToCart = (id) => {
    const p = state.products.find(x => x.id === id);
    if (!p) return;
    const existing = state.cart.find(item => item.id === id);
    if (existing) existing.qty++;
    else state.cart.push({ ...p, qty: 1 });
    updateCartUI();
    window.toggleCart(true);
};

const updateCartUI = () => {
    const list = document.getElementById('cart-items');
    if (!list) return;
    list.innerHTML = state.cart.map(item => `
        <div class="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
            <img src="${item.image}" class="w-16 h-20 object-cover rounded-xl">
            <div class="flex-grow">
                <p class="text-[10px] font-bold uppercase truncate w-32">${item.name}</p>
                <p class="text-amber-500 text-[10px]">Rs. ${item.price.toLocaleString()} x ${item.qty}</p>
            </div>
            <button onclick="window.removeFromCart('${item.id}')" class="text-white/20">✕</button>
        </div>
    `).join('');

    const total = state.cart.reduce((s,i) => s + (i.price * i.qty), 0);
    document.getElementById('cart-total').innerText = "Rs. " + total.toLocaleString();
    const badge = document.getElementById('cart-badge');
    const totalQty = state.cart.reduce((s,i)=>s+i.qty, 0);
    badge.innerText = totalQty;
    badge.classList.toggle('hidden', totalQty === 0);
};

window.removeFromCart = (id) => {
    state.cart = state.cart.filter(item => item.id !== id);
    updateCartUI();
};

window.toggleCart = (show) => {
    const drawer = document.getElementById('cart-drawer');
    if (drawer) drawer.style.transform = show ? 'translateX(0)' : 'translateX(100%)';
};

window.showCheckout = () => {
    if (!state.user) return window.openModal('auth');
    document.getElementById('checkout-btn').classList.add('hidden');
    document.getElementById('checkout-form').classList.remove('hidden');
};

window.executeTransaction = async () => {
    const total = state.cart.reduce((s,i) => s + (i.price * i.qty), 0);
    const { error } = await _supabase.from('orders').insert({
        user_id: state.user.id,
        customer_email: state.user.email,
        items: state.cart,
        total: total,
        status: 'Pending'
    });

    if (!error) {
        alert("Selection finalized. Treasury updated.");
        state.cart = [];
        updateCartUI();
        window.toggleCart(false);
        loadData();
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    updateSession();
    
    const authForm = document.getElementById('auth-form');
    if (authForm) authForm.onsubmit = handleAuth;

    const productForm = document.getElementById('product-form');
    if (productForm) productForm.onsubmit = async (e) => {
        e.preventDefault();
        const productData = {
            name: document.getElementById('p-name').value,
            price: parseInt(document.getElementById('p-price').value),
            stock: parseInt(document.getElementById('p-stock').value),
            category: document.getElementById('p-category').value,
            image: document.getElementById('p-image').value,
            description: document.getElementById('p-desc').value
        };

        const { error } = await _supabase.from('products').insert(productData);
        if (!error) {
            alert("New Masterwork Added.");
            window.closeModal('add-product');
            loadData();
        }
    };

    // Particles
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let particles = [];
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
    }
});