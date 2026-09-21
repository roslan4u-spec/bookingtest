const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8085;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ──────────────────────────────────────────────
// DATABASE SETUP (PostgreSQL)
// ──────────────────────────────────────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase') 
        ? { rejectUnauthorized: false } 
        : false
});

// Create tables on startup
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS rooms (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                capacity INTEGER NOT NULL,
                price_per_night DECIMAL(10,2) NOT NULL,
                description TEXT,
                facilities TEXT,
                image_url TEXT,
                is_active INTEGER DEFAULT 1
            );
        `);

        // Check and seed rooms if empty
        const res = await pool.query('SELECT COUNT(*) as count FROM rooms');
        if (parseInt(res.rows[0].count) === 0) {
            const rooms = [
                ['Tempahan & Aktiviti Sungai A', 'Tempahan & Aktiviti', 6, 350, 'Tempahan & Aktiviti tepi sungai dengan pemandangan air terjun yang menakjubkan. Sesuai untuk keluarga besar.', 'Tempahan & Aktiviti tidur 3, 2 tandas, Dapur, Ruang tamu, Balkoni tepi sungai, Pendingin hawa', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'],
                ['Tempahan & Aktiviti Rimba B', 'Tempahan & Aktiviti', 4, 280, 'Tempahan & Aktiviti dikelilingi pepohonan hijau yang nyaman dan segar. Ideal untuk pasangan atau keluarga kecil.', 'Tempahan & Aktiviti tidur 2, 1 tandas, Dapur kecil, Ruang tamu, Teres luar', 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=800&q=80'],
                ['Tempahan & Aktiviti Bukit C', 'Tempahan & Aktiviti', 8, 450, 'Tempahan & Aktiviti besar di lereng bukit dengan panorama hutan lipur yang indah. Sesuai untuk rombongan atau keluarga besar.', 'Tempahan & Aktiviti tidur 4, 3 tandas, Dapur lengkap, Ruang makan, Ruang tamu luas, Gazebo peribadi', 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80'],
                ['Dorm Berkelah', 'Dorm', 12, 60, 'Tempahan & Aktiviti asrama berkongsi yang selesa untuk kumpulan atau backpacker. Harga berpatutan dan kemudahan lengkap.', 'Katil tingkat (per orang), Tandas berkongsi, Tempat simpan beg, Kipas angin', 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
                ['Pondok Kelah', 'Pondok', 10, 180, 'Pondok tradisional Melayu yang unik dengan nuansa alam semula jadi. Sesuai untuk majlis kecil atau rombongan.', 'Ruang terbuka luas, Lantai kayu, Pondok tepi sungai, Sistem pencahayaan', 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80'],
            ];
            
            for (const r of rooms) {
                await pool.query(
                    'INSERT INTO rooms (name, type, capacity, price_per_night, description, facilities, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                    r
                );
            }
            console.log('✅ Data tempahan & aktiviti awal telah dimasukkan.');
        }

        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                booking_ref VARCHAR(20) UNIQUE NOT NULL,
                room_id INTEGER REFERENCES rooms(id),
                room_name VARCHAR(255) NOT NULL,
                guest_name VARCHAR(255) NOT NULL,
                guest_phone VARCHAR(50) NOT NULL,
                guest_email VARCHAR(255),
                guest_ic VARCHAR(50),
                num_guests INTEGER NOT NULL,
                checkin_date DATE NOT NULL,
                checkout_date DATE NOT NULL,
                num_nights INTEGER NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                special_request TEXT,
                status VARCHAR(50) DEFAULT 'Menunggu Pengesahan',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Jadual bookings sedia.');
        console.log('✅ Database PostgreSQL disambungkan.');
    } catch (err) {
        console.error('❌ Gagal inisialisasi database:', err);
    }
}
// Only run init if we have a connection string
if (process.env.DATABASE_URL) {
    initDB();
} else {
    console.warn('⚠️ DATABASE_URL tidak dijumpai. Jika ini localhost, sila tetapkan di dalam fail .env');
}

// ──────────────────────────────────────────────
// HELPER: Generate booking reference
// ──────────────────────────────────────────────
function generateRef() {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TERB-${datePart}-${rand}`;
}

