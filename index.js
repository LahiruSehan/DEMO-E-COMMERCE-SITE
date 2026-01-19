// --- CONFIGURATION ---
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
    activeProduct: null,
    filters: { category: 'All' }
};

// --- CORE UTILITIES ---
window.switchView = (viewName) => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`${viewName}-view`);
    if (target) {
        target.classList.add('active');
        state.currentView = viewName;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadData();
    }
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
    const toggleMsg = document.getElementById('auth-toggle-msg');
    
    title.innerText = state.authMode === 'login' ? 'Sign In' : 'Create Account';
    toggleBtn.innerText = state.authMode === 'login' ? 'Join Now' : 'Sign In';
    toggleMsg.innerText = state.authMode === 'login' ? "Don't have an account?" : 'Already a member?';
    signupFields.classList.toggle('hidden', state.authMode === 'login');
};

const handleAuth = async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-pass').value;
    const name = document.getElementById('auth-name').value;
    const secret = document.getElementById('admin-secret').value;
    const errorMsg = document.getElementById('auth-error');

    errorMsg.innerText = "Connecting...";

    if (state.authMode === 'signup') {
        const role = secret === '251025' ? 'admin' : 'user';
        const { error } = await _supabase.auth.signUp({
            email, password, options: { data: { full_name: name, role: role } }
        });
        if (error) return errorMsg.innerText = error.message;
        
        document.getElementById('auth-main').classList.add('hidden');
        document.getElementById('auth-otp').classList.remove('hidden');
        errorMsg.innerText = "Check your email for code.";
    } else {
        const { error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) return errorMsg.innerText = "Invalid login details.";
        await updateSession();
        window.closeModal('auth');
    }
};

window.verifyOTP = async () => {
    const email = document.getElementById('auth-email').value;
    const token = document.getElementById('otp-code').value;
    const { error } = await _supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (error) return alert("Code verification failed.");
    await updateSession();
    window.closeModal('auth');
};

const updateSession = async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    if (session) {
        state.user = session.user;
        const { data: profile } = await _supabase.from('profiles').select('*').eq('id', session.user.id).single();
        state.profile = profile;
        
        document.getElementById('auth-btn').innerText = profile?.role === 'admin' ? "Admin" : "Account";
        document.getElementById('nav-profile-btn').classList.remove('hidden');
        if (profile?.role === 'admin') document.getElementById('nav-admin-btn').classList.remove('hidden');
        
        if (profile) {
            document.getElementById('edit-name').value = profile.full_name || '';
            document.getElementById('edit-phone').value = profile.phone || '';
            document.getElementById('edit-address').value = profile.address || '';
            document.getElementById('profile-name-display').innerText = profile.full_name || 'Valued Member';
            document.getElementById('profile-email-display').innerText = state.user.email;
        }

        loadData();
    }
};

window.logout = async () => {
    await _supabase.auth.signOut();
    location.reload();
};

// --- PROFILE ---
window.updateProfile = async () => {
    const name = document.getElementById('edit-name').value;
    const phone = document.getElementById('edit-phone').value;
    const address = document.getElementById('edit-address').value;

    const { error } = await _supabase.from('profiles').update({
        full_name: name, phone, address
    }).eq('id', state.user.id);

    if (!error) {
        alert("Profile updated successfully.");
        await updateSession();
    }
};

