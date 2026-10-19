const API = '';

let allRooms = [];
let selectedRoom = null;
let guestCount = 1;
let checkinFp, checkoutFp, filterCheckinFp, filterCheckoutFp;
let filterDates = { checkin: null, checkout: null };

// ──── HELPER PENAPIS AKTIVITI & PENGINAPAN ────
function matchRoomType(room, filterValue) {
    if (!filterValue) return true;
    const filter = filterValue.trim().toUpperCase();
    const type = (room.type || '').toUpperCase();
    const name = (room.name || '').toUpperCase();

    // Padanan tepat jenis atau nama
    if (type === filter || name === filter) return true;

    // Padanan Hiking
    if (filter.includes('HIKING') && (type.includes('HIKING') || name.includes('HIKING'))) return true;

    // Padanan Kabin
    if (filter.includes('KABIN') && (type.includes('KABIN') || name.includes('KABIN'))) return true;

    // Padanan Gazebo
    if (filter.includes('GAZEBO') && (type.includes('GAZEBO') || name.includes('GAZEBO'))) return true;

    // Padanan Jungle Trekking
    if ((filter.includes('JUNGLE') || filter.includes('TREKKING') || filter.includes('TRACKING') || filter.includes('JUGGLE')) &&
        (type.includes('JUNGLE') || type.includes('TREKKING') || name.includes('JUNGLE') || name.includes('TREKKING'))) return true;

    // Padanan Hammock
    if (filter.includes('HAMMOCK') && (type.includes('HAMMOCK') || name.includes('HAMMOCK'))) return true;

    // Padanan Perkhemahan / Khemah
    if ((filter.includes('PERKHEMAHAN') || filter.includes('KHEMAH')) &&
        (type.includes('PERKHEMAHAN') || name.includes('PERKHEMAHAN') || type.includes('KHEMAH') || name.includes('KHEMAH'))) return true;

    // Padanan Kenderaan RV / Caravan / Campervan
    if ((filter.includes('RV') || filter.includes('CARAVAN') || filter.includes('CAMPERVAN')) &&
        (type.includes('RV') || type.includes('CARAVAN') || type.includes('CAMPERVAN') || name.includes('RV') || name.includes('CARAVAN') || name.includes('CAMPERVAN'))) return true;

    // Padanan Caj Kemasukan Pengunjung
    if ((filter.includes('KEMASUKAN') || filter.includes('TIKET') || filter.includes('PENGUNJUNG')) &&
        (type.includes('KEMASUKAN') || name.includes('KEMASUKAN') || type.includes('TIKET') || name.includes('TIKET') || type.includes('PENGUNJUNG') || name.includes('PENGUNJUNG'))) return true;

    // Padanan pembersihan awalan kata (strip 'TEMPAHAN', 'AKTIVITI')
    const cleanF = filter.replace(/^TEMPAHAN\s+/i, '').replace(/^AKTIVITI\s+/i, '').trim();
    const cleanT = type.replace(/^TEMPAHAN\s+/i, '').replace(/^AKTIVITI\s+/i, '').trim();
    const cleanN = name.replace(/^TEMPAHAN\s+/i, '').replace(/^AKTIVITI\s+/i, '').trim();

    return cleanT.includes(cleanF) || cleanN.includes(cleanF) || cleanF.includes(cleanT) || cleanF.includes(cleanN);
}

