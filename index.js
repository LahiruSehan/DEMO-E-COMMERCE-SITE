// --- CONSTANTS ---
const CATEGORIES = {
    EVENING: 'Evening Wear',
    ROYAL: 'Royal Occasions',
    LUXE: 'Casual Luxe',
    BUSINESS: 'Business Elite',
    BRIDAL: 'Imperial Bridal'
};

const AGE_GROUPS = {
    JUNIOR: 'Junior Royalty',
    YOUNG_ADULT: 'Graceful Youth',
    MATURE: 'Majestic Elegance',
    TIMELESS: 'Timeless Legacy'
};

const PRODUCTS = [
    { id: 'SH-01', name: 'Aetheris Dress', description: 'Hand-stitched silk with moon-stone accents.', price: 1250000, category: CATEGORIES.EVENING, ageGroup: AGE_GROUPS.MATURE, image: 'https://i.ibb.co/LXw6tbPN/219436cd090b78ecb532d0215f902573.jpg', rating: 4.9 },
    { id: 'SH-02', name: 'Regent Blazer', description: 'Tailored premium wool for elite presence.', price: 850000, category: CATEGORIES.BUSINESS, ageGroup: AGE_GROUPS.YOUNG_ADULT, image: 'https://i.ibb.co/tMxv9BZ1/eb348ad80adc84fbbd6ce5c03dcf8413.jpg', rating: 4.8 },
    { id: 'SH-03', name: 'Azure Silk Gown', description: 'Flowing satin with imperial embroidery.', price: 450000, category: CATEGORIES.LUXE, ageGroup: AGE_GROUPS.JUNIOR, image: 'https://i.ibb.co/3yqRTH4D/ee071bfe9dd5f341acfe6dae90ccae51.jpg', rating: 4.7 },
    { id: 'SH-04', name: 'Crown Jewel Cape', description: 'Limited heavy velvet gold bullion masterpiece.', price: 2800000, category: CATEGORIES.ROYAL, ageGroup: AGE_GROUPS.TIMELESS, image: 'https://i.ibb.co/JSmbbDv/8bd13d06c7679c42b9a45552de6a40fd.jpg', rating: 5.0 },
    { id: 'SH-05', name: 'Onyx Evening Suit', description: 'Deep black silhouette with 24k gold threading.', price: 920000, category: CATEGORIES.LUXE, ageGroup: AGE_GROUPS.MATURE, image: 'https://i.ibb.co/1f2JzZcr/9db655c054eae5e2d1b8d117326630ce.jpg', rating: 4.9 },
    { id: 'SH-07', name: 'Ivory Cathedral', description: 'The ultimate 4-meter train statement piece.', price: 4500000, category: CATEGORIES.BRIDAL, ageGroup: AGE_GROUPS.YOUNG_ADULT, image: 'https://i.ibb.co/LKBRdyD/444e6f0fe598878135d2d045d7fc10aa.jpg', rating: 5.0 },
    { id: 'SH-08', name: 'Solaris Gown', description: 'Radiant gold finish with pleated layers.', price: 1150000, category: CATEGORIES.EVENING, ageGroup: AGE_GROUPS.TIMELESS, image: 'https://i.ibb.co/mFHjZd6N/6777b52052495598aaa844bbf5fb544f.jpg', rating: 4.7 },
    { id: 'SH-09', name: 'Sovereign Bridal', description: 'Passed through generations of imperial brides.', price: 5800000, category: CATEGORIES.BRIDAL, ageGroup: AGE_GROUPS.MATURE, image: 'https://i.ibb.co/Fq6RjkPZ/d6149f37b1e7bf47a7ad0565c7368328.jpg', rating: 5.0 },
    { id: 'SH-10', name: 'Golden Empress', description: '24k gold leaf details on mulberry silk.', price: 2980000, category: CATEGORIES.ROYAL, ageGroup: AGE_GROUPS.TIMELESS, image: 'https://i.ibb.co/bRqbT1HW/eb77f1b749702a5c3289d566c30b20f7.jpg', rating: 5.0 },
    { id: 'SH-12', name: 'Midnight Noir', description: 'Sleek, modern commanding presence.', price: 950000, category: CATEGORIES.EVENING, ageGroup: AGE_GROUPS.JUNIOR, image: 'https://i.ibb.co/mVtx3cVd/6c3b85f95eda88d860b7c4aecc6783d0.jpg', rating: 4.7 }
];

// --- STATE ---
let state = {
    cart: JSON.parse(localStorage.getItem('shani_cart_v2') || '[]'),
    filters: { category: 'All' },
    heroIndex: 0,
    aiStep: 0,
    aiSelections: { category: '', ageGroup: '' }
};

