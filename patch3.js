const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');
html = html.replace(/loadBookings\(\);[\s\r\n]*setInterval\(loadBookings,\s*60000\);.*(\n<\/script>\n<\/body>\n<\/html>\s*)$/m, 
    'if (localStorage.getItem("adminToken")) showDashboard(); else showLogin();\nsetInterval(() => { if(!document.getElementById("admin-dashboard").classList.contains("hidden")) loadBookings(); }, 60000);\n</script>\n</body>\n</html>\n');
fs.writeFileSync('admin.html', html);
