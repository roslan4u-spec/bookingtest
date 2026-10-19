const API = '';

let allRooms = [];
let selectedRoom = null;
let guestCount = 1;
let checkinFp, checkoutFp, filterCheckinFp, filterCheckoutFp;
let filterDates = { checkin: null, checkout: null };

// ──── LOAD ROOMS ────
async function loadRooms(typeFilter = '') {
    const grid = document.getElementById('rooms-grid');
    try {
        const res = await fetch(`${API}/api/rooms?t=${Date.now()}`);
        allRooms = (await res.json()).map(r => {
            if (r.name) r.name = r.name.replace(/TEMPAHAN TAPAK GAZEBO/gi, 'TEMPAHAN GAZEBO');
            if (r.type) r.type = r.type.replace(/TEMPAHAN TAPAK GAZEBO/gi, 'TEMPAHAN GAZEBO');
            return r;
        });
        let filtered = allRooms;
        if (typeFilter) filtered = allRooms.filter(r => r.type === typeFilter);
        // removed room count logic
        renderRooms(filtered);
    } catch (e) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-rose-500"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Gagal memuatkan senarai tempahan & aktiviti.</div>`;
    }
}


function renderRooms(rooms) {
    const grid = document.getElementById('rooms-grid');
    if (!rooms.length) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400"><i class="fa-solid fa-bed text-4xl mb-3 block"></i>Tiada tempahan & aktiviti yang sepadan.</div>`;
        return;
    }
    grid.innerHTML = rooms.map(r => `
        <div class="room-card bg-white rounded-2xl shadow-lg overflow-hidden border-2 border-dashed border-amber-400 flex flex-col relative group" data-room-id="${r.id}">
            
            <!-- Edit Overlay Image -->
            <div class="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-3 py-2 rounded-lg cursor-pointer hover:bg-emerald-600 transition shadow-lg flex items-center gap-2" onclick="document.getElementById('img-upload-${r.id}').click()">
                <i class="fa-solid fa-camera"></i> Tukar Gambar
            </div>
            <input type="file" id="img-upload-${r.id}" class="hidden" accept="image/*" onchange="handleImage(event, ${r.id})">

            <div class="relative w-full bg-slate-50 aspect-[3/4] flex justify-center items-center border-b border-slate-100 cursor-pointer" onclick="document.getElementById('img-upload-${r.id}').click()">
                  <img id="img-preview-${r.id}" src="${r.image_url}" alt="${r.name}" class="w-full h-full object-cover p-2 hover:opacity-80 transition">
            </div>
            <div class="p-5 flex flex-col flex-grow bg-amber-50/20">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-extrabold text-slate-900 border-b border-dashed border-emerald-500/50 hover:bg-emerald-50 focus:bg-emerald-100 focus:outline-none transition w-full" contenteditable="true" data-field="name" title="Klik untuk sunting">${r.name}</h3>
                </div>
                <p class="text-slate-600 text-sm mb-3 flex-grow border-b border-dashed border-emerald-500/50 hover:bg-emerald-50 focus:bg-emerald-100 focus:outline-none transition" contenteditable="true" data-field="description" title="Klik untuk sunting">${r.description}</p>
                <div class="flex flex-col gap-2 mb-4 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-users text-slate-400 w-4"></i> Kapasiti: 
                        <span class="font-bold border-b border-dashed border-emerald-500/50 hover:bg-emerald-50 focus:bg-emerald-100 focus:outline-none transition px-1" contenteditable="true" data-field="capacity" title="Klik untuk sunting">${r.capacity}</span> orang
                    </div>
                    <div class="flex items-center gap-2">
                        <i class="fa-solid fa-tag text-slate-400 w-4"></i> Harga (RM): 
                        <span class="font-bold border-b border-dashed border-emerald-500/50 hover:bg-emerald-50 focus:bg-emerald-100 focus:outline-none transition px-1" contenteditable="true" data-field="price_per_night" title="Klik untuk sunting">${r.price_per_night}</span>
                    </div>
                    <div class="flex flex-col mt-2">
                        <span class="text-xs text-slate-500 font-semibold mb-1">Kemudahan:</span>
                        <span class="font-medium text-xs border-b border-dashed border-emerald-500/50 hover:bg-emerald-50 focus:bg-emerald-100 focus:outline-none transition p-1" contenteditable="true" data-field="facilities" title="Klik untuk sunting">${r.facilities || '-'}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

let imagePayloads = {};

function handleImage(event, id) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('img-preview-' + id).src = e.target.result;
        const ext = file.name.split('.').pop();
        imagePayloads[id] = {
            base64: e.target.result,
            ext: ext
        };
    };
    reader.readAsDataURL(file);
}

async function saveAllChanges() {
    const btn = document.getElementById('btn-save-cms');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan...';

    const cards = document.querySelectorAll('.room-card');
    let allSuccess = true;

    for (const card of cards) {
        const id = card.getAttribute('data-room-id');
        const name = card.querySelector('[data-field="name"]').innerText.trim();
        const description = card.querySelector('[data-field="description"]').innerText.trim();
        const capacity = card.querySelector('[data-field="capacity"]').innerText.trim();
        const price = card.querySelector('[data-field="price_per_night"]').innerText.trim();
        const facilities = card.querySelector('[data-field="facilities"]').innerText.trim();

        const payload = {
            name: name,
            description: description,
            capacity: capacity,
            price_per_night: price,
            facilities: facilities
        };

        if (imagePayloads[id]) {
            payload.image_base64 = imagePayloads[id].base64;
            payload.image_ext = imagePayloads[id].ext;
        }

        try {
            const res = await fetch('/api/rooms/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!data.success) {
                allSuccess = false;
                console.error(data);
            }
        } catch(e) {
            allSuccess = false;
        }
    }

    if (allSuccess) {
        imagePayloads = {};
        alert('Taniah! Semua perubahan berjaya disimpan. Sila periksa Laman Tempahan awam untuk melihat perubahan.');
    } else {
        alert('Terdapat ralat semasa menyimpan sebahagian data.');
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Simpan Perubahan / Publish';
}

// Init
loadRooms();