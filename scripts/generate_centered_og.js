import fs from 'fs';
import zlib from 'zlib';

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

const width = 600;
const height = 600;

const pngBuffer = createPNG(width, height, (x, y, w, h) => {
  const cx = w / 2;
  const cy = h / 2;
  const dist = Math.hypot(x - cx, y - cy);
  const glow = Math.max(0, 1 - dist / 350);

  let r = 9 + Math.floor(glow * 40);
  let g = 13 + Math.floor(glow * 35);
  let b = 22 + Math.floor(glow * 90);

  const logoSize = 340;
  const logoX = cx - logoSize / 2;
  const logoY = cy - logoSize / 2;

  if (x >= logoX && x <= logoX + logoSize && y >= logoY && y <= logoY + logoSize) {
    const rx = (x - logoX) / logoSize;
    const ry = (y - logoY) / logoSize;
    const cornerRadius = 0.24;
    const isCorner = (rx < cornerRadius && ry < cornerRadius && Math.hypot(rx - cornerRadius, ry - cornerRadius) > cornerRadius) ||
                     (rx > (1 - cornerRadius) && ry < cornerRadius && Math.hypot(rx - (1 - cornerRadius), ry - cornerRadius) > cornerRadius) ||
                     (rx < cornerRadius && ry > (1 - cornerRadius) && Math.hypot(rx - cornerRadius, ry - (1 - cornerRadius)) > cornerRadius) ||
                     (rx > (1 - cornerRadius) && ry > (1 - cornerRadius) && Math.hypot(rx - (1 - cornerRadius), ry - (1 - cornerRadius)) > cornerRadius);

    if (!isCorner) {
      const grad = rx * 0.5 + ry * 0.5;
      r = Math.floor(79 * (1 - grad) + 6 * grad);
      g = Math.floor(70 * (1 - grad) + 182 * grad);
      b = Math.floor(229 * (1 - grad) + 212 * grad);

      const envX = 60;
      const envY = 85;
      const envW = 220;
      const envH = 170;
      const lx = x - logoX;
      const ly = y - logoY;

      const stroke = 18;
      const isBorder = (lx >= envX && lx <= envX + envW && (ly >= envY && ly <= envY + stroke || ly >= envY + envH - stroke && ly <= envY + envH)) ||
                       (ly >= envY && ly <= envY + envH && (lx >= envX && lx <= envX + stroke || lx >= envX + envW - stroke && lx <= envX + envW));

      const flapSlope = (envH * 0.55) / (envW * 0.5);
      const flapY1 = envY + Math.abs(lx - (envX + envW / 2)) * flapSlope;
      const isFlap = Math.abs(ly - flapY1) <= (stroke / 2) && ly <= envY + envH * 0.65 && lx >= envX && lx <= envX + envW;

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
fs.writeFileSync('public/og-square.png', pngBuffer);
console.log('Successfully generated centered public/og-image.png and public/og-square.png');