// ──────────────────────────────────────────────
// API ROUTES & AUTHENTICATION
// ──────────────────────────────────────────────

// Admin Auth Setup
const ADMIN_TOKEN = process.env.ADMIN_PASSWORD ? Buffer.from(process.env.ADMIN_PASSWORD).toString('base64') : 'dev_mode_token_123';

app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD || (!process.env.ADMIN_PASSWORD && password === 'admin123')) {
        res.json({ success: true, token: ADMIN_TOKEN });
    } else {
        res.status(401).json({ success: false, message: 'Kata laluan tidak sah!' });
    }
});

const requireAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Bearer ${ADMIN_TOKEN}`) {
        next();
    } else {
        res.status(401).json({ error: 'Akses Ditolak. Sila log masuk panel admin.' });
    }
};


// GET all rooms
const MOCK_ROOMS = [
    { id: 1, name: 'Aktiviti Hiking', type: 'AKTIVITI HIKING', capacity: 7, price_per_night: 50, description: 'Terokai alam semula jadi dengan pendakian berpandu di sekitar Taman Eko Rimba Berkelah.', facilities: 'Pemandu arah, Peralatan asas, Sijil penyertaan', image_url: 'images/hiking.jpg', is_active: 1 },
    { id: 7, name: 'Sewaan Kabin', type: 'TEMPAHAN KABIN', capacity: 4, price_per_night: 150, description: 'Kabin berhawa dingin yang selesa sesuai untuk percutian keluarga.', facilities: '2 Katil Single, Aircond, Almari, Tandas, Dapur', image_url: 'images/kabin.jpg', is_active: 1 },
    { id: 2, name: 'Gazebo Tepi Sungai', type: 'TEMPAHAN TAPAK GAZEBO', capacity: 8, price_per_night: 60, description: 'Pondok berehat berhampiran sungai yang sesuai untuk keluarga berkelah.', facilities: 'Bumbung teduh, Meja kayu, Tempat duduk, Tong sampah', image_url: 'images/gazebo.jpg', is_active: 1 },
    { id: 3, name: 'Jungle Tracking Flora & Fauna', type: 'AKTIVITI JUGGLE TRACKING', capacity: 15, price_per_night: 30, description: 'Pengalaman merentas hutan sambil mempelajari spesies pokok dan tumbuhan herba.', facilities: 'Laluan bertanda, Panduan taklimat', image_url: 'https://images.unsplash.com/photo-1542131596-dec47d6e80b2?auto=format&fit=crop&w=800&q=80', is_active: 1 },
    { id: 4, name: 'Tapak Hammock Santai', type: 'TEMPAHAN TAPAK HAMMOCK', capacity: 2, price_per_night: 15, description: 'Lokasi strategik di antara pepohonan untuk menggantung hammock anda.', facilities: 'Kawasan redup, Akses mudah ke sungai', image_url: 'images/hammock.jpg', is_active: 1 },
    { id: 5, name: 'Tapak Perkhemahan Utama', type: 'TEMPAHAN TAPAK PERKHEMAHAN', capacity: 4, price_per_night: 40, description: 'Kawasan lapang khas untuk mendirikan khemah, dilengkapi kemudahan asas.', facilities: 'Tandas awam, Bekalan air paip, Kawasan unggun api', image_url: 'images/perkhemahan.jpg', is_active: 1 },
    { id: 6, name: 'Tapak Parkir RV / Campervan', type: 'TEMPAHAN TAPAK KENDERAAN RV / CARAVAN / CAMPERVAN', capacity: 6, price_per_night: 80, description: 'Ruang parkir khusus untuk kenderaan rekreasi dengan sokongan kuasa elektrik.', facilities: 'Penyambung elektrik (Plug), Bekalan air, Sisa pembuangan', image_url: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80', is_active: 1 }
];

app.get('/api/rooms', async (req, res) => {
    try {
        if (process.env.DATABASE_URL) {
            await pool.query("UPDATE rooms SET description = REPLACE(description, 'Gunung Tapis', 'Taman Eko Rimba Berkelah') WHERE description LIKE '%Gunung Tapis%'");
        }
        const { rows } = await pool.query('SELECT * FROM rooms WHERE is_active = 1 ORDER BY id ASC');
        res.json(rows.length > 0 ? rows : MOCK_ROOMS);
    } catch (err) {
        console.warn("DB Failed, returning mock data");
        res.json(MOCK_ROOMS);
    }
});

// GET booked dates for a room
app.get('/api/rooms/:id/booked-dates', async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query(
            `SELECT checkin_date, checkout_date FROM bookings WHERE room_id = $1 AND status != 'Dibatalkan'`,
            [id]
        );
        res.json(rows);
    } catch (err) {
        console.warn("DB Failed, returning mock empty bookings");
        res.json([]);
    }
});

// POST new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const {
            room_id, guest_name, guest_phone, guest_email,
            guest_ic, num_guests, checkin_date, checkout_date,
            special_request
        } = req.body;

        // Validation
        if (!room_id || !guest_name || !guest_phone || !num_guests || !checkin_date || !checkout_date) {
            return res.status(400).json({ error: 'Sila lengkapkan semua maklumat yang diperlukan.' });
        }

        const checkin = new Date(checkin_date);
        const checkout = new Date(checkout_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkin < today) return res.status(400).json({ error: 'Tarikh daftar masuk tidak boleh lebih awal daripada hari ini.' });
        if (checkout <= checkin) return res.status(400).json({ error: 'Tarikh daftar keluar mesti selepas tarikh daftar masuk.' });

        const num_nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));

        // Check room exists and get price
        const roomRes = await pool.query('SELECT * FROM rooms WHERE id = $1 AND is_active = 1', [room_id]);
        if (roomRes.rows.length === 0) return res.status(404).json({ error: 'Tempahan & Aktiviti tidak dijumpai.' });
        const room = roomRes.rows[0];

        // Check capacity
        if (parseInt(num_guests) > room.capacity) {
            return res.status(400).json({
                error: `Bilangan tetamu (${num_guests}) melebihi kapasiti ${room.name} (${room.capacity} orang).`
            });
        }

        // Check for date conflicts
        const conflictRes = await pool.query(
            `SELECT id FROM bookings WHERE room_id = $1 AND status != 'Dibatalkan'
             AND NOT (checkout_date <= $2 OR checkin_date >= $3)`,
            [room_id, checkin_date, checkout_date]
        );
        
        if (conflictRes.rows.length > 0) {
            return res.status(409).json({ error: 'Maaf, tarikh yang dipilih telah ditempah. Sila pilih tarikh lain.' });
        }

        const total_price = num_nights * room.price_per_night;
        const booking_ref = generateRef();

        const insertRes = await pool.query(
            `INSERT INTO bookings (booking_ref, room_id, room_name, guest_name, guest_phone, guest_email, guest_ic,
             num_guests, checkin_date, checkout_date, num_nights, total_price, special_request)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
            [booking_ref, room_id, room.name, guest_name, guest_phone, guest_email || '', guest_ic || '',
             num_guests, checkin_date, checkout_date, num_nights, total_price, special_request || '']
        );

        res.status(201).json({
            success: true,
            message: 'Tempahan berjaya disimpan!',
            booking: {
                id: insertRes.rows[0].id,
                booking_ref,
                room_name: room.name,
                checkin_date,
                checkout_date,
                num_nights,
                total_price,
                status: 'Menunggu Pengesahan'
            }
        });

    } catch (err) {
        console.warn("DB Failed on POST booking, returning mock success");
        const MOCK_ROOMS = [
            { id: 1, name: 'Aktiviti Hiking', type: 'AKTIVITI HIKING', capacity: 7, price_per_night: 50 },
            { id: 7, name: 'Sewaan Kabin', type: 'TEMPAHAN KABIN', capacity: 4, price_per_night: 150 },
            { id: 2, name: 'Gazebo Tepi Sungai', type: 'TEMPAHAN TAPAK GAZEBO', capacity: 8, price_per_night: 60 },
            { id: 3, name: 'Jungle Tracking Flora & Fauna', type: 'AKTIVITI JUGGLE TRACKING', capacity: 15, price_per_night: 30 },
            { id: 4, name: 'Tapak Hammock Santai', type: 'TEMPAHAN TAPAK HAMMOCK', capacity: 2, price_per_night: 15 },
            { id: 5, name: 'Tapak Perkhemahan Utama', type: 'TEMPAHAN TAPAK PERKHEMAHAN', capacity: 4, price_per_night: 40 },
            { id: 6, name: 'Tapak Parkir RV / Campervan', type: 'TEMPAHAN TAPAK KENDERAAN RV / CARAVAN / CAMPERVAN', capacity: 6, price_per_night: 80 }
        ];
        
        const room = MOCK_ROOMS.find(r => r.id == req.body.room_id);
        if (!room) {
            return res.status(404).json({ error: 'Tempahan & Aktiviti tidak dijumpai dalam MOCK.' });
        }
        
        const checkin = new Date(req.body.checkin_date);
        const checkout = new Date(req.body.checkout_date);
        const num_nights = Math.ceil((checkout - checkin) / (1000 * 60 * 60 * 24));
        const total_price = num_nights * room.price_per_night;
        const booking_ref = 'MOCK' + Math.floor(1000 + Math.random() * 9000);

        res.status(201).json({
            success: true,
            message: 'Tempahan berjaya disimpan (Mock)!',
            booking: {
                id: Math.floor(Math.random() * 100),
                booking_ref,
                room_name: room.name,
                checkin_date: req.body.checkin_date,
                checkout_date: req.body.checkout_date,
                num_nights,
                total_price,
                status: 'Menunggu Pengesahan'
            }
        });
    }
});

