let allBookings = [];
let currentViewMode = 'individual'; // 'individual' | 'grouped'

// 1. Muat Turun Data dari Server
async function loadBookings() {
    document.getElementById('booking-count-label').textContent = 'Memuatkan data terkini...';
    try {
        const res = await fetch('/api/admin/bookings');
        allBookings = await res.json();
        updateStats(allBookings);
        applyFiltersAndRender();
    } catch(e) {
        document.getElementById('bookings-tbody').innerHTML = `<tr><td colspan="7" class="text-center py-8 text-rose-500 font-bold">Gagal memuatkan data dari pelayan. Sila cuba lagi.</td></tr>`;
    }
}

// 2. Statistik Dashboard
function updateStats(bookings) {
    document.getElementById('stat-total').textContent = bookings.length;
    document.getElementById('stat-pending').textContent = bookings.filter(b => b.status === 'Menunggu Pengesahan' || b.status === 'Menunggu').length;
    document.getElementById('stat-confirmed').textContent = bookings.filter(b => b.status === 'Disahkan').length;
    const revenue = bookings.filter(b => b.status !== 'Dibatalkan').reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    document.getElementById('stat-revenue').textContent = revenue.toFixed(2);
    
    // Update counts on switcher
    const grouped = getGroupedBookings(bookings);
    document.getElementById('count-individual').textContent = bookings.length;
    document.getElementById('count-grouped').textContent = grouped.length;
}

// 3. Helper Pengelompokan: Asingkan mengikut TETAMU & TARIKH TEMPAHAN (Check-in Date)
function getGuestId(b) {
    if (!b) return '';
    const phone = (b.guest_phone || '').replace(/[^0-9]/g, '');
    if (phone.length >= 8) return phone;
    return (b.guest_name || '').trim().toLowerCase();
}

// Kunci penyata gabungan berasaskan Tetamu + Tarikh Masuk (Trip yang sama)
function getStatementKey(b) {
    if (!b) return '';
    const gid = getGuestId(b);
    const checkin = (b.checkin_date || '').trim();
    return `${gid}__${checkin}`;
}

// Mengira berapa banyak tempahan untuk tarikh & tetamu yang SAMA
function getStatementBookingCount(b) {
    const key = getStatementKey(b);
    return allBookings.filter(x => getStatementKey(x) === key).length;
}

// Kumpulkan mengikut Tetamu & Tarikh supaya tidak bercampur tarikh berlainan
function getGroupedBookings(bookingsList) {
    const map = new Map();
    bookingsList.forEach(b => {
        const key = getStatementKey(b);
        if (!map.has(key)) {
            map.set(key, {
                statement_key: key,
                guest_id: getGuestId(b),
                guest_name: b.guest_name || 'Tetamu',
                guest_phone: b.guest_phone || '-',
                guest_email: (b.guest_email && b.guest_email !== '-') ? b.guest_email : '',
                guest_ic: (b.guest_ic && b.guest_ic !== '-') ? b.guest_ic : '',
                checkin_date: b.checkin_date || '-',
                checkout_date: b.checkout_date || '-',
                num_nights: b.num_nights || 1,
                bookings: [],
                total_amount: 0,
                special_requests: []
            });
        }
        const g = map.get(key);
        g.bookings.push(b);
        g.total_amount += parseFloat(b.total_price || 0);
        if (b.special_request && !g.special_requests.includes(b.special_request)) {
            g.special_requests.push(b.special_request);
        }
        // Gunakan nama & IC terkini jika ada
        if ((!g.guest_name || g.guest_name === 'Tetamu') && b.guest_name) g.guest_name = b.guest_name;
        if (!g.guest_email && b.guest_email && b.guest_email !== '-') g.guest_email = b.guest_email;
        if (!g.guest_ic && b.guest_ic && b.guest_ic !== '-') g.guest_ic = b.guest_ic;
    });
    return Array.from(map.values());
}

// 4. Tukar Mod Paparan (Individual vs Grouped)
function setViewMode(mode) {
    currentViewMode = mode;
    const btnInd = document.getElementById('btn-mode-individual');
    const btnGrp = document.getElementById('btn-mode-grouped');
    
    if (mode === 'individual') {
        btnInd.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-emerald-900 shadow-sm';
        btnGrp.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900';
    } else {
        btnGrp.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-white text-emerald-900 shadow-sm';
        btnInd.className = 'px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900';
    }
    applyFiltersAndRender();
}

// 5. Penapis & Carian
function applyFiltersAndRender() {
    const q = (document.getElementById('search-input').value || '').trim().toLowerCase();
    const v = document.getElementById('filter-status').value;
    
    const helperTag = document.getElementById('filter-helper-tag');
    if (q) {
        helperTag.classList.remove('hidden');
        document.getElementById('filtered-guest-name').textContent = q;
    } else {
        helperTag.classList.add('hidden');
    }

    let filtered = allBookings.filter(b => {
        const matchStatus = !v || b.status === v;
        const matchQuery = !q || 
            (b.guest_name && b.guest_name.toLowerCase().includes(q)) || 
            (b.guest_phone && b.guest_phone.includes(q)) || 
            (b.booking_ref && b.booking_ref.toLowerCase().includes(q)) ||
            (b.checkin_date && b.checkin_date.includes(q)) ||
            (b.room_name && b.room_name.toLowerCase().includes(q));
        return matchStatus && matchQuery;
    });

    renderTable(filtered);
}