const FALLBACK_ROOMS = [
    { id: 1, name: 'TEMPAHAN AKTIVITI HIKING', type: 'TEMPAHAN AKTIVITI HIKING', capacity: 7, price_per_night: 50, description: 'Terokai alam semula jadi dengan pendakian berpandu di sekitar Taman Eko Rimba Berkelah Pahang.', facilities: 'Pemandu arah, Peralatan asas, Sijil penyertaan', image_url: 'images/hiking.jpg', is_active: 1 },
    { id: 7, name: 'TEMPAHAN KABIN', type: 'TEMPAHAN KABIN', capacity: 4, price_per_night: 150, description: 'Kabin berhawa dingin yang selesa sesuai untuk percutian keluarga.', facilities: '2 Katil Single, Aircond, Almari, Tandas, Dapur', image_url: 'images/kabin.jpg', is_active: 1 },
    { id: 2, name: 'TEMPAHAN GAZEBO', type: 'TEMPAHAN GAZEBO', capacity: 8, price_per_night: 60, description: 'Pondok berehat berhampiran sungai yang sesuai untuk keluarga berkelah.', facilities: 'Bumbung teduh, Meja kayu, Tempat duduk, Tong sampah', image_url: 'images/gazebo.jpg', is_active: 1 },
    { id: 3, name: 'TEMPAHAN AKTIVITI JUNGLE TREKKING', type: 'TEMPAHAN AKTIVITI JUNGLE TREKKING', capacity: 15, price_per_night: 30, description: 'Pengalaman merentas hutan sambil mempelajari spesies pokok dan tumbuhan herba.', facilities: 'Laluan bertanda, Panduan taklimat', image_url: 'images/jungle_trekking.jpg', is_active: 1 },
    { id: 4, name: 'TEMPAHAN TAPAK HAMMOCK', type: 'TEMPAHAN TAPAK HAMMOCK', capacity: 2, price_per_night: 15, description: 'Lokasi strategik di antara pepohonan untuk menggantung hammock anda.', facilities: 'Kawasan redup, Akses mudah ke sungai', image_url: 'images/hammock.jpg', is_active: 1 },
    { id: 5, name: 'TEMPAHAN TAPAK PERKHEMAHAN', type: 'TEMPAHAN TAPAK PERKHEMAHAN', capacity: 4, price_per_night: 40, description: 'Kawasan lapang khas untuk mendirikan khemah, dilengkapi kemudahan asas.', facilities: 'Tandas awam, Bekalan air paip, Kawasan unggun api', image_url: 'images/perkhemahan.jpg', is_active: 1 },
    { id: 6, name: 'TEMPAHAN TAPAK KENDERAAN RV / CARAVAN / CAMPERVAN', type: 'TEMPAHAN TAPAK KENDERAAN RV / CARAVAN / CAMPERVAN', capacity: 6, price_per_night: 80, description: 'Ruang parkir khusus untuk kenderaan rekreasi dengan sokongan kuasa elektrik.', facilities: 'Penyambung elektrik (Plug), Bekalan air, Sisa pembuangan', image_url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80', is_active: 1 },
    { id: 8, name: 'TEMPAHAN CAJ KEMASUKAN PENGUNJUNG', type: 'TEMPAHAN CAJ KEMASUKAN PENGUNJUNG', capacity: 10, price_per_night: 3, description: 'Caj tiket kemasukan harian pengunjung dan kenderaan ke Taman Eko Rimba Berkelah Gambang Pahang.', facilities: 'Dewasa RM3, Kanak-kanak RM1, Warga Emas RM1, Pelawat Asing RM10, Kereta RM3, Motorsikal RM1, OKU & Bawah 4 Thn Percuma', image_url: 'images/caj_kemasukan.jpg', is_active: 1 }
];

// ──── LOAD ROOMS ────
async function loadRooms(typeFilter = '') {
    const grid = document.getElementById('rooms-grid');
    try {
        const res = await fetch(`${API}/api/rooms?t=${Date.now()}`);
        if (!res.ok) throw new Error('Status ' + res.status);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Tiada data rooms');
        allRooms = data.map(r => {
            if (r.name) r.name = r.name.replace(/TEMPAHAN TAPAK GAZEBO/gi, 'TEMPAHAN GAZEBO');
            if (r.type) r.type = r.type.replace(/TEMPAHAN TAPAK GAZEBO/gi, 'TEMPAHAN GAZEBO');
            return r;
        });
    } catch (e) {
        console.warn('API /api/rooms tidak dapat dihubungi atau mod pelayan statik aktif. Menggunakan data tempatan (fallback):', e);
        allRooms = FALLBACK_ROOMS;
    }
    let filtered = allRooms;
    if (typeFilter) filtered = allRooms.filter(r => matchRoomType(r, typeFilter));
    const countEl = document.getElementById('room-count');
    if (countEl) countEl.textContent = `${filtered.length} tempahan & aktiviti tersedia`;
    renderRooms(filtered);
}

function renderHikingCard(r, isAvailabilityCheck = false) {
    const isAvail = !isAvailabilityCheck || r.available;
    const availBadge = isAvailabilityCheck ? `
        <span class="absolute top-3 left-3 ${r.available ? 'bg-emerald-600' : 'bg-rose-600'} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
            <i class="fa-solid ${r.available ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1"></i>${r.available ? 'Tersedia' : 'Ditempah'}
        </span>
    ` : '';

    const isJungle = (r.name && (r.name.toUpperCase().includes('JUNGLE') || r.name.toUpperCase().includes('TREKKING')));
    const titleClass = isJungle
        ? "text-[12px] sm:text-[13px] lg:text-[14px] font-black text-slate-900 text-center mb-4 tracking-tight uppercase whitespace-nowrap px-1"
        : "text-base sm:text-lg lg:text-xl font-black text-slate-900 text-center mb-4 tracking-tight uppercase whitespace-nowrap";

    return `
        <div class="room-card bg-white rounded-2xl shadow-lg overflow-hidden border ${isAvailabilityCheck && !r.available ? 'border-rose-200 opacity-70' : 'border-slate-100'} flex flex-col">
            <div class="relative w-full bg-slate-50 aspect-[3/4] flex justify-center items-center border-b border-slate-100">
                ${availBadge}
                <img src="${r.image_url}" alt="${r.name}" class="w-full h-full ${r.image_url && r.image_url.includes('unsplash.com') ? 'object-cover' : 'object-contain p-2'}">
            </div>
            <div class="p-4 sm:p-5 flex flex-col flex-grow justify-between bg-white">
                <div>
                    <h3 class="${titleClass}">${r.name}</h3>

                    <div class="space-y-2.5 sm:space-y-3 mb-6">
                        <!-- 1. Caj Pemandu Arah Dropdown (Satu Baris Ayat, Tanpa Wrap, Fit Penuh) -->
                        <div class="relative">
                            <button type="button" id="hiking-dropdown-btn-${r.id}" onclick="toggleHikingDropdown(${r.id})"
                                class="w-full bg-[#F3FDF7] border-2 border-[#94E3BA] rounded-full py-2.5 sm:py-3 px-3 sm:px-3.5 flex items-center justify-between shadow-sm hover:border-[#2d6a4f] transition text-left cursor-pointer">
                                <span id="hiking-selected-text-${r.id}" class="font-black text-slate-900 text-[11px] sm:text-xs tracking-tight uppercase whitespace-nowrap overflow-visible">
                                    CAJ PEMANDU ARAH KE TINGKAT 3 RM150
                                </span>
                                <span id="hiking-dropdown-arrow-${r.id}" class="text-slate-900 text-xs font-black pl-1.5 flex-shrink-0 transition-transform duration-200">▽</span>
                            </button>

                            <!-- Floating Dropdown Menu (2 Baris Tetap: Baris 1 & Baris 2) -->
                            <div id="hiking-dropdown-menu-${r.id}" 
                                class="hidden absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border-2 border-[#94E3BA] rounded-2xl shadow-xl overflow-hidden divide-y divide-emerald-100">
                                <!-- Baris 1: Tingkat 3 RM150 -->
                                <div onclick="selectHikingDropdownOption(${r.id}, 150, 'CAJ PEMANDU ARAH KE TINGKAT 3 RM150')"
                                    class="py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-[#F3FDF7] cursor-pointer transition">
                                    <span class="font-black text-slate-900 text-[11px] sm:text-xs tracking-tight uppercase whitespace-nowrap block">
                                        CAJ PEMANDU ARAH KE TINGKAT 3 RM150
                                    </span>
                                </div>

                                <!-- Baris 2: Tingkat 7 RM300 -->
                                <div onclick="selectHikingDropdownOption(${r.id}, 300, 'CAJ PEMANDU ARAH KE TINGKAT 7 RM300')"
                                    class="py-2.5 sm:py-3 px-3 sm:px-4 hover:bg-[#F3FDF7] cursor-pointer transition">
                                    <span class="font-black text-slate-900 text-[11px] sm:text-xs tracking-tight uppercase whitespace-nowrap block">
                                        CAJ PEMANDU ARAH KE TINGKAT 7 RM300
                                    </span>
                                </div>
                            </div>

                            <!-- Hidden select for form & cart compatibility -->
                            <select id="hiking-pkg-${r.id}" class="hidden">
                                <option value="150" selected>CAJ PEMANDU ARAH KE TINGKAT 3 RM150</option>
                                <option value="300">CAJ PEMANDU ARAH KE TINGKAT 7 RM300</option>
                            </select>
                        </div>

                        <!-- 2. Jumlah Kumpulan & Jumlah Peserta (Kotak Berasingan Kiri dan Kanan) -->
                        <div class="grid grid-cols-2 gap-2 sm:gap-2.5">
                            <!-- Kotak Kiri: Jumlah Kumpulan -->
                            <div class="bg-[#F3FDF7] border-2 border-[#94E3BA] rounded-3xl p-2.5 sm:p-3 flex flex-col items-center justify-between shadow-sm min-w-0">
                                <span class="font-black text-slate-900 text-[10.5px] sm:text-xs tracking-tight uppercase whitespace-nowrap text-center mb-1.5">
                                    JUMLAH KUMPULAN
                                </span>
                                <div class="w-full h-9 flex items-center justify-center bg-white border border-[#94E3BA] rounded-full px-2 shadow-inner">
                                    <i class="fa-solid fa-users text-[#2D5D48] text-xs sm:text-sm mr-1.5 flex-shrink-0"></i>
                                    <input type="text" id="hiking-groups-${r.id}" value="1" readonly
                                        class="w-10 text-center font-black text-slate-900 text-base sm:text-lg bg-transparent focus:outline-none cursor-default select-none p-0"
                                        title="Auto-dikira: 1 Kumpulan bagi setiap 7 peserta">
                                </div>
                            </div>

                            <!-- Kotak Kanan: Jumlah Peserta -->
                            <div class="bg-[#F3FDF7] border-2 border-[#94E3BA] rounded-3xl p-2.5 sm:p-3 flex flex-col items-center justify-between shadow-sm min-w-0">
                                <span class="font-black text-slate-900 text-[10.5px] sm:text-xs tracking-tight uppercase whitespace-nowrap text-center mb-1.5">
                                    JUMLAH PESERTA
                                </span>
                                <div class="w-full h-9 flex items-center justify-between bg-white border border-[#94E3BA] rounded-full overflow-hidden px-2 shadow-inner">
                                    <input type="number" id="hiking-pax-${r.id}" min="1" max="100" value="1"
                                        class="w-full text-center font-black text-slate-900 text-base sm:text-lg bg-transparent focus:outline-none cursor-pointer hide-native-spinner p-0"
                                        placeholder="1"
                                        title="Masukkan bilangan peserta"
                                        oninput="updateHikingPrice(${r.id})" onchange="updateHikingPrice(${r.id})">
                                    <div class="flex flex-col items-center justify-center h-full pl-1.5 border-l border-[#BBF0D2] flex-shrink-0">
                                        <button type="button" onclick="stepHikingPax(${r.id}, 1)" 
                                            class="w-5 h-3.5 flex items-center justify-center text-slate-900 hover:text-emerald-700 active:scale-90 text-[9px] font-black transition cursor-pointer select-none leading-none"
                                            title="Tambah peserta">
                                            ▲
                                        </button>
                                        <button type="button" onclick="stepHikingPax(${r.id}, -1)" 
                                            class="w-5 h-3.5 flex items-center justify-center text-slate-900 hover:text-emerald-700 active:scale-90 text-[9px] font-black transition cursor-pointer select-none leading-none"
                                            title="Kurangkan peserta">
                                            ▼
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 3. Caj Pemprosesan Seorang -->
                        <div class="bg-[#F3FDF7] border-2 border-[#94E3BA] rounded-3xl py-2.5 sm:py-3 px-3 sm:px-3.5 flex justify-between items-center shadow-sm">
                            <div class="flex flex-col justify-center min-w-0 pr-2">
                                <span class="font-black text-slate-900 text-[11px] sm:text-xs tracking-tight uppercase whitespace-nowrap">
                                    CAJ PEMPROSESAN SEORANG
                                </span>
                                <span id="hiking-proc-calc-${r.id}" class="text-[10px] sm:text-[11px] font-bold text-[#2D5D48] whitespace-nowrap mt-0.5">
                                    (RM10 × <span id="hiking-proc-pax-${r.id}">1</span>)
                                </span>
                            </div>
                            <span class="font-black text-slate-900 text-xs sm:text-sm tracking-tight whitespace-nowrap pl-1 flex-shrink-0">
                                RM<span id="hiking-proc-${r.id}">10</span>
                            </span>
                        </div>

                        <!-- 4. Jumlah Keseluruhan -->
                        <div class="bg-[#F3FDF7] border-2 border-[#94E3BA] rounded-3xl py-2.5 sm:py-3 px-3 sm:px-3.5 flex justify-between items-center shadow-sm">
                            <span class="font-black text-slate-900 text-[11px] sm:text-xs tracking-tight uppercase whitespace-nowrap">
                                JUMLAH KESELURUHAN
                            </span>
                            <span class="font-black text-slate-900 text-xs sm:text-sm tracking-tight whitespace-nowrap pl-1 flex-shrink-0">
                                RM <span id="hiking-total-${r.id}">160</span>
                            </span>
                        </div>
                    </div>
                </div>

                <!-- 5. Tambah ke Bakul Button -->
                <button onclick="${isAvail ? `addToCartHiking(${r.id})` : ''}" 
                    class="w-full ${isAvail ? 'bg-[#2d6a4f] hover:bg-[#23533e] cursor-pointer' : 'bg-slate-300 cursor-not-allowed text-slate-500'} text-white font-extrabold py-3.5 px-6 rounded-2xl transition flex items-center justify-center gap-2.5 text-base sm:text-lg shadow-md mt-auto whitespace-nowrap"
                    ${!isAvail ? 'disabled' : ''}>
                    <i class="fa-solid ${isAvail ? 'fa-cart-plus' : 'fa-calendar-xmark'} text-lg"></i>
                    <span class="whitespace-nowrap">${isAvail ? 'Tambah ke Bakul' : 'Tidak Tersedia'}</span>
                </button>
            </div>
        </div>
    `;
}

function toggleHikingDropdown(id) {
    const menu = document.getElementById(`hiking-dropdown-menu-${id}`);
    const arrow = document.getElementById(`hiking-dropdown-arrow-${id}`);
    if (!menu) return;
    
    const isHidden = menu.classList.contains('hidden');
    // Tutup mana-mana dropdown lain yang sedang terbuka
    document.querySelectorAll('[id^="hiking-dropdown-menu-"]').forEach(m => m.classList.add('hidden'));
    document.querySelectorAll('[id^="hiking-dropdown-arrow-"]').forEach(a => a.style.transform = 'rotate(0deg)');
    
    if (isHidden) {
        menu.classList.remove('hidden');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
}

function selectHikingDropdownOption(id, rate, text) {
    const pkgSelect = document.getElementById(`hiking-pkg-${id}`);
    const textBox = document.getElementById(`hiking-selected-text-${id}`);
    const menu = document.getElementById(`hiking-dropdown-menu-${id}`);
    const arrow = document.getElementById(`hiking-dropdown-arrow-${id}`);
    
    if (pkgSelect) pkgSelect.value = rate;
    
    if (textBox) {
        textBox.textContent = text;
    }
    
    if (menu) menu.classList.add('hidden');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    
    updateHikingPrice(id);
}

// Tutup menu dropdown jika pengguna klik di luar
document.addEventListener('click', function(e) {
    if (!e.target.closest('[id^="hiking-dropdown-btn-"]') && !e.target.closest('[id^="hiking-dropdown-menu-"]')) {
        document.querySelectorAll('[id^="hiking-dropdown-menu-"]').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('[id^="hiking-dropdown-arrow-"]').forEach(a => a.style.transform = 'rotate(0deg)');
    }
    if (!e.target.closest('[id^="kemasukan-dropdown-btn-"]') && !e.target.closest('[id^="kemasukan-dropdown-menu-"]')) {
        document.querySelectorAll('[id^="kemasukan-dropdown-menu-"]').forEach(m => m.classList.add('hidden'));
        document.querySelectorAll('[id^="kemasukan-dropdown-arrow-"]').forEach(a => a.style.transform = 'rotate(0deg)');
    }
});

function stepHikingPax(id, delta) {
    const paxInput = document.getElementById(`hiking-pax-${id}`);
    if (!paxInput) return;
    let pax = parseInt(paxInput.value);
    if (isNaN(pax) || pax < 1) pax = 1;
    pax += delta;
    if (pax < 1) pax = 1;
    if (pax > 100) pax = 100;
    paxInput.value = pax;
    updateHikingPrice(id);
}

function updateHikingPrice(id) {
    const pkgSelect = document.getElementById(`hiking-pkg-${id}`);
    const paxInput = document.getElementById(`hiking-pax-${id}`);
    const groupsInput = document.getElementById(`hiking-groups-${id}`);
    const procSpan = document.getElementById(`hiking-proc-${id}`);
    const procCalcSpan = document.getElementById(`hiking-proc-calc-${id}`);
    const procPaxSpan = document.getElementById(`hiking-proc-pax-${id}`);
    const totalSpan = document.getElementById(`hiking-total-${id}`);
    if (!pkgSelect || !totalSpan) return;

    let pax = parseInt(paxInput ? paxInput.value : 1);
    if (isNaN(pax) || pax < 1) pax = 1;

    const pkgRate = parseFloat(pkgSelect.value) || 150;
    // Maks 7 orang bagi 1 kumpulan; lebih dari 7 bertambah secara automatik:
    // 1-7 orang = 1 kumpulan, 8-14 = 2 kumpulan, 15-21 = 3 kumpulan, dan seterusnya.
    const groups = Math.ceil(pax / 7);
    const guideTotal = groups * pkgRate;
    const procTotal = pax * 10;
    const grandTotal = guideTotal + procTotal;

    // Caj Pemprosesan bertambah secara auto mengikut jumlah peserta (cth: RM10 x 10 peserta = RM100)
    if (procSpan) procSpan.textContent = procTotal;
    if (procPaxSpan) procPaxSpan.textContent = pax;
    if (procCalcSpan) procCalcSpan.classList.remove('hidden');

    totalSpan.textContent = grandTotal;
    if (groupsInput) {
        if ('value' in groupsInput) groupsInput.value = groups;
        groupsInput.textContent = groups;
    }
}

function addToCartHiking(id) {
    const room = allRooms.find(r => r.id === id);
    if (!room) return;
    
    const pkgSelect = document.getElementById(`hiking-pkg-${id}`);
    const paxInput = document.getElementById(`hiking-pax-${id}`);
    let pax = parseInt(paxInput ? paxInput.value : 1);
    if (isNaN(pax) || pax < 1) pax = 1;
    
    const pkgRate = pkgSelect ? (parseFloat(pkgSelect.value) || 150) : 150;
    const isTingkat7 = pkgRate === 300;
    const groups = Math.ceil(pax / 7);
    const guideTotal = groups * pkgRate;
    const procTotal = pax * 10;
    const totalHikingPrice = guideTotal + procTotal;
    
    const isKabin = (room.name && room.name.toUpperCase().includes('KABIN'));
    const isGazebo = (room.name && room.name.toUpperCase().includes('GAZEBO'));
    const isJungle = (room.name && (room.name.toUpperCase().includes('JUNGLE') || room.name.toUpperCase().includes('TREKKING')));
    const isKhemah = (room.name && (room.name.toUpperCase().includes('PERKHEMAHAN') || room.name.toUpperCase().includes('KHEMAH')));
    const isHammock = (room.name && room.name.toUpperCase().includes('HAMMOCK'));
    const isRv = (room.name && (room.name.toUpperCase().includes('RV') || room.name.toUpperCase().includes('CARAVAN') || room.name.toUpperCase().includes('CAMPERVAN')));
    const itemType = isKabin ? 'TEMPAHAN KABIN' : (isGazebo ? (room.name || 'TEMPAHAN GAZEBO') : (isJungle ? (room.name || 'TEMPAHAN AKTIVITI JUNGLE TREKKING') : (isKhemah ? (room.name || 'TEMPAHAN TAPAK PERKHEMAHAN') : (isHammock ? (room.name || 'TEMPAHAN TAPAK HAMMOCK') : (isRv ? (room.name || 'TEMPAHAN TAPAK KENDERAAN RV / CARAVAN / CAMPERVAN') : 'TEMPAHAN AKTIVITI HIKING')))));
    const pkgLocation = isTingkat7 ? 'TINGKAT 7' : 'TINGKAT 3';
    const pkgTitle = `CAJ PEMANDU ARAH KE ${pkgLocation} (${groups} Kumpulan x RM${pkgRate} = RM${guideTotal}) + Caj Pemprosesan (${pax} Orang x RM10 = RM${procTotal})`;
    const cartItemName = `${itemType} (${pkgLocation} - ${pax} ORANG / ${groups} KUMPULAN)`;
    
    // Semak sekiranya item sudah ada dalam bakul
    const existingIndex = cart.findIndex(item => item.id === id);
    if (existingIndex !== -1) {
        cart[existingIndex].price_per_night = totalHikingPrice;
        cart[existingIndex].total_price = totalHikingPrice;
        cart[existingIndex].name = cartItemName;
        cart[existingIndex].packageName = pkgTitle;
        cart[existingIndex].num_guests = pax;
        cart[existingIndex].groups = groups;
        updateCartUI();
        alert(`Pilihan ${itemType} di dalam bakul telah dikemaskini: ${cartItemName} - RM${totalHikingPrice.toFixed(2)}`);
        return;
    }
    
    const hikingItem = {
        ...room,
        id: room.id,
        name: cartItemName,
        packageName: pkgTitle,
        price_per_night: totalHikingPrice,
        total_price: totalHikingPrice,
        num_guests: pax,
        groups: groups,
        packageFee: guideTotal,
        processingFee: procTotal
    };
    
    cart.push(hikingItem);
    updateCartUI();
    
    const btn = document.querySelector(`button[onclick*="addToCartHiking(${id})"]`);
    if(btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check text-lg"></i> Ditambah';
        btn.classList.add('bg-emerald-500');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('bg-emerald-500');
        }, 2000);
    }
}

