import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPNG(width, height, drawFn) {
  const buffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    buffer.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawData);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.concat([typeBuf, data]);
    const crc = crc32(crcBuf);
    const crcVal = Buffer.alloc(4);
    crcVal.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcVal]);
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ -1) >>> 0;
  }

  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

const width = 1200;
const height = 630;

const pngBuffer = createPNG(width, height, (x, y, w, h) => {
  const cx1 = w * 0.3;
  const cy1 = h * 0.4;
  const dist1 = Math.hypot(x - cx1, y - cy1);
  const glow1 = Math.max(0, 1 - dist1 / 450);

  const cx2 = w * 0.75;
  const cy2 = h * 0.6;
  const dist2 = Math.hypot(x - cx2, y - cy2);
  const glow2 = Math.max(0, 1 - dist2 / 500);

  let r = 9 + Math.floor(glow1 * 40 + glow2 * 10);
  let g = 13 + Math.floor(glow1 * 20 + glow2 * 50);
  let b = 22 + Math.floor(glow1 * 90 + glow2 * 100);

  const logoX = 140;
  const logoY = 220;
  const logoSize = 190;
  if (x >= logoX && x <= logoX + logoSize && y >= logoY && y <= logoY + logoSize) {
    const rx = (x - logoX) / logoSize;
    const ry = (y - logoY) / logoSize;
    const isCorner = (rx < 0.15 && ry < 0.15 && Math.hypot(rx - 0.15, ry - 0.15) > 0.15) ||
                     (rx > 0.85 && ry < 0.15 && Math.hypot(rx - 0.85, ry - 0.15) > 0.15) ||
                     (rx < 0.15 && ry > 0.85 && Math.hypot(rx - 0.15, ry - 0.85) > 0.15) ||
                     (rx > 0.85 && ry > 0.85 && Math.hypot(rx - 0.85, ry - 0.85) > 0.15);
    
    if (!isCorner) {
      const grad = rx * 0.5 + ry * 0.5;
      r = Math.floor(79 * (1 - grad) + 6 * grad);
      g = Math.floor(70 * (1 - grad) + 182 * grad);
      b = Math.floor(229 * (1 - grad) + 212 * grad);

      const envX = 35;
      const envY = 45;
      const envW = 120;
      const envH = 95;
      const lx = x - logoX;
      const ly = y - logoY;
      
      const isBorder = (lx >= envX && lx <= envX + envW && (ly >= envY && ly <= envY + 8 || ly >= envY + envH - 8 && ly <= envY + envH)) ||
                       (ly >= envY && ly <= envY + envH && (lx >= envX && lx <= envX + 8 || lx >= envX + envW - 8 && lx <= envX + envW));
      
      const diag1 = Math.abs((ly - (envY + 8)) - (lx - (envX + 8)) * 0.7);
      const diag2 = Math.abs((ly - (envY + 8)) - ((envX + envW - 8) - lx) * 0.7);
      const isFlap = (diag1 < 5 || diag2 < 5) && ly <= envY + 55 && lx >= envX + 8 && lx <= envX + envW - 8;

      if (isBorder || isFlap) {
        r = 255;
        g = 255;
        b = 255;
      }
    }
  }

  return [Math.min(255, r), Math.min(255, g), Math.min(255, b), 255];
});

fs.writeFileSync('public/og-image.png', pngBuffer);
console.log('Successfully generated public/og-image.png');