let MOCK_BOOKINGS_DATA = [
    { id: 1, booking_ref: 'REF1234', room_id: 1, room_name: 'Aktiviti Hiking', guest_name: 'Ahmad Albab', guest_phone: '0123456789', num_guests: 4, checkin_date: '2026-10-10', checkout_date: '2026-10-12', num_nights: 2, total_price: 100, status: 'Disahkan', created_at: new Date().toISOString() },
    { id: 2, booking_ref: 'MOCK5349', room_id: 5, room_name: 'Tapak Perkhemahan Utama', guest_name: 'Peah Bin Puah', guest_phone: '0194489296', num_guests: 2, checkin_date: '2026-09-12', checkout_date: '2026-09-13', num_nights: 1, total_price: 40, status: 'Menunggu Pengesahan', created_at: new Date().toISOString() }
];

// GET booking by reference
app.get('/api/bookings/:ref', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM bookings WHERE booking_ref = $1', [req.params.ref]);
        if (rows.length === 0) throw new Error('Not Found');
        res.json(rows[0]);
    } catch (err) {
        console.warn('DB Failed, returning mock booking by ref');
        const b = MOCK_BOOKINGS_DATA.find(b => b.booking_ref === req.params.ref);
        if (!b) return res.status(404).json({ error: 'Tempahan tidak dijumpai.' });
        res.json(b);
    }
});

