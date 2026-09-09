const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

const parts = html.split('<script>');
let js = parts[1].split('</script>')[0];

const loginJs = `
function getAuthHeaders() { return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + (localStorage.getItem('adminToken') || '') }; }

function showLogin() { document.getElementById('login-section').classList.remove('hidden'); document.getElementById('admin-dashboard').classList.add('hidden'); localStorage.removeItem('adminToken'); }

function showDashboard() { document.getElementById('login-section').classList.add('hidden'); document.getElementById('admin-dashboard').classList.remove('hidden'); loadBookings(); }

document.getElementById('login-form').addEventListener('submit', async (e) => { 
    e.preventDefault(); 
    const btn = document.getElementById('btn-login'); 
    const err = document.getElementById('login-error'); 
    const pwd = document.getElementById('admin-password').value; 
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memuatkan...'; 
    err.classList.add('hidden'); 
    try { 
        const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwd }) }); 
        const data = await res.json(); 
        if(res.ok && data.success) { localStorage.setItem('adminToken', data.token); showDashboard(); } 
        else { err.textContent = data.message || 'Gagal log masuk.'; err.classList.remove('hidden'); } 
    } catch (e) { 
        err.textContent = 'Ralat rangkaian. Sila cuba lagi.'; err.classList.remove('hidden'); 
    } 
    btn.innerHTML = 'Log Masuk <i class="fa-solid fa-arrow-right ml-2"></i>'; 
});
`;

js = js.replace('let allBookings = [];', 'let allBookings = [];\n' + loginJs);
js = js.replace('const res = await fetch(\'/api/admin/bookings\');', 'const res = await fetch(\'/api/admin/bookings\', { headers: getAuthHeaders() }); if(res.status === 401) return showLogin();');
js = js.replace('loadBookings();\nsetInterval(loadBookings, 60000);', 'if (localStorage.getItem("adminToken")) showDashboard(); else showLogin();\nsetInterval(() => { if(!document.getElementById("admin-dashboard").classList.contains("hidden")) loadBookings(); }, 60000);');

html = parts[0] + '<script>' + js + '</script>' + parts[1].split('</script>')[1];
fs.writeFileSync('admin.html', html);
