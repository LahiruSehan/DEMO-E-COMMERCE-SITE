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
    { id: 'SH-291X', name: 'Aetheris Dress', description: 'Hand-stitched silk with moon-stone accents.', price: 1250000, category: CATEGORIES.EVENING, ageGroup: AGE_GROUPS.MATURE, image: 'https://i.ibb.co/LXw6tbPN/219436cd090b78ecb532d0215f902573.jpg', rating: 4.9 },
    { id: 'SH-882E', name: 'Regent Blazer', description: 'Premium wool tailored for the elite.', price: 850000, category: CATEGORIES.BUSINESS, ageGroup: AGE_GROUPS.YOUNG_ADULT, image: 'https://i.ibb.co/tMxv9BZ1/eb348ad80adc84fbbd6ce5c03dcf8413.jpg', rating: 4.8 },
    { id: 'SH-109A', name: 'Azure Silk Gown', description: 'Flowing satin with imperial embroidery.', price: 450000, category: CATEGORIES.LUXE, ageGroup: AGE_GROUPS.JUNIOR, image: 'https://i.ibb.co/3yqRTH4D/ee071bfe9dd5f341acfe6dae90ccae51.jpg', rating: 4.7 },
    { id: 'SH-99RC', name: 'Crown Jewel Cape', description: 'Limited edition heavy velvet masterpiece.', price: 2800000, category: CATEGORIES.ROYAL, ageGroup: AGE_GROUPS.TIMELESS, image: 'https://i.ibb.co/JSmbbDv/8bd13d06c7679c42b9a45552de6a40fd.jpg', rating: 5.0 },
    { id: 'SH-44PL', name: 'Onyx Evening Suit', description: 'Deep black silhouette with gold threading.', price: 920000, category: CATEGORIES.LUXE, ageGroup: AGE_GROUPS.MATURE, image: 'https://i.ibb.co/1f2JzZcr/9db655c054eae5e2d1b8d117326630ce.jpg', rating: 4.9 },
    { id: 'SH-06ST', name: 'Stardust Wrap', description: 'Light as air with subtle reflective fibers.', price: 350000, category: CATEGORIES.LUXE, ageGroup: AGE_GROUPS.TIMELESS, image: 'https://i.ibb.co/4wwxXR09/2c55b0fbe18a136812e42a0e7452e848.jpg', rating: 4.6 },
    { id: 'SH-07IV', name: 'Ivory Cathedral', description: 'The ultimate bridal statement.', price: 4500000, category: CATEGORIES.BRIDAL, ageGroup: AGE_GROUPS.YOUNG_ADULT, image: 'https://i.ibb.co/LKBRdyD/444e6f0fe598878135d2d045d7fc10aa.jpg', rating: 5.0 },
    { id: 'SH-10OR', name: 'Solaris Gown', description: 'Radiant gold finish with pleated layers.', price: 1150000, category: CATEGORIES.EVENING, ageGroup: AGE_GROUPS.TIMELESS, image: 'https://i.ibb.co/mFHjZd6N/6777b52052495598aaa844bbf5fb544f.jpg', rating: 4.7 },
    { id: 'SH-13DD', name: 'Sovereign Bridal', description: 'A legacy piece for the imperial bride.', price: 5800000, category: CATEGORIES.BRIDAL, ageGroup: AGE_GROUPS.MATURE, image: 'https://i.ibb.co/Fq6RjkPZ/d6149f37b1e7bf47a7ad0565c7368328.jpg', rating: 5.0 },
    { id: 'SH-21GG', name: 'Golden Empress', description: '24k gold leaf details on pure white silk.', price: 2980000, category: CATEGORIES.ROYAL, ageGroup: AGE_GROUPS.TIMELESS, image: 'https://i.ibb.co/bRqbT1HW/eb77f1b749702a5c3289d566c30b20f7.jpg', rating: 5.0 },
    { id: 'SH-23SS', name: 'Diamond Dusk', description: 'Studded with ethically sourced crystals.', price: 5100000, category: CATEGORIES.BRIDAL, ageGroup: AGE_GROUPS.YOUNG_ADULT, image: 'https://i.ibb.co/1tTrQVVZ/292446b2679926d0339b3171fca4aff7.jpg', rating: 5.0 },
    { id: 'SH-25CC', name: 'Midnight Noir', description: 'Sleek, modern, and undeniably royal.', price: 950000, category: CATEGORIES.EVENING, ageGroup: AGE_GROUPS.JUNIOR, image: 'https://i.ibb.co/mVtx3cVd/6c3b85f95eda88d860b7c4aecc6783d0.jpg', rating: 4.7 }
];

