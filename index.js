// --- CONSTANTS ---
const CATEGORIES = {
    EVENING: 'Evening Wear',
    ROYAL: 'Royal Occasions',
    LUXE: 'Casual Luxe',
    BUSINESS: 'Business Elite',
    BRIDAL: 'Imperial Bridal'
};

const CITIES = ['Paris', 'London', 'Milan', 'Tokyo', 'New York', 'Dubai', 'Singapore'];

const PRODUCTS = [
    { id: 'SH-01', name: 'Aetheris Dress', description: 'Hand-stitched silk with moon-stone accents from the northern silk road.', price: 1250000, category: CATEGORIES.EVENING, image: 'https://i.ibb.co/LXw6tbPN/219436cd090b78ecb532d0215f902573.jpg', rating: 4.9 },
    { id: 'SH-02', name: 'Regent Blazer', description: 'Premium wool tailored for the business elite who command presence.', price: 850000, category: CATEGORIES.BUSINESS, image: 'https://i.ibb.co/tMxv9BZ1/eb348ad80adc84fbbd6ce5c03dcf8413.jpg', rating: 4.8 },
    { id: 'SH-03', name: 'Azure Silk Gown', description: 'Flowing satin with imperial embroidery that moves like water.', price: 450000, category: CATEGORIES.LUXE, image: 'https://i.ibb.co/3yqRTH4D/ee071bfe9dd5f341acfe6dae90ccae51.jpg', rating: 4.7 },
    { id: 'SH-04', name: 'Crown Jewel Cape', description: 'Limited edition heavy velvet masterpiece with intricate gold bullion.', price: 2800000, category: CATEGORIES.ROYAL, image: 'https://i.ibb.co/JSmbbDv/8bd13d06c7679c42b9a45552de6a40fd.jpg', rating: 5.0 },
    { id: 'SH-05', name: 'Onyx Evening Suit', description: 'Deep black silhouette with 24k gold threading for high-profile galas.', price: 920000, category: CATEGORIES.LUXE, image: 'https://i.ibb.co/1f2JzZcr/9db655c054eae5e2d1b8d117326630ce.jpg', rating: 4.9 },
    { id: 'SH-06', name: 'Stardust Wrap', description: 'Light as air with subtle reflective fibers that twinkle under soft light.', price: 350000, category: CATEGORIES.LUXE, image: 'https://i.ibb.co/4wwxXR09/2c55b0fbe18a136812e42a0e7452e848.jpg', rating: 4.6 },
    { id: 'SH-07', name: 'Ivory Cathedral', description: 'The ultimate bridal statement with a 4-meter hand-crafted train.', price: 4500000, category: CATEGORIES.BRIDAL, image: 'https://i.ibb.co/LKBRdyD/444e6f0fe598878135d2d045d7fc10aa.jpg', rating: 5.0 },
    { id: 'SH-08', name: 'Solaris Gown', description: 'Radiant gold finish with pleated layers that mimic a setting sun.', price: 1150000, category: CATEGORIES.EVENING, image: 'https://i.ibb.co/mFHjZd6N/6777b52052495598aaa844bbf5fb544f.jpg', rating: 4.7 },
    { id: 'SH-09', name: 'Sovereign Bridal', description: 'A legacy piece for the imperial bride, passed through generations.', price: 5800000, category: CATEGORIES.BRIDAL, image: 'https://i.ibb.co/Fq6RjkPZ/d6149f37b1e7bf47a7ad0565c7368328.jpg', rating: 5.0 },
    { id: 'SH-10', name: 'Golden Empress', description: '24k gold leaf details on pure white high-grade mulberry silk.', price: 2980000, category: CATEGORIES.ROYAL, image: 'https://i.ibb.co/bRqbT1HW/eb77f1b749702a5c3289d566c30b20f7.jpg', rating: 5.0 },
    { id: 'SH-11', name: 'Diamond Dusk', description: 'Studded with thousands of ethically sourced micro-crystals.', price: 5100000, category: CATEGORIES.BRIDAL, image: 'https://i.ibb.co/1tTrQVVZ/292446b2679926d0339b3171fca4aff7.jpg', rating: 5.0 },
    { id: 'SH-12', name: 'Midnight Noir', description: 'Sleek, modern, and undeniably commanding in its presence.', price: 950000, category: CATEGORIES.EVENING, image: 'https://i.ibb.co/mVtx3cVd/6c3b85f95eda88d860b7c4aecc6783d0.jpg', rating: 4.7 }
];