// GET all bookings (admin view)
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.warn('DB Failed, returning mock admin bookings');
        res.json(MOCK_BOOKINGS_DATA);
    }
});

// PATCH cancel booking
app.patch('/api/bookings/:ref/cancel', async (req, res) => {
    try {
        const updateRes = await pool.query(
            "UPDATE bookings SET status = 'Dibatalkan' WHERE booking_ref = $1",
            [req.params.ref]
        );
        if (updateRes.rowCount === 0) throw new Error('Not Found');
        res.json({ success: true, message: 'Tempahan telah dibatalkan.' });
    } catch (err) {
        const b = MOCK_BOOKINGS_DATA.find(b => b.booking_ref === req.params.ref);
        if (!b) return res.status(404).json({ error: 'Tempahan tidak dijumpai.' });
        b.status = 'Dibatalkan';
        res.json({ success: true, message: 'Tempahan telah dibatalkan (Mock).' });
    }
});

// PATCH update booking status (admin)
app.patch('/api/bookings/:ref/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['Menunggu Pengesahan', 'Disahkan', 'Dibatalkan'];
        if (!allowed.includes(status)) return res.status(400).json({ error: 'Status tidak sah.' });
        
        const updateRes = await pool.query(
            'UPDATE bookings SET status = $1 WHERE booking_ref = $2',
            [status, req.params.ref]
        );
        if (updateRes.rowCount === 0) throw new Error('Not found');
        res.json({ success: true, message: `Status dikemaskini kepada: ${status}` });
    } catch (err) {
        const { status } = req.body;
        const b = MOCK_BOOKINGS_DATA.find(b => b.booking_ref === req.params.ref);
        if (!b) return res.status(404).json({ error: 'Tempahan tidak dijumpai.' });
        b.status = status;
        res.json({ success: true, message: `Status dikemaskini kepada: ${status} (Mock)` });
    }
});

// GET all bookings (admin view)
app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH cancel booking
app.patch('/api/bookings/:ref/cancel', async (req, res) => {
    try {
        const updateRes = await pool.query(
            "UPDATE bookings SET status = 'Dibatalkan' WHERE booking_ref = $1",
            [req.params.ref]
        );
        if (updateRes.rowCount === 0) return res.status(404).json({ error: 'Tempahan tidak dijumpai.' });
        res.json({ success: true, message: 'Tempahan telah dibatalkan.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update booking status (admin)
app.patch('/api/bookings/:ref/status', requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['Menunggu Pengesahan', 'Disahkan', 'Dibatalkan'];
        if (!allowed.includes(status)) return res.status(400).json({ error: 'Status tidak sah.' });
        
        const updateRes = await pool.query(
            'UPDATE bookings SET status = $1 WHERE booking_ref = $2',
            [status, req.params.ref]
        );
        if (updateRes.rowCount === 0) return res.status(404).json({ error: 'Tempahan tidak dijumpai.' });
        res.json({ success: true, message: `Status dikemaskini kepada: ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ──────────────────────────────────────────────
// Serve page routes (HANYA UNTUK LOCALHOST)
// Di Vercel, HTML & CSS disajikan secara automatik oleh Vercel Edge Network
// ──────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const fs = require('fs');
    const rootDir = path.join(__dirname, '..');
    
    app.get('/', (req, res) => { res.setHeader('Content-Type', 'text/html'); res.send(fs.readFileSync(path.join(rootDir, 'index.html'))); });
    app.get('/rooms', (req, res) => { res.setHeader('Content-Type', 'text/html'); res.send(fs.readFileSync(path.join(rootDir, 'rooms.html'))); });
    app.get('/admin', (req, res) => { res.setHeader('Content-Type', 'text/html'); res.send(fs.readFileSync(path.join(rootDir, 'admin.html'))); });
    
    // Serve all other static assets (css, js, images)
    app.use(express.static(rootDir));

    app.listen(PORT, () => {
        console.log(`\n🌿 Taman Eko Rimba Berkelah Server berjalan di: http://localhost:${PORT}/`);
        console.log(`📋 Halaman Tempahan  : http://localhost:${PORT}/rooms`);
        console.log(`🔧 Panel Admin       : http://localhost:${PORT}/admin`);
        console.log(`📡 API Tempahan & Aktiviti         : http://localhost:${PORT}/api/rooms`);
        console.log(`📡 API Tempahan      : http://localhost:${PORT}/api/bookings\n`);
    });
}

// Required for Vercel serverless functions
module.exports = app;
