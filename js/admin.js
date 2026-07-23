        import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
        import { getFirestore, collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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
        let selectedFile = null;
        let currentImageUrl = "";
        let activeFilter = "todos";

        // Sector map for display
        const SECTOR_LABELS = {
            arabes:    'Árabes',
            arábes:    'Árabes',
            boticario: 'Árabes',
            brand:     'Brand',
            oculos:    'Óculos',
            óculos:    'Óculos',
            bones:     'Bonés',
            bonés:     'Bonés',
        };

        function getSectorLabel(brand) {
            return SECTOR_LABELS[(brand || '').toLowerCase()] || (brand || '—');
        }

        function normalizeBrand(brand) {
            const b = (brand || '').toLowerCase();
            if (b === 'arábes' || b === 'boticario') return 'arabes';
            if (b === 'óculos') return 'oculos';
            if (b === 'bonés') return 'bones';
            return b;
        }

        onSnapshot(collection(db, "produtos"), (snapshot) => {
            products = [];
            snapshot.forEach((doc) => {
                products.push({ id: doc.id, ...doc.data() });
            });
            window.renderTable();
        });

        window.setFilter = function(filter) {
            activeFilter = filter;
            document.querySelectorAll('.filter-pill').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.filter === filter);
            });
            window.renderTable();
        }

        window.previewFile = function() {
            const fileInput = document.getElementById('prod-image');
            selectedFile = fileInput.files[0];

            if (selectedFile) {
                const objectUrl = URL.createObjectURL(selectedFile);
                document.getElementById('img-preview').src = objectUrl;
                document.getElementById('img-preview').classList.remove('hidden');
                document.getElementById('img-placeholder').classList.add('hidden');
                document.getElementById('btn-remove-img').classList.remove('hidden');
            } else {
                window.removeImage();
            }
        }

        window.removeImage = function() {
            selectedFile = null;
            currentImageUrl = "";
            document.getElementById('prod-image').value = ""; 
            document.getElementById('img-preview').src = "";
            document.getElementById('img-preview').classList.add('hidden');
            document.getElementById('img-placeholder').classList.remove('hidden');
            document.getElementById('btn-remove-img').classList.add('hidden');
        }

        window.renderTable = function() {
            const tbody = document.getElementById('product-list');
            const noMsg = document.getElementById('no-products-msg');
            const searchTerm = document.getElementById('admin-search').value.toLowerCase();

            // Sector badge colors
            const SECTOR_COLORS = {
                arabes:  'bg-amber-100 text-amber-800',
                brand:   'bg-purple-100 text-purple-800',
                oculos:  'bg-sky-100 text-sky-800',
                bones:   'bg-green-100 text-green-800',
            };
            
            tbody.innerHTML = '';
            
            let filteredProducts = products.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                (p.brand || '').toLowerCase().includes(searchTerm)
            );

            if (activeFilter !== 'todos') {
                filteredProducts = filteredProducts.filter(p => normalizeBrand(p.brand) === activeFilter);
            }

            if (filteredProducts.length === 0) {
                noMsg.classList.remove('hidden');
                return;
            } else {
                noMsg.classList.add('hidden');
            }
            
            filteredProducts.forEach(p => {
                const stockLabel = p.stock > 0 
                    ? `<span class="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">${p.stock}</span>` 
                    : `<span class="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">Esgotado</span>`;
                
                const finalImgSrc = p.image || p.img || "";
                
                const imgTag = finalImgSrc !== ""
                    ? `<img src="${finalImgSrc}" alt="${p.name}" class="w-12 h-12 object-contain p-0.5 border rounded-sm">`
                    : `<div class="w-12 h-12 bg-gray-100 border rounded-sm flex items-center justify-center text-[7px] text-gray-400 font-serif uppercase p-0.5 text-center">sem<br>foto</div>`;

                const sectorKey = normalizeBrand(p.brand);
                const sectorColor = SECTOR_COLORS[sectorKey] || 'bg-gray-100 text-gray-600';
                const sectorDisplay = getSectorLabel(p.brand);

                tbody.innerHTML += `
                    <tr class="border-b hover:bg-gray-50 transition">
                        <td class="p-4">${imgTag}</td>
                        <td class="p-4 font-semibold text-midnight">${p.name}</td>
                        <td class="p-4"><span class="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${sectorColor}">${sectorDisplay}</span></td>
                        <td class="p-4 font-semibold text-gold">R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}</td>
                        <td class="p-4">${stockLabel}</td>
                        <td class="p-4">
                            <div class="flex gap-2">
                                <button onclick="window.editProduct('${p.id}')" class="text-blue-500 hover:text-blue-700 p-1.5" title="Editar"><i class="fas fa-edit"></i></button>
                                <button onclick="window.deleteProduct('${p.id}')" class="text-red-400 hover:text-red-600 p-1.5" title="Excluir"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }

        window.saveProduct = async function(e) {
            e.preventDefault();
            
            const btnSave = document.getElementById('btn-save');
            const idInput = document.getElementById('prod-id').value;
            const name = document.getElementById('prod-name').value;
            const brand = document.getElementById('prod-brand').value;
            const price = parseFloat(document.getElementById('prod-price').value);
            const stock = parseInt(document.getElementById('prod-stock').value);

            if (!idInput && !selectedFile) {
                alert("Por favor, escolha uma foto para o novo produto!");
                return;
            }

            btnSave.innerText = "Enviando Foto pro Cloudinary...";
            btnSave.disabled = true;

            let finalImageUrl = currentImageUrl; 

            try {
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append("file", selectedFile);
                    formData.append("upload_preset", "ml_default"); 
                    const cloudName = "dzophwnk2"; 
                    
                    const urlCloudinary = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

                    const response = await fetch(urlCloudinary, {
                        method: "POST",
                        body: formData
                    });
                    
                    const data = await response.json();
                    
                    if (data.secure_url) {
                        finalImageUrl = data.secure_url;
                    } else {
                        throw new Error(data.error?.message || "O Cloudinary recusou a imagem.");
                    }
                }

                btnSave.innerText = "Salvando no Banco...";

                const productData = {
                    name: name,
                    brand: brand, 
                    price: price,
                    stock: stock,
                    image: finalImageUrl, 
                    img: finalImageUrl    
                };

                if (idInput) {
                    const docRef = doc(db, "produtos", idInput);
                    await updateDoc(docRef, productData);
                } else {
                    await addDoc(collection(db, "produtos"), productData);
                }

                window.resetForm();
                alert('Vitória! 🎉 Produto salvo com sucesso!');
                
            } catch (error) {
                console.error(error);
                alert("ERRO: " + error.message);
            } finally {
                btnSave.innerText = "Salvar Produto";
                btnSave.disabled = false;
            }
        }

        window.editProduct = function(id) {
            const product = products.find(p => p.id === id);
            
            document.getElementById('form-title').innerHTML = `<i class="fas fa-edit text-gold"></i> Editar Produto`;
            document.getElementById('prod-name').focus();

            document.getElementById('prod-id').value = product.id;
            document.getElementById('prod-name').value = product.name;
            
            const brandNorm = normalizeBrand(product.brand);
            document.getElementById('prod-brand').value = brandNorm;
            
            document.getElementById('prod-price').value = product.price;
            document.getElementById('prod-stock').value = product.stock;
            
            selectedFile = null; 
            currentImageUrl = product.image || product.img || ""; 

            if (currentImageUrl !== "") {
                document.getElementById('img-preview').src = currentImageUrl;
                document.getElementById('img-preview').classList.remove('hidden');
                document.getElementById('img-placeholder').classList.add('hidden');
                document.getElementById('btn-remove-img').classList.remove('hidden');
            } else {
                window.removeImage();
            }

            // Scroll to form on mobile
            document.getElementById('product-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        window.deleteProduct = async function(id) {
            if(confirm('Tem certeza absoluta que deseja remover este produto?')) {
                try {
                    await deleteDoc(doc(db, "produtos", id));
                    if(document.getElementById('prod-id').value === id) window.resetForm();
                } catch (error) {
                    alert("Erro ao excluir: " + error.message);
                }
            }
        }

        window.resetForm = function() {
            document.getElementById('form-title').innerHTML = `<i class="fas fa-plus-circle text-gold"></i> Novo Produto`;
            document.getElementById('prod-id').value = '';
            document.getElementById('product-form').reset();
            window.removeImage();
        }
