const fs = require('fs');
const path = require('path');

const filesToProcess = [
    'index.html',
    'rooms.html',
    'admin.html',
    'script.js',
    'tarikan_section.html'
];

filesToProcess.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // First remove redundant combos
    content = content.replace(/Taman Eko Rimba Berkelah\s*[-–]\s*Hutan Lipur Berkelah(?:,\s*Pahang)?/gi, 'Taman Eko Rimba Berkelah');
    content = content.replace(/Taman Eko Rimba Berkelah\s*Hutan Lipur Berkelah(?:,\s*Pahang)?/gi, 'Taman Eko Rimba Berkelah');
    
    // Replace standalone occurrences
    content = content.replace(/Hutan Lipur Berkelah,\s*Pahang/gi, 'Taman Eko Rimba Berkelah, Pahang');
    content = content.replace(/Hutan Lipur Berkelah/gi, 'Taman Eko Rimba Berkelah');
    
    // Cleanup double occurrences or weird artifacts
    content = content.replace(/Taman Eko Rimba Berkelah,\s*Pahang,\s*Pahang/gi, 'Taman Eko Rimba Berkelah, Pahang');
    content = content.replace(/Taman Eko Rimba Berkelah\s+Taman Eko Rimba Berkelah/gi, 'Taman Eko Rimba Berkelah');
    content = content.replace(/Taman Eko Rimba Berkelah\s*[-–]\s*Taman Eko Rimba Berkelah/gi, 'Taman Eko Rimba Berkelah');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed ${file}`);
});
