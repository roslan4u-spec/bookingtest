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
    
    // Remove the ", Pahang" part
    content = content.replace(/Taman Eko Rimba Berkelah,\s*Pahang/gi, 'Taman Eko Rimba Berkelah');
    content = content.replace(/Taman Eko Rimba Berkelah\s*Pahang/gi, 'Taman Eko Rimba Berkelah');
    
    // In case there are stray "Hutan Lipur Berkelah" left somewhere due to git caching
    content = content.replace(/Hutan Lipur Berkelah,\s*Pahang/gi, 'Taman Eko Rimba Berkelah');
    content = content.replace(/Hutan Lipur Berkelah\s*Pahang/gi, 'Taman Eko Rimba Berkelah');
    content = content.replace(/Hutan Lipur Berkelah/gi, 'Taman Eko Rimba Berkelah');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Processed ${file}`);
});
