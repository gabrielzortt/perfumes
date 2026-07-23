        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
        import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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
        let cart = [];

        // Maps brand value → { section id, display label, modal description }
        const SECTORS = {
            arabes:  { id: 'arabes',  label: 'Árabes',           desc: '"Uma fragrância exclusiva selecionada a dedo. A assinatura perfeita para marcar a sua presença onde quer que você vá."' },
            arábes:  { id: 'arabes',  label: 'Árabes',           desc: '"Uma fragrância exclusiva selecionada a dedo. A assinatura perfeita para marcar a sua presença onde quer que você vá."' },
            boticario:{ id: 'arabes', label: 'Árabes',           desc: '"Uma fragrância exclusiva selecionada a dedo. A assinatura perfeita para marcar a sua presença onde quer que você vá."' },
            brand:   { id: 'brand',   label: 'Brand (Coleção)',   desc: '"Uma fragrância exclusiva selecionada a dedo. A assinatura perfeita para marcar a sua presença onde quer que você vá."' },
            oculos:  { id: 'oculos',  label: 'Óculos',            desc: '"Estilo que completa o look. Peça selecionada com cuidado para quem valoriza elegância no detalhe."' },
            óculos:  { id: 'oculos',  label: 'Óculos',            desc: '"Estilo que completa o look. Peça selecionada com cuidado para quem valoriza elegância no detalhe."' },
            bones:   { id: 'bones',   label: 'Bonés',             desc: '"Atitude e estilo em um só acessório. Para quem leva o visual a sério em qualquer ocasião."' },
            bonés:   { id: 'bones',   label: 'Bonés',             desc: '"Atitude e estilo em um só acessório. Para quem leva o visual a sério em qualquer ocasião."' },
        };

        function getSector(brand) {
            return SECTORS[(brand || '').toLowerCase()] || { id: 'brand', label: brand || 'Brand', desc: '"Produto selecionado com cuidado para você."' };
        }

        onSnapshot(collection(db, "produtos"), (snapshot) => {
            products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() }); 
            });
            window.renderProducts(products);
            cart = cart.filter(cartItem => products.some(p => p.id === cartItem.id));
            window.updateCart(); 
        });

        // Sector pill config (order = display order)
        const SECTOR_PILLS = [
            { id: 'arabes', label: 'Árabes', icon: 'fa-wind' },
            { id: 'brand',  label: 'Brand',  icon: 'fa-star' },
            { id: 'oculos', label: 'Óculos', icon: 'fa-glasses' },
            { id: 'bones',  label: 'Bonés',  icon: 'fa-hat-cowboy' },
        ];

        window.renderProducts = function(productsToRender = products) {
            const grids = {
                arabes: document.getElementById('grid-arabes'),
                brand:  document.getElementById('grid-brand'),
                oculos: document.getElementById('grid-oculos'),
                bones:  document.getElementById('grid-bones'),
            };
            const sections = {
                arabes: document.getElementById('section-arabes'),
                brand:  document.getElementById('section-brand'),
                oculos: document.getElementById('section-oculos'),
                bones:  document.getElementById('section-bones'),
            };
            const noResults = document.getElementById('no-results');

            // Clear all grids
            Object.values(grids).forEach(g => g.innerHTML = '');
            const counts = { arabes: 0, brand: 0, oculos: 0, bones: 0 };

            productsToRender.forEach(p => {
                const isEsgotado = p.stock <= 0;
                const sector = getSector(p.brand);
                const sectorId = sector.id;
                
                const imageHtml = p.image && p.image !== "" 
                    ? `<img src="${p.image}" alt="${p.name}" class="product-image transform group-hover:scale-105 transition-transform duration-700">`
                    : `<span class="text-gray-400 font-serif tracking-widest text-xs uppercase transform group-hover:scale-110 transition-transform duration-700 p-4 text-center">sem imagem</span>`;

                const card = `
                    <div class="group bg-white rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden relative flex flex-col">
                        <div onclick="window.openProductModal('${p.id}')" class="h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative border-b border-gray-100 cursor-pointer">
                            ${imageHtml}
                            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 z-0"></div>
                            ${isEsgotado ? '<div class="absolute top-3 right-3 bg-midnight text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-10">Esgotado</div>' : ''}
                        </div>
                        
                        <div class="p-5 flex flex-col flex-1 bg-white relative z-10">
                            <h4 onclick="window.openProductModal('${p.id}')" class="text-base font-serif text-midnight mb-1 hover:text-gold transition-colors line-clamp-2 h-12 cursor-pointer">${p.name}</h4>
                            <p class="text-xl text-gray-800 font-light mb-5">R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}</p>
                            
                            <div class="mt-auto">
                                ${isEsgotado 
                                    ? '<button disabled class="w-full border border-gray-200 text-gray-400 py-2.5 uppercase tracking-widest text-xs cursor-not-allowed rounded-sm">Indisponível</button>' 
                                    : `<button onclick="window.addToCart('${p.id}', this)" class="w-full bg-white border border-midnight text-midnight py-2.5 uppercase tracking-widest text-xs hover:bg-midnight hover:text-white transition-all duration-300 rounded-sm">Adicionar à Sacola</button>`}
                            </div>
                        </div>
                    </div>
                `;

                if (grids[sectorId]) {
                    grids[sectorId].innerHTML += card;
                    counts[sectorId]++;
                }
            });

            // Show/hide sections based on count
            Object.keys(sections).forEach(key => {
                sections[key].classList.toggle('hidden', counts[key] === 0);
            });

            // Rebuild sector nav pills — only show sectors that have products
            const navWrapper = document.getElementById('sector-nav-wrapper');
            const nav = document.getElementById('sector-nav');
            nav.innerHTML = '';
            const activePills = SECTOR_PILLS.filter(s => counts[s.id] > 0);
            if (activePills.length > 0) {
                navWrapper.classList.remove('hidden');
                activePills.forEach(s => {
                    nav.innerHTML += `<a href="#section-${s.id}" class="sector-pill"><i class="fas ${s.icon}"></i> ${s.label}</a>`;
                });
            } else {
                navWrapper.classList.add('hidden');
            }

            noResults.classList.toggle('hidden', productsToRender.length > 0);
        }

        window.openProductModal = function(id) {
            const p = products.find(prod => prod.id === id);
            if (!p) return;

            const modal = document.getElementById('product-modal');
            const modalContent = document.getElementById('product-modal-content');
            const sector = getSector(p.brand);
            
            document.getElementById('modal-name').innerText = p.name;
            document.getElementById('modal-sector-badge').innerText = `Linha ${sector.label}`;
            document.getElementById('modal-price').innerText = `R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}`;
            document.getElementById('modal-description').innerText = sector.desc.replace(/"/g, '');
            
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
                btnContainer.innerHTML = '<button disabled class="w-full bg-gray-100 text-gray-400 py-4 uppercase tracking-widest text-sm cursor-not-allowed rounded-sm">Produto Esgotado</button>';
            } else {
                btnContainer.innerHTML = `<button onclick="window.addToCart('${p.id}', this); setTimeout(window.closeProductModal, 1000);" class="w-full bg-midnight text-white py-4 uppercase tracking-widest text-sm hover:bg-gold transition-colors duration-500 rounded-sm shadow-lg">Adicionar à Sacola</button>`;
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
            
            // Hide sector nav while searching
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

        window.toggleCart = function() {
            const sidebar = document.getElementById('cart-sidebar');
            const overlay = document.getElementById('cart-overlay');
            
            sidebar.classList.toggle('translate-x-full');
            
            if(sidebar.classList.contains('translate-x-full')) {
                overlay.classList.add('opacity-0');
                setTimeout(() => overlay.classList.add('hidden'), 300);
            } else {
                overlay.classList.remove('hidden');
                setTimeout(() => overlay.classList.remove('opacity-0'), 10);
            }
        }

        window.addToCart = function(id, btnElement) {
            const product = products.find(p => p.id === id);
            if(product && product.stock > 0) {
                const item = cart.find(i => i.id === id);
                if(item) {
                    if(item.qtd < product.stock) item.qtd++;
                    else {
                        alert('Estoque máximo atingido para este item.');
                        return;
                    }
                } else {
                    cart.push({...product, qtd: 1});
                }
                
                if(btnElement) {
                    const originalText = btnElement.innerText;
                    btnElement.innerText = "Adicionado ✓";
                    btnElement.classList.add('bg-gold', 'text-white', 'border-gold');
                    btnElement.classList.remove('bg-white', 'text-midnight', 'border-midnight');
                    setTimeout(() => {
                        btnElement.innerText = originalText;
                        btnElement.classList.remove('bg-gold', 'text-white', 'border-gold');
                        btnElement.classList.add('bg-midnight', 'text-white');
                        if(btnElement.classList.contains('py-2.5')) {
                             btnElement.classList.add('bg-white', 'text-midnight', 'border-midnight');
                             btnElement.classList.remove('bg-midnight', 'text-white');
                        }
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
                    <div class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 mt-20">
                        <i class="fas fa-shopping-bag text-5xl opacity-30 mb-4"></i>
                        <p class="font-light text-lg">Sua sacola está vazia.</p>
                    </div>`;
            } else {
                container.innerHTML = '';
                cart.forEach((item, index) => {
                    total += item.price * item.qtd;
                    count += item.qtd;
                    
                    const imgInCart = item.image && item.image !== "" 
                        ? `<img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-contain p-1 border rounded-sm">`
                        : `<div class="w-16 h-16 bg-gray-100 rounded-sm flex items-center justify-center text-[8px] text-gray-400 font-serif uppercase text-center p-1 border">sem<br>imagem</div>`;

                    const sector = getSector(item.brand);

                    container.innerHTML += `
                        <div class="flex gap-4 items-center border-b border-gray-100 pb-4">
                            ${imgInCart}
                            <div class="flex-1">
                                <p class="font-serif text-sm text-midnight">${item.name}</p>
                                <p class="text-xs text-gray-500 mt-1">${sector.label} · Qtd: ${item.qtd}</p>
                                <p class="text-sm font-semibold text-gold mt-1">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                            </div>
                            <button onclick="window.removeFromCart(${index})" class="text-gray-300 hover:text-red-500 transition-colors p-2"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                });
            }

            document.getElementById('cart-total').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
            document.getElementById('cart-count').innerText = count;
        }

        window.checkout = function() {
            if(cart.length === 0) return alert('Sua sacola está vazia!');
            
            let text = "Ola! Gostaria de fazer o seguinte pedido na Perfumes da Gi:%0A%0A";
            let total = 0;
            
            cart.forEach(item => {
                const sector = getSector(item.brand);
                text += `- ${item.qtd}x ${item.name} (${sector.label}) | R$ ${(item.price * item.qtd).toFixed(2).replace('.', ',')}%0A`;
                total += item.price * item.qtd;
            });
            
            text += `%0A*Total do Pedido: R$ ${total.toFixed(2).replace('.', ',')}*%0A%0AAguardo o retorno para confirmar e combinar a entrega/pagamento.`;
            
            const numero = "5592994246242"; 
            window.open(`https://wa.me/${numero}?text=${text}`, '_blank');
        }