// --- DOM ELEMENTS ---
const elements = {
    grid: document.getElementById('product-grid'),
    filterBar: document.getElementById('filter-bar'),
    cartBadge: document.getElementById('cart-badge'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    aiDrawer: document.getElementById('ai-drawer'),
    aiOverlay: document.getElementById('ai-overlay'),
    aiTrigger: document.getElementById('ai-trigger'),
    aiClose: document.getElementById('ai-close'),
    aiQuestion: document.getElementById('ai-question'),
    aiOptions: document.getElementById('ai-options'),
    aiProcessing: document.getElementById('ai-processing'),
    aiWizard: document.getElementById('ai-wizard'),
    scrollThread: document.getElementById('scroll-thread')
};

// --- HERO CAROUSEL ---
const initHero = () => {
    const slides = document.querySelectorAll('.hero-slide');
    setInterval(() => {
        slides[state.heroIndex].classList.remove('active');
        state.heroIndex = (state.heroIndex + 1) % slides.length;
        slides[state.heroIndex].classList.add('active');
    }, 6000);
};

// --- SCROLL THREAD ---
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    elements.scrollThread.style.width = (winScroll / height) * 100 + "%";
});

// --- RENDER PRODUCTS ---
const renderProducts = () => {
    elements.grid.innerHTML = '';
    const filtered = PRODUCTS.filter(p => state.filters.category === 'All' || p.category === state.filters.category);
    
    if (filtered.length === 0) {
        document.getElementById('no-results').classList.remove('hidden');
    } else {
        document.getElementById('no-results').classList.add('hidden');
        filtered.forEach(p => {
            const card = document.createElement('div');
            card.className = 'glass-royal rounded-[2rem] overflow-hidden group flex flex-col shadow-xl';
            card.innerHTML = `
                <div class="relative overflow-hidden aspect-[4/5] md:aspect-[3/4]">
                    <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110">
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-700"></div>
                </div>
                <div class="p-4 md:p-6 flex-grow flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="text-[10px] md:text-xs font-bold text-white uppercase tracking-widest">${p.name}</h4>
                        <span class="text-amber-500 font-bold text-[9px] md:text-[10px]">Rs. ${p.price.toLocaleString()}</span>
                    </div>
                    <p class="text-[8px] md:text-[9px] text-gray-500 line-clamp-1 mb-4 italic">${p.description}</p>
                    <div class="mt-auto pt-4 border-t border-amber-500/5 flex justify-between items-center text-[7px] md:text-[8px] uppercase tracking-widest text-amber-500/30">
                        <span>${p.category}</span>
                        <button onclick="window.addItemById('${p.id}')" class="text-amber-500 hover:text-white transition-colors">Selection +</button>
                    </div>
                </div>
            `;
            elements.grid.appendChild(card);
        });
    }
};

const renderFilters = () => {
    const cats = ['All', ...Object.values(CATEGORIES)];
    elements.filterBar.innerHTML = '';
    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `px-5 py-2 text-[9px] md:text-[10px] uppercase tracking-[0.2em] rounded-full border transition-all flex-shrink-0 whitespace-nowrap ${
            state.filters.category === cat ? 'bg-amber-500 border-amber-500 text-black font-extrabold' : 'border-white/5 text-white/30'
        }`;
        btn.innerText = cat;
        btn.onclick = () => { state.filters.category = cat; renderFilters(); renderProducts(); };
        elements.filterBar.appendChild(btn);
    });
};

// --- CART LOGIC ---
const updateCartUI = () => {
    const total = state.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const count = state.cart.reduce((s, i) => s + i.quantity, 0);
    elements.cartBadge.innerText = count;
    elements.cartBadge.classList.toggle('hidden', count === 0);
    elements.cartBadge.classList.toggle('flex', count > 0);
    elements.cartTotal.innerText = `Rs. ${total.toLocaleString()}`;

    elements.cartItems.innerHTML = '';
    if (state.cart.length === 0) {
        elements.cartItems.innerHTML = `<div class="h-full flex flex-col items-center justify-center text-white/20 uppercase tracking-[0.5em] text-[10px]">Your treasury is empty</div>`;
    } else {
        state.cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex space-x-4 items-center p-3 bg-white/5 rounded-2xl border border-white/5';
            div.innerHTML = `
                <img src="${item.image}" class="w-16 h-20 object-cover rounded-xl border border-amber-500/10">
                <div class="flex-grow">
                    <div class="flex justify-between text-[10px] font-bold text-white mb-2">
                        <span>${item.name}</span>
                        <button onclick="window.removeItem('${item.id}')" class="text-amber-500/20">✕</button>
                    </div>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-3 bg-black/40 px-3 py-1.5 rounded-full text-[10px]">
                            <button onclick="window.updateQty('${item.id}', -1)">-</button>
                            <span class="font-bold">${item.quantity}</span>
                            <button onclick="window.updateQty('${item.id}', 1)">+</button>
                        </div>
                        <span class="text-amber-400 font-bold text-[10px]">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                </div>
            `;
            elements.cartItems.appendChild(div);
        });
    }
};