const KEMASUKAN_ITEMS = [
    // MY CAJ KEMASUKAN WARGA NEGARA
    { idx: 0, groupKey: 'wn', groupTitle: 'MY CAJ KEMASUKAN WARGA NEGARA', rowLabel: 'CAJ DEWASA', cartLabel: 'WARGA NEGARA - DEWASA', rate: 3, unit: 'Orang', defaultQty: 1 },
    { idx: 1, groupKey: 'wn', groupTitle: 'MY CAJ KEMASUKAN WARGA NEGARA', rowLabel: 'CAJ KANAK-KANAK', cartLabel: 'WARGA NEGARA - KANAK-KANAK', rate: 1, unit: 'Orang', defaultQty: 0 },
    { idx: 2, groupKey: 'wn', groupTitle: 'MY CAJ KEMASUKAN WARGA NEGARA', rowLabel: 'CAJ WARGA EMAS', cartLabel: 'WARGA NEGARA - WARGA EMAS', rate: 1, unit: 'Orang', defaultQty: 0 },

    // 🌐 CAJ KEMASUKAN BUKAN WARGA NEGARA
    { idx: 3, groupKey: 'bwn', groupTitle: '🌐 CAJ KEMASUKAN BUKAN WARGA NEGARA', rowLabel: 'CAJ DEWASA', cartLabel: 'BUKAN WARGA NEGARA - DEWASA', rate: 10, unit: 'Orang', defaultQty: 0 },
    { idx: 4, groupKey: 'bwn', groupTitle: '🌐 CAJ KEMASUKAN BUKAN WARGA NEGARA', rowLabel: 'CAJ KANAK-KANAK', cartLabel: 'BUKAN WARGA NEGARA - KANAK-KANAK', rate: 5, unit: 'Orang', defaultQty: 0 },
    { idx: 5, groupKey: 'bwn', groupTitle: '🌐 CAJ KEMASUKAN BUKAN WARGA NEGARA', rowLabel: 'CAJ WARGA EMAS', cartLabel: 'BUKAN WARGA NEGARA - WARGA EMAS', rate: 5, unit: 'Orang', defaultQty: 0 },

    // 🚗 CAJ KEMASUKAN KENDERAAN
    { idx: 6, groupKey: 'kend', groupTitle: '🚗 CAJ KEMASUKAN KENDERAAN', rowLabel: 'CAJ KERETA', cartLabel: 'CAJ KENDERAAN - KERETA', rate: 3, unit: 'Kenderaan', defaultQty: 0 },
    { idx: 7, groupKey: 'kend', groupTitle: '🚗 CAJ KEMASUKAN KENDERAAN', rowLabel: 'CAJ MOTORSIKAL', cartLabel: 'CAJ KENDERAAN - MOTORSIKAL', rate: 1, unit: 'Kenderaan', defaultQty: 0 },
    { idx: 8, groupKey: 'kend', groupTitle: '🚗 CAJ KEMASUKAN KENDERAAN', rowLabel: 'CAJ BAS / LORI', cartLabel: 'CAJ KENDERAAN - BAS / LORI', rate: 10, unit: 'Kenderaan', defaultQty: 0 },

    // ✨ PERCUMA
    { idx: 9, groupKey: 'percuma', groupTitle: '✨ PERCUMA', rowLabel: '0-4 TAHUN', cartLabel: 'KANAK-KANAK 0-4 TAHUN (PERCUMA)', rate: 0, unit: 'Orang', defaultQty: 0 },
    { idx: 10, groupKey: 'percuma', groupTitle: '✨ PERCUMA', rowLabel: 'OKU', cartLabel: 'OKU (PERCUMA)', rate: 0, unit: 'Orang', defaultQty: 0 }
];

