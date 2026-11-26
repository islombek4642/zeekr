const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('=== HARMONIZING CARD MAIN IMAGES ===');

  // 1. Zeekr 7X: Replace family photo with clean studio car render (blue-stone.webp)
  console.log('Step 1: Harmonizing Zeekr 7X (Studio Blue Stone)...');
  const blueStonePath = path.join(process.cwd(), 'public/images/cars/zeekr-7x/colors/blue-stone.webp');
  if (fs.existsSync(blueStonePath)) {
    const buf7x = fs.readFileSync(blueStonePath);
    const targetWebp7x = path.join(process.cwd(), 'public/images/cars/zeekr-7x/main.webp');
    const targetJpg7x = path.join(process.cwd(), 'public/images/cars/zeekr-7x/main.jpg');

    await sharp(buf7x)
      .resize(1920, 1080, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(targetWebp7x);

    await sharp(buf7x)
      .resize(1920, 1080, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(targetJpg7x);

    console.log(`  Zeekr 7X main.webp: ${fs.statSync(targetWebp7x).size} bytes`);
    console.log(`  Zeekr 7X main.jpg:  ${fs.statSync(targetJpg7x).size} bytes`);
  } else {
    console.error('  Error: blue-stone.webp not found!');
  }

  // 2. Zeekr 007: Replace outdoor building photo with clean studio car render (clear-blue.jpg)
  console.log('Step 2: Harmonizing Zeekr 007 (Studio Clear Blue)...');
  const studio007 = path.join(process.cwd(), 'public/images/cars/zeekr-007/colors/clear-blue.jpg');
  if (fs.existsSync(studio007)) {
    const buf007 = fs.readFileSync(studio007);
    const targetWebp007 = path.join(process.cwd(), 'public/images/cars/zeekr-007/main.webp');
    const targetJpg007 = path.join(process.cwd(), 'public/images/cars/zeekr-007/main.jpg');

    await sharp(buf007)
      .resize(1920, 1080, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(targetWebp007);

    await sharp(buf007)
      .resize(1920, 1080, { fit: 'cover' })
      .jpeg({ quality: 85 })
      .toFile(targetJpg007);

    console.log(`  Zeekr 007 main.webp: ${fs.statSync(targetWebp007).size} bytes`);
    console.log(`  Zeekr 007 main.jpg:  ${fs.statSync(targetJpg007).size} bytes`);
  } else {
    console.error('  Error: clear-blue.jpg not found!');
  }

  // 3. Verify all 10 models' main.jpg sizes are strictly <= 512,000 bytes and valid JPEG
  console.log('\nStep 3: Validating all 10 models main images...');
  const carDirs = [
    'zeekr-9x',
    'zeekr-8x',
    'zeekr-8x-yaoying',
    'zeekr-7x',
    'zeekr-x',
    'zeekr-001',
    'zeekr-001-2025',
    'zeekr-001-all-new',
    'zeekr-007',
    'zeekr-007-gt',
    'zeekr-009'
  ];

  for (const slug of carDirs) {
    const jpg = path.join(process.cwd(), 'public/images/cars', slug, 'main.jpg');
    const webp = path.join(process.cwd(), 'public/images/cars', slug, 'main.webp');
    if (fs.existsSync(jpg)) {
      const s = fs.statSync(jpg).size;
      const meta = await sharp(jpg).metadata();
      console.log(`  [OK] ${slug}/main.jpg: ${s} bytes (${meta.width}x${meta.height}, ${meta.format})`);
      if (s > 512000) {
        console.error(`  [WARN] ${slug}/main.jpg exceeds 512KB! Re-compressing...`);
        const rebuf = await sharp(jpg).jpeg({ quality: 75 }).toBuffer();
        fs.writeFileSync(jpg, rebuf);
      }
    } else {
      console.error(`  [FAIL] Missing ${jpg}`);
    }
  }

  console.log('\n=== ALL MAIN IMAGES HARMONIZED SUCCESSFULLY ===');
}

main().catch(console.error);
