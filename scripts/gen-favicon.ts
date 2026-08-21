import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

async function main() {
  const svg = await sharp('public/favicon.svg').toBuffer();

  await sharp(svg).resize(16, 16).toFile('public/favicon-16x16.png');
  await sharp(svg).resize(32, 32).toFile('public/favicon-32x32.png');
  await sharp(svg).resize(48, 48).toFile('public/favicon-48x48.png');
  await sharp(svg).resize(180, 180).toFile('public/apple-touch-icon.png');
  await sharp(svg).resize(192, 192).toFile('public/icon-192.png');
  await sharp(svg).resize(512, 512).toFile('public/icon-512.png');

  await sharp(svg)
    .resize(16, 16)
    .toFile('public/favicon-16.ico')
    .catch(() => console.log('single ico fallback'));
  const icoFrames = await Promise.all([16, 32, 48].map((s) => sharp(svg).resize(s, s).toBuffer()));
  await sharp(icoFrames)
    .toFile('public/favicon.ico')
    .catch((e) => console.log('ico failed:', e.message));

  const p = new PrismaClient();
  await p.setting.upsert({
    where: { key: 'site_favicon' },
    update: { value: '/favicon.svg' },
    create: { key: 'site_favicon', value: '/favicon.svg', group: 'general' },
  });
  await p.$disconnect();

  console.log('favicons generated + setting updated');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});