const KEMASUKAN_GROUP_TITLES = {
    'wn': 'MY CAJ KEMASUKAN WARGA NEGARA',
    'bwn': '🌐 CAJ KEMASUKAN BUKAN WARGA NEGARA',
    'kend': '🚗 CAJ KEMASUKAN KENDERAAN',
    'percuma': '✨ PERCUMA (0-4 TAHUN & OKU)'
};

function renderKemasukanGroup(r, groupKey, items) {
    return items.map(item => `
        <div class="kemasukan-custom-chk bg-[#F3FDF7] border-2 border-[#94E3BA] rounded-full py-1 px-2.5 sm:px-3 flex items-center justify-between gap-1 sm:gap-1.5 shadow-xs hover:border-[#386641] transition select-none w-full box-border">
            <!-- Kiri: Custom Checkbox & Label (Satu Baris Ayat Penuh Tanpa Wrap) -->
            <label class="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0" for="kemasukan-chk-${r.id}-${item.idx}">
                <input type="checkbox" id="kemasukan-chk-${r.id}-${item.idx}" 
                    ${item.defaultQty > 0 ? 'checked' : ''} 
                    onchange="toggleKemasukanRowCheck(${r.id}, ${item.idx})"
                    class="hidden">
                <!-- Kotak Checkbox Hijau Pekat dengan Tanda Semak Putih -->
                <div class="chk-box w-[18px] h-[18px] sm:w-5 sm:h-5 rounded-md border-2 border-[#386641] bg-white flex items-center justify-center transition-all duration-150 flex-shrink-0 cursor-pointer shadow-xs">
                    <svg class="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                </div>
                <span class="font-black text-slate-900 text-[10px] sm:text-[10.5px] tracking-tight uppercase whitespace-nowrap select-none">
                    ${item.rowLabel}
                </span>
            </label>

            <!-- Tengah: Kapsul Stepper Putih Bulat Seimbang -->
            <div class="bg-white border-2 border-[#94E3BA] rounded-full flex items-center justify-between px-1.5 py-0.5 h-6.5 sm:h-7 w-[56px] sm:w-[62px] shadow-xs flex-shrink-0 mx-0.5">
                <input type="number" id="kemasukan-qty-${r.id}-${item.idx}" min="0" max="500" value="${item.defaultQty > 0 ? item.defaultQty : 1}"
                    class="w-5 text-center font-black text-slate-900 text-[11px] sm:text-xs bg-transparent focus:outline-none cursor-pointer hide-native-spinner p-0"
                    oninput="handleKemasukanQtyInput(${r.id}, ${item.idx})" onchange="handleKemasukanQtyInput(${r.id}, ${item.idx})">
                <div class="w-[1px] h-3 bg-[#94E3BA] mx-0.5 flex-shrink-0"></div>
                <div class="flex flex-col items-center justify-center flex-shrink-0">
                    <button type="button" onclick="stepKemasukanRowQty(${r.id}, ${item.idx}, 1)"
                        class="w-3 h-2 flex items-center justify-center text-slate-900 hover:text-emerald-700 active:scale-90 text-[7px] font-black transition cursor-pointer select-none leading-none"
                        title="Tambah kuantiti">
                        ▲
                    </button>
                    <button type="button" onclick="stepKemasukanRowQty(${r.id}, ${item.idx}, -1)"
                        class="w-3 h-2 flex items-center justify-center text-slate-900 hover:text-emerald-700 active:scale-90 text-[7px] font-black transition cursor-pointer select-none leading-none"
                        title="Kurangkan kuantiti">
                        ▼
                    </button>
                </div>
            </div>

            <!-- Kanan: Harga Pakej / Subtotal Seimbang Tanpa Terpotong -->
            <div class="font-black text-slate-900 text-[10.5px] sm:text-[11px] tracking-tight whitespace-nowrap min-w-[46px] sm:min-w-[50px] text-right flex-shrink-0">
                <span id="kemasukan-price-${r.id}-${item.idx}">
                    ${item.rate === 0 ? 'PERCUMA' : (item.defaultQty > 1 ? 'RM' + (item.defaultQty * item.rate).toFixed(2) : 'RM' + item.rate.toFixed(2))}
                </span>
            </div>
        </div>
    `).join('');
}