window.addItemById = (id) => {
    const p = PRODUCTS.find(prod => prod.id === id);
    if (!p) return;
    const exists = state.cart.find(i => i.id === p.id);
    if (exists) exists.quantity++; else state.cart.push({...p, quantity: 1});
    localStorage.setItem('shani_cart_v2', JSON.stringify(state.cart));
    updateCartUI();
    elements.cartDrawer.classList.add('active');
};

window.removeItem = (id) => {
    state.cart = state.cart.filter(i => i.id !== id);
    localStorage.setItem('shani_cart_v2', JSON.stringify(state.cart));
    updateCartUI();
};

window.updateQty = (id, d) => {
    const item = state.cart.find(i => i.id === id);
    if (item) {
        item.quantity = Math.max(1, item.quantity + d);
        localStorage.setItem('shani_cart_v2', JSON.stringify(state.cart));
        updateCartUI();
    }
};

// --- AI STYLIST WIZARD ---
const AI_QUESTIONS = [
    {
        q: "What nature of presence do you wish to command?",
        key: 'category',
        options: Object.values(CATEGORIES)
    },
    {
        q: "What era of legacy do you resonate with?",
        key: 'ageGroup',
        options: Object.values(AGE_GROUPS)
    },
    {
        q: "Shall we proceed with this curated vision?",
        key: 'final',
        options: ["Manifest Selection", "Restart Journey"]
    }
];

const renderAIWizard = () => {
    const qData = AI_QUESTIONS[state.aiStep];
    elements.aiQuestion.innerText = qData.q;
    elements.aiOptions.innerHTML = '';
    
    qData.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 text-[10px] md:text-xs uppercase tracking-[0.2em] text-amber-500 font-bold transition-all";
        btn.innerText = opt;
        btn.onclick = () => handleAISelection(opt);
        elements.aiOptions.appendChild(btn);
    });
};

const handleAISelection = (val) => {
    if (state.aiStep === 0) state.aiSelections.category = val;
    if (state.aiStep === 1) state.aiSelections.ageGroup = val;
    
    if (val === "Restart Journey") {
        state.aiStep = 0;
        renderAIWizard();
        return;
    }

    if (state.aiStep < AI_QUESTIONS.length - 1) {
        state.aiStep++;
        renderAIWizard();
    } else {
        // Final Manifestation
        elements.aiWizard.classList.add('hidden');
        elements.aiProcessing.classList.remove('hidden');
        
        setTimeout(() => {
            state.filters.category = state.aiSelections.category;
            renderFilters();
            renderProducts();
            
            elements.aiDrawer.classList.remove('active');
            // Reset for next time
            setTimeout(() => {
                state.aiStep = 0;
                elements.aiWizard.classList.remove('hidden');
                elements.aiProcessing.classList.add('hidden');
            }, 500);
            
            window.scrollTo({ top: elements.filterBar.offsetTop - 100, behavior: 'smooth' });
        }, 2000);
    }
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
                vx: (Math.random()-0.5)*2.5, vy: (Math.random()-0.5)*2.5,
                life: 1, size: Math.random()*2.5
            });
        }
    });

    const animate = () => {
        ctx.clearRect(0,0,canvas.width, canvas.height);
        particles.forEach((p, idx) => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.015;
            if(p.life <= 0) particles.splice(idx, 1);
            ctx.fillStyle = `rgba(180, 138, 62, ${p.life})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(255, 225, 169, 0.5)';
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
    initHero();
    initParticles();
    renderAIWizard();

    // Event Handlers
    elements.cartTrigger.onclick = () => elements.cartDrawer.classList.add('active');
    document.getElementById('cart-close-btn').onclick = () => elements.cartDrawer.classList.remove('active');
    document.getElementById('cart-overlay').onclick = () => elements.cartDrawer.classList.remove('active');

    elements.aiTrigger.onclick = () => elements.aiDrawer.classList.add('active');
    elements.aiClose.onclick = () => elements.aiDrawer.classList.remove('active');
    elements.aiOverlay.onclick = () => elements.aiDrawer.classList.remove('active');

    document.getElementById('checkout-btn').onclick = () => {
        if(state.cart.length === 0) return;
        const btn = document.getElementById('checkout-btn');
        btn.innerText = "Consulting the Royal Treasury...";
        btn.disabled = true;
        
        setTimeout(() => {
            alert("Acquisition Successful. Your artifacts are being prepared at the Shani Atelier.");
            state.cart = [];
            localStorage.setItem('shani_cart_v2', '[]');
            updateCartUI();
            elements.cartDrawer.classList.remove('active');
            btn.innerText = "Complete Acquisition";
            btn.disabled = false;
        }, 2500);
    };
});