// --- STATE MANAGEMENT ---
let state = {
    cart: JSON.parse(localStorage.getItem('shani_cart') || '[]'),
    filters: {
        category: 'All',
        ageGroup: 'All'
    },
    activeModalProduct: null
};

const saveState = () => {
    localStorage.setItem('shani_cart', JSON.stringify(state.cart));
};

// --- DOM ELEMENTS ---
const elements = {
    productGrid: document.getElementById('product-grid'),
    noResults: document.getElementById('no-results'),
    filterBar: document.getElementById('filter-bar'),
    cartBadge: document.getElementById('cart-badge'),
    cartItems: document.getElementById('cart-items'),
    cartTotal: document.getElementById('cart-total'),
    cartDrawer: document.getElementById('cart-drawer'),
    cartOverlay: document.getElementById('cart-overlay'),
    cartTrigger: document.getElementById('cart-trigger'),
    cartClose: document.getElementById('cart-close'),
    checkoutBtn: document.getElementById('checkout-btn'),
    modal: document.getElementById('product-modal-container'),
    modalName: document.getElementById('modal-name'),
    modalImage: document.getElementById('modal-image'),
    modalPrice: document.getElementById('modal-price'),
    modalDesc: document.getElementById('modal-description'),
    modalCat: document.getElementById('modal-category'),
    modalAddBtn: document.getElementById('modal-add-to-cart'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCloseBg: document.getElementById('modal-close-bg')
};

// --- CORE FUNCTIONS ---

const renderProducts = () => {
    elements.productGrid.innerHTML = '';
    const filtered = PRODUCTS.filter(p => {
        const catMatch = state.filters.category === 'All' || p.category === state.filters.category;
        const ageMatch = state.filters.ageGroup === 'All' || p.ageGroup === state.filters.ageGroup;
        return catMatch && ageMatch;
    });

    if (filtered.length === 0) {
        elements.noResults.classList.remove('hidden');
    } else {
        elements.noResults.classList.add('hidden');
        filtered.forEach(product => {
            const card = document.createElement('div');
            card.className = 'masonry-item royal-card glass-royal rounded-[2.5rem] overflow-hidden cursor-pointer';
            card.innerHTML = `
                <div class="relative overflow-hidden">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-auto object-cover transition-transform duration-1000 hover:scale-105">
                </div>
                <div class="p-6">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-[10px] font-bold text-white uppercase tracking-widest">${product.name}</h3>
                        <span class="text-amber-500 font-bold text-[10px]">Rs. ${product.price.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between items-center text-[8px] text-amber-500/30 uppercase tracking-widest pt-3 border-t border-amber-500/5">
                        <span>${product.category}</span>
                        <span>${product.rating} ★</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => openModal(product));
            elements.productGrid.appendChild(card);
        });
    }
};

const renderFilters = () => {
    const cats = ['All', ...Object.values(CATEGORIES)];
    elements.filterBar.innerHTML = '';
    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `px-6 py-2 text-[9px] uppercase tracking-[0.2em] rounded-full border transition-all flex-shrink-0 ${
            state.filters.category === cat 
            ? 'bg-amber-500 border-amber-500 text-black font-bold' 
            : 'border-white/5 text-white/30 hover:text-amber-500'
        }`;
        btn.innerText = cat;
        btn.onclick = () => {
            state.filters.category = cat;
            renderFilters();
            renderProducts();
        };
        elements.filterBar.appendChild(btn);
    });
};

const updateCartUI = () => {
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    elements.cartBadge.innerText = totalCount;
    elements.cartBadge.classList.toggle('hidden', totalCount === 0);
    elements.cartBadge.classList.toggle('flex', totalCount > 0);
    elements.cartTotal.innerText = `Rs. ${totalPrice.toLocaleString()}`;

    elements.cartItems.innerHTML = '';
    if (state.cart.length === 0) {
        elements.cartItems.innerHTML = `<div class="h-full flex flex-col items-center justify-center opacity-20"><p class="uppercase tracking-[0.5em] text-[8px]">Treasury is Empty</p></div>`;
    } else {
        state.cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'flex space-x-4 p-3 bg-white/5 rounded-2xl border border-white/5 items-center';
            div.innerHTML = `
                <img src="${item.image}" class="w-16 h-20 object-cover rounded-xl border border-amber-500/10">
                <div class="flex-grow">
                    <div class="flex justify-between text-[10px] font-bold text-white mb-2">
                        <span class="truncate w-32">${item.name}</span>
                        <button onclick="window.removeFromCart('${item.id}')" class="text-amber-500/30 hover:text-amber-500">✕</button>
                    </div>
                    <div class="flex justify-between items-center">
                        <div class="flex items-center space-x-3 bg-black/40 px-3 py-1.5 rounded-full text-[10px] border border-white/5">
                            <button onclick="window.updateQty('${item.id}', -1)" class="hover:text-amber-500">-</button>
                            <span class="font-bold">${item.quantity}</span>
                            <button onclick="window.updateQty('${item.id}', 1)" class="hover:text-amber-500">+</button>
                        </div>
                        <span class="text-[10px] text-amber-400 font-bold">Rs. ${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                </div>
            `;
            elements.cartItems.appendChild(div);
        });
    }
};

window.addToCart = (product) => {
    const existing = state.cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        state.cart.push({ ...product, quantity: 1 });
    }
    saveState();
    updateCartUI();
    toggleCart(true);
};

window.removeFromCart = (id) => {
    state.cart = state.cart.filter(i => i.id !== id);
    saveState();
    updateCartUI();
};

window.updateQty = (id, delta) => {
    const item = state.cart.find(i => i.id === id);
    if (item) {
        item.quantity = Math.max(1, item.quantity + delta);
        saveState();
        updateCartUI();
    }
};

const toggleCart = (show) => {
    elements.cartDrawer.classList.toggle('active', show);
    elements.cartOverlay.classList.toggle('active', show);
};

const openModal = (product) => {
    state.activeModalProduct = product;
    elements.modalName.innerText = product.name;
    elements.modalImage.src = product.image;
    elements.modalPrice.innerText = `Rs. ${product.price.toLocaleString()}`;
    elements.modalDesc.innerText = product.description;
    elements.modalCat.innerText = product.category;
    
    elements.modalAddBtn.onclick = () => {
        window.addToCart(product);
        closeModal();
    };
    
    elements.modal.classList.add('active');
};

const closeModal = () => {
    elements.modal.classList.remove('active');
};

window.resetFilters = () => {
    state.filters = { category: 'All', ageGroup: 'All' };
    renderFilters();
    renderProducts();
};

// --- PARTICLE ENGINE ---
const initParticles = () => {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const createParticle = (x, y) => {
        return {
            x, y,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 2.5,
            speedY: (Math.random() - 0.5) * 2.5,
            color: ['#b48a3e', '#f9e1a9', '#ffffff'][Math.floor(Math.random() * 3)],
            life: 1
        };
    };

    window.addEventListener('mousemove', (e) => {
        for (let i = 0; i < 4; i++) {
            particles.push(createParticle(e.clientX, e.clientY));
        }
    });

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.speedX;
            p.y += p.speedY;
            p.life -= 0.015;
            if (p.life <= 0) {
                particles.splice(i, 1);
                i--;
                continue;
            }
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        requestAnimationFrame(animate);
    };
    animate();
};

// --- EVENT LISTENERS ---
elements.cartTrigger.addEventListener('click', () => toggleCart(true));
elements.cartClose.addEventListener('click', () => toggleCart(false));
elements.cartOverlay.addEventListener('click', () => toggleCart(false));
elements.modalCloseBtn.addEventListener('click', closeModal);
elements.modalCloseBg.addEventListener('click', closeModal);

elements.checkoutBtn.addEventListener('click', () => {
    if (state.cart.length === 0) return;
    elements.checkoutBtn.innerText = 'Acquisition in progress...';
    elements.checkoutBtn.disabled = true;
    setTimeout(() => {
        state.cart = [];
        saveState();
        updateCartUI();
        elements.checkoutBtn.innerText = 'Granted';
        setTimeout(() => {
            elements.checkoutBtn.innerText = 'Complete Acquisition';
            elements.checkoutBtn.disabled = false;
            toggleCart(false);
        }, 2000);
    }, 2500);
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderFilters();
    renderProducts();
    updateCartUI();
    initParticles();
    
    // AI Stylist logic
    const aiBtn = document.getElementById('ai-trigger');
    aiBtn.onclick = () => {
        const choice = confirm("Imperial AI: Shall I curate a special selection for you based on 'Royal Occasions'?");
        if (choice) {
            state.filters.category = CATEGORIES.ROYAL;
            renderFilters();
            renderProducts();
            window.scrollTo({ top: elements.filterBar.offsetTop - 100, behavior: 'smooth' });
        }
    };
});