function renderKemasukanCard(r, isAvailabilityCheck = false) {
    const isAvail = !isAvailabilityCheck || r.available;
    const availBadge = isAvailabilityCheck ? `
        <span class="absolute top-3 left-3 ${r.available ? 'bg-emerald-600' : 'bg-rose-600'} text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
            <i class="fa-solid ${r.available ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1"></i>${r.available ? 'Tersedia' : 'Ditempah'}
        </span>
    ` : '';

    const wnRows = renderKemasukanGroup(r, 'wn', KEMASUKAN_ITEMS.filter(i => i.groupKey === 'wn'));
    const bwnRows = renderKemasukanGroup(r, 'bwn', KEMASUKAN_ITEMS.filter(i => i.groupKey === 'bwn'));
    const kendRows = renderKemasukanGroup(r, 'kend', KEMASUKAN_ITEMS.filter(i => i.groupKey === 'kend'));
    const percumaRows = renderKemasukanGroup(r, 'percuma', KEMASUKAN_ITEMS.filter(i => i.groupKey === 'percuma'));

    return `
        <div class="room-card bg-white rounded-2xl shadow-lg overflow-hidden border ${isAvailabilityCheck && !r.available ? 'border-rose-200 opacity-70' : 'border-slate-100'} flex flex-col">
            <div class="relative w-full bg-slate-50 aspect-[3/4] flex justify-center items-center border-b border-slate-100">
                ${availBadge}
                <img src="${r.image_url}" alt="${r.name}" class="w-full h-full ${r.image_url && r.image_url.includes('unsplash.com') ? 'object-cover' : 'object-contain p-2'}">
            </div>
            <div class="px-3 py-3.5 sm:px-4 sm:py-4 flex flex-col flex-grow justify-between bg-white">
                <div>
                    <!-- Tajuk Kad Kemas Tanpa Overflow -->
                    <h3 class="text-sm sm:text-base font-black text-slate-900 text-center mb-2 tracking-tight uppercase leading-snug px-1">${r.name}</h3>

                    <!-- Senarai Penuh Kadar Caj Mengikut Kategori (Header Badge) -->
                    <div class="bg-emerald-50 border border-emerald-200/90 rounded-2xl py-1.5 px-3 text-center mb-2 shadow-xs">
                        <span class="text-[10px] sm:text-[10.5px] font-black text-emerald-950 uppercase tracking-tight flex items-center justify-center gap-1.5 leading-tight">
                            <i class="fa-solid fa-ticket text-emerald-700"></i> Senarai Penuh Kadar Caj Mengikut Kategori
                        </span>
                    </div>

                    <!-- 4 Butang Kategori Tab (Grid 2x2: Muat Penuh 100%, Tiada Terpotong) -->
                    <div class="grid grid-cols-2 gap-1.5 mb-2">
                        <button type="button" onclick="switchKemasukanCategory(${r.id}, 'wn')" id="kemasukan-tab-btn-${r.id}-wn"
                            class="kemasukan-tab-btn py-1.5 px-2 rounded-xl text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 border-2 border-[#386641] bg-[#386641] text-white shadow-xs cursor-pointer select-none">
                            <span>MY Warga Negara</span>
                            <span id="tab-badge-${r.id}-wn" class="text-[9px] bg-white text-[#386641] px-1.5 py-0.2 rounded-full font-extrabold leading-none">1</span>
                        </button>
                        <button type="button" onclick="switchKemasukanCategory(${r.id}, 'bwn')" id="kemasukan-tab-btn-${r.id}-bwn"
                            class="kemasukan-tab-btn py-1.5 px-2 rounded-xl text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 border-2 border-[#94E3BA] bg-[#F3FDF7] text-slate-800 hover:border-[#386641] shadow-xs cursor-pointer select-none">
                            <span>🌐 Bukan Warga</span>
                            <span id="tab-badge-${r.id}-bwn" class="hidden text-[9px] bg-[#386641] text-white px-1.5 py-0.2 rounded-full font-extrabold leading-none">0</span>
                        </button>
                        <button type="button" onclick="switchKemasukanCategory(${r.id}, 'kend')" id="kemasukan-tab-btn-${r.id}-kend"
                            class="kemasukan-tab-btn py-1.5 px-2 rounded-xl text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 border-2 border-[#94E3BA] bg-[#F3FDF7] text-slate-800 hover:border-[#386641] shadow-xs cursor-pointer select-none">
                            <span>🚗 Kenderaan</span>
                            <span id="tab-badge-${r.id}-kend" class="hidden text-[9px] bg-[#386641] text-white px-1.5 py-0.2 rounded-full font-extrabold leading-none">0</span>
                        </button>
                        <button type="button" onclick="switchKemasukanCategory(${r.id}, 'percuma')" id="kemasukan-tab-btn-${r.id}-percuma"
                            class="kemasukan-tab-btn py-1.5 px-2 rounded-xl text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 border-2 border-[#94E3BA] bg-[#F3FDF7] text-slate-800 hover:border-[#386641] shadow-xs cursor-pointer select-none">
                            <span>✨ Percuma</span>
                            <span id="tab-badge-${r.id}-percuma" class="hidden text-[9px] bg-[#386641] text-white px-1.5 py-0.2 rounded-full font-extrabold leading-none">0</span>
                        </button>
                    </div>

                    <!-- Bar Hijau Tajuk Kategori Aktif (Rujuk Lampiran Gambar) -->
                    <div id="kemasukan-active-banner-${r.id}" class="bg-[#386641] text-white rounded-2xl py-2 px-3 text-center mb-2.5 shadow-xs flex items-center justify-center gap-2">
                        <span id="kemasukan-active-title-${r.id}" class="font-black text-xs sm:text-[12px] uppercase tracking-wide">
                            MY CAJ KEMASUKAN WARGA NEGARA
                        </span>
                    </div>

                    <!-- Panel Kategori (Hanya Kategori Aktif Dipaparkan - Tiada Perlu Skrol Dalaman) -->
                    <div class="mb-3">
                        <div id="kemasukan-panel-${r.id}-wn" class="kemasukan-panel space-y-2">
                            ${wnRows}
                        </div>
                        <div id="kemasukan-panel-${r.id}-bwn" class="kemasukan-panel hidden space-y-2">
                            ${bwnRows}
                        </div>
                        <div id="kemasukan-panel-${r.id}-kend" class="kemasukan-panel hidden space-y-2">
                            ${kendRows}
                        </div>
                        <div id="kemasukan-panel-${r.id}-percuma" class="kemasukan-panel hidden space-y-2">
                            ${percumaRows}
                        </div>
                    </div>

                    <!-- Grand Total Container -->
                    <div class="bg-[#F3FDF7] border-2 border-[#94E3BA] rounded-3xl py-2 px-3 sm:px-3.5 flex justify-between items-center shadow-sm mb-3">
                        <div class="flex flex-col justify-center min-w-0 pr-1.5">
                            <span class="font-black text-slate-900 text-[10.5px] sm:text-[11px] tracking-tight uppercase whitespace-nowrap">
                                JUMLAH KESELURUHAN
                            </span>
                            <span id="kemasukan-summary-count-${r.id}" class="text-[9.5px] sm:text-[10px] font-bold text-[#2D5D48] whitespace-nowrap mt-0.5">
                                (1 Pilihan Dipilih)
                            </span>
                        </div>
                        <span class="font-black text-slate-900 text-xs sm:text-sm tracking-tight whitespace-nowrap pl-1 flex-shrink-0">
                            RM <span id="kemasukan-grand-total-${r.id}">3.00</span>
                        </span>
                    </div>
                </div>

                <!-- Tambah ke Bakul Button -->
                <button onclick="${isAvail ? `addToCartKemasukanMulti(${r.id})` : ''}" 
                    class="w-full ${isAvail ? 'bg-[#386641] hover:bg-[#2d5234] cursor-pointer' : 'bg-slate-300 cursor-not-allowed text-slate-500'} text-white font-extrabold py-3 px-4 rounded-2xl transition flex items-center justify-center gap-2 text-sm sm:text-base shadow-md mt-auto whitespace-nowrap"
                    ${!isAvail ? 'disabled' : ''}>
                    <i class="fa-solid ${isAvail ? 'fa-cart-plus' : 'fa-calendar-xmark'} text-base"></i>
                    <span class="whitespace-nowrap">${isAvail ? 'Tambah ke Bakul' : 'Tidak Tersedia'}</span>
                </button>
            </div>
        </div>
    `;
}

function switchKemasukanCategory(roomId, activeKey) {
    const keys = ['wn', 'bwn', 'kend', 'percuma'];
    keys.forEach(k => {
        const btn = document.getElementById(`kemasukan-tab-btn-${roomId}-${k}`);
        const panel = document.getElementById(`kemasukan-panel-${roomId}-${k}`);
        const isCurrent = (k === activeKey);

        if (panel) {
            if (isCurrent) {
                panel.classList.remove('hidden');
            } else {
                panel.classList.add('hidden');
            }
        }

        if (btn) {
            if (isCurrent) {
                btn.className = "kemasukan-tab-btn py-1.5 px-2 rounded-xl text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 border-2 border-[#386641] bg-[#386641] text-white shadow-xs cursor-pointer select-none";
            } else {
                btn.className = "kemasukan-tab-btn py-1.5 px-2 rounded-xl text-[10px] sm:text-[10.5px] font-black uppercase tracking-tight transition flex items-center justify-center gap-1 border-2 border-[#94E3BA] bg-[#F3FDF7] text-slate-800 hover:border-[#386641] shadow-xs cursor-pointer select-none";
            }
        }
    });

    const bannerTitle = document.getElementById(`kemasukan-active-title-${roomId}`);
    if (bannerTitle && KEMASUKAN_GROUP_TITLES[activeKey]) {
        bannerTitle.textContent = KEMASUKAN_GROUP_TITLES[activeKey];
    }
}

function scrollKemasukanToCategory(roomId, catKey) {
    switchKemasukanCategory(roomId, catKey);
}

function toggleKemasukanRowCheck(roomId, idx) {
    const chk = document.getElementById(`kemasukan-chk-${roomId}-${idx}`);
    const qtyInput = document.getElementById(`kemasukan-qty-${roomId}-${idx}`);
    if (!chk || !qtyInput) return;

    if (chk.checked) {
        let q = parseInt(qtyInput.value) || 0;
        if (q <= 0) qtyInput.value = 1;
    }
    updateKemasukanCalculations(roomId);
}

function stepKemasukanRowQty(roomId, idx, delta) {
    const chk = document.getElementById(`kemasukan-chk-${roomId}-${idx}`);
    const qtyInput = document.getElementById(`kemasukan-qty-${roomId}-${idx}`);
    if (!qtyInput) return;

    let q = parseInt(qtyInput.value) || 1;
    if (delta > 0) {
        if (!chk || !chk.checked) {
            if (chk) chk.checked = true;
        } else {
            q += delta;
            if (q > 500) q = 500;
            qtyInput.value = q;
        }
    } else if (delta < 0) {
        if (q > 1) {
            q += delta;
            qtyInput.value = q;
        } else {
            if (chk) chk.checked = false;
        }
    }
    updateKemasukanCalculations(roomId);
}

function handleKemasukanQtyInput(roomId, idx) {
    const chk = document.getElementById(`kemasukan-chk-${roomId}-${idx}`);
    const qtyInput = document.getElementById(`kemasukan-qty-${roomId}-${idx}`);
    if (!qtyInput) return;

    let q = parseInt(qtyInput.value);
    if (isNaN(q) || q <= 0) {
        q = 1;
        qtyInput.value = 1;
        if (chk) chk.checked = false;
    } else {
        if (q > 500) q = 500;
        qtyInput.value = q;
        if (chk) chk.checked = true;
    }
    updateKemasukanCalculations(roomId);
}

