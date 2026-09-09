// JavaScript for Taman Eko Rimba Berkelah Activities & Direction Interactivity + Bilingual (BM/EN) Support

const translations = {
    bm: {
        announcement_welcome: 'Selamat Datang ke Taman Eko Rimba Berkelah, Pahang',
        top_contact: '019-4489296',
        brand_subtitle: 'Taman Eko Rimba Berkelah',
        nav_home: 'UTAMA',
        nav_direction: 'PANDUAN JALAN',
        nav_tarikan: 'TARIKAN',
        tarikan_sungai: 'Sungai',
        tarikan_khemah: 'Berkhemah',
        tarikan_kelah: 'Berkelah',
        tarikan_flora: 'Flora',
        tarikan_air_terjun: 'Air Terjun',
        nav_rooms: 'BILIK & CHALET',
        nav_activities: 'AKTIVITI',
        nav_terms: 'TERMA & SYARAT',
        nav_contact: 'HUBUNGI KAMI',
        hero_badge: 'Taman Eko Rimba Berkelah, Pahang',
        hero_title: 'AKTIVITI & PANDUAN JALAN Taman Eko Rimba Berkelah',
        hero_desc: 'Terokai keindahan semula jadi Air Terjun 7 Tingkat di Taman Eko Rimba Berkelah, Pahang. Nikmati perkelahan, mandi sungai, BBQ, dan pelbagai aktiviti riadah air yang menyeronokkan!',
        hero_btn_direction: 'Panduan Jalan ke Taman Eko Rimba Berkelah',
        hero_btn_activities: 'Terokai Aktiviti',
        dir_badge: 'Panduan Lokasi & Perjalanan',
        dir_title: 'Panduan Jalan ke Taman Eko Rimba Berkelah, Pahang',
        dir_desc: 'Taman Eko Rimba Berkelah terletak di daerah Maran/Gambang, Pahang. Terkenal dengan keindahan air terjun 7 tingkat dan air sungai yang sejuk serta jernih.',
        dir_routes_header: 'Panduan Laluan Utama',
        dir_route1_title: 'Dari Kuala Lumpur / Pantai Barat (LPT1)',
        dir_route1_steps: '<li>Guna <strong>Lebuhraya Pantai Timur (LPT1)</strong> menghala ke Kuantan.</li><li>Ambil <strong>Susur Keluar Sri Jaya / Gambang</strong> (Keluar 825 atau Keluar 827).</li><li>Masuk ke <strong>Jalan Maran-Kuantan (Laluan 2)</strong> dan ikuti papan tanda menghala ke Taman Eko Rimba Berkelah.</li><li>Belok ke simpang jalan berturap Taman Eko Rimba Berkelah sehingga tiba di kawasan letak kenderaan & pintu masuk.</li>',
        dir_route2_title: 'Dari Bandar Kuantan / Gambang',
        dir_route2_steps: '<li>Guna <strong>Jalan Kuantan - Maran (Laluan 2)</strong> menghala ke arah Gambang / Sri Jaya.</li><li>Pandu melepasi Pusat Asasi UIA Gambang / Simpang Gambang.</li><li>Belok kanan di papan tanda rasmi <strong>Taman Eko Rimba Berkelah</strong> dan teruskan perjalanan hingga ke pintu masuk.</li>',
        dir_parking_title: 'Kemudahan Tempat Letak Kenderaan',
        dir_parking_desc: 'Disediakan di pintu masuk utama Taman Eko Rimba Berkelah.',
        dir_contact_title: 'Bantuan & Pertanyaan Lokasi',
        dir_contact_sub: 'WhatsApp / Hubungi:',
        dir_map_header: 'Peta Interaktif Google Maps',
        act_heading: 'Aktiviti Menarik Untuk Anda',
        act_subheading: 'Pilih aktiviti di bawah untuk melihat maklumat lanjut dan panduan keselamatan di Taman Eko Rimba Berkelah.',
        tab_bbq: 'Barbeque',
        tab_picnic: 'Berkelah',
        tab_rubber_tube: 'Tiub Hanyutan',
        tab_swimming: 'Mandi Sungai',
        bbq_tag: 'Aktiviti Popular',
        bbq_sub: 'Sesi BBQ Tepi Sungai Berkelah',
        bbq_title: 'Barbeque',
        bbq_desc: 'Nikmati hidangan panggang panas di tepi sungai Taman Eko Rimba Berkelah yang jernih dan nyaman. Tapak BBQ disediakan untuk kemudahan anda dan keluarga.',
        bbq_notes_header: 'Nota Penting BBQ:',
        bbq_notes_list: '<li>Tetamu digalakkan membawa arang, jaring panggang, dan peralatan memasak sendiri.</li><li>Pastikan kawasan BBQ dibersihkan selepas digunakan.</li>',
        btn_book_bbq: 'Tempah / Tanya Tapak BBQ',
        picnic_tag: 'Pilihan Keluarga',
        picnic_sub: 'Berkelah & Gazebo',
        picnic_title: 'Berkelah',
        picnic_desc: 'Sesuai untuk berkelah harian bersama keluarga di bawah pepohonan rimba Taman Eko Rimba Berkelah yang redup dan menyegarkan.',
        picnic_notes_header: 'Panduan Berkelah:',
        picnic_notes_list: '<li>Gazebo / Pondok berkelah boleh disewa tertakluk kepada kekosongan.</li><li>Hormati keselesaan pengunjung lain dengan mengelakkan penggunaan peralatan muzik yang bising.</li><li>Sila bawa beg sampah sendiri dan buang sampah di tempat yang disediakan.</li>',
        btn_book_picnic: 'Pertanyaan Sewaan Gazebo',
        tube_tag: 'Aktiviti Air',
        tube_sub: 'Hanyutan Tiub Sungai',
        tube_title: 'Tiub Hanyutan',
        tube_desc: 'Aktiviti popular berhanyut santai mengikut arus Sungai Berkelah menggunakan tiub getah. Aktiviti yang sangat menyeronokkan untuk kanak-kanak mahupun orang dewasa!',
        tube_notes_header: 'Maklumat Sewaan & Keselamatan:',
        tube_notes_list: '<li>Tiub getah boleh disewa terus di kaunter pendaftaran.</li><li>Kanak-kanak wajib dipantau oleh ibu bapa / penjaga pada setiap masa.</li>',
        btn_book_tube: 'Tanya Sewaan Tiub Hanyutan',
        swim_tag: 'Air Segar & Jernih',
        swim_sub: 'Mandi-Manda Air Terjun Berkelah',
        swim_title: 'Mandi Sungai',
        swim_desc: 'Berenang dan mandi-manda di air terjun 7 tingkat yang begitu jernih, sejuk dan menyegarkan di Taman Eko Rimba Berkelah, Pahang.',
        swim_notes_header: 'Panduan Keselamatan Mandi Sungai:',
        swim_notes_list: '<li>Air sungai adalah semula jadi; sila perhatikan arus air terutama jika hujan berlaku di kawasan hulu.</li><li>Pakaian mandi yang bersesuaian dan sopan amat digalakkan.</li>',
        btn_contact: 'Hubungi Kami',
        rules_badge: 'PERATURAN & SYARAT PREMIS',
        rules_title: 'Aktiviti & Barangan Yang Dilarang',
        rules_desc: 'Demi menjaga ketenteraman, kebersihan, dan keselamatan semua pengunjung di Taman Eko Rimba Berkelah, aktiviti dan barangan berikut adalah <strong>DILARANG SAMA SEKALI</strong>:',
        rule_1: 'Kelab kenderaan / konvoi berkumpulan tanpa kelulusan pihak pengurusan.',
        rule_2: 'Melebihi had kapasiti tetamu yang dibenarkan bagi setiap unit.',
        rule_3: 'Membawa makanan luar atau perkhidmatan katering tanpa kebenaran.',
        rule_4: 'Memasak dengan cara berbahaya atau menggunakan penyambung wayar sambungan elektrik.',
        rule_5: 'Haiwan peliharaan tidak dibenarkan masuk ke kawasan premis.',
        rule_6: 'Minuman beralkohol dan makanan tidak halal adalah dilarang sama sekali.',
        rule_7: 'Karaoke, mikrofon mini, pembesar suara mudah alih & sebarang bunyi bising yang mengganggu.',
        rule_8: 'Dilarang kecuali diadakan di kawasan PADANG yang ditetapkan dengan tempahan khas.',
        penalty_title: 'AMARAN DENDA RM500',
        penalty_desc: 'Sebarang aktiviti yang dijalankan tanpa kebenaran pihak pengurusan Taman Eko Rimba Berkelah adalah <strong>DILARANG SAMA SEKALI</strong>. Denda <strong>RM500</strong> akan dikenakan bagi sebarang pelanggaran peraturan.',
        btn_more_info: 'Hubungi Untuk Pertanyaan Lanjut',
        contact_title: 'Pertanyaan & Tempahan',
        contact_desc: 'Sila WhatsApp atau hubungi kami secara terus untuk sebarang pertanyaan berkaitan aktiviti dan tempahan di Taman Eko Rimba Berkelah.',
        contact_button: 'Hubungi / WhatsApp: 019-4489296',
        footer_about: 'Destinasi riadah & perkelahan air terjun terkemuka di Taman Eko Rimba Berkelah, Mukim Luit, Pahang.',
        footer_nav_header: 'Pautan Pantas',
        footer_contact_header: 'Hubungi Kami',
        footer_address: 'Taman Eko Rimba Berkelah, Mukim Luit, Pahang, Malaysia',
        back_to_top: 'Kembali ke atas'
    },
    en: {
        announcement_welcome: 'Welcome to Taman Eko Rimba Berkelah – Berkelah Forest Reserve, Pahang',
        top_contact: '019-4489296',
        brand_subtitle: 'Berkelah Forest Reserve',
        nav_home: 'HOME',
        nav_direction: 'DIRECTION',
        nav_tarikan: 'ATTRACTIONS',
        tarikan_sungai: 'River',
        tarikan_khemah: 'Camping',
        tarikan_kelah: 'Picnic',
        tarikan_flora: 'Flora',
        tarikan_air_terjun: 'Waterfall',
        nav_rooms: 'ROOMS',
        nav_activities: 'ACTIVITIES',
        nav_terms: 'TERMS & CONDITIONS',
        nav_contact: 'CONTACT US',
        hero_badge: 'Berkelah Forest Reserve, Pahang',
        hero_title: 'Taman Eko Rimba Berkelah ACTIVITIES & DIRECTION',
        hero_desc: 'Explore the natural beauty of the 7-Tiered Waterfall at Berkelah Forest Reserve, Pahang. Enjoy picnics, river swimming, BBQ, and premier water activities!',
        hero_btn_direction: 'Directions to Berkelah Forest Reserve',
        hero_btn_activities: 'Explore Activities',
        dir_badge: 'Location & Travel Guide',
        dir_title: 'Directions to Berkelah Forest Reserve, Pahang',
        dir_desc: 'Berkelah Forest Reserve is located in Maran/Gambang, Pahang. Famous for its magnificent 7-tiered waterfall and cool, crystal-clear river waters.',
        dir_routes_header: 'Main Route Guide',
        dir_route1_title: 'From Kuala Lumpur / West Coast (LPT1)',
        dir_route1_steps: '<li>Take the <strong>East Coast Expressway (LPT1)</strong> towards Kuantan.</li><li>Take the <strong>Sri Jaya / Gambang Exit</strong> (Exit 825 or Exit 827).</li><li>Join <strong>Jalan Maran-Kuantan (Route 2)</strong> and follow directional signposts to Berkelah Forest Reserve.</li><li>Turn into the paved entrance road to reach the parking area & entrance gate.</li>',
        dir_route2_title: 'From Kuantan City / Gambang',
        dir_route2_steps: '<li>Take <strong>Jalan Kuantan - Maran (Route 2)</strong> towards Gambang / Sri Jaya.</li><li>Drive past IIUM Gambang Foundation Centre / Gambang Junction.</li><li>Turn right at the official <strong>Berkelah Forest Reserve</strong> signboard and continue to the park site.</li>',
        dir_parking_title: 'Parking Facilities',
        dir_parking_desc: 'Available at the main entrance of Berkelah Forest Reserve.',
        dir_contact_title: 'Location Assistance Inquiry',
        dir_contact_sub: 'WhatsApp / Call:',
        dir_map_header: 'Google Maps Interactive Map',
        act_heading: 'Exciting Activities For You',
        act_subheading: 'Select an activity below to view details and safety guidelines at Taman Eko Rimba Berkelah.',
        tab_bbq: 'Barbeque',
        tab_picnic: 'Picnic',
        tab_rubber_tube: 'Rubber Tube Rafting',
        tab_swimming: 'Swimming',
        bbq_tag: 'Popular Activity',
        bbq_sub: 'Riverside BBQ Session',
        bbq_title: 'Barbeque',
        bbq_desc: 'Enjoy hot grilled meals beside the clear and refreshing Berkelah river. BBQ pits are available for your family convenience.',
        bbq_notes_header: 'Important BBQ Notes:',
        bbq_notes_list: '<li>Guests are advised to bring charcoal, grill wire mesh, and utensils.</li><li>Please ensure the BBQ area is cleaned after use.</li>',
        btn_book_bbq: 'Book / Inquire BBQ Pit',
        picnic_tag: 'Family Favorite',
        picnic_sub: 'Picnic & Gazebo',
        picnic_title: 'Picnic',
        picnic_desc: 'Ideal for day trips with family under the cool, refreshing rainforest canopy of Berkelah Forest Reserve.',
        picnic_notes_header: 'Picnic Guidelines:',
        picnic_notes_list: '<li>Gazebos / Huts can be rented subject to availability.</li><li>Respect other visitors by avoiding loud music equipment.</li><li>Please bring your own trash bags and dispose of waste in designated bins.</li>',
        btn_book_picnic: 'Gazebo Rental Inquiry',
        tube_tag: 'Water Adventure',
        tube_sub: 'River Tube Floating',
        tube_title: 'Rubber Tube Rafting',
        tube_desc: 'Popular relaxing floating activity along the Berkelah river current using rubber tubes. Great fun for both children and adults!',
        tube_notes_header: 'Rental & Safety Info:',
        tube_notes_list: '<li>Rubber tubes can be rented directly at the registration booth.</li><li>Children must be supervised by parents / guardians at all times.</li>',
        btn_book_tube: 'Inquire Rubber Tube Rental',
        swim_tag: 'Refreshing River',
        swim_sub: 'Berkelah Waterfall Swimming',
        swim_title: 'Swimming',
        swim_desc: 'Swim and refresh in the crystal-clear, cool mountain waters of the 7-tiered waterfall at Berkelah Forest Reserve, Pahang.',
        swim_notes_header: 'River Swimming Safety:',
        swim_notes_list: '<li>River water is natural; monitor water currents especially during upstream rains.</li><li>Modest and appropriate swimwear is highly encouraged.</li>',
        btn_contact: 'Contact Us',
        rules_badge: 'PREMISES RULES & REGULATIONS',
        rules_title: 'Prohibited Activities and Items',
        rules_desc: 'To maintain peace, cleanliness, and safety for all visitors at Taman Eko Rimba Berkelah, the following activities and items are <strong>STRICTLY PROHIBITED</strong>:',
        rule_1: 'Vehicle clubs / group convoys without prior authorization.',
        rule_2: 'Exceeding the allowed guest capacity per unit.',
        rule_3: 'Outside commercial catering services without permission.',
        rule_4: 'Hazardous cooking methods or electrical extension cords.',
        rule_5: 'Pets are not allowed on the premises.',
        rule_6: 'Alcoholic beverages and non-halal food are prohibited.',
        rule_7: 'Karaoke, mini mics, portable speakers & loud noise.',
        rule_8: 'Prohibited unless conducted in designated FIELD areas with special booking.',
        penalty_title: 'RM500 PENALTY WARNING',
        penalty_desc: 'Unapproved activities without Taman Eko Rimba Berkelah management permission are <strong>STRICTLY PROHIBITED</strong>. A fine of <strong>RM500</strong> will be imposed for any rule violation.',
        btn_more_info: 'Further Inquiries',
        contact_title: 'Inquiries & Reservations',
        contact_desc: 'Please WhatsApp or call us directly for activity inquiries & bookings at Taman Eko Rimba Berkelah.',
        contact_button: 'Call / WhatsApp: 019-4489296',
        footer_about: 'Premier waterfall picnic & recreation destination at Berkelah Forest Reserve, Mukim Luit, Pahang.',
        footer_nav_header: 'Quick Links',
        footer_contact_header: 'Contact Us',
        footer_address: 'Berkelah Forest Reserve, Mukim Luit, Pahang, Malaysia',
        back_to_top: 'Back to top'
    }
};

