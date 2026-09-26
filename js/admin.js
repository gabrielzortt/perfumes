import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, updateDoc, setDoc, doc, deleteDoc, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { DEFAULT_SECTORS, normalizeBrandKey, resolveSectors, slugify } from "./sectors.js";
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
let seeded = false;
let selectedFile = null;
let currentImageUrl = "";
let activeFilter = "todos";

function getSectorList() {
    return resolveSectors(liveSectors);
}

onSnapshot(collection(db, "produtos"), (snapshot) => {
    products = [];
    snapshot.forEach((d) => products.push({ id: d.id, ...d.data() }));
    window.renderTable();
});

onSnapshot(collection(db, "setores"), async (snapshot) => {
    liveSectors = [];
    snapshot.forEach((d) => liveSectors.push({ id: d.id, ...d.data() }));

    // Primeira vez que o painel abre e a coleção ainda não existe: semeia os
    // 5 setores atuais para ficarem editáveis daqui pra frente.
    if (liveSectors.length === 0 && !seeded) {
        seeded = true;
        const check = await getDocs(collection(db, "setores"));
        if (check.empty) {
            for (const s of DEFAULT_SECTORS) await setDoc(doc(db, "setores", s.key), s);
        }
        return;
    }

    window.renderSectorChips();
    window.renderFilterPills();
    window.populateBrandSelect();
    window.renderTable();
});

// -------------------- Setores: CRUD --------------------

window.renderSectorChips = function() {
    const wrap = document.getElementById('sector-chips');
    wrap.innerHTML = getSectorList().map(s => `
        <span class="sector-chip">
            <span>${s.icon || ''}</span>
            <span>${s.label}</span>
            <span class="text-gray-300">#${s.order ?? 0}</span>
            <button onclick="window.editSector('${s.key}')" class="text-gray-400 hover:text-gold ml-1" title="Editar"><i class="fas fa-pen text-[10px]"></i></button>
            <button onclick="window.deleteSector('${s.key}')" class="text-gray-400 hover:text-red-500" title="Excluir"><i class="fas fa-trash text-[10px]"></i></button>
        </span>
    `).join('');
}

window.saveSector = async function(e) {
    e.preventDefault();
    const editingKey = document.getElementById('sector-id').value;
    const label = document.getElementById('sector-label').value.trim();
    const icon = document.getElementById('sector-icon').value.trim();
    const order = parseInt(document.getElementById('sector-order').value) || 0;
    const key = editingKey || slugify(label) || `setor-${Date.now()}`;

    try {
        await setDoc(doc(db, "setores", key), { key, label, icon, order }, { merge: true });
        window.resetSectorForm();
    } catch (err) {
        alert("Erro ao salvar setor: " + err.message);
    }
}

