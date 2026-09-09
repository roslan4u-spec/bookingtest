const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');
html = html.replace('loadBookings();\nsetInterval(loadBookings, 60000); // Auto-refresh setiap 1 minit', 'if (localStorage.getItem("adminToken")) showDashboard(); else showLogin();\nsetInterval(() => { if(!document.getElementById("admin-dashboard").classList.contains("hidden")) loadBookings(); }, 60000);');
fs.writeFileSync('admin.html', html);