let currentLang = localStorage.getItem('terb_lang') || 'bm';


function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('terb_lang', lang);

    // Update html lang attribute
    document.documentElement.lang = lang;

    // Update all elements with data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key] !== undefined) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Update button active state
    const btnBm = document.getElementById('lang-bm');
    const btnEn = document.getElementById('lang-en');

    if (btnBm && btnEn) {
        if (lang === 'bm') {
            btnBm.className = 'lang-btn px-2.5 py-1 text-xs font-bold rounded-md transition bg-amber-400 text-emerald-950 shadow-sm';
            btnEn.className = 'lang-btn px-2.5 py-1 text-xs font-bold rounded-md transition text-emerald-200 hover:text-white hover:bg-emerald-800';
        } else {
            btnEn.className = 'lang-btn px-2.5 py-1 text-xs font-bold rounded-md transition bg-amber-400 text-emerald-950 shadow-sm';
            btnBm.className = 'lang-btn px-2.5 py-1 text-xs font-bold rounded-md transition text-emerald-200 hover:text-white hover:bg-emerald-800';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize language
    setLanguage(currentLang);

    // Bind language button clicks
    const btnBm = document.getElementById('lang-bm');
    const btnEn = document.getElementById('lang-en');

    if (btnBm) btnBm.addEventListener('click', () => setLanguage('bm'));
    if (btnEn) btnEn.addEventListener('click', () => setLanguage('en'));

    // Tab switching logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.add('text-slate-600', 'hover:bg-emerald-50');
            });

            // Add active class to clicked button
            button.classList.add('active');
            button.classList.remove('text-slate-600', 'hover:bg-emerald-50');

            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.add('hidden');
                content.classList.remove('block');
            });

            // Show selected tab content
            const activeContent = document.getElementById(`tab-${targetTab}`);
            if (activeContent) {
                activeContent.classList.remove('hidden');
                activeContent.classList.add('block');
            }
        });
    });

    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Mobile Tarikan Dropdown Toggle
    const mobileTarikanBtn = document.getElementById('mobile-tarikan-btn');
    const mobileTarikanMenu = document.getElementById('mobile-tarikan-menu');
    const mobileTarikanIcon = document.getElementById('mobile-tarikan-icon');
    if (mobileTarikanBtn && mobileTarikanMenu && mobileTarikanIcon) {
        mobileTarikanBtn.addEventListener('click', (e) => {
            e.preventDefault();
            mobileTarikanMenu.classList.toggle('hidden');
            mobileTarikanIcon.classList.toggle('rotate-180');
        });
    }
});
