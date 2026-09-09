import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try multiple sources to find a working one
const sources = [
  { name: 'Wikimedia (Main Logo)', url: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Major_League_Baseball_logo.svg/64px-Major_League_Baseball_logo.svg.png', size: 'Small' },
  { name: 'Wikimedia (Large Logo)', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Major_League_Baseball_logo.svg/2560px-Major_League_Baseball_logo.svg.png', size: 'Large' }
];

const outputDir = path.join(__dirname, 'assets');
const filename = path.join(outputDir, 'mlb-logo.png');

function download(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, { headers: { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept': '*/*' 
    }}, (res) => {
      let data = Buffer.alloc(0);
      if (res.statusCode === 200 || res.statusCode === 301 || res.statusCode === 302) {
        res.on('data', chunk => data = Buffer.concat([data, chunk]));
        res.on('end', () => {
          const dir = path.dirname(filename);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          
          // Check if it's actually an image (not HTML error)
          const firstByte = data[0];
          if (firstByte === 0x89 || firstByte === 0xFF) { // PNG or JPEG
            fs.writeFileSync(filename, data);
            console.log(`✓ Downloaded ${res.statusCode} - Image file!`);
            console.log(`  Saved to: ${filename}`);
            console.log(`  Size: ${(data.length / 1024).toFixed(2)} KB`);
            resolve(true);
          } else if (data.includes('<html')) {
            console.log(`✗ Got HTML response (${res.statusCode}) - CORS or error page`);
            console.log('  First bytes:', Array.from(data.slice(0, 100)).map(b => b.toString('hex')).join(' '));
            reject(new Error('HTML response received'));
          } else {
            fs.writeFileSync(filename, data);
            console.log(`✓ Downloaded ${res.statusCode} - Size: ${(data.length / 1024).toFixed(2)} KB`);
            resolve(true);
          }
        });
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

(async () => {
  console.log('🏈 Downloading MLB Logo...\n');
  
  for (const src of sources) {
    try {
      await download(src.url);
      return;
    } catch (err) {
      console.log(`\n✗ Failed: ${src.name}`);
      console.log(`   Error: ${err.message}`);
      console.log('');
      console.log('Trying next source...');
      console.log('');
    }
  }
  
  // Fallback to SVG with inline paths if all downloads fail
  const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <title>MLB Logo</title>
  <desc>Major League Baseball - Official Primary Logo</desc>
  <g transform="translate(0,0)">
    <ellipse cx="200" cy="125" rx="90" ry="70" fill="#E31837"/>
    <path d="M 110,-20 C 50,-20 10,50 -20,110 C 10,170 50,240 110,240 C 140,240 160,210 175,190" fill="#0C2340"/>
    <circle cx="20" cy="72" r="9" fill="#FFFFFF"/>
  </g>
</svg>`;

  const fallbackFile = path.join(outputDir, 'mlb-logo.svg');
  fs.mkdirSync(path.dirname(fallbackFile), { recursive: true });
  fs.writeFileSync(fallbackFile, fallback);
  
  console.log('\n⚠️  All downloads failed - Created fallback SVG instead');
  console.log(`   Saved to: ${fallbackFile}`);
})();
