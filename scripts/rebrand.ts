import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function main() {
  console.log('🎨 Rebranding to KinleyMart...');

  const settings: { key: string; value: string; group: string }[] = [
    { key: 'site_name', value: 'KinleyMart', group: 'general' },
    { key: 'site_tagline', value: 'Quality Products • Best Value • Fast Delivery', group: 'general' },
    { key: 'site_description', value: 'Quality products at the best value with fast delivery. Shop electronics, fashion, home & more at KinleyMart.', group: 'general' },
    { key: 'site_logo', value: '/logo.svg', group: 'general' },
    { key: 'seo_meta_title', value: 'KinleyMart - Quality Products, Best Value, Fast Delivery', group: 'seo' },
    { key: 'seo_meta_description', value: 'Quality products at the best value with fast delivery. Shop electronics, fashion, home & more at KinleyMart.', group: 'seo' },
  ];

  let updatedSettings = 0;
  for (const s of settings) {
    const existing = await prisma.setting.findUnique({ where: { key: s.key } });
    if (existing) {
      if (existing.value !== s.value) {
        await prisma.setting.update({ where: { key: s.key }, data: { value: s.value } });
        updatedSettings++;
      }
    } else {
      await prisma.setting.create({ data: s });
      updatedSettings++;
    }
  }
  console.log(`✅ Settings upserted: ${updatedSettings}`);

  // Update any brand text lingering in CMS pages / blogs / banners
  const replaceText = async <T extends { id: string }>(
    model: 'page' | 'blog' | 'banner' | 'newsletter',
    fields: (keyof T)[]
  ) => {
    const rows = await (prisma as any)[model].findMany();
    let count = 0;
    for (const row of rows) {
      const data: Record<string, string> = {};
      for (const field of fields) {
        const val = (row as any)[field as string];
        if (typeof val === 'string' && val.includes('ShopHub')) {
          data[field as string] = val.replace(/ShopHub/g, 'KinleyMart').replace(/shophub/g, 'kinleymart');
        }
      }
      if (Object.keys(data).length > 0) {
        await (prisma as any)[model].update({ where: { id: row.id }, data });
        count++;
      }
    }
    return count;
  };

  const pageCount = await replaceText('page', ['title', 'content', 'metaTitle', 'metaDescription']);
  const blogCount = await replaceText('blog', ['title', 'excerpt', 'content']);
  const bannerCount = await replaceText('banner', ['title', 'subtitle']);

  console.log(`✅ Pages updated: ${pageCount}`);
  console.log(`✅ Blogs updated: ${blogCount}`);
  console.log(`✅ Banners updated: ${bannerCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Rebrand script failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });