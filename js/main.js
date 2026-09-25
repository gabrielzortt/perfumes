import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { normalizeBrandKey, resolveSectors } from "./sectors.js";
import { FRAGRANCE_LIBRARY, extractReference } from "./fragrance-library.js";

const firebaseConfig = {
    apiKey: "AIzaSyBBzLjq-FsBI7nK97MvF_-FMNEDDakbs3o",
    authDomain: "elegance-perfum.firebaseapp.com",
    projectId: "elegance-perfum",
    storageBucket: "elegance-perfum.firebasestorage.app",
    messagingSenderId: "12599337514",
    appId: "1:12599337514:web:b83c321202fc48ba73d953"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let products = [];
let liveSectors = [];
let cart = [];

const GENERIC_DESC = 'Produto selecionado com cuidado para você.';

// -------------------- Firestore listeners --------------------

onSnapshot(collection(db, "produtos"), (snapshot) => {
    products = [];
    snapshot.forEach((doc) => products.push({ id: doc.id, ...doc.data() }));
    cart = cart.filter(cartItem => products.some(p => p.id === cartItem.id));
    window.renderProducts();
    window.updateCart();
});

onSnapshot(collection(db, "setores"), (snapshot) => {
    liveSectors = [];
    snapshot.forEach((doc) => liveSectors.push({ id: doc.id, ...doc.data() }));
    window.renderProducts();
});

// -------------------- Sector helpers --------------------

function getSectorList() {
    return resolveSectors(liveSectors);
}

// Devolve a ficha do setor para uma chave, criando uma entrada "avulsa" se o
// produto referenciar um setor que não existe mais (nunca esconde produtos).
function getSectorMeta(brandRaw) {
    const key = normalizeBrandKey(brandRaw);
    const found = getSectorList().find(s => (s.key || s.id) === key);
    if (found) return found;
    return { key, label: brandRaw || 'Outros', icon: '📦', order: 999 };
}

// -------------------- Fragrance notes (ficha olfativa) --------------------

function getFragranceInfo(p) {
    // 1) Ficha própria salva no Firestore pelo admin sempre tem prioridade
    const hasOwn = p.description || p.family || p.notesTop || p.notesHeart || p.notesBase;
    if (hasOwn) {
        return {
            family: p.family || '',
            top: p.notesTop || '',
            heart: p.notesHeart || '',
            base: p.notesBase || '',
            blurb: p.description || '',
        };
    }
    // 2) Biblioteca curada, casada pelo nome do perfume original referenciado
    const ref = extractReference(p.name);
    if (FRAGRANCE_LIBRARY[ref]) return FRAGRANCE_LIBRARY[ref];
    const keys = Object.keys(FRAGRANCE_LIBRARY).sort((a, b) => b.length - a.length);
    for (const k of keys) {
        if (ref.includes(k) || k.includes(ref)) return FRAGRANCE_LIBRARY[k];
    }
    return null;
}

// -------------------- Rendering --------------------

window.renderProducts = function(productsToRender = products) {
    const container = document.getElementById('sections-container');
    const noResults = document.getElementById('no-results');
    if (!container) return;

    container.innerHTML = '';

    // Agrupa produtos por chave de setor
    const grouped = {};
    productsToRender.forEach(p => {
        const key = normalizeBrandKey(p.brand);
        (grouped[key] = grouped[key] || []).push(p);
    });

    // Lista efetiva de setores (Firestore ou semente padrão) + setores "órfãos"
    // que existem nos produtos mas não têm mais ficha cadastrada.
    const known = getSectorList();
    const knownKeys = new Set(known.map(s => s.key || s.id));
    const orphanKeys = Object.keys(grouped).filter(k => !knownKeys.has(k));
    const orphanSectors = orphanKeys.map(k => ({ key: k, label: grouped[k][0].brand || k, icon: '📦', order: 999 }));
    const allSections = [...known, ...orphanSectors];

    const activePills = [];

    allSections.forEach(sector => {
        const key = sector.key || sector.id;
        const items = grouped[key];
        if (!items || items.length === 0) return;

        activePills.push({ key, label: sector.label, icon: sector.icon });

        const cardsHtml = items.map(p => renderCard(p)).join('');

        const section = document.createElement('div');
        section.id = `section-${key}`;
        section.className = 'mb-20 product-section scroll-mt-32';
        section.innerHTML = `
            <div class="flex items-baseline justify-between border-b border-line pb-3 mb-8">
                <h3 class="font-serif text-3xl md:text-4xl">${sector.label}</h3>
                <span class="text-copper text-sm">${sector.icon || ''}</span>
            </div>
            <div id="grid-${key}" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">${cardsHtml}</div>
        `;
        container.appendChild(section);
    });

    // Nav de setores (só os que têm produtos)
    const navWrapper = document.getElementById('sector-nav-wrapper');
    const nav = document.getElementById('sector-nav');
    nav.innerHTML = '';
    if (activePills.length > 0) {
        navWrapper.classList.remove('hidden');
        activePills.forEach(s => {
            nav.innerHTML += `<a href="#section-${s.key}" class="sector-pill">${s.icon || ''} ${s.label}</a>`;
        });
    } else {
        navWrapper.classList.add('hidden');
    }

    noResults.classList.toggle('hidden', productsToRender.length > 0);
}

function renderCard(p) {
    const isEsgotado = p.stock <= 0;
    const imageHtml = p.image && p.image !== ""
        ? `<img src="${p.image}" alt="${p.name}" class="product-image transform group-hover:scale-105 transition-transform duration-700">`
        : `<span class="text-gray-400 font-serif tracking-widest text-xs uppercase transform group-hover:scale-110 transition-transform duration-700 p-4 text-center">sem imagem</span>`;

    return `
        <div class="group product-card overflow-hidden relative flex flex-col">
            <div onclick="window.openProductModal('${p.id}')" class="card-media h-44 md:h-60 flex items-center justify-center overflow-hidden relative border-b border-line cursor-pointer">
                ${imageHtml}
                ${isEsgotado ? '<div class="absolute top-3 right-3 bg-ink text-ivory text-[10px] px-2.5 py-1 rounded-full z-10">Esgotado</div>' : ''}
            </div>
            
            <div class="p-4 md:p-5 flex flex-col flex-1 bg-ivory relative z-10">
                <h4 onclick="window.openProductModal('${p.id}')" class="underline-grow inline-block text-sm md:text-base font-serif mb-1 line-clamp-2 h-10 md:h-12 cursor-pointer w-fit">${p.name}</h4>
                <p class="text-lg md:text-xl font-light mb-4 md:mb-5">R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}</p>
                
                <div class="mt-auto">
                    ${isEsgotado
                        ? '<button disabled class="w-full border border-line text-ink/30 py-2.5 text-xs cursor-not-allowed">Indisponível</button>'
                        : `<button onclick="window.addToCart('${p.id}', this)" class="w-full bg-ivory border border-ink text-ink py-2.5 text-xs hover:bg-ink hover:text-ivory transition-all duration-300">Adicionar à Sacola</button>`}
                </div>
            </div>
        </div>
    `;
}

// -------------------- Product modal --------------------

window.openProductModal = function(id) {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('product-modal-content');
    const sector = getSectorMeta(p.brand);
    const frag = getFragranceInfo(p);

    document.getElementById('modal-name').innerText = p.name;
    document.getElementById('modal-sector-badge').innerText = `Linha ${sector.label}`;
    document.getElementById('modal-price').innerText = `R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}`;
    document.getElementById('modal-description').innerText = (frag && frag.blurb) ? frag.blurb : GENERIC_DESC;

    // Família + pirâmide olfativa (só aparece quando há dados)
    const familyEl = document.getElementById('modal-family');
    const notesEl = document.getElementById('modal-notes');
    if (frag && (frag.family || frag.top || frag.heart || frag.base)) {
        familyEl.innerText = frag.family || '';
        familyEl.classList.toggle('hidden', !frag.family);

        const rows = [
            ['Topo', frag.top],
            ['Coração', frag.heart],
            ['Fundo', frag.base],
        ].filter(([, v]) => v);

        notesEl.innerHTML = rows.map(([label, v]) => `
            <div class="flex gap-3 text-xs text-ink/70 py-1.5 border-t border-line first:border-t-0">
                <span class="w-16 shrink-0 uppercase tracking-wide text-copper font-medium">${label}</span>
                <span>${v}</span>
            </div>
        `).join('');
        notesEl.classList.toggle('hidden', rows.length === 0);
    } else {
        familyEl.classList.add('hidden');
        notesEl.classList.add('hidden');
    }

    const imgEl = document.getElementById('modal-img');
    if (p.image && p.image !== "") {
        imgEl.src = p.image;
        imgEl.classList.remove('hidden');
    } else {
        imgEl.classList.add('hidden');
    }

    const isEsgotado = p.stock <= 0;
    document.getElementById('modal-esgotado').classList.toggle('hidden', !isEsgotado);

    const btnContainer = document.getElementById('modal-action-btn');
    if (isEsgotado) {
        btnContainer.innerHTML = '<button disabled class="w-full bg-sand text-ink/30 py-4 text-sm cursor-not-allowed">Produto Esgotado</button>';
    } else {
        btnContainer.innerHTML = `<button onclick="window.addToCart('${p.id}', this); setTimeout(window.closeProductModal, 1000);" class="w-full bg-ink text-ivory py-4 text-sm hover:bg-copper transition-colors duration-500">Adicionar à Sacola</button>`;
    }

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
}

window.closeProductModal = function() {
    const modal = document.getElementById('product-modal');
    const modalContent = document.getElementById('product-modal-content');

    modal.classList.add('opacity-0');
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// -------------------- Search --------------------

window.searchProducts = function() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    const heroSection = document.getElementById('hero-section');
    const searchCount = document.getElementById('search-count');
    const navWrapper = document.getElementById('sector-nav-wrapper');

    if (searchTerm === "") {
        heroSection.classList.remove('hidden');
        searchCount.classList.add('hidden');
        window.renderProducts(products);
        return;
    }

    navWrapper.classList.add('hidden');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.brand || '').toLowerCase().includes(searchTerm)
    );

    heroSection.classList.add('hidden');
    searchCount.classList.remove('hidden');

    if (filteredProducts.length === 0) {
        searchCount.innerHTML = `Nenhum produto encontrado para "<b>${searchTerm}</b>"`;
    } else if (filteredProducts.length === 1) {
        searchCount.innerHTML = `1 produto encontrado`;
    } else {
        searchCount.innerHTML = `${filteredProducts.length} produtos encontrados`;
    }

    window.renderProducts(filteredProducts);
}

