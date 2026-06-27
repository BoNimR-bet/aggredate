"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const outDir = path.join(__dirname, "..", "assets");
const size = 256;
const rgba = Buffer.alloc(size * size * 4);

function setPixel(x, y, color) {
  const i = (y * size + x) * 4;
  rgba[i] = color[0];
  rgba[i + 1] = color[1];
  rgba[i + 2] = color[2];
  rgba[i + 3] = color[3];
}

function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function roundedRect(x, y, w, h, r, px, py) {
  const cx = Math.max(x + r, Math.min(px, x + w - r));
  const cy = Math.max(y + r, Math.min(py, y + h - r));
  return (px - cx) * (px - cx) + (py - cy) * (py - cy) <= r * r;
}

const bg = [23, 23, 19, 255];
const transparent = [0, 0, 0, 0];
const teal = [15, 118, 110, 255];
const paper = [245, 246, 241, 255];
const boltShadow = [[146, 30], [57, 144], [115, 164], [102, 225], [209, 123], [156, 104], [170, 43]];
const bolt = [[136, 42], [77, 132], [133, 146], [121, 202], [179, 119], [126, 105]];

for (let y = 0; y < size; y++) {
  for (let x = 0; x < size; x++) {
    setPixel(x, y, roundedRect(0, 0, size, size, 52, x, y) ? bg : transparent);
    if (pointInPoly(x, y, boltShadow)) setPixel(x, y, teal);
    if (pointInPoly(x, y, bolt)) setPixel(x, y, paper);
  }
}

const raw = Buffer.alloc((size * 4 + 1) * size);
for (let y = 0; y < size; y++) {
  raw[y * (size * 4 + 1)] = 0;
  rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
}

function crc32(buffer) {
  let c = ~0;
  for (let i = 0; i < buffer.length; i++) {
    c ^= buffer[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return out;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(size, 0);
ihdr.writeUInt32BE(size, 4);
ihdr[8] = 8;
ihdr[9] = 6;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0))
]);

const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
icoHeader[6] = 0;
icoHeader[7] = 0;
icoHeader[8] = 0;
icoHeader[9] = 0;
icoHeader.writeUInt16LE(1, 10);
icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(png.length, 14);
icoHeader.writeUInt32LE(22, 18);

fs.writeFileSync(path.join(outDir, "icon.png"), png);
fs.writeFileSync(path.join(outDir, "icon.ico"), Buffer.concat([icoHeader, png]));