window.editSector = function(key) {
    const s = getSectorList().find(x => x.key === key);
    if (!s) return;
    document.getElementById('sector-id').value = s.key;
    document.getElementById('sector-label').value = s.label;
    document.getElementById('sector-icon').value = s.icon || '';
    document.getElementById('sector-order').value = s.order ?? 0;
    document.getElementById('sector-submit-btn').innerText = 'Atualizar setor';
    document.getElementById('sector-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

window.deleteSector = async function(key) {
    const inUse = products.some(p => normalizeBrandKey(p.brand) === key);
    const msg = inUse
        ? 'Existem produtos usando este setor. Eles continuam aparecendo na loja agrupados pelo nome atual, mas o setor some da lista de gestão. Continuar?'
        : 'Excluir este setor?';
    if (!confirm(msg)) return;
    try {
        await deleteDoc(doc(db, "setores", key));
    } catch (err) {
        alert("Erro ao excluir setor: " + err.message);
    }
}

window.resetSectorForm = function() {
    document.getElementById('sector-form').reset();
    document.getElementById('sector-id').value = '';
    document.getElementById('sector-submit-btn').innerText = '+ Salvar setor';
}

window.populateBrandSelect = function() {
    const select = document.getElementById('prod-brand');
    const current = select.value;
    select.innerHTML = getSectorList().map(s => `<option value="${s.key}">${s.icon || ''} ${s.label}</option>`).join('');
    if (current) select.value = current;
}

window.renderFilterPills = function() {
    const wrap = document.getElementById('filter-pills');
    const sectors = getSectorList();
    wrap.innerHTML = `<button onclick="window.setFilter('todos')" data-filter="todos" class="filter-pill ${activeFilter === 'todos' ? 'active' : ''} text-xs px-3 py-1.5 rounded-full border border-midnight ${activeFilter === 'todos' ? 'bg-midnight text-white' : 'text-gray-600'} transition">Todos</button>` +
        sectors.map(s => `<button onclick="window.setFilter('${s.key}')" data-filter="${s.key}" class="filter-pill ${activeFilter === s.key ? 'active' : ''} text-xs px-3 py-1.5 rounded-full border border-gray-200 ${activeFilter === s.key ? 'bg-midnight text-white border-midnight' : 'text-gray-600 hover:border-midnight hover:bg-midnight hover:text-white'} transition">${s.icon || ''} ${s.label}</button>`).join('');
}

window.setFilter = function(filter) {
    activeFilter = filter;
    window.renderFilterPills();
    window.renderTable();
}

// -------------------- Imagem (Cloudinary) --------------------

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

// -------------------- Tabela de produtos --------------------

window.renderTable = function() {
    const tbody = document.getElementById('product-list');
    const noMsg = document.getElementById('no-products-msg');
    const searchTerm = document.getElementById('admin-search').value.toLowerCase();

    tbody.innerHTML = '';

    let filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        (p.brand || '').toLowerCase().includes(searchTerm)
    );

    if (activeFilter !== 'todos') {
        filteredProducts = filteredProducts.filter(p => normalizeBrandKey(p.brand) === activeFilter);
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

        const sectorKey = normalizeBrandKey(p.brand);
        const sectorMeta = getSectorList().find(s => s.key === sectorKey);
        const sectorDisplay = sectorMeta ? `${sectorMeta.icon || ''} ${sectorMeta.label}` : (p.brand || '—');

        const hasFicha = !!(p.description || p.family || p.notesTop);
        const fichaBadge = hasFicha
            ? `<span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2.5 py-1 rounded-full"><i class="fas fa-check"></i></span>`
            : `<span class="text-gray-300 text-xs">—</span>`;

        tbody.innerHTML += `
            <tr class="border-b hover:bg-gray-50 transition">
                <td class="p-4">${imgTag}</td>
                <td class="p-4 font-semibold text-midnight">${p.name}</td>
                <td class="p-4"><span class="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide bg-gray-100 text-gray-600">${sectorDisplay}</span></td>
                <td class="p-4 font-semibold text-gold">R$ ${parseFloat(p.price).toFixed(2).replace('.', ',')}</td>
                <td class="p-4">${stockLabel}</td>
                <td class="p-4">${fichaBadge}</td>
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

// -------------------- Salvar / editar / excluir produto --------------------

window.saveProduct = async function(e) {
    e.preventDefault();

    const btnSave = document.getElementById('btn-save');
    const idInput = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value;
    const brand = document.getElementById('prod-brand').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);
    const family = document.getElementById('prod-family').value.trim();
    const notesTop = document.getElementById('prod-notes-top').value.trim();
    const notesHeart = document.getElementById('prod-notes-heart').value.trim();
    const notesBase = document.getElementById('prod-notes-base').value.trim();
    const description = document.getElementById('prod-description').value.trim();

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

            const response = await fetch(urlCloudinary, { method: "POST", body: formData });
            const data = await response.json();

            if (data.secure_url) {
                finalImageUrl = data.secure_url;
            } else {
                throw new Error(data.error?.message || "O Cloudinary recusou a imagem.");
            }
        }

        btnSave.innerText = "Salvando no Banco...";

        const productData = {
            name, brand, price, stock,
            image: finalImageUrl, img: finalImageUrl,
            family, notesTop, notesHeart, notesBase, description,
        };

        if (idInput) {
            await updateDoc(doc(db, "produtos", idInput), productData);
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

    window.populateBrandSelect();
    document.getElementById('prod-brand').value = normalizeBrandKey(product.brand);

    document.getElementById('prod-price').value = product.price;
    document.getElementById('prod-stock').value = product.stock;

    document.getElementById('prod-family').value = product.family || '';
    document.getElementById('prod-notes-top').value = product.notesTop || '';
    document.getElementById('prod-notes-heart').value = product.notesHeart || '';
    document.getElementById('prod-notes-base').value = product.notesBase || '';
    document.getElementById('prod-description').value = product.description || '';

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

    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

window.deleteProduct = async function(id) {
    if (confirm('Tem certeza absoluta que deseja remover este produto?')) {
        try {
            await deleteDoc(doc(db, "produtos", id));
            if (document.getElementById('prod-id').value === id) window.resetForm();
        } catch (error) {
            alert("Erro ao excluir: " + error.message);
        }
    }
}

window.resetForm = function() {
    document.getElementById('form-title').innerHTML = `<i class="fas fa-plus-circle text-gold"></i> Novo Produto`;
    document.getElementById('prod-id').value = '';
    document.getElementById('product-form').reset();
    window.populateBrandSelect();
    window.removeImage();
}

// -------------------- Preencher fichas automaticamente --------------------

window.autoFillNotes = async function() {
    const btn = document.getElementById('btn-autofill');
    const candidates = products.filter(p => !p.description && !p.family && !p.notesTop);

    if (candidates.length === 0) {
        alert('Todos os produtos já têm ficha própria. Nada para preencher.');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Preenchendo...`;

    let filled = 0, skipped = 0;

    for (const p of candidates) {
        const ref = extractReference(p.name);
        let match = FRAGRANCE_LIBRARY[ref];
        if (!match) {
            const keys = Object.keys(FRAGRANCE_LIBRARY).sort((a, b) => b.length - a.length);
            for (const k of keys) {
                if (ref.includes(k) || k.includes(ref)) { match = FRAGRANCE_LIBRARY[k]; break; }
            }
        }
        if (match) {
            try {
                await updateDoc(doc(db, "produtos", p.id), {
                    family: match.family || '',
                    notesTop: match.top || '',
                    notesHeart: match.heart || '',
                    notesBase: match.base || '',
                    description: match.blurb || '',
                });
                filled++;
            } catch (err) {
                console.error('Falha ao atualizar', p.name, err);
                skipped++;
            }
        } else {
            skipped++;
        }
    }

    btn.disabled = false;
    btn.innerHTML = `<i class="fas fa-wand-magic-sparkles"></i> Preencher fichas`;
    alert(`Pronto! ${filled} produto(s) receberam ficha olfativa automaticamente.${skipped ? ` ${skipped} não bateram com a biblioteca.` : ''}`);
}