window.clearSearch = function() {
    document.getElementById('search-input').value = '';
    window.searchProducts();
}

// -------------------- Cart --------------------

window.toggleCart = function() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');

    sidebar.classList.toggle('translate-x-full');

    if (sidebar.classList.contains('translate-x-full')) {
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    } else {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
    }
}

window.addToCart = function(id, btnElement) {
    const product = products.find(p => p.id === id);
    if (product && product.stock > 0) {
        const item = cart.find(i => i.id === id);
        if (item) {
            if (item.qtd < product.stock) item.qtd++;
            else {
                alert('Estoque máximo atingido para este item.');
                return;
            }
        } else {
            cart.push({ ...product, qtd: 1 });
        }

        if (btnElement) {
            const originalText = btnElement.innerText;
            btnElement.innerText = "Adicionado ✓";
            btnElement.classList.add('bg-copper', 'text-ivory', 'border-copper');
            btnElement.classList.remove('bg-ivory', 'text-ink', 'border-ink');
            setTimeout(() => {
                btnElement.innerText = originalText;
                btnElement.classList.remove('bg-copper', 'text-ivory', 'border-copper');
                btnElement.classList.add('bg-ivory', 'text-ink', 'border-ink');
            }, 1500);
        }

        window.updateCart();
    }
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    window.updateCart();
}

