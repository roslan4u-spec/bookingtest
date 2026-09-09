const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');
const loginHtml = `
    <!-- Login Section -->
    <div id="login-section" class="max-w-sm mx-auto mt-20 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            <i class="fa-solid fa-user-shield"></i>
        </div>
        <h2 class="text-2xl font-extrabold text-slate-900 mb-2">Log Masuk Admin</h2>
        <p class="text-slate-500 text-sm mb-6">Sila masukkan kata laluan untuk mengakses panel admin.</p>
        
        <form id="login-form" class="space-y-4 text-left">
            <div>
                <label class="block text-sm font-semibold text-slate-700 mb-1">Kata Laluan</label>
                <input type="password" id="admin-password" class="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500" required>
            </div>
            <p id="login-error" class="text-rose-500 text-sm hidden font-medium text-center"></p>
            <button type="submit" id="btn-login" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition">
                Log Masuk <i class="fa-solid fa-arrow-right ml-2"></i>
            </button>
        </form>
    </div>

    <!-- Admin Dashboard (Hidden by default) -->
    <div id="admin-dashboard" class="hidden">
`;
html = html.replace('<div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="stats-cards">', loginHtml + '        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8" id="stats-cards">');
html = html.replace('</div>\n\n<!-- Detail Modal -->', '    </div>\n</div>\n\n<!-- Detail Modal -->');

// JS modifications
const newJs = `
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('adminToken') || '')
    };
}

function showLogin() {
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    localStorage.removeItem('adminToken');
}

function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadBookings();
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login');
    const err = document.getElementById('login-error');
    const pwd = document.getElementById('admin-password').value;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memuatkan...';
    err.classList.add('hidden');
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd })
        });
        const data = await res.json();
        
        if(res.ok && data.success) {
            localStorage.setItem('adminToken', data.token);
            showDashboard();
        } else {
            err.textContent = data.message || 'Gagal log masuk.';
            err.classList.remove('hidden');
        }
    } catch (e) {
        err.textContent = 'Ralat rangkaian. Sila cuba lagi.';
        err.classList.remove('hidden');
    }
    btn.innerHTML = 'Log Masuk <i class="fa-solid fa-arrow-right ml-2"></i>';
});

async function loadBookings() {
    if(!localStorage.getItem('adminToken')) return showLogin();
    document.getElementById('booking-count-label').textContent = 'Memuatkan...';
    try {
        const res = await fetch('/api/admin/bookings', { headers: getAuthHeaders() });
        if(res.status === 401) return showLogin();
        allBookings = await res.json();
`;

html = html.replace('async function loadBookings() {\n    document.getElementById(\'booking-count-label\').textContent = \'Memuatkan...\';\n    try {\n        const res = await fetch(\'/api/admin/bookings\');\n        allBookings = await res.json();', newJs);

// update fetch calls in cancelBooking and updateStatus
html = html.replace('await fetch(`/api/bookings/${ref}/cancel`, { method: \'PATCH\' });', 'const res = await fetch(`/api/bookings/${ref}/cancel`, { method: \'PATCH\', headers: getAuthHeaders() }); if(res.status === 401) return showLogin();');
html = html.replace('await fetch(`/api/bookings/${ref}/status`, { method: \'PATCH\', headers: {\'Content-Type\':\'application/json\'}, body: JSON.stringify({ status }) });', 'const res = await fetch(`/api/bookings/${ref}/status`, { method: \'PATCH\', headers: getAuthHeaders(), body: JSON.stringify({ status }) }); if(res.status === 401) return showLogin();');

html = html.replace('loadBookings();\nsetInterval(loadBookings, 60000);', 'if (localStorage.getItem("adminToken")) showDashboard(); else showLogin();\nsetInterval(() => { if(!document.getElementById("admin-dashboard").classList.contains("hidden")) loadBookings(); }, 60000);');

fs.writeFileSync('admin.html', html);