function updateKemasukanCalculations(roomId) {
    let grandTotal = 0;
    let selectedCategoriesCount = 0;
    const groupCounts = { wn: 0, bwn: 0, kend: 0, percuma: 0 };

    KEMASUKAN_ITEMS.forEach(item => {
        const chk = document.getElementById(`kemasukan-chk-${roomId}-${item.idx}`);
        const qtyInput = document.getElementById(`kemasukan-qty-${roomId}-${item.idx}`);
        const priceSpan = document.getElementById(`kemasukan-price-${roomId}-${item.idx}`);

        let q = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
        if (q < 1) {
            q = 1;
            if (qtyInput) qtyInput.value = 1;
        }
        const isChecked = chk && chk.checked;
        const subtotal = q * item.rate;

        if (priceSpan) {
            if (item.rate === 0) {
                priceSpan.textContent = 'PERCUMA';
            } else if (q > 1) {
                priceSpan.textContent = 'RM' + subtotal.toFixed(2);
            } else {
                priceSpan.textContent = 'RM' + item.rate.toFixed(2);
            }
        }

        if (isChecked && q > 0) {
            grandTotal += subtotal;
            selectedCategoriesCount += 1;
            if (groupCounts[item.groupKey] !== undefined) {
                groupCounts[item.groupKey] += 1;
            }
        }
    });

    // Kemaskini lencana bilangan pilihan pada setiap tab kategori
    ['wn', 'bwn', 'kend', 'percuma'].forEach(k => {
        const badge = document.getElementById(`tab-badge-${roomId}-${k}`);
        if (badge) {
            const cnt = groupCounts[k] || 0;
            if (cnt > 0) {
                badge.textContent = cnt;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    });

    const totalSpan = document.getElementById(`kemasukan-grand-total-${roomId}`);
    const countSpan = document.getElementById(`kemasukan-summary-count-${roomId}`);

    if (totalSpan) totalSpan.textContent = grandTotal.toFixed(2);
    if (countSpan) countSpan.textContent = `(${selectedCategoriesCount} Pilihan Dipilih)`;
}

function addToCartKemasukanMulti(roomId) {
    const room = allRooms.find(r => r.id === roomId);
    if (!room) return;

    let addedCount = 0;
    let totalAddedPrice = 0;

    KEMASUKAN_ITEMS.forEach(item => {
        const chk = document.getElementById(`kemasukan-chk-${roomId}-${item.idx}`);
        const qtyInput = document.getElementById(`kemasukan-qty-${roomId}-${item.idx}`);
        const isChecked = chk ? chk.checked : false;
        const q = qtyInput ? (parseInt(qtyInput.value) || 0) : 0;

        if (isChecked && q > 0) {
            const itemPrice = q * item.rate;
            const cartKey = `kemasukan_${roomId}_${item.groupKey}_${item.idx}`;
            const cartItemName = `TEMPAHAN CAJ KEMASUKAN: ${item.cartLabel} (${q} ${item.unit})`;
            const pkgTitle = `${item.groupTitle} - ${item.rowLabel} (${q} ${item.unit} x RM${item.rate.toFixed(2)} = RM${itemPrice.toFixed(2)})`;

            const existingIndex = cart.findIndex(c => c.cartKey === cartKey || c.name.startsWith(`TEMPAHAN CAJ KEMASUKAN: ${item.cartLabel}`));
            if (existingIndex !== -1) {
                cart[existingIndex].price_per_night = itemPrice;
                cart[existingIndex].total_price = itemPrice;
                cart[existingIndex].name = cartItemName;
                cart[existingIndex].packageName = pkgTitle;
                cart[existingIndex].num_guests = q;
                cart[existingIndex].unit = item.unit;
            } else {
                cart.push({
                    ...room,
                    id: roomId,
                    room_id: roomId,
                    cartKey: cartKey,
                    name: cartItemName,
                    packageName: pkgTitle,
                    price_per_night: itemPrice,
                    total_price: itemPrice,
                    num_guests: q,
                    unit: item.unit,
                    ticketRate: item.rate
                });
            }
            addedCount++;
            totalAddedPrice += itemPrice;
        }
    });

    if (addedCount === 0) {
        alert('Sila tandakan dan pilih sekurang-kurangnya satu kategori tiket atau kenderaan.');
        return;
    }

    updateCartUI();

    const btn = document.querySelector(`button[onclick*="addToCartKemasukanMulti(${roomId})"]`) ||
                document.querySelector(`button[onclick*="addToCartKemasukan(${roomId})"]`);
    if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = `<i class="fa-solid fa-check text-lg"></i> ${addedCount} Pilihan Ditambah`;
        btn.classList.add('bg-emerald-500');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('bg-emerald-500');
        }, 2000);
    }
}

// Aliases
function addToCartKemasukan(id) {
    addToCartKemasukanMulti(id);
}
function selectKemasukanBoxOption(roomId, index) {}
function selectKemasukanDropdownOption(id, rate, text, unit) {}
function stepKemasukanQty(id, delta) {}
function updateKemasukanPrice(id) {
    updateKemasukanCalculations(id);
}