window.updateCart = function() {
    const container = document.getElementById('cart-items');
    let total = 0;
    let count = 0;

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-ink/40 space-y-4 mt-20">
                <i class="fas fa-shopping-bag text-5xl opacity-30 mb-4"></i>
                <p class="font-light text-lg">Sua sacola está vazia.</p>
            </div>`;
    } else {
        container.innerHTML = '';
        cart.forEach((item, index) => {
            total += item.price * item.qtd;
            count += item.qtd;

            const imgInCart = item.image && item.image !== ""
                ? `<img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain p-1 border border-line">`
                : `<div class="w-16 h-16 bg-sand flex items-center justify-center text-[8px] text-ink/40 font-serif text-center p-1 border border-line">sem<br>imagem</div>`;

            const sector = getSectorMeta(item.brand);

            container.innerHTML += `
                <div class="flex gap-4 items-center border-b border-line pb-4">
                    ${imgInCart}
                    <div class="flex-1">
                        <p class="font-serif text-sm">${item.name}</p>
                        <p class="text-xs text-ink/50 mt-1">${sector.label} · Qtd: ${item.qtd}</p>
                        <p class="text-sm font-semibold text-copper mt-1">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <button onclick="window.removeFromCart(${index})" class="text-ink/30 hover:text-red-500 transition-colors p-2"><i class="fas fa-trash"></i></button>
                </div>
            `;
        });
    }

    document.getElementById('cart-total').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    document.getElementById('cart-count').innerText = count;
}

// -------------------- Checkout (inalterado: mesmo número e mesmo formato de mensagem) --------------------

window.checkout = function() {
    if (cart.length === 0) return alert('Sua sacola está vazia!');

    let text = "Ola! Gostaria de fazer o seguinte pedido na Perfumes da Gi:%0A%0A";
    let total = 0;

    cart.forEach(item => {
        const sector = getSectorMeta(item.brand);
        text += `- ${item.qtd}x ${item.name} (${sector.label}) | R$ ${(item.price * item.qtd).toFixed(2).replace('.', ',')}%0A`;
        total += item.price * item.qtd;
    });

    text += `%0A*Total do Pedido: R$ ${total.toFixed(2).replace('.', ',')}*%0A%0AAguardo o retorno para confirmar e combinar a entrega/pagamento.`;

    const numero = "5592994246242";
    window.open(`https://wa.me/${numero}?text=${text}`, '_blank');
}