// --- STATE ---
let state = {
    cart: JSON.parse(localStorage.getItem('shani_cart') || '[]'),
    filters: { category: 'All' },
    activeProduct: null
};

// --- DOM ---
const elements = {
    cursor: document.getElementById('royal-cursor'),
    scrollThread: document.getElementById('scroll-thread'),
    grid: document.getElementById('product-grid'),
    filterBar: document.getElementById('filter-bar'),
    cartBadge: document.getElementById('cart-badge'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    notificationCenter: document.getElementById('notification-center'),
    modalContainer: document.getElementById('product-modal-container'),
    modalBox: document.getElementById('modal-box')
};

// --- ROYAL CURSOR ---
const initCursor = () => {
    let mouseX = 0, mouseY = 0;
    let ballX = 0, ballY = 0;
    const speed = 0.15;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animate = () => {
        let distX = mouseX - ballX;
        let distY = mouseY - ballY;
        ballX = ballX + (distX * speed);
        ballY = ballY + (distY * speed);
        elements.cursor.style.left = ballX + 'px';
        elements.cursor.style.top = ballY + 'px';
        elements.cursor.style.transform = `translate(-50%, -50%)`;
        requestAnimationFrame(animate);
    };
    animate();

    // Interaction states
    const interactive = 'a, button, .royal-card, input';
    document.querySelectorAll(interactive).forEach(el => {
        el.addEventListener('mouseenter', () => {
            elements.cursor.style.width = '60px';
            elements.cursor.style.height = '60px';
            elements.cursor.style.borderColor = 'white';
        });
        el.addEventListener('mouseleave', () => {
            elements.cursor.style.width = '30px';
            elements.cursor.style.height = '30px';
            elements.cursor.style.borderColor = 'var(--royal-gold)';
        });
    });
};

// --- SCROLL THREAD ---
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    elements.scrollThread.style.width = scrolled + "%";
});

// --- NOTIFICATIONS ---
const showNotification = () => {
    const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const city = CITIES[Math.floor(Math.random() * CITIES.length)];
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = `A ${product.name} was just acquired in ${city}`;
    elements.notificationCenter.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
};
setInterval(showNotification, 8000);

// --- PRODUCT RENDER ---
const renderProducts = () => {
    elements.grid.innerHTML = '';
    const filtered = PRODUCTS.filter(p => state.filters.category === 'All' || p.category === state.filters.category);
    
    if (filtered.length === 0) {
        document.getElementById('no-results').classList.remove('hidden');
    } else {
        document.getElementById('no-results').classList.add('hidden');
        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'masonry-item royal-card glass-royal rounded-[3rem] overflow-hidden cursor-pointer group';
            card.innerHTML = `
                <div class="relative overflow-hidden aspect-[3/4]">
                    <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-700"></div>
                </div>
                <div class="p-8">
                    <div class="flex justify-between items-start mb-4">
                        <h4 class="text-[11px] font-bold text-white uppercase tracking-[0.3em]">${p.name}</h4>
                        <span class="text-amber-500 font-bold text-[10px]">Rs. ${p.price.toLocaleString()}</span>
                    </div>
                    <div class="pt-6 border-t border-amber-500/5 flex justify-between text-[8px] uppercase tracking-widest text-amber-500/30">
                        <span>${p.category}</span>
                        <span>${p.rating} ★</span>
                    </div>
                </div>
            `;
            card.onclick = () => openModal(p);
            elements.grid.appendChild(card);
        });
    }
};

const renderFilters = () => {
    const cats = ['All', ...Object.values(CATEGORIES)];
    elements.filterBar.innerHTML = '';
    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `px-6 py-2 text-[9px] uppercase tracking-[0.3em] rounded-full border transition-all ${
            state.filters.category === cat ? 'bg-amber-500 border-amber-500 text-black font-bold' : 'border-white/5 text-white/30 hover:text-amber-500'
        }`;
        btn.innerText = cat;
        btn.onclick = () => { state.filters.category = cat; renderFilters(); renderProducts(); };
        elements.filterBar.appendChild(btn);
    });
};

