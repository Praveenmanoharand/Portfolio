/*
  Build a sprite sheet from the extracted frames using jimp (pure JS, no native deps).
  300 frames at 1280x720 → 20 cols × 15 rows at 640×360 each.
  Output: 12,800 × 5,400 webp.
*/
const { Jimp } = require('jimp');
const fs = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, 'client', 'src', 'frames');
const OUT_FILE = path.join(__dirname, 'client', 'public', 'manus-storage', 'praveen-scroll-sprite_77660a85.jpg');
const TMP_DIR = path.join(__dirname, '.tmp-frames');

const FRAME_W = 400;
const FRAME_H = 225;
const COLS = 20;
const ROWS = 15;
const TOTAL = COLS * ROWS; // 300

async function main() {
  console.log(`Building sprite from ${TOTAL} frames @ ${FRAME_W}x${FRAME_H}`);
  console.log(`Grid: ${COLS} cols x ${ROWS} rows`);

  // Make sure output directory exists
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });

  // 1. Resize every frame to FRAME_W × FRAME_H, write into TMP_DIR as jpg.
  const files = fs.readdirSync(FRAMES_DIR)
    .filter(f => /^ezgif-frame-\d{3}\.jpg$/.test(f))
    .sort();

  if (files.length < TOTAL) {
    throw new Error(`Need ${TOTAL} frames, found ${files.length}`);
  }

  console.log(`Resizing ${files.length} frames…`);
  let count = 0;
  for (let i = 0; i < TOTAL; i++) {
    const f = files[i];
    const src = path.join(FRAMES_DIR, f);
    const dst = path.join(TMP_DIR, `${String(i + 1).padStart(4, '0')}.jpg`);
    const img = await Jimp.read(src);
    await img.cover({ w: FRAME_W, h: FRAME_H }).write(dst);
    count++;
    if (count % 30 === 0) {
      console.log(`  Resized ${count}/${TOTAL}`);
    }
  }
  console.log('All frames resized.');

  // 2. Compose the grid into one large image.
  console.log('Composing sprite…');
  const sprite = new Jimp({ width: COLS * FRAME_W, height: ROWS * FRAME_H, color: 0x0b0c0bff });

  for (let i = 0; i < TOTAL; i++) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * FRAME_W;
    const y = row * FRAME_H;
    const f = path.join(TMP_DIR, `${String(i + 1).padStart(4, '0')}.jpg`);
    const frame = await Jimp.read(f);
    sprite.composite(frame, x, y);
    if ((i + 1) % 50 === 0) {
      console.log(`  Composited ${i + 1}/${TOTAL}`);
    }
  }

  // 3. Write the sprite sheet as jpg with explicit quality.
  console.log(`Writing ${OUT_FILE}…`);
  const buffer = await sprite.getBuffer('image/jpeg', { quality: 70, chromaSubsampling: '4:2:0' });
  fs.writeFileSync(OUT_FILE, buffer);
  const stat = fs.statSync(OUT_FILE);
  console.log(`Done. Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB`);

  // 4. Clean up temp resized frames.
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  console.log('Cleaned temp frames.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