function renderRooms(rooms) {
    const grid = document.getElementById('rooms-grid');
    if (!rooms.length) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400"><i class="fa-solid fa-bed text-4xl mb-3 block"></i>Tiada tempahan & aktiviti yang sepadan.</div>`;
        return;
    }
    grid.innerHTML = rooms.map(r => {
        if ((r.name && (r.name.toUpperCase().includes('KEMASUKAN') || r.name.toUpperCase().includes('TIKET'))) ||
            (r.type && (r.type.toUpperCase().includes('KEMASUKAN') || r.type.toUpperCase().includes('TIKET')))) {
            return renderKemasukanCard(r, false);
        }
        if ((r.name && r.name.toUpperCase().includes('HIKING')) || (r.type && r.type.toUpperCase().includes('HIKING')) ||
            (r.name && r.name.toUpperCase().includes('KABIN')) || (r.type && r.type.toUpperCase().includes('KABIN')) ||
            (r.name && r.name.toUpperCase().includes('GAZEBO')) || (r.type && r.type.toUpperCase().includes('GAZEBO')) ||
            (r.name && (r.name.toUpperCase().includes('JUNGLE') || r.name.toUpperCase().includes('TREKKING'))) ||
            (r.type && (r.type.toUpperCase().includes('JUNGLE') || r.type.toUpperCase().includes('TREKKING'))) ||
            (r.name && (r.name.toUpperCase().includes('PERKHEMAHAN') || r.name.toUpperCase().includes('KHEMAH'))) ||
            (r.type && (r.type.toUpperCase().includes('PERKHEMAHAN') || r.type.toUpperCase().includes('KHEMAH'))) ||
            (r.name && r.name.toUpperCase().includes('HAMMOCK')) || (r.type && r.type.toUpperCase().includes('HAMMOCK')) ||
            (r.name && (r.name.toUpperCase().includes('RV') || r.name.toUpperCase().includes('CARAVAN') || r.name.toUpperCase().includes('CAMPERVAN'))) ||
            (r.type && (r.type.toUpperCase().includes('RV') || r.type.toUpperCase().includes('CARAVAN') || r.type.toUpperCase().includes('CAMPERVAN')))) {
            return renderHikingCard(r, false);
        }
        return `
        <div class="room-card bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100 flex flex-col">
            <div class="relative w-full bg-slate-50 aspect-[3/4] flex justify-center items-center border-b border-slate-100">
                  <img src="${r.image_url}" alt="${r.name}" class="w-full h-full ${r.image_url.includes('unsplash.com') ? 'object-cover' : 'object-contain p-2'}">
                
                
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-extrabold text-slate-900">${r.name}</h3>
                </div>
                <p class="text-slate-500 text-sm mb-3 flex-grow">${r.description}</p>
                <div class="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-4 border border-emerald-100">
                    <i class="fa-solid ${(r.name && (r.name.includes('KEMASUKAN') || r.name.includes('TIKET'))) ? 'fa-ticket' : 'fa-users'}"></i>
                    <span>${(r.name && (r.name.includes('KEMASUKAN') || r.name.includes('TIKET'))) ? 'Kemasukan: <strong>Warganegara & Bukan Warganegara</strong>' : `Sehingga <strong>${r.capacity} orang</strong>`}</span>
                </div>
                <div class="mb-4">
                    <p class="text-xs text-slate-500 font-semibold mb-1.5">${(r.name && (r.name.includes('KEMASUKAN') || r.name.includes('TIKET'))) ? 'Kadar Caj:' : 'Kemudahan:'}</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${r.facilities.split(', ').slice(0,4).map(f => `<span class="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">${f}</span>`).join('')}
                        ${r.facilities.split(', ').length > 4 ? `<span class="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">+${r.facilities.split(', ').length - 4} lagi</span>` : ''}
                    </div>
                </div>
                <button onclick="addToCart(${r.id})" class="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-auto">
                    <i class="fa-solid fa-cart-plus"></i> Tambah ke Bakul
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// ──── FILTER TYPE ────
document.getElementById('filter-type').addEventListener('change', function() {
    loadRooms(this.value);
});

// ──── FILTER DATE BAR ────
filterCheckinFp = flatpickr('#filter-checkin', {
    dateFormat: 'Y-m-d', minDate: 'today', locale: { firstDayOfWeek: 1 },
    onChange: (sel) => { filterDates.checkin = sel[0] ? flatpickr.formatDate(sel[0], 'Y-m-d') : null; filterCheckoutFp.set('minDate', sel[0] || 'today'); }
});
filterCheckoutFp = flatpickr('#filter-checkout', {
    dateFormat: 'Y-m-d', minDate: 'today', locale: { firstDayOfWeek: 1 },
    onChange: (sel) => { filterDates.checkout = sel[0] ? flatpickr.formatDate(sel[0], 'Y-m-d') : null; }
});

document.getElementById('btn-check-avail').addEventListener('click', async () => {
    if (!filterDates.checkin || !filterDates.checkout) {
        showAvailMsg('Sila pilih kedua-dua tarikh masuk dan keluar.', 'error'); return;
    }
    showAvailMsg('Menyemak ketersediaan...', 'info');
    document.getElementById('btn-clear-filter').classList.remove('hidden');
    await loadRoomsWithAvailability(filterDates.checkin, filterDates.checkout);
});

document.getElementById('btn-clear-filter').addEventListener('click', () => {
    filterCheckinFp.clear(); filterCheckoutFp.clear();
    filterDates = { checkin: null, checkout: null };
    document.getElementById('btn-clear-filter').classList.add('hidden');
    document.getElementById('avail-msg').classList.add('hidden');
    loadRooms(document.getElementById('filter-type').value);
});

async function loadRoomsWithAvailability(checkin, checkout) {
    const typeFilter = document.getElementById('filter-type').value;
    let rooms = typeFilter ? allRooms.filter(r => matchRoomType(r, typeFilter)) : [...allRooms];
    // Check each room
    const checks = await Promise.all(rooms.map(async r => {
        const res = await fetch(`${API}/api/rooms/${r.id}/booked-dates`);
        const bookings = await res.json();
        const isConflict = bookings.some(b => !(b.checkout_date <= checkin || b.checkin_date >= checkout));
        return { ...r, available: !isConflict };
    }));
    const avail = checks.filter(r => r.available).length;
    showAvailMsg(`${avail} daripada ${checks.length} tempahan & aktiviti tersedia untuk tarikh yang dipilih.`, avail > 0 ? 'success' : 'error');
    renderRoomsWithAvailability(checks);
}

function renderRoomsWithAvailability(rooms) {
    const grid = document.getElementById('rooms-grid');
    grid.innerHTML = rooms.map(r => {
        if ((r.name && (r.name.toUpperCase().includes('KEMASUKAN') || r.name.toUpperCase().includes('TIKET'))) ||
            (r.type && (r.type.toUpperCase().includes('KEMASUKAN') || r.type.toUpperCase().includes('TIKET')))) {
            return renderKemasukanCard(r, true);
        }
        if ((r.name && r.name.toUpperCase().includes('HIKING')) || (r.type && r.type.toUpperCase().includes('HIKING')) ||
            (r.name && r.name.toUpperCase().includes('KABIN')) || (r.type && r.type.toUpperCase().includes('KABIN')) ||
            (r.name && r.name.toUpperCase().includes('GAZEBO')) || (r.type && r.type.toUpperCase().includes('GAZEBO')) ||
            (r.name && (r.name.toUpperCase().includes('JUNGLE') || r.name.toUpperCase().includes('TREKKING'))) ||
            (r.type && (r.type.toUpperCase().includes('JUNGLE') || r.type.toUpperCase().includes('TREKKING'))) ||
            (r.name && (r.name.toUpperCase().includes('PERKHEMAHAN') || r.name.toUpperCase().includes('KHEMAH'))) ||
            (r.type && (r.type.toUpperCase().includes('PERKHEMAHAN') || r.type.toUpperCase().includes('KHEMAH'))) ||
            (r.name && r.name.toUpperCase().includes('HAMMOCK')) || (r.type && r.type.toUpperCase().includes('HAMMOCK')) ||
            (r.name && (r.name.toUpperCase().includes('RV') || r.name.toUpperCase().includes('CARAVAN') || r.name.toUpperCase().includes('CAMPERVAN'))) ||
            (r.type && (r.type.toUpperCase().includes('RV') || r.type.toUpperCase().includes('CARAVAN') || r.type.toUpperCase().includes('CAMPERVAN')))) {
            return renderHikingCard(r, true);
        }
        return `
        <div class="room-card bg-white rounded-2xl shadow-lg overflow-hidden border ${r.available ? 'border-slate-100' : 'border-rose-200 opacity-70'} flex flex-col">
            <div class="relative w-full bg-slate-50 aspect-[3/4] flex justify-center items-center border-b border-slate-100">
                  <img src="${r.image_url}" alt="${r.name}" class="w-full h-full ${r.image_url.includes('unsplash.com') ? 'object-cover' : 'object-contain p-2'}">
                <span class="absolute top-3 left-3 ${r.available ? 'bg-emerald-600' : 'bg-rose-600'} text-white text-xs font-bold px-3 py-1 rounded-full">
                    <i class="fa-solid ${r.available ? 'fa-circle-check' : 'fa-circle-xmark'} mr-1"></i>${r.available ? 'Tersedia' : 'Ditempah'}
                </span>
                
            </div>
            <div class="p-5 flex flex-col flex-grow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-extrabold text-slate-900">${r.name}</h3>
                </div>
                <p class="text-slate-500 text-sm mb-3 flex-grow">${r.description}</p>
                <div class="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-4 border border-emerald-100">
                    <i class="fa-solid ${(r.name && (r.name.includes('KEMASUKAN') || r.name.includes('TIKET'))) ? 'fa-ticket' : 'fa-users'}"></i>
                    <span>${(r.name && (r.name.includes('KEMASUKAN') || r.name.includes('TIKET'))) ? 'Kemasukan: <strong>Warganegara & Bukan Warganegara</strong>' : `Sehingga <strong>${r.capacity} orang</strong>`}</span>
                </div>
                <div class="mb-4">
                    <p class="text-xs text-slate-500 font-semibold mb-1.5">${(r.name && (r.name.includes('KEMASUKAN') || r.name.includes('TIKET'))) ? 'Kadar Caj:' : 'Kemudahan:'}</p>
                    <div class="flex flex-wrap gap-1.5">
                        ${r.facilities.split(', ').slice(0,4).map(f => `<span class="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">${f}</span>`).join('')}
                        ${r.facilities.split(', ').length > 4 ? `<span class="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">+${r.facilities.split(', ').length - 4} lagi</span>` : ''}
                    </div>
                </div>
                <button onclick="${r.available ? `addToCart(${r.id})` : ''}" 
                    class="w-full ${r.available ? 'bg-emerald-700 hover:bg-emerald-800 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'} text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 mt-auto"
                    ${!r.available ? 'disabled' : ''}>
                    <i class="fa-solid ${r.available ? 'fa-cart-plus' : 'fa-calendar-xmark'}"></i>
                    ${r.available ? 'Tambah ke Bakul' : 'Tidak Tersedia'}
                </button>
            </div>
        </div>
        `;
    }).join('');
}

function showAvailMsg(msg, type) {
    const el = document.getElementById('avail-msg');
    el.classList.remove('hidden', 'text-emerald-700', 'text-rose-600', 'text-slate-500');
    el.classList.add(type === 'success' ? 'text-emerald-700' : type === 'error' ? 'text-rose-600' : 'text-slate-500');
    el.textContent = msg;
    el.classList.remove('hidden');
}

// ──── OPEN BOOKING MODAL ────
let checkinPicker;
let cart = [];

function addToCart(id) {
    const room = allRooms.find(r => r.id === id);
    if (!room) return;
    
    // Check if already in cart
    if (cart.find(item => item.id === id)) {
        alert(room.name + ' sudah ada di dalam bakul.');
        return;
    }
    
    cart.push(room);
    updateCartUI();
    
    // Show toast or alert
    const btn = document.querySelector(`button[onclick="addToCart(${id})"]`);
    if(btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Ditambah';
        btn.classList.add('bg-emerald-500');
        setTimeout(() => {
            btn.innerHTML = original;
            btn.classList.remove('bg-emerald-500');
        }, 2000);
    }
}

function removeFromCart(keyOrId) {
    cart = cart.filter(item => (item.cartKey ? item.cartKey !== keyOrId : (item.id != keyOrId)));
    updateCartUI();
}

function clearCart() {
    cart = [];
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-container');
    const itemsDiv = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        container.classList.add('translate-y-full');
        return;
    }
    
    container.classList.remove('translate-y-full');
    document.getElementById('cart-count').textContent = cart.length;
    
    let total = 0;
    itemsDiv.innerHTML = cart.map(item => {
        total += parseFloat(item.price_per_night);
        return `
            <div class="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span class="font-semibold text-slate-700 truncate mr-2">${item.name}</span>
                <div class="flex items-center gap-3">
                    <span class="font-bold text-emerald-800">RM${parseFloat(item.price_per_night).toFixed(2)}</span>
                    <button onclick="removeFromCart('${item.cartKey || item.id}')" class="text-slate-400 hover:text-rose-500 transition"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

async function openCheckout() {
    if (cart.length === 0) return;
    
    document.getElementById('modal-room-name').innerHTML = `<i class="fa-solid fa-chevron-right text-emerald-400 mx-2 text-xs"></i> ${cart.length} Aktiviti Terpilih`;
    document.getElementById('booking-form').reset();
    document.getElementById('booking-modal').classList.remove('hidden');
    
    // Populate Bahagian C summary
    let modalTotal = 0;
    document.getElementById('modal-cart-summary').innerHTML = cart.map(item => {
        modalTotal += parseFloat(item.price_per_night);
        return `<div class="flex justify-between items-center"><span>${item.name}</span><span class="font-bold">RM${parseFloat(item.price_per_night).toFixed(2)}</span></div>`;
    }).join('');
    document.getElementById('modal-cart-total').textContent = modalTotal.toFixed(2);


    if(checkinPicker) checkinPicker.destroy();
    
    // Fetch conflicts for ALL items in cart
    let allConflicts = [];
    try {
        for (const item of cart) {
            const roomId = parseInt(item.room_id || item.id);
            if (!isNaN(roomId)) {
                const res = await fetch(`/api/rooms/${roomId}/booked-dates`);
                const data = await res.json();
                if (data && data.dates) {
                    allConflicts = [...allConflicts, ...data.dates];
                }
            }
        }
    } catch(e) {}
    
    checkinPicker = flatpickr("#f-checkin", {
        minDate: "today",
        disable: allConflicts,
        onChange: function(selectedDates, dateStr, instance) {
            // No longer directly setting checkout here because we handle it in submit
        }
    });
}

document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('booking-modal').classList.add('hidden');
});