// --- CART ---
const updateCartUI = () => {
    const total = state.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const count = state.cart.reduce((s, i) => s + i.quantity, 0);
    elements.cartBadge.innerText = count;
    elements.cartBadge.classList.toggle('hidden', count === 0);
    elements.cartBadge.classList.toggle('flex', count > 0);
    elements.cartTotal.innerText = `Rs. ${total.toLocaleString()}`;

    elements.cartItems.innerHTML = '';
    state.cart.forEach(item => {
        const div = document.createElement('div');
        div.className = 'flex space-x-6 items-center p-4 bg-white/5 rounded-3xl border border-white/5';
        div.innerHTML = `
            <img src="${item.image}" class="w-20 h-24 object-cover rounded-2xl">
            <div class="flex-grow">
                <div class="flex justify-between text-[10px] font-bold text-white mb-2 uppercase tracking-widest">
                    <span>${item.name}</span>
                    <button onclick="window.removeItem('${item.id}')" class="text-amber-500/20 hover:text-amber-500">✕</button>
                </div>
                <div class="flex justify-between items-center mt-4">
                    <div class="flex items-center space-x-4 bg-black/40 px-4 py-2 rounded-full text-[10px] border border-white/5">
                        <button onclick="window.updateQty('${item.id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="window.updateQty('${item.id}', 1)">+</button>
                    </div>
                    <span class="text-amber-400 font-bold text-[10px]">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            </div>
        `;
        elements.cartItems.appendChild(div);
    });
};

window.addItem = (p) => {
    const exists = state.cart.find(i => i.id === p.id);
    if (exists) exists.quantity++; else state.cart.push({...p, quantity: 1});
    localStorage.setItem('shani_cart', JSON.stringify(state.cart));
    updateCartUI();
    toggleCart(true);
};

window.removeItem = (id) => {
    state.cart = state.cart.filter(i => i.id !== id);
    localStorage.setItem('shani_cart', JSON.stringify(state.cart));
    updateCartUI();
};

window.updateQty = (id, d) => {
    const item = state.cart.find(i => i.id === id);
    if (item) {
        item.quantity = Math.max(1, item.quantity + d);
        localStorage.setItem('shani_cart', JSON.stringify(state.cart));
        updateCartUI();
    }
};

const toggleCart = (show) => {
    elements.cartDrawer.style.transform = show ? 'translateX(0)' : 'translateX(100%)';
    elements.cartOverlay.style.opacity = show ? '1' : '0';
    elements.cartOverlay.style.pointerEvents = show ? 'auto' : 'none';
};

// --- MODAL ---
const openModal = (p) => {
    state.activeProduct = p;
    document.getElementById('modal-name').innerText = p.name;
    document.getElementById('modal-image').src = p.image;
    document.getElementById('modal-price').innerText = `Rs. ${p.price.toLocaleString()}`;
    document.getElementById('modal-description').innerText = p.description;
    document.getElementById('modal-category').innerText = p.category;
    
    document.getElementById('modal-add-to-cart').onclick = () => { window.addItem(p); closeModal(); };
    
    elements.modalContainer.style.opacity = '1';
    elements.modalContainer.style.pointerEvents = 'auto';
    elements.modalBox.style.transform = 'scale(1)';
};

const closeModal = () => {
    elements.modalContainer.style.opacity = '0';
    elements.modalContainer.style.pointerEvents = 'none';
    elements.modalBox.style.transform = 'scale(0.95)';
};

// --- PARTICLES ---
const initParticles = () => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('mousemove', (e) => {
        for(let i=0; i<3; i++) {
            particles.push({
                x: e.clientX, y: e.clientY,
                vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2,
                life: 1, size: Math.random()*2
            });
        }
    });

    const animate = () => {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        particles.forEach((p, idx) => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.01;
            if(p.life <= 0) particles.splice(idx, 1);
            ctx.fillStyle = `rgba(180, 138, 62, ${p.life})`;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(animate);
    };
    animate();
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    renderFilters();
    renderProducts();
    updateCartUI();
    initCursor();
    initParticles();

    document.getElementById('cart-trigger').onclick = () => toggleCart(true);
    document.getElementById('cart-close').onclick = () => toggleCart(false);
    document.getElementById('cart-overlay').onclick = () => toggleCart(false);
    document.getElementById('modal-close-btn').onclick = closeModal;
    document.getElementById('modal-close-bg').onclick = closeModal;
    document.getElementById('ai-trigger').onclick = () => alert("Imperial AI: Based on your presence, I suggest the 'Golden Empress' for your next gala.");

    document.getElementById('checkout-btn').onclick = () => {
        if(state.cart.length === 0) return;
        const btn = document.getElementById('checkout-btn');
        btn.innerText = "Consulting Treasury...";
        setTimeout(() => {
            alert("Acquisition Successful. Your items are being prepared at the Shani Atelier.");
            state.cart = [];
            localStorage.setItem('shani_cart', '[]');
            updateCartUI();
            toggleCart(false);
            btn.innerText = "Acquire Collection";
        }, 2000);
    };
});
