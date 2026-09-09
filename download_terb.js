process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const fs = require('fs');

fetch('https://forestry.pahang.gov.my/index.php/eko-rimba-daerah-kuantan-pekan-maran/taman-eko-rimba-berkelah')
  .then(res => res.text())
  .then(text => {
    fs.writeFileSync('content.html', text);
    console.log('Downloaded');
  })
  .catch(err => console.error(err));