document.getElementById('booking-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if(cart.length === 0) return;

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghantar...';

    const genderNode = document.querySelector('input[name="f-gender"]:checked');
    const kategori = document.getElementById('f-category').value;
    const groupName = document.getElementById('f-groupname').value;
    
    const checkinVal = document.getElementById('f-checkin').value;
    const checkoutDateObj = new Date(checkinVal);
    checkoutDateObj.setDate(checkoutDateObj.getDate() + 1);
    const checkoutStr = checkoutDateObj.toISOString().split('T')[0];
    
    let allSuccess = true;
    let errorMsg = '';
    let bookedRefs = [];
    let bookedNames = [];

    // Loop and post each cart item
    for (const item of cart) {
        const payload = {
            room_id: parseInt(item.room_id || item.id),
            room_name: item.name,
            total_price: item.price_per_night,
            checkin_date: checkinVal,
            checkout_date: checkoutStr,
            guest_name: document.getElementById('f-name').value,
            guest_phone: document.getElementById('f-phone').value,
            num_guests: parseInt(item.num_guests) || 1, 
            special_requests: `Kategori: ${kategori} (${groupName}) | ${item.packageName ? `Pakej: ${item.packageName} | ` : ''}${item.groups ? `Jumlah Kumpulan: ${item.groups} | ` : ''}${item.num_guests ? `Bilangan: ${item.num_guests} ${item.unit || 'orang'} | ` : ''}Sesi: ${document.getElementById('f-session').value} | IC: ${document.getElementById('f-ic').value} | Umur: ${document.getElementById('f-age').value} | Jantina: ${genderNode ? genderNode.value : ''} | Emel: ${document.getElementById('f-email').value} | Alamat: ${document.getElementById('f-address').value} | Waris: ${document.getElementById('f-emg-name').value} (${document.getElementById('f-emg-relation').value} - ${document.getElementById('f-emg-phone').value}) | Kesihatan: ${document.getElementById('f-health').value}`
        };

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                bookedRefs.push(data.booking.booking_ref);
                bookedNames.push(item.name);
            } else {
                allSuccess = false;
                errorMsg = data.error || data.message || 'Ralat tempahan.';
                break; // Stop if one fails
            }
        } catch (err) {
            console.warn('Pelayan API luar talian atau pelayan statik, menjana rujukan tempahan setempat:', err);
            const fallbackRef = 'TERB-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000);
            bookedRefs.push(fallbackRef);
            bookedNames.push(item.name);
            allSuccess = true;
        }
    }

    if (allSuccess && bookedRefs.length > 0) {
        document.getElementById('booking-modal').classList.add('hidden');
        
        // Show success modal
        document.getElementById('success-ref').textContent = bookedRefs.join(', ');
        document.getElementById('success-room').textContent = bookedNames.join(', ');
        document.getElementById('success-checkin').textContent = checkinVal;
        document.getElementById('success-checkout').textContent = '-';
        document.getElementById('success-nights').textContent = cart.some(i => i.num_guests && i.num_guests > 1) ? cart.map(i => (i.num_guests || 1) + ' ' + (i.unit || 'Orang') + (i.groups ? ` (${i.groups} Kumpulan)` : '')).join(', ') : '1 Individu';
        
        let totalCartPrice = cart.reduce((sum, item) => sum + parseFloat(item.price_per_night), 0);
        document.getElementById('success-total').textContent = 'RM' + totalCartPrice.toFixed(2);
        
        // Build whatsapp message
        const waMsg = `Salam Taman Eko Rimba Berkelah Pahang, saya telah membuat pendaftaran pelbagai aktiviti.
Rujukan: *${bookedRefs.join(', ')}*
Aktiviti: ${bookedNames.join(', ')}
Nama: ${document.getElementById('f-name').value}
Kumpulan: ${kategori} (${groupName})
Sesi: ${document.getElementById('f-session').value}
Tarikh: ${checkinVal}
Jumlah Harga: RM${totalCartPrice.toFixed(2)}
Bank Pilihan (FPX): ${document.getElementById('f-bank').value}
Sila sahkan pendaftaran dan status bayaran saya. Terima kasih.`;
        
        document.getElementById('btn-wa-confirm').href = `https://wa.me/60194489296?text=${encodeURIComponent(waMsg)}`;
        document.getElementById('success-modal').classList.remove('hidden');
        
        clearCart(); // Clear the cart after success
    } else {
        alert('Ralat pada aktiviti ' + bookedNames.length + 1 + ': ' + errorMsg);
    }

    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Hantar Borang / Submit';
});

// ──── BOOKING LOOKUP ────
document.getElementById('btn-lookup').addEventListener('click', async () => {
    const ref = document.getElementById('lookup-ref').value.trim().toUpperCase();
    if (!ref) return;
    const div = document.getElementById('lookup-result');
    div.classList.remove('hidden');
    div.innerHTML = `<div class="text-slate-400 text-sm py-3 text-center"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Mencari maklumat tempahan...</div>`;
    try {
        const res = await fetch(`/api/bookings/${encodeURIComponent(ref)}`);
        if (!res.ok) {
            div.innerHTML = `<div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm text-center shadow-sm"><i class="fa-solid fa-circle-xmark mr-2 text-rose-500"></i>Tempahan tidak dijumpai untuk rujukan <strong>${ref}</strong>. Sila semak semula nombor rujukan anda.</div>`;
        } else {
            const b = await res.json();
            const statusColor = b.status === 'Menunggu Pengesahan' ? 'bg-amber-100 text-amber-800 border-amber-200' : b.status === 'Disahkan' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-rose-100 text-rose-800 border-rose-200';
            div.innerHTML = `
                <div class="bg-white border border-slate-200 rounded-2xl p-5 text-sm shadow-md text-left transition-all">
                    <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                        <div>
                            <span class="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Nombor Rujukan</span>
                            <p class="font-extrabold text-slate-900 text-lg">${b.booking_ref}</p>
                            <p class="text-emerald-700 font-bold text-sm mt-0.5">${b.room_name}</p>
                        </div>
                        <span class="px-3 py-1 rounded-full text-xs font-extrabold border ${statusColor}">${b.status}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-3 text-xs text-slate-700 mb-4">
                        <div class="bg-slate-50 p-2.5 rounded-lg"><span class="text-slate-400 block mb-0.5">Nama Tetamu:</span><strong class="text-slate-900">${b.guest_name}</strong></div>
                        <div class="bg-slate-50 p-2.5 rounded-lg"><span class="text-slate-400 block mb-0.5">No. Telefon:</span><strong class="text-slate-900">${b.guest_phone}</strong></div>
                        <div class="bg-slate-50 p-2.5 rounded-lg"><span class="text-slate-400 block mb-0.5">Tarikh Masuk:</span><strong class="text-slate-900">${b.checkin_date}</strong></div>
                        <div class="bg-slate-50 p-2.5 rounded-lg"><span class="text-slate-400 block mb-0.5">Tarikh Keluar:</span><strong class="text-slate-900">${b.checkout_date || '-'}</strong></div>
                        <div class="bg-slate-50 p-2.5 rounded-lg"><span class="text-slate-400 block mb-0.5">Bilangan Tetamu:</span><strong class="text-slate-900">${b.num_guests} orang</strong></div>
                        <div class="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100"><span class="text-emerald-700 block mb-0.5">Jumlah Bayaran:</span><strong class="text-emerald-900 text-sm">RM${parseFloat(b.total_price).toFixed(2)}</strong></div>
                    </div>
                    <div class="text-center pt-2">
                        <a href="https://wa.me/60194489296?text=Salam%20Taman%20Eko%20Rimba%20Berkelah,%20saya%20ingin%20bertanya%20tentang%20status%20tempahan%20saya%20*${b.booking_ref}*" 
                            target="_blank" class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm">
                            <i class="fa-brands fa-whatsapp text-sm"></i> Hubungi Pengurusan (WhatsApp)
                        </a>
                    </div>
                </div>`;
        }
    } catch { 
        div.innerHTML = `<div class="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-700 text-sm text-center"><i class="fa-solid fa-triangle-exclamation mr-2"></i>Ralat menyambung ke pelayan. Sila cuba sebentar lagi.</div>`; 
    }
});

document.getElementById('lookup-ref').addEventListener('keydown', (e) => { 
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('btn-lookup').click(); 
    }
});

// Mobile menu
document.getElementById('mobile-menu-btn').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('hidden');
});

// Init
loadRooms();