function clearGuestFilter() {
    document.getElementById('search-input').value = '';
    applyFiltersAndRender();
}

function filterByGuest(phoneOrName) {
    document.getElementById('search-input').value = phoneOrName;
    applyFiltersAndRender();
}

// 6. Badges & Format Status
function statusBadge(status) {
    if (status === 'Disahkan') {
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Disahkan</span>`;
    } else if (status === 'Menunggu Pengesahan' || status === 'Menunggu') {
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Menunggu</span>`;
    } else if (status === 'Dibatalkan') {
        return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Batal</span>`;
    }
    return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">${status}</span>`;
}

// 7. Render Jadual Mengikut Mod Paparan
function renderTable(bookings) {
    const thead = document.getElementById('bookings-thead');
    const tbody = document.getElementById('bookings-tbody');
    const footer = document.getElementById('table-footer');
    
    if (currentViewMode === 'individual') {
        // --- MOD A: SEMUA TEMPAHAN INDIVIDU ---
        thead.innerHTML = `
            <tr>
                <th class="px-2.5 py-3 text-left font-bold text-slate-900 w-[95px]">Rujukan</th>
                <th class="px-2 py-3 text-left font-bold">Bilik / Aktiviti</th>
                <th class="px-2 py-3 text-left font-bold">Tetamu</th>
                <th class="px-2 py-3 text-left font-bold w-[130px]">Tarikh & Tempoh</th>
                <th class="px-2 py-3 text-right font-bold w-[90px]">Jumlah</th>
                <th class="px-2 py-3 text-center font-bold w-[105px]">Status</th>
                <th class="px-2 py-3 text-center font-bold w-[95px]">Tindakan</th>
            </tr>
        `;
        document.getElementById('booking-count-label').textContent = `${bookings.length} rekod tempahan ditemui`;
        footer.textContent = `Jumlah: ${bookings.length} rekod | Terakhir dikemas kini: ${new Date().toLocaleTimeString('ms-MY')}`;

        if (!bookings.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-400"><i class="fa-solid fa-inbox text-3xl mb-2 block"></i>Tiada rekod tempahan dijumpai.</td></tr>`;
            return;
        }

        tbody.innerHTML = bookings.map(b => {
            const cleanRoom = (b.room_name || '').replace(/^TEMPAHAN\s+/i, '').replace(/TAPAK KENDERAAN RV \/ CARAVAN \/ CAMPERVAN/i, 'TAPAK RV / CARAVAN');
            const stmtCount = getStatementBookingCount(b);
            const stmtKey = getStatementKey(b);

            return `
            <tr class="hover:bg-emerald-50/50 cursor-pointer transition-colors border-b border-slate-100" onclick="showDetail('${b.booking_ref}')">
                <td class="px-2.5 py-3 font-mono text-xs text-emerald-800 font-bold align-middle">
                    <span class="bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-200 font-extrabold inline-block shadow-xs">${b.booking_ref}</span>
                </td>
                <td class="px-2 py-3 font-bold text-slate-800 align-middle">
                    <span class="block leading-tight text-xs sm:text-sm">${cleanRoom}</span>
                </td>
                <td class="px-2 py-3 align-middle">
                    <p class="font-bold text-slate-900 leading-tight text-xs sm:text-sm">${b.guest_name}</p>
                    <p class="text-slate-500 text-xs mt-0.5">${b.guest_phone} · <span class="text-emerald-700 font-semibold">${b.num_guests} org</span></p>
                    ${stmtCount > 1 ? `
                    <div class="mt-1">
                        <button onclick="event.stopPropagation(); showStatementModal('${stmtKey}')"
                            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition shadow-xs"
                            title="Tetamu ini membuat ${stmtCount} tempahan untuk tarikh ${b.checkin_date}. Klik untuk lihat penyata!">
                            <i class="fa-solid fa-layer-group text-amber-700"></i> ${stmtCount} Tempahan (${b.checkin_date})
                        </button>
                    </div>` : ''}
                </td>
                <td class="px-2 py-3 text-xs text-slate-700 align-middle">
                    <div class="font-bold text-slate-800">${b.checkin_date}</div>
                    <div class="text-[11px] text-slate-400 mt-0.5">hingga ${b.checkout_date} <span class="text-slate-600 font-medium">(${b.num_nights} mlm)</span></div>
                </td>
                <td class="px-2 py-3 text-right font-black text-emerald-800 text-xs sm:text-sm align-middle whitespace-nowrap">
                    RM${parseFloat(b.total_price).toFixed(2)}
                </td>
                <td class="px-2 py-3 text-center align-middle">
                    ${statusBadge(b.status)}
                </td>
                <td class="px-2 py-3 text-center align-middle">
                    <div class="flex justify-center items-center gap-1">
                        <a href="https://wa.me/${(b.guest_phone||'').replace(/[^0-9]/g,'').replace(/^0/,'60')}?text=Salam%20${encodeURIComponent(b.guest_name)},%20tempahan%20anda%20*${b.booking_ref}*%20telah%20kami%20terima.%20Status%20semasa:%20${encodeURIComponent(b.status)}." 
                           target="_blank" onclick="event.stopPropagation()"
                           class="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs transition shadow-xs border border-emerald-200" title="WhatsApp Tetamu">
                            <i class="fa-brands fa-whatsapp text-sm"></i>
                        </a>
                        ${b.status !== 'Disahkan' ? `
                        <button onclick="event.stopPropagation();updateStatus('${b.booking_ref}','Disahkan')"
                            class="w-7 h-7 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 flex items-center justify-center text-xs transition shadow-xs border border-blue-200" title="Sahkan">
                            <i class="fa-solid fa-check"></i>
                        </button>` : ''}
                        ${b.status !== 'Dibatalkan' ? `
                        <button onclick="event.stopPropagation();cancelBooking('${b.booking_ref}')"
                            class="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center text-xs transition shadow-xs border border-rose-200" title="Batal">
                            <i class="fa-solid fa-xmark"></i>
                        </button>` : ''}
                    </div>
                </td>
            </tr>
            `;
        }).join('');

    } else {
        // --- MOD B: PENYATA MENGIKUT TETAMU & TARIKH (SEPARATED BY TRIP DATE) ---
        thead.innerHTML = `
            <tr>
                <th class="px-2.5 py-3 text-left font-bold text-slate-900 w-[150px]">Tetamu & Telefon</th>
                <th class="px-2 py-3 text-left font-bold w-[130px]">Tarikh Lawatan</th>
                <th class="px-2 py-3 text-left font-bold">Aktiviti & Bil. Tempahan</th>
                <th class="px-2 py-3 text-left font-bold w-[130px]">No. Rujukan</th>
                <th class="px-2 py-3 text-right font-bold w-[95px]">Jumlah Bersatu</th>
                <th class="px-2 py-3 text-center font-bold w-[110px]">Status Penyata</th>
                <th class="px-2 py-3 text-center font-bold w-[95px]">Tindakan</th>
            </tr>
        `;

        const grouped = getGroupedBookings(bookings);
        document.getElementById('booking-count-label').textContent = `${grouped.length} penyata tetamu & tarikh ditemui (${bookings.length} aktiviti)`;
        footer.textContent = `Jumlah Penyata: ${grouped.length} | Keseluruhan Tempahan: ${bookings.length} | Terakhir: ${new Date().toLocaleTimeString('ms-MY')}`;

        if (!grouped.length) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-400"><i class="fa-solid fa-inbox text-3xl mb-2 block"></i>Tiada penyata tempahan dijumpai.</td></tr>`;
            return;
        }

        tbody.innerHTML = grouped.map(g => {
            const pendingCount = g.bookings.filter(b => b.status === 'Menunggu Pengesahan' || b.status === 'Menunggu').length;
            const confirmedCount = g.bookings.filter(b => b.status === 'Disahkan').length;
            
            let statusMarkup = '';
            if (pendingCount > 0) {
                statusMarkup = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Menunggu (${pendingCount})</span>`;
            } else if (confirmedCount === g.bookings.length) {
                statusMarkup = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Disahkan Semua (${g.bookings.length})</span>`;
            } else {
                statusMarkup = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Pelbagai (${g.bookings.length})</span>`;
            }

            // Ringkasan aktiviti
            const roomsList = g.bookings.map(b => (b.room_name || '').replace(/^TEMPAHAN\s+/i, '').replace(/TAPAK KENDERAAN RV \/ CARAVAN \/ CAMPERVAN/i, 'RV / Caravan'));
            const roomSummary = roomsList.slice(0, 2).join(', ') + (roomsList.length > 2 ? ` (+${roomsList.length - 2} lagi)` : '');
            
            // Senarai rujukan
            const refsSummary = g.bookings.slice(0, 2).map(b => `<span class="bg-emerald-50 text-emerald-900 border border-emerald-200 px-1.5 py-0.5 rounded font-mono text-[11px] font-bold inline-block mr-1">${b.booking_ref}</span>`).join('') + 
                (g.bookings.length > 2 ? `<span class="text-[10px] text-slate-500 font-bold">+${g.bookings.length - 2} lagi</span>` : '');

            return `
            <tr class="hover:bg-amber-50/40 cursor-pointer transition-colors border-b border-slate-100" onclick="showStatementModal('${g.statement_key}')">
                <td class="px-2.5 py-3 align-middle">
                    <p class="font-extrabold text-slate-900 leading-tight text-xs sm:text-sm">${g.guest_name}</p>
                    <p class="text-slate-500 text-xs mt-0.5">${g.guest_phone}</p>
                    ${g.guest_ic ? `<p class="text-[10px] text-slate-400 font-mono">IC: ${g.guest_ic}</p>` : ''}
                </td>
                <td class="px-2 py-3 text-xs text-slate-700 align-middle">
                    <div class="font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 text-center font-mono">
                        ${g.checkin_date}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5 text-center">hingga ${g.checkout_date} (${g.num_nights} mlm)</div>
                </td>
                <td class="px-2 py-3 align-middle">
                    <div class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-900 mb-1">
                        <i class="fa-solid fa-layer-group text-emerald-700"></i> ${g.bookings.length} Tempahan Dibuat
                    </div>
                    <p class="text-xs text-slate-700 leading-tight font-medium">${roomSummary}</p>
                </td>
                <td class="px-2 py-3 align-middle font-mono text-xs">
                    ${refsSummary}
                </td>
                <td class="px-2 py-3 text-right font-black text-emerald-800 text-xs sm:text-sm align-middle whitespace-nowrap">
                    RM${g.total_amount.toFixed(2)}
                </td>
                <td class="px-2 py-3 text-center align-middle">
                    ${statusMarkup}
                </td>
                <td class="px-2 py-3 text-center align-middle">
                    <div class="flex justify-center items-center gap-1.5">
                        <button onclick="event.stopPropagation(); showStatementModal('${g.statement_key}')"
                            class="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1" title="Lihat Penyata Tarikh Ini">
                            <i class="fa-solid fa-file-invoice"></i> Penyata
                        </button>
                    </div>
                </td>
            </tr>
            `;
        }).join('');
    }
}

// 8. Buka Modal Penyata Lengkap (Mengikut Tetamu & Tarikh Tertentu)
function showStatementModal(statementKey) {
    const related = allBookings.filter(b => getStatementKey(b) === statementKey);
    if (!related.length) return;
    renderUnifiedStatementModal(related);
}

function showDetail(ref) {
    const target = allBookings.find(x => x.booking_ref === ref);
    if (!target) return;
    const stmtKey = getStatementKey(target);
    const related = allBookings.filter(b => getStatementKey(b) === stmtKey);
    renderUnifiedStatementModal(related, ref);
}

// 9. Render Kandungan Modal Penyata Gabungan (HANYA BAGI TARIKH TEMPAHAN INI)
function renderUnifiedStatementModal(bookingsList, highlightRef = null) {
    const first = bookingsList[0];
    const guestName = first.guest_name;
    const guestPhone = first.guest_phone;
    const guestId = getGuestId(first);
    const stmtKey = getStatementKey(first);
    const totalAmount = bookingsList.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
    const isMulti = bookingsList.length > 1;

    document.getElementById('modal-title').textContent = isMulti ? `Penyata Gabungan Tempahan Tetamu` : `Butiran Lengkap Tempahan`;
    document.getElementById('modal-subtitle').textContent = `Tarikh: ${first.checkin_date} hingga ${first.checkout_date} (${first.num_nights} mlm) · ${guestName}`;

    // Maklumat Tetamu & Banner Tarikh
    let contentHtml = `
        <div class="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-xl p-4 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <span class="text-[11px] uppercase font-bold tracking-wider text-emerald-300">Penyata Rasmi Tempahan (Tarikh: ${first.checkin_date})</span>
                    <h4 class="text-lg font-black leading-tight">${guestName}</h4>
                    <p class="text-xs text-emerald-200 mt-0.5"><i class="fa-solid fa-phone mr-1"></i>${guestPhone} ${first.guest_ic && first.guest_ic !== '-' ? ` · <span class="font-mono">IC: ${first.guest_ic}</span>` : ''}</p>
                </div>
                <div class="text-right">
                    <span class="text-xs text-emerald-200 block">Jumlah Bersatu Tarikh Ini</span>
                    <span class="text-xl font-black text-amber-300">RM${totalAmount.toFixed(2)}</span>
                    <span class="text-[11px] text-emerald-200 block mt-0.5">${bookingsList.length} Aktiviti Ditempah</span>
                </div>
            </div>
        </div>
    `;

    // Semak jika tetamu ini ada rekod tempahan pada tarikh BERBEZA (supaya admin tahu sejarah mereka)
    const otherBookings = allBookings.filter(x => getGuestId(x) === guestId && getStatementKey(x) !== stmtKey);
    if (otherBookings.length > 0) {
        const otherDates = [...new Set(otherBookings.map(x => x.checkin_date))];
        contentHtml += `
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-2.5 text-xs text-blue-900 flex items-center justify-between mt-2">
                <div>
                    <i class="fa-solid fa-clock-rotate-left mr-1.5 text-blue-600"></i>
                    <strong>Nota:</strong> Tetamu ini juga mempunyai <strong>${otherBookings.length} tempahan lain</strong> pada tarikh berbeza (${otherDates.join(', ')}). Penyata ini diasingkan mengikut tarikh lawatan.
                </div>
                <button onclick="filterByGuest('${guestPhone || guestName}')" class="px-2.5 py-1 bg-white hover:bg-blue-100 rounded-lg text-blue-800 font-bold border border-blue-300 text-[11px] shadow-xs flex-shrink-0 ml-2">
                    Tapis Semua Rekod
                </button>
            </div>
        `;
    }

    // Jika lebih daripada 1 tempahan bagi tarikh ini: Paparkan Jadual Itemized
    if (isMulti) {
        contentHtml += `
            <div class="border border-slate-200 rounded-xl overflow-hidden mt-3 shadow-xs">
                <div class="bg-slate-100 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <span class="font-bold text-slate-800 text-xs"><i class="fa-solid fa-list-check text-emerald-700 mr-1.5"></i>Perincian Item Tempahan Tarikh ${first.checkin_date}:</span>
                    <span class="text-[11px] font-semibold text-slate-500">${bookingsList.length} Item</span>
                </div>
                <div class="divide-y divide-slate-100 max-h-60 overflow-y-auto">
        `;

        bookingsList.forEach((b, idx) => {
            const cleanRoom = (b.room_name || '').replace(/^TEMPAHAN\s+/i, '');
            const isHighlight = highlightRef && b.booking_ref === highlightRef;
            contentHtml += `
                <div class="p-3 text-xs flex flex-wrap items-center justify-between gap-2 ${isHighlight ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-slate-50'}">
                    <div class="flex-1 min-w-[180px]">
                        <div class="flex items-center gap-2">
                            <span class="font-mono font-extrabold text-emerald-900 bg-emerald-100/70 border border-emerald-200 px-1.5 py-0.5 rounded text-[11px]">${b.booking_ref}</span>
                            <span class="font-extrabold text-slate-900">${cleanRoom}</span>
                        </div>
                        <div class="text-slate-500 text-[11px] mt-1">
                            <i class="fa-regular fa-calendar text-slate-400 mr-1"></i>${b.checkin_date} hingga ${b.checkout_date} (${b.num_nights} mlm) · <span class="font-semibold text-slate-700">${b.num_guests} tetamu</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="text-right">
                            <span class="font-black text-slate-900 block">RM${parseFloat(b.total_price).toFixed(2)}</span>
                            <div>${statusBadge(b.status)}</div>
                        </div>
                        ${b.status !== 'Disahkan' ? `
                        <button onclick="event.stopPropagation();updateStatus('${b.booking_ref}','Disahkan')"
                            class="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition border border-blue-200" title="Sahkan item ini">
                            <i class="fa-solid fa-check"></i>
                        </button>` : ''}
                    </div>
                </div>
            `;
        });

        contentHtml += `
                </div>
                <div class="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span class="font-extrabold text-slate-700">JUMLAH KESELURUHAN TARIKH INI:</span>
                    <span class="font-black text-sm text-emerald-800">RM${totalAmount.toFixed(2)}</span>
                </div>
            </div>
        `;
    } else {
        // Jika hanya 1 tempahan sahaja pada tarikh ini: Paparan butiran tunggal
        contentHtml += `
            <div class="grid grid-cols-2 gap-2.5 mt-2">
                <div class="bg-slate-50 rounded-lg p-3"><p class="text-xs text-slate-400 mb-0.5">Bilik / Aktiviti</p><p class="font-bold text-slate-800">${first.room_name}</p></div>
                <div class="bg-slate-50 rounded-lg p-3"><p class="text-xs text-slate-400 mb-0.5">No. Rujukan</p><p class="font-mono font-bold text-emerald-800">${first.booking_ref}</p></div>
                <div class="bg-slate-50 rounded-lg p-3"><p class="text-xs text-slate-400 mb-0.5">Tarikh Masuk</p><p class="font-bold text-slate-800">${first.checkin_date}</p></div>
                <div class="bg-slate-50 rounded-lg p-3"><p class="text-xs text-slate-400 mb-0.5">Tarikh Keluar</p><p class="font-bold text-slate-800">${first.checkout_date} (${first.num_nights} mlm)</p></div>
                <div class="bg-slate-50 rounded-lg p-3"><p class="text-xs text-slate-400 mb-0.5">Bilangan Tetamu</p><p class="font-bold text-slate-800">${first.num_guests} orang</p></div>
                <div class="bg-slate-50 rounded-lg p-3"><p class="text-xs text-slate-400 mb-0.5">Status Semasa</p><div>${statusBadge(first.status)}</div></div>
            </div>
        `;
    }

    // Paparkan permintaan khas
    const requests = bookingsList.map(b => b.special_request).filter(Boolean);
    if (requests.length > 0) {
        contentHtml += `
            <div class="bg-slate-50 rounded-lg p-3 mt-2 border border-slate-200">
                <p class="text-xs font-bold text-slate-500 mb-1"><i class="fa-solid fa-notes-medical text-amber-600 mr-1"></i>Maklumat Tambahan / Permintaan Khas Tetamu:</p>
                <p class="text-xs text-slate-700 whitespace-pre-wrap">${requests[0]}</p>
            </div>
        `;
    }

    document.getElementById('detail-content').innerHTML = contentHtml;

    // Sediakan Mesej WhatsApp Penyata Lengkap (Khusus untuk tarikh ini sahaja)
    let waMessage = `Salam ${guestName},\n\nBerikut adalah *PENYATA RASMI TEMPAHAN* anda di *Taman Eko Rimba Berkelah Pahang* bagi tarikh *${first.checkin_date} hingga ${first.checkout_date}*:\n\n`;
    bookingsList.forEach((b, idx) => {
        const cleanRoom = (b.room_name || '').replace(/^TEMPAHAN\s+/i, '');
        waMessage += `${idx + 1}. *${cleanRoom}*\n   - No. Rujukan: ${b.booking_ref}\n   - Tarikh: ${b.checkin_date} hingga ${b.checkout_date}\n   - Status: ${b.status}\n   - Harga: RM${parseFloat(b.total_price).toFixed(2)}\n\n`;
    });
    waMessage += `*JUMLAH KESELURUHAN (Tarikh Ini):* RM${totalAmount.toFixed(2)}\n\nTerima kasih kerana memilih Taman Eko Rimba Berkelah Pahang! Jumpa anda di sana.`;

    const pendingCount = bookingsList.filter(b => b.status !== 'Disahkan').length;

    // Butang Tindakan Bersepadu
    document.getElementById('detail-actions').innerHTML = `
        <a href="https://wa.me/${guestPhone.replace(/[^0-9]/g,'').replace(/^0/,'60')}?text=${encodeURIComponent(waMessage)}" 
            target="_blank" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-sm" title="Hantar ringkasan penyata tarikh ini ke WhatsApp tetamu">
            <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp Penyata
        </a>
        <button onclick="downloadStatementPDF('${stmtKey}')"
            class="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-sm" title="Muat turun fail PDF penyata rasmi bagi tarikh ini">
            <i class="fa-solid fa-file-pdf text-sm"></i> Penyata PDF
        </button>
        ${pendingCount > 0 ? `
        <button onclick="confirmAllForStatement('${stmtKey}')"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-xs shadow-sm" title="Sahkan semua ${pendingCount} tempahan bagi tarikh ini">
            <i class="fa-solid fa-check-double text-sm"></i> Sahkan Semua (${pendingCount})
        </button>` : ''}
        <button onclick="document.getElementById('detail-modal').classList.add('hidden')" 
            class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition text-xs">
            Tutup
        </button>
    `;

    document.getElementById('detail-modal').classList.remove('hidden');
}

// 10. Sahkan Semua Tempahan Bagi Satu Penyata Tarikh (Batch Confirm)
async function confirmAllForStatement(statementKey) {
    const related = allBookings.filter(b => getStatementKey(b) === statementKey && b.status !== 'Disahkan');
    if (!related.length) return alert('Semua tempahan bagi tarikh ini telah pun disahkan.');
    if (!confirm(`Sahkan kesemua ${related.length} tempahan bagi tarikh ini serentak?`)) return;

    for (const b of related) {
        await fetch(`/api/bookings/${b.booking_ref}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Disahkan' })
        });
    }

    document.getElementById('detail-modal').classList.add('hidden');
    await loadBookings();
}

// 11. Muat Turun PDF Penyata Rasmi Bagi Tarikh Tertentu
function downloadStatementPDF(statementKey) {
    const related = allBookings.filter(b => getStatementKey(b) === statementKey);
    if (!related.length) return;

    const first = related[0];
    const totalAmount = related.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('portrait');

    // Header Rasmi
    doc.setFontSize(18);
    doc.setTextColor(6, 78, 59); // Emerald 900
    doc.text('TAMAN EKO RIMBA BERKELAH PAHANG', 14, 18);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('PENYATA RASMI & RESIT TEMPAHAN PELANGGAN', 14, 25);

    // Garisan pemisah
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 28, 196, 28);

    // Maklumat Pelanggan & Penyata
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Nama Pelanggan  : ${first.guest_name}`, 14, 35);
    doc.text(`No. Telefon     : ${first.guest_phone}`, 14, 41);
    doc.text(`Tarikh Lawatan  : ${first.checkin_date} hingga ${first.checkout_date} (${first.num_nights} malam)`, 14, 47);

    const tarikhCetak = new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
    doc.text(`Tarikh Dijana   : ${tarikhCetak}`, 130, 35);
    doc.text(`Bil. Tempahan   : ${related.length} Aktiviti`, 130, 41);
    doc.text(`Jumlah Bersih   : RM${totalAmount.toFixed(2)}`, 130, 47);

    // Jadual Item Penyata
    const columns = [
        { header: '#', dataKey: 'no' },
        { header: 'No. Rujukan', dataKey: 'ref' },
        { header: 'Bilik / Aktiviti', dataKey: 'room' },
        { header: 'Tarikh Masuk', dataKey: 'checkin' },
        { header: 'Tarikh Keluar', dataKey: 'checkout' },
        { header: 'Malam', dataKey: 'nights' },
        { header: 'Tetamu', dataKey: 'guests' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Jumlah (RM)', dataKey: 'price' }
    ];

    const rows = related.map((b, idx) => ({
        no: idx + 1,
        ref: b.booking_ref,
        room: (b.room_name || '').replace(/^TEMPAHAN\s+/i, ''),
        checkin: b.checkin_date,
        checkout: b.checkout_date,
        nights: b.num_nights,
        guests: b.num_guests,
        status: b.status,
        price: parseFloat(b.total_price).toFixed(2)
    }));

    doc.autoTable({
        columns: columns,
        body: rows,
        startY: 53,
        theme: 'striped',
        styles: { fontSize: 8.5, cellPadding: 3.5, valign: 'middle' },
        headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
            0: { cellWidth: 8, halign: 'center' },
            1: { fontStyle: 'bold' },
            5: { halign: 'center' },
            6: { halign: 'center' },
            7: { halign: 'center', fontStyle: 'bold' },
            8: { halign: 'right', fontStyle: 'bold' }
        },
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.dataKey === 'status') {
                if (data.cell.raw === 'Disahkan') data.cell.styles.textColor = [5, 150, 105];
                else if (data.cell.raw === 'Menunggu Pengesahan' || data.cell.raw === 'Menunggu') data.cell.styles.textColor = [217, 119, 6];
                else if (data.cell.raw === 'Dibatalkan') data.cell.styles.textColor = [225, 29, 72];
            }
        }
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Kotak Ringkasan Jumlah
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(120, finalY, 76, 16, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('JUMLAH KESELURUHAN:', 124, finalY + 10);
    doc.setFontSize(11);
    doc.setTextColor(6, 78, 59);
    doc.setFont(undefined, 'bold');
    doc.text(`RM${totalAmount.toFixed(2)}`, 172, finalY + 10, { align: 'right' });

    // Nota Kaki
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Terima kasih kerana memilih Taman Eko Rimba Berkelah Pahang. Sila tunjukkan penyata ini semasa mendaftar masuk.', 14, finalY + 28);

    doc.save(`Penyata_${first.guest_name.replace(/[^a-zA-Z0-9]/g, '_')}_${first.checkin_date}.pdf`);
}

// 12. Modal Back-drop Close & Tindakan Tunggal
document.getElementById('detail-modal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.add('hidden');
});

async function cancelBooking(ref) {
    if (!confirm(`Batalkan tempahan ${ref}?`)) return;
    await fetch(`/api/bookings/${ref}/cancel`, { method: 'PATCH' });
    document.getElementById('detail-modal').classList.add('hidden');
    loadBookings();
}

async function updateStatus(ref, status) {
    await fetch(`/api/bookings/${ref}/status`, { 
        method: 'PATCH', 
        headers: {'Content-Type':'application/json'}, 
        body: JSON.stringify({ status }) 
    });
    document.getElementById('detail-modal').classList.add('hidden');
    loadBookings();
}

// 13. Carian & Penapis Dinamik
document.getElementById('filter-status').addEventListener('change', applyFiltersAndRender);
document.getElementById('search-input').addEventListener('input', applyFiltersAndRender);

// 14. Muat Turun CSV (Menyokong Mod Semasa)
document.getElementById('btn-export').addEventListener('click', () => {
    if (currentViewMode === 'grouped') {
        const grouped = getGroupedBookings(allBookings);
        const header = ['Nama Tetamu','No. Telefon','No. IC','Tarikh Masuk','Tarikh Keluar','Bil. Tempahan','Senarai Rujukan','Jumlah Keseluruhan RM'];
        const rows = grouped.map(g => [
            g.guest_name, g.guest_phone, g.guest_ic, g.checkin_date, g.checkout_date, 
            g.bookings.length, g.bookings.map(b => b.booking_ref).join('; '), g.total_amount.toFixed(2)
        ]);
        const csv = [header, ...rows].map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
        downloadCSVBlob(csv, `TERB_Penyata_Tetamu_Tarikh_${new Date().toISOString().slice(0,10)}.csv`);
    } else {
        const header = ['Rujukan','Bilik','Nama','Telefon','IC','Emel','Tarikh Masuk','Tarikh Keluar','Malam','Tetamu','Jumlah RM','Status','Permintaan Khas','Diterima'];
        const rows = allBookings.map(b => [b.booking_ref, b.room_name, b.guest_name, b.guest_phone, b.guest_ic, b.guest_email, b.checkin_date, b.checkout_date, b.num_nights, b.num_guests, b.total_price, b.status, b.special_request, b.created_at]);
        const csv = [header, ...rows].map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
        downloadCSVBlob(csv, `TERB_Tempahan_${new Date().toISOString().slice(0,10)}.csv`);
    }
});

function downloadCSVBlob(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

// 15. Muat Turun PDF Utama
document.getElementById('btn-export-pdf').addEventListener('click', () => {
    if (!allBookings || allBookings.length === 0) {
        alert('Tiada rekod tempahan untuk dimuat turun.');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    const tarikhCetak = new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    doc.setFontSize(16);
    doc.setTextColor(6, 78, 59);
    doc.text('TAMAN EKO RIMBA BERKELAH PAHANG', 14, 15);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    
    if (currentViewMode === 'grouped') {
        const grouped = getGroupedBookings(allBookings);
        doc.text('Laporan Ringkasan Penyata Mengikut Tetamu & Tarikh', 14, 22);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Tarikh: ${tarikhCetak}  |  Jumlah Penyata: ${grouped.length} rekod`, 14, 28);

        const columns = [
            { header: '#', dataKey: 'no' },
            { header: 'Nama Tetamu', dataKey: 'name' },
            { header: 'No. Telefon', dataKey: 'phone' },
            { header: 'Tarikh Lawatan', dataKey: 'dates' },
            { header: 'Bil. Tempahan', dataKey: 'count' },
            { header: 'Senarai Rujukan', dataKey: 'refs' },
            { header: 'Aktiviti Ditempah', dataKey: 'rooms' },
            { header: 'Jumlah (RM)', dataKey: 'total' }
        ];

        const rows = grouped.map((g, idx) => ({
            no: idx + 1,
            name: g.guest_name,
            phone: g.guest_phone,
            dates: `${g.checkin_date} - ${g.checkout_date}`,
            count: `${g.bookings.length} item`,
            refs: g.bookings.map(b => b.booking_ref).join(', '),
            rooms: g.bookings.map(b => (b.room_name||'').replace(/^TEMPAHAN\s+/i, '')).join(', '),
            total: g.total_amount.toFixed(2)
        }));

        doc.autoTable({
            columns: columns,
            body: rows,
            startY: 33,
            theme: 'striped',
            styles: { fontSize: 8.5, cellPadding: 3, valign: 'middle' },
            headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                3: { fontStyle: 'bold' },
                4: { halign: 'center', fontStyle: 'bold' },
                7: { halign: 'right', fontStyle: 'bold' }
            }
        });

        doc.save(`TERB_Penyata_Tetamu_Tarikh_${new Date().toISOString().slice(0, 10)}.pdf`);
    } else {
        doc.text('Laporan Senarai Semua Tempahan Pelanggan', 14, 22);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Tarikh: ${tarikhCetak}  |  Jumlah Rekod: ${allBookings.length} tempahan`, 14, 28);
        
        const columns = [
            { header: '#', dataKey: 'no' },
            { header: 'No Rujukan', dataKey: 'ref' },
            { header: 'Bilik / Aktiviti', dataKey: 'room' },
            { header: 'Nama Tetamu', dataKey: 'name' },
            { header: 'No. Telefon', dataKey: 'phone' },
            { header: 'Tarikh Masuk', dataKey: 'checkin' },
            { header: 'Tarikh Keluar', dataKey: 'checkout' },
            { header: 'Malam', dataKey: 'nights' },
            { header: 'Tetamu', dataKey: 'guests' },
            { header: 'Jumlah (RM)', dataKey: 'price' },
            { header: 'Status', dataKey: 'status' }
        ];
        
        const rows = allBookings.map((b, idx) => ({
            no: idx + 1,
            ref: b.booking_ref || '-',
            room: (b.room_name || '-').replace(/^TEMPAHAN\s+/i, ''),
            name: b.guest_name || '-',
            phone: b.guest_phone || '-',
            checkin: b.checkin_date || '-',
            checkout: b.checkout_date || '-',
            nights: b.num_nights ? `${b.num_nights}` : '-',
            guests: b.num_guests ? `${b.num_guests}` : '-',
            price: parseFloat(b.total_price || 0).toFixed(2),
            status: b.status || '-'
        }));
        
        doc.autoTable({
            columns: columns,
            body: rows,
            startY: 33,
            theme: 'striped',
            styles: { fontSize: 8.5, cellPadding: 3, valign: 'middle' },
            headStyles: { fillColor: [6, 78, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 10, halign: 'center' },
                1: { fontStyle: 'bold' },
                7: { halign: 'center' },
                8: { halign: 'center' },
                9: { halign: 'right', fontStyle: 'bold' },
                10: { halign: 'center', fontStyle: 'bold' }
            },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.dataKey === 'status') {
                    if (data.cell.raw === 'Disahkan') data.cell.styles.textColor = [5, 150, 105];
                    else if (data.cell.raw === 'Menunggu Pengesahan') data.cell.styles.textColor = [217, 119, 6];
                    else if (data.cell.raw === 'Dibatalkan') data.cell.styles.textColor = [225, 29, 72];
                }
            }
        });
        
        doc.save(`TERB_Tempahan_${new Date().toISOString().slice(0, 10)}.pdf`);
    }
});

// Mulakan muatan data
loadBookings();
setInterval(loadBookings, 60000); // Auto-refresh setiap 1 minit