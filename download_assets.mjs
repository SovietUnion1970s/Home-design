import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outDir = path.join(__dirname, 'client', 'public', 'models');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const assets = [
  {
    name: 'house_01.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/LittlestTokyo.glb'
  },
  {
    name: 'sofa_01.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/SheenChair.glb'
  },
  {
    name: 'boombox_01.glb',
    url: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/BoomBox/glTF-Binary/BoomBox.glb'
  }
];

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url}...`);
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Saved ${dest}`);
          resolve();
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        console.log(`Redirecting to ${response.headers.location}...`);
        download(response.headers.location, dest).then(resolve).catch(reject);
      } else {
        reject(`Failed with status: ${response.statusCode}`);
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err.message);
    });
  });
}

async function main() {
  for (const asset of assets) {
    const destPath = path.join(outDir, asset.name);
    try {
      await download(asset.url, destPath);
    } catch (e) {
      console.error(`Error downloading ${asset.name}:`, e);
    }
  }
  console.log('All downloads completed!');
}

main();
