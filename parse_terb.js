const fs = require('fs');
const html = fs.readFileSync('content.html', 'utf8');

// simple regex to strip out script, style tags
let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');

// strip html tags
clean = clean.replace(/<[^>]+>/g, ' ');

// clean up whitespace
clean = clean.replace(/\s+/g, ' ').trim();

console.log(clean.substring(0, 3000));
console.log("\n\n--- PART 2 ---\n\n");
console.log(clean.substring(3000, 6000));