// --- LOADING ---
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
    
    const filtered = state.products.filter(p => state.filters.category === 'All' || p.category === state.filters.category);
    
    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-32 text-center opacity-20 italic font-display text-2xl uppercase tracking-widest">No styles found.</div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => `
        <div onclick="window.showProductDetail('${p.id}')" class="product-card group relative cursor-pointer glass rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:-translate-y-2 border-white/5 hover:border-amber-500/20 shadow-2xl">
            <div class="aspect-[4/5] overflow-hidden relative">
                <img src="${p.image}" class="product-card-img w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-[2s]">
                <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-all duration-500"></div>
                ${p.stock < 5 ? '<span class="absolute top-6 right-6 glass-bright text-[8px] text-amber-500 px-4 py-1.5 rounded-full uppercase font-bold tracking-widest">Limited</span>' : ''}
            </div>
            <div class="p-8 relative">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="text-xs uppercase font-bold tracking-[0.2em] truncate w-40">${p.name}</h4>
                    <span class="text-amber-500 text-xs font-bold font-display italic">Rs. ${p.price.toLocaleString()}</span>
                </div>
                <p class="text-[9px] uppercase text-white/30 tracking-[0.3em]">${p.category}</p>
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
            <div class="w-full md:w-1/2 aspect-[4/5] md:aspect-auto">
                <img src="${p.image}" class="w-full h-full object-cover">
            </div>
            <div class="w-full md:w-1/2 p-10 md:p-20 space-y-10 flex flex-col justify-center">
                <div class="space-y-4">
                    <span class="text-[10px] text-amber-500 font-bold uppercase tracking-[0.5em] border-b border-amber-500/20 pb-2 inline-block">${p.category}</span>
                    <h2 class="text-6xl font-display italic leading-tight">${p.name}</h2>
                    <p class="text-[10px] text-white/40 uppercase tracking-[0.2em]">In Stock: ${p.stock > 0 ? p.stock + ' Pieces Left' : 'Sold Out'}</p>
                </div>
                <p class="text-sm leading-relaxed text-white/50 tracking-wide font-light">${p.description || "A meticulously crafted piece designed for the modern individual who values quality and timeless elegance."}</p>
                <div class="pt-10 border-t border-white/10">
                    <div class="flex justify-between items-end mb-10">
                        <span class="text-4xl font-display italic gold-glow">Rs. ${p.price.toLocaleString()}</span>
                        <button onclick="window.addToCart('${p.id}')" class="btn-premium px-12 py-5 rounded-2xl text-[10px] shadow-2xl">Add to Bag</button>
                    </div>
                </div>
                <!-- Chat / Questions -->
                <div class="pt-10 space-y-8">
                    <h4 class="text-[10px] uppercase text-amber-500 font-bold tracking-widest flex items-center gap-3">
                        <span class="w-8 h-[1px] bg-amber-500/30"></span> Support & Chat
                    </h4>
                    <div class="max-h-56 overflow-y-auto no-scrollbar space-y-6">
                        ${(qa || []).length > 0 ? qa.map(q => `
                            <div class="bg-white/5 p-6 rounded-3xl border border-white/5">
                                <p class="text-[11px] text-white/90 font-bold mb-2 uppercase tracking-wide">Q: ${q.question}</p>
                                <p class="text-[10px] text-amber-500/70 font-light italic">Support: ${q.answer || 'Answering soon...'}</p>
                            </div>
                        `).join('') : '<p class="text-[10px] text-white/20 italic tracking-widest uppercase text-center py-4">No recent chats.</p>'}
                    </div>
                    ${state.user ? `
                        <div class="flex gap-3">
                            <input type="text" id="q-input" placeholder="Ask a question..." class="form-input flex-grow bg-white/5 border-white/10 rounded-2xl py-4">
                            <button onclick="window.askOracle('${p.id}')" class="btn-premium px-6 rounded-2xl">Send</button>
                        </div>
                    ` : '<p class="text-[9px] text-white/20 uppercase tracking-widest text-center">Sign in to ask questions about this item.</p>'}
                </div>
            </div>
        </div>
    `;
    window.openModal('detail');
};

const renderOrders = () => {
    const list = document.getElementById('order-history');
    if (!list) return;
    if (!state.orders.length) return list.innerHTML = `<div class="glass p-20 text-center text-white/20 italic font-display text-xl uppercase tracking-widest rounded-[3rem]">No orders found.</div>`;
    
    list.innerHTML = state.orders.map(o => {
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];
        const currentIdx = statuses.indexOf(o.status);
        const progress = ((currentIdx + 1) / statuses.length) * 100;

        return `
            <div class="glass p-10 rounded-[3rem] space-y-8 border-white/5">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-[11px] text-amber-500 font-bold uppercase tracking-widest mb-1">Order Ref: #${o.id.slice(0,8)}</p>
                        <p class="text-[10px] text-white/40 uppercase tracking-widest">${new Date(o.created_at).toDateString()}</p>
                    </div>
                    <p class="text-3xl font-display italic gold-glow">Rs. ${o.total.toLocaleString()}</p>
                </div>
                <div class="space-y-4">
                    <div class="flex justify-between text-[9px] uppercase tracking-widest text-white/30 font-bold">
                        ${statuses.map(s => `<span class="${o.status === s ? 'text-amber-500 font-bold tracking-[0.2em]' : ''}">${s}</span>`).join('')}
                    </div>
                    <div class="progress-line">
                        <div class="progress-fill" style="width: ${progress}%"></div>
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
        <div class="bg-white/5 border border-white/5 p-6 rounded-3xl group hover:border-amber-500/20 transition-all">
            <p class="text-[11px] text-amber-500 font-bold uppercase tracking-widest mb-1">${n.title}</p>
            <p class="text-[10px] text-white/50 tracking-wide font-light leading-relaxed">${n.message}</p>
            <p class="text-[8px] text-white/10 uppercase tracking-widest mt-4">${new Date(n.created_at).toLocaleString()}</p>
        </div>
    `).join('');
};

const renderAdminConsole = (orders, qa) => {
    const orderList = document.getElementById('admin-order-list');
    if (orderList) orderList.innerHTML = orders.map(o => `
        <div class="glass p-8 rounded-3xl flex justify-between items-center gap-6 border-white/5">
            <div class="flex-grow">
                <p class="text-[11px] font-bold text-amber-500 uppercase tracking-widest mb-1">#${o.id.slice(0,8)}</p>
                <p class="text-xs text-white/40 truncate w-48 font-light">${o.customer_email}</p>
            </div>
            <select onchange="window.updateOrderStatus('${o.id}', this.value, '${o.user_id}')" class="bg-black border border-white/10 text-amber-500 text-[10px] uppercase font-bold p-3 rounded-xl outline-none cursor-pointer hover:border-amber-500/50 transition-all">
                <option value="Pending" ${o.status==='Pending'?'selected':''}>Pending</option>
                <option value="Processing" ${o.status==='Processing'?'selected':''}>Processing</option>
                <option value="Shipped" ${o.status==='Shipped'?'selected':''}>Shipped</option>
                <option value="Delivered" ${o.status==='Delivered'?'selected':''}>Delivered</option>
            </select>
        </div>
    `).join('');

    const qaList = document.getElementById('admin-qa-list');
    if (qaList) qaList.innerHTML = qa.map(q => `
        <div class="glass p-8 rounded-3xl space-y-5 border-white/5">
            <div class="flex justify-between items-center border-b border-white/5 pb-3">
                <p class="text-[10px] text-white/30 font-bold uppercase tracking-widest">${q.user_email}</p>
                <span class="text-[8px] text-amber-500 uppercase tracking-widest font-bold border border-amber-500/20 px-3 py-1 rounded-full">Support Request</span>
            </div>
            <p class="text-xs italic text-white/80 leading-relaxed font-display">"${q.question}"</p>
            <div class="flex gap-3 pt-4">
                <input type="text" id="ans-${q.id}" placeholder="Type your response..." class="form-input flex-grow text-[10px] bg-white/5 border-white/10 rounded-xl">
                <button onclick="window.answerQuestion('${q.id}')" class="btn-premium px-6 rounded-xl text-[10px]">Reply</button>
            </div>
        </div>
    `).join('');

    document.getElementById('admin-revenue').innerText = "Rs. " + orders.reduce((s,o)=>s+o.total, 0).toLocaleString();
    document.getElementById('admin-order-count').innerText = orders.length;
    document.getElementById('admin-product-count').innerText = state.products.length;
    document.getElementById('admin-qa-count').innerText = qa.length;
};

// --- ACTIONS ---
window.askOracle = async (productId) => {
    const question = document.getElementById('q-input').value;
    if (!question) return;
    await _supabase.from('questions').insert({
        product_id: productId,
        user_id: state.user.id,
        user_email: state.user.email,
        question: question
    });
    alert("Question sent to our stylists.");
    window.showProductDetail(productId);
};

window.answerQuestion = async (id) => {
    const answer = document.getElementById(`ans-${id}`).value;
    if (!answer) return;
    await _supabase.from('questions').update({ answer }).eq('id', id);
    alert("Response sent to customer.");
    loadData();
};

window.updateOrderStatus = async (id, status, userId) => {
    const { error } = await _supabase.from('orders').update({ status }).eq('id', id);
    if (!error) {
        await _supabase.from('notifications').insert({
            user_id: userId,
            title: "Order Update",
            message: `Your Order #${id.slice(0,8)} is now ${status}. Check your profile for tracking.`
        });
        alert("Status updated and customer notified.");
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
        <div class="flex items-center gap-6 glass p-6 rounded-[2rem] border-white/5 group hover:border-amber-500/20 transition-all">
            <img src="${item.image}" class="w-20 h-24 object-cover rounded-2xl grayscale-[0.2] group-hover:grayscale-0 transition-all">
            <div class="flex-grow">
                <p class="text-[11px] font-bold uppercase tracking-[0.2em] truncate w-32 mb-1">${item.name}</p>
                <p class="text-amber-500 text-[10px] font-bold font-display italic">Rs. ${item.price.toLocaleString()} x ${item.qty}</p>
            </div>
            <button onclick="window.removeFromCart('${item.id}')" class="text-white/20 hover:text-white transition-colors p-2">✕</button>
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
        alert("Order placed successfully! Check your profile for updates.");
        state.cart = [];
        updateCartUI();
        window.toggleCart(false);
        loadData();
    }
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    updateSession();
    
    // Auto-load Products immediately
    loadData();

    // Scroll effect for header
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if (window.scrollY > 50) {
            header.classList.add('glass', 'py-3');
            header.classList.remove('bg-transparent', 'py-4');
            header.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
        } else {
            header.classList.remove('glass', 'py-3');
            header.classList.add('bg-transparent', 'py-4');
            header.style.borderBottom = "1px solid transparent";
        }
    });

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
            alert("New style added to catalog.");
            window.closeModal('add-product');
            loadData();
        }
    };

    // Filter Bar Categories
    const filterBar = document.getElementById('filter-bar');
    if (filterBar) {
        const categories = ['All', 'Dresses', 'Suits', 'Accessories', 'Evening', 'Lounge'];
        filterBar.innerHTML = categories.map(c => `
            <button onclick="updateCategory('${c}')" class="filter-btn px-6 py-2.5 rounded-full border border-white/10 text-[10px] uppercase tracking-widest transition-all hover:border-amber-500/50 whitespace-nowrap ${state.filters.category === c ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'text-white/40'}">
                ${c}
            </button>
        `).join('');
    }

    window.updateCategory = (c) => {
        state.filters.category = c;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.innerText === c) {
                btn.classList.add('bg-amber-500', 'text-black', 'border-amber-500', 'font-bold');
                btn.classList.remove('text-white/40');
            } else {
                btn.classList.remove('bg-amber-500', 'text-black', 'border-amber-500', 'font-bold');
                btn.classList.add('text-white/40');
            }
        });
        renderCollection();
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
                p.x += p.vx; p.y += p.vy; p.life -= 0.008;
                if(p.life <= 0) particles.splice(i, 1);
                ctx.fillStyle = `rgba(180, 138, 62, ${p.life})`;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();
    }
});