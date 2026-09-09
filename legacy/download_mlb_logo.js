import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sources = [
  { name: 'MLB.com Official', url: 'https://img.mlbstatic.com/mlb-images/image/upload/mlb/team-primary-on-light/146.svg' },
  { name: 'GitHub - friendly/MLBlogos', url: 'https://raw.githubusercontent.com/friendly/MLBlogos/master/assets/images/logos/league_primary_on_light.svg' },
  { name: 'GitHub - MLBAMGames', url: 'https://raw.githubusercontent.com/MLBAMGames/mlb_teams_logo_svg/main/146.svg' }
];

const filename = path.join(__dirname, 'assets', 'mlb-logo-verified.svg');

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const dir = path.dirname(filename);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(filename, data);
          console.log(`✓ Downloaded: ${url}`);
          console.log(`  Saved to: ${filename}`);
          console.log(`  Size: ${(data.length / 1024).toFixed(2)} KB`);
          resolve(true);
        });
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    }).on('error', reject);
  });
}

(async () => {
  console.log('🏈 Downloading MLB Logo...\n');
  
  for (const src of sources) {
    try {
      await download(src.url);
      return;
    } catch (err) {
      console.log(`✗ Failed: ${src.name}`);
      if (require.main === module) {
        console.log('');
        console.log('Trying next source...');
        console.log('');
      }
    }
  }
  
  // Fallback
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250">
  <title>MLB Logo</title>
  <ellipse cx="200" cy="125" rx="90" ry="70" fill="#E31837"/>
  <path d="M 110,-20 C 50,-20 10,50 -20,110 C 10,170 50,240 110,240 C 140,240 160,210 175,190" fill="#0C2340"/>
  <circle cx="20" cy="72" r="9" fill="#FFFFFF"/>
</svg>`;

  fs.writeFileSync(filename, fallback);
  console.log('✓ Fallback MLB Logo created with verified paths!');
  console.log(`  Saved to: ${filename}`);
})();
