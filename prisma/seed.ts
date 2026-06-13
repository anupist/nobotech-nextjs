import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// ============ Helper ============
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function subset<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// ============ Cleanup ============
async function cleanup() {
  console.log('🧹 Cleaning existing data...');

  // Delete in order respecting foreign keys
  await prisma.inventoryLog.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.orderTimeline.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.review.deleteMany();
  await prisma.flashSaleProduct.deleteMany();
  await prisma.flashSale.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.productVariantValue.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attributeValue.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.page.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.newsletter.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.auditLog.deleteMany();

  console.log('✅ Cleanup complete');
}

// ============ Roles & Permissions ============
async function seedRolesAndPermissions() {
  console.log('📋 Seeding roles and permissions...');

  const permissionsData = [
    // User management
    { name: 'View Users', slug: 'view-users', module: 'users' },
    { name: 'Create Users', slug: 'create-users', module: 'users' },
    { name: 'Edit Users', slug: 'edit-users', module: 'users' },
    { name: 'Delete Users', slug: 'delete-users', module: 'users' },
    // Product management
    { name: 'View Products', slug: 'view-products', module: 'products' },
    { name: 'Create Products', slug: 'create-products', module: 'products' },
    { name: 'Edit Products', slug: 'edit-products', module: 'products' },
    { name: 'Delete Products', slug: 'delete-products', module: 'products' },
    // Order management
    { name: 'View Orders', slug: 'view-orders', module: 'orders' },
    { name: 'Create Orders', slug: 'create-orders', module: 'orders' },
    { name: 'Edit Orders', slug: 'edit-orders', module: 'orders' },
    { name: 'Delete Orders', slug: 'delete-orders', module: 'orders' },
    // Category management
    { name: 'View Categories', slug: 'view-categories', module: 'categories' },
    { name: 'Create Categories', slug: 'create-categories', module: 'categories' },
    { name: 'Edit Categories', slug: 'edit-categories', module: 'categories' },
    { name: 'Delete Categories', slug: 'delete-categories', module: 'categories' },
    // Brand management
    { name: 'View Brands', slug: 'view-brands', module: 'brands' },
    { name: 'Create Brands', slug: 'create-brands', module: 'brands' },
    { name: 'Edit Brands', slug: 'edit-brands', module: 'brands' },
    { name: 'Delete Brands', slug: 'delete-brands', module: 'brands' },
    // Coupon management
    { name: 'View Coupons', slug: 'view-coupons', module: 'coupons' },
    { name: 'Create Coupons', slug: 'create-coupons', module: 'coupons' },
    { name: 'Edit Coupons', slug: 'edit-coupons', module: 'coupons' },
    { name: 'Delete Coupons', slug: 'delete-coupons', module: 'coupons' },
    // Blog management
    { name: 'View Blogs', slug: 'view-blogs', module: 'blogs' },
    { name: 'Create Blogs', slug: 'create-blogs', module: 'blogs' },
    { name: 'Edit Blogs', slug: 'edit-blogs', module: 'blogs' },
    { name: 'Delete Blogs', slug: 'delete-blogs', module: 'blogs' },
    // Settings
    { name: 'View Settings', slug: 'view-settings', module: 'settings' },
    { name: 'Edit Settings', slug: 'edit-settings', module: 'settings' },
    // Reviews
    { name: 'View Reviews', slug: 'view-reviews', module: 'reviews' },
    { name: 'Moderate Reviews', slug: 'moderate-reviews', module: 'reviews' },
    // Dashboard
    { name: 'View Dashboard', slug: 'view-dashboard', module: 'dashboard' },
    // Reports
    { name: 'View Reports', slug: 'view-reports', module: 'reports' },
  ];

  const permissions = await Promise.all(
    permissionsData.map((p) => prisma.permission.create({ data: p }))
  );

  const rolesData = [
    {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full access to all system features and settings',
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access with most features',
    },
    {
      name: 'Product Manager',
      slug: 'product-manager',
      description: 'Manage products, categories, brands, and inventory',
    },
    {
      name: 'Order Manager',
      slug: 'order-manager',
      description: 'Manage orders, payments, and shipping',
    },
    {
      name: 'Customer Support',
      slug: 'customer-support',
      description: 'View orders and manage customer inquiries',
    },
    {
      name: 'Customer',
      slug: 'customer',
      description: 'Standard customer access for shopping',
    },
  ];

  const roles: Record<string, ReturnType<typeof prisma.role.create>> = {} as any;

  for (const rd of rolesData) {
    roles[rd.slug] = await prisma.role.create({ data: rd });
  }

  // Assign permissions to roles
  const allPermIds = permissions.map((p) => p.id);
  const productPermIds = permissions.filter((p) => ['products', 'categories', 'brands'].includes(p.module)).map((p) => p.id);
  const orderPermIds = permissions.filter((p) => ['orders'].includes(p.module)).map((p) => p.id);
  const viewPermIds = permissions.filter((p) => p.slug.startsWith('view-')).map((p) => p.id);
  const customerViewPermIds = permissions.filter((p) =>
    ['view-products', 'view-categories', 'view-brands', 'view-orders', 'view-reviews'].includes(p.slug)
  ).map((p) => p.id);

  // Super Admin - all permissions
  for (const pid of allPermIds) {
    await prisma.rolePermission.create({
      data: { roleId: roles['super-admin'].id, permissionId: pid },
    });
  }

  // Admin - all except delete settings
  const adminPermIds = allPermIds.filter((id) => {
    const perm = permissions.find((p) => p.id === id);
    return perm!.slug !== 'delete-settings';
  });
  for (const pid of adminPermIds) {
    await prisma.rolePermission.create({
      data: { roleId: roles['admin'].id, permissionId: pid },
    });
  }

  // Product Manager
  const pmPermIds = [...productPermIds, ...viewPermIds.filter((id) => {
    const perm = permissions.find((p) => p.id === id);
    return ['view-dashboard', 'view-reports', 'view-orders', 'view-reviews', 'view-coupons'].includes(perm!.slug);
  })];
  for (const pid of pmPermIds) {
    await prisma.rolePermission.create({
      data: { roleId: roles['product-manager'].id, permissionId: pid },
    });
  }

  // Order Manager
  const omPermIds = [...orderPermIds, ...viewPermIds.filter((id) => {
    const perm = permissions.find((p) => p.id === id);
    return ['view-dashboard', 'view-reports', 'view-products', 'view-users', 'view-coupons'].includes(perm!.slug);
  })];
  for (const pid of omPermIds) {
    await prisma.rolePermission.create({
      data: { roleId: roles['order-manager'].id, permissionId: pid },
    });
  }

  // Customer Support
  const csPermIds = [...customerViewPermIds, ...viewPermIds.filter((id) => {
    const perm = permissions.find((p) => p.id === id);
    return ['view-dashboard', 'view-users'].includes(perm!.slug);
  }), permissions.find((p) => p.slug === 'moderate-reviews')!.id];
  for (const pid of csPermIds) {
    await prisma.rolePermission.create({
      data: { roleId: roles['customer-support'].id, permissionId: pid },
    });
  }

  // Customer - only view products and orders
  for (const pid of customerViewPermIds) {
    await prisma.rolePermission.create({
      data: { roleId: roles['customer'].id, permissionId: pid },
    });
  }

  console.log(`✅ Created ${rolesData.length} roles and ${permissionsData.length} permissions`);
  return { roles, permissions };
}

// ============ Users ============
async function seedUsers(roles: Record<string, any>) {
  console.log('👤 Seeding users...');

  const usersData = [
    {
      email: 'superadmin@shop.com',
      name: 'Super Admin',
      password: 'admin123',
      phone: '+1234567890',
      emailVerified: true,
      roleSlug: 'super-admin',
    },
    {
      email: 'admin@shop.com',
      name: 'Admin User',
      password: 'admin123',
      phone: '+1234567891',
      emailVerified: true,
      roleSlug: 'admin',
    },
    {
      email: 'pm@shop.com',
      name: 'Product Manager',
      password: 'admin123',
      phone: '+1234567892',
      emailVerified: true,
      roleSlug: 'product-manager',
    },
  ];

  const customerData = [
    {
      email: 'customer1@shop.com',
      name: 'Alice Johnson',
      password: 'customer123',
      phone: '+1987654321',
    },
    {
      email: 'customer2@shop.com',
      name: 'Bob Smith',
      password: 'customer123',
      phone: '+1987654322',
    },
    {
      email: 'customer3@shop.com',
      name: 'Carol Williams',
      password: 'customer123',
      phone: '+1987654323',
    },
    {
      email: 'customer4@shop.com',
      name: 'David Brown',
      password: 'customer123',
      phone: '+1987654324',
    },
    {
      email: 'customer5@shop.com',
      name: 'Emma Davis',
      password: 'customer123',
      phone: '+1987654325',
    },
  ];

  const staffUsers: any[] = [];
  for (const ud of usersData) {
    const user = await prisma.user.create({
      data: {
        email: ud.email,
        name: ud.name,
        password: ud.password,
        phone: ud.phone,
        emailVerified: ud.emailVerified,
        avatar: `https://i.pravatar.cc/150?u=${ud.email}`,
      },
    });
    await prisma.userRole.create({
      data: { userId: user.id, roleId: roles[ud.roleSlug].id },
    });
    staffUsers.push(user);
  }

  const customerUsers: any[] = [];
  for (const cd of customerData) {
    const user = await prisma.user.create({
      data: {
        email: cd.email,
        name: cd.name,
        password: cd.password,
        phone: cd.phone,
        emailVerified: true,
        avatar: `https://i.pravatar.cc/150?u=${cd.email}`,
      },
    });
    await prisma.userRole.create({
      data: { userId: user.id, roleId: roles['customer'].id },
    });
    const customer = await prisma.customer.create({
      data: {
        userId: user.id,
        loyaltyPoints: randomInt(0, 500),
      },
    });
    // Create a default address for each customer
    await prisma.address.create({
      data: {
        customerId: customer.id,
        label: 'Home',
        firstName: cd.name.split(' ')[0],
        lastName: cd.name.split(' ')[1] || '',
        phone: cd.phone,
        address1: `${randomInt(100, 999)} Main Street`,
        address2: `Apt ${randomInt(1, 50)}`,
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US',
        isDefault: true,
      },
    });
    customerUsers.push({ ...user, customer });
  }

  console.log(`✅ Created ${staffUsers.length} staff users and ${customerUsers.length} customers`);
  return { staffUsers, customerUsers };
}

// ============ Categories ============
async function seedCategories() {
  console.log('📂 Seeding categories...');

  const categoriesData = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest gadgets and electronic devices',
      image: 'https://picsum.photos/seed/electronics/600/400',
      children: [
        { name: 'Smartphones', slug: 'smartphones', description: 'Mobile phones and accessories' },
        { name: 'Laptops', slug: 'laptops', description: 'Notebooks and laptops' },
        { name: 'Audio', slug: 'audio', description: 'Headphones, speakers, and audio equipment' },
        { name: 'Cameras', slug: 'cameras', description: 'Digital cameras and photography gear' },
      ],
    },
    {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel for everyone',
      image: 'https://picsum.photos/seed/clothing/600/400',
      children: [
        { name: "Men's Wear", slug: 'mens-wear', description: "Men's clothing and fashion" },
        { name: "Women's Wear", slug: 'womens-wear', description: "Women's clothing and fashion" },
        { name: 'Sportswear', slug: 'sportswear', description: 'Athletic and sports clothing' },
        { name: 'Shoes', slug: 'shoes', description: 'Footwear for all occasions' },
      ],
    },
    {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Everything for your home and kitchen',
      image: 'https://picsum.photos/seed/home-kitchen/600/400',
      children: [
        { name: 'Kitchen Appliances', slug: 'kitchen-appliances', description: 'Appliances for your kitchen' },
        { name: 'Furniture', slug: 'furniture', description: 'Home furniture and decor' },
        { name: 'Bedding', slug: 'bedding', description: 'Bed sheets, pillows, and comforters' },
      ],
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and outdoor gear',
      image: 'https://picsum.photos/seed/sports/600/400',
      children: [
        { name: 'Fitness', slug: 'fitness', description: 'Gym and fitness equipment' },
        { name: 'Outdoor', slug: 'outdoor', description: 'Camping and outdoor gear' },
      ],
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books, ebooks, and audiobooks',
      image: 'https://picsum.photos/seed/books/600/400',
      children: [
        { name: 'Fiction', slug: 'fiction', description: 'Novels and fiction books' },
        { name: 'Non-Fiction', slug: 'non-fiction', description: 'Non-fiction and educational books' },
      ],
    },
  ];

  const allCategories: any[] = [];
  const subCategories: Record<string, any[]> = {};

  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    const parent = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        sortOrder: i,
        isActive: true,
      },
    });
    allCategories.push(parent);
    subCategories[cat.slug] = [];

    for (let j = 0; j < cat.children.length; j++) {
      const child = cat.children[j];
      const subCat = await prisma.category.create({
        data: {
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: parent.id,
          sortOrder: j,
          isActive: true,
        },
      });
      subCategories[cat.slug].push(subCat);
      allCategories.push(subCat);
    }
  }

  console.log(`✅ Created ${allCategories.length} categories`);
  return { allCategories, subCategories };
}

// ============ Brands ============
async function seedBrands() {
  console.log('🏷️ Seeding brands...');

  const brandsData = [
    { name: 'Apple', slug: 'apple', description: 'Think Different', logo: 'https://picsum.photos/seed/apple-logo/200/200' },
    { name: 'Samsung', slug: 'samsung', description: 'Galaxy of possibilities', logo: 'https://picsum.photos/seed/samsung-logo/200/200' },
    { name: 'Nike', slug: 'nike', description: 'Just Do It', logo: 'https://picsum.photos/seed/nike-logo/200/200' },
    { name: 'Adidas', slug: 'adidas', description: 'Impossible Is Nothing', logo: 'https://picsum.photos/seed/adidas-logo/200/200' },
    { name: 'Sony', slug: 'sony', description: 'Be Moved', logo: 'https://picsum.photos/seed/sony-logo/200/200' },
    { name: 'Dell', slug: 'dell', description: 'The power to do more', logo: 'https://picsum.photos/seed/dell-logo/200/200' },
    { name: 'Bose', slug: 'bose', description: 'Better sound through research', logo: 'https://picsum.photos/seed/bose-logo/200/200' },
    { name: 'Canon', slug: 'canon', description: 'Delighting You Always', logo: 'https://picsum.photos/seed/canon-logo/200/200' },
    { name: 'KitchenAid', slug: 'kitchenaid', description: 'For the way it\'s made', logo: 'https://picsum.photos/seed/kitchenaid-logo/200/200' },
    { name: 'Levi\'s', slug: 'levis', description: 'The original jeans', logo: 'https://picsum.photos/seed/levis-logo/200/200' },
    { name: 'Under Armour', slug: 'under-armour', description: 'Protect This House', logo: 'https://picsum.photos/seed/underarmour-logo/200/200' },
    { name: 'Dyson', slug: 'dyson', description: 'Solve problems others ignore', logo: 'https://picsum.photos/seed/dyson-logo/200/200' },
  ];

  const brands: any[] = [];
  for (const bd of brandsData) {
    const brand = await prisma.brand.create({ data: bd });
    brands.push(brand);
  }

  console.log(`✅ Created ${brands.length} brands`);
  return brands;
}

// ============ Attributes ============
async function seedAttributes() {
  console.log('🎨 Seeding attributes...');

  const attributesData = [
    {
      name: 'Color',
      slug: 'color',
      type: 'color',
      values: [
        { value: 'Red', meta: '#EF4444' },
        { value: 'Blue', meta: '#3B82F6' },
        { value: 'Black', meta: '#1F2937' },
        { value: 'White', meta: '#F9FAFB' },
        { value: 'Green', meta: '#10B981' },
        { value: 'Navy', meta: '#1E3A5F' },
        { value: 'Gray', meta: '#6B7280' },
        { value: 'Pink', meta: '#EC4899' },
      ],
    },
    {
      name: 'Size',
      slug: 'size',
      type: 'size',
      values: [
        { value: 'XS', meta: null },
        { value: 'S', meta: null },
        { value: 'M', meta: null },
        { value: 'L', meta: null },
        { value: 'XL', meta: null },
        { value: 'XXL', meta: null },
      ],
    },
    {
      name: 'Storage',
      slug: 'storage',
      type: 'text',
      values: [
        { value: '64GB', meta: null },
        { value: '128GB', meta: null },
        { value: '256GB', meta: null },
        { value: '512GB', meta: null },
        { value: '1TB', meta: null },
      ],
    },
    {
      name: 'Material',
      slug: 'material',
      type: 'text',
      values: [
        { value: 'Cotton', meta: null },
        { value: 'Polyester', meta: null },
        { value: 'Leather', meta: null },
        { value: 'Metal', meta: null },
        { value: 'Wool', meta: null },
      ],
    },
  ];

  const attributeMap: Record<string, any> = {};

  for (const ad of attributesData) {
    const attribute = await prisma.attribute.create({
      data: { name: ad.name, slug: ad.slug, type: ad.type },
    });

    const values: any[] = [];
    for (const vd of ad.values) {
      const val = await prisma.attributeValue.create({
        data: {
          attributeId: attribute.id,
          value: vd.value,
          meta: vd.meta,
        },
      });
      values.push(val);
    }

    attributeMap[ad.slug] = { attribute, values };
  }

  console.log(`✅ Created ${Object.keys(attributeMap).length} attributes with values`);
  return attributeMap;
}

// ============ Products ============
async function seedProducts(
  subCategories: Record<string, any[]>,
  brands: any[],
  attributeMap: Record<string, any>
) {
  console.log('📦 Seeding products...');

  const getBrand = (slug: string) => brands.find((b) => b.slug === slug);
  const getColorVal = (color: string) => attributeMap.color.values.find((v: any) => v.value === color);
  const getSizeVal = (size: string) => attributeMap.size.values.find((v: any) => v.value === size);
  const getStorageVal = (storage: string) => attributeMap.storage.values.find((v: any) => v.value === storage);

  const productsData = [
    // ---- Electronics / Smartphones ----
    {
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      sku: 'APL-IP15PM',
      description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and a 48MP camera system. Experience the future of mobile technology.',
      specifications: JSON.stringify({ Display: '6.7" Super Retina XDR', Chip: 'A17 Pro', Camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto', Battery: 'Up to 29 hours video playback', OS: 'iOS 17' }),
      features: JSON.stringify(['Titanium design', 'Action Button', 'USB-C with Thunderbolt', 'ProRes video recording']),
      costPrice: 999,
      sellingPrice: 1199,
      discountPrice: 1099,
      brandSlug: 'apple',
      subCategorySlug: 'smartphones',
      status: 'active',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      totalSold: 342,
      variants: [
        { name: 'Black / 128GB', color: 'Black', storage: '128GB', price: 1099, sku: 'APL-IP15PM-BK-128' },
        { name: 'Black / 256GB', color: 'Black', storage: '256GB', price: 1199, sku: 'APL-IP15PM-BK-256' },
        { name: 'White / 128GB', color: 'White', storage: '128GB', price: 1099, sku: 'APL-IP15PM-WH-128' },
        { name: 'White / 256GB', color: 'White', storage: '256GB', price: 1199, sku: 'APL-IP15PM-WH-256' },
      ],
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      slug: 'samsung-galaxy-s24-ultra',
      sku: 'SAM-S24U',
      description: 'The ultimate Galaxy experience with AI-powered features, S Pen, and a stunning 200MP camera.',
      specifications: JSON.stringify({ Display: '6.8" Dynamic AMOLED 2X', Chip: 'Snapdragon 8 Gen 3', Camera: '200MP Main + 12MP Ultra Wide + 50MP Telephoto + 10MP Telephoto', Battery: '5000mAh' }),
      features: JSON.stringify(['Galaxy AI', 'S Pen built-in', 'Titanium frame', '5x optical zoom']),
      costPrice: 1050,
      sellingPrice: 1299,
      discountPrice: null,
      brandSlug: 'samsung',
      subCategorySlug: 'smartphones',
      status: 'active',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 215,
      variants: [
        { name: 'Black / 256GB', color: 'Black', storage: '256GB', price: 1299, sku: 'SAM-S24U-BK-256' },
        { name: 'Navy / 256GB', color: 'Navy', storage: '256GB', price: 1299, sku: 'SAM-S24U-NV-256' },
        { name: 'Black / 512GB', color: 'Black', storage: '512GB', price: 1419, sku: 'SAM-S24U-BK-512' },
      ],
    },
    // ---- Electronics / Laptops ----
    {
      name: 'MacBook Pro 16" M3 Max',
      slug: 'macbook-pro-16-m3-max',
      sku: 'APL-MBP16-M3',
      description: 'Supercharged by M3 Max. The most powerful MacBook Pro ever with up to 22 hours of battery life.',
      specifications: JSON.stringify({ Display: '16.2" Liquid Retina XDR', Chip: 'Apple M3 Max', Memory: 'Up to 128GB', Storage: 'Up to 8TB SSD', Battery: 'Up to 22 hours' }),
      features: JSON.stringify(['M3 Max chip', 'Space Black finish', 'MagSafe charging', 'SDXC card slot']),
      costPrice: 2799,
      sellingPrice: 3499,
      discountPrice: 3299,
      brandSlug: 'apple',
      subCategorySlug: 'laptops',
      status: 'active',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 156,
      variants: [
        { name: 'Black / 512GB', color: 'Black', storage: '512GB', price: 3299, sku: 'APL-MBP16-BK-512' },
        { name: 'Black / 1TB', color: 'Black', storage: '1TB', price: 3499, sku: 'APL-MBP16-BK-1TB' },
      ],
    },
    {
      name: 'Dell XPS 15',
      slug: 'dell-xps-15',
      sku: 'DEL-XPS15',
      description: 'Premium 15.6-inch laptop with InfinityEdge display and Intel Core i9 processor for professionals.',
      specifications: JSON.stringify({ Display: '15.6" 4K UHD+ InfinityEdge', Processor: 'Intel Core i9-13900H', Memory: '32GB DDR5', Storage: '1TB SSD', Graphics: 'NVIDIA RTX 4070' }),
      features: JSON.stringify(['InfinityEdge display', 'CNC machined aluminum', 'Carbon fiber palm rest', 'Thunderbolt 4']),
      costPrice: 1599,
      sellingPrice: 1899,
      discountPrice: null,
      brandSlug: 'dell',
      subCategorySlug: 'laptops',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 198,
      variants: [],
    },
    // ---- Electronics / Audio ----
    {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      sku: 'SNY-WH1000XM5',
      description: 'Industry-leading noise cancellation with Auto NC Optimizer and crystal clear hands-free calling.',
      specifications: JSON.stringify({ Type: 'Over-ear wireless', Driver: '30mm', Battery: 'Up to 30 hours', ANC: 'Auto NC Optimizer', Weight: '250g' }),
      features: JSON.stringify(['Industry-leading ANC', 'Multi-point connection', 'Speak-to-Chat', 'Hi-Res Audio']),
      costPrice: 249,
      sellingPrice: 349,
      discountPrice: 299,
      brandSlug: 'sony',
      subCategorySlug: 'audio',
      status: 'active',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 567,
      variants: [
        { name: 'Black', color: 'Black', price: 299, sku: 'SNY-WH1000XM5-BK' },
        { name: 'White', color: 'White', price: 299, sku: 'SNY-WH1000XM5-WH' },
      ],
    },
    {
      name: 'Bose QuietComfort Ultra',
      slug: 'bose-quietcomfort-ultra',
      sku: 'BSE-QCU',
      description: 'World-class noise cancellation meets spatial audio for an immersive listening experience.',
      specifications: JSON.stringify({ Type: 'Over-ear wireless', Battery: 'Up to 24 hours', ANC: 'CustomTune', Weight: '250g' }),
      features: JSON.stringify(['Spatial Audio', 'CustomTune ANC', 'Aware Mode', 'SimpleSync']),
      costPrice: 329,
      sellingPrice: 429,
      discountPrice: null,
      brandSlug: 'bose',
      subCategorySlug: 'audio',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 89,
      variants: [
        { name: 'Black', color: 'Black', price: 429, sku: 'BSE-QCU-BK' },
        { name: 'White', color: 'White', price: 429, sku: 'BSE-QCU-WH' },
      ],
    },
    // ---- Electronics / Cameras ----
    {
      name: 'Canon EOS R6 Mark II',
      slug: 'canon-eos-r6-mark-ii',
      sku: 'CN-EOSR6II',
      description: 'Full-frame mirrorless camera with 24.2MP sensor, advanced AF, and 6K video recording capabilities.',
      specifications: JSON.stringify({ Sensor: '24.2MP Full-Frame CMOS', AF: 'Dual Pixel CMOS AF II', Video: '6K 60fps RAW', ISO: '100-102400', Stabilization: 'Up to 8 stops' }),
      features: JSON.stringify(['Subject detection AF', '6K RAW video', 'In-body IS', 'Dual card slots']),
      costPrice: 1999,
      sellingPrice: 2499,
      discountPrice: 2299,
      brandSlug: 'canon',
      subCategorySlug: 'cameras',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 67,
      variants: [],
    },
    // ---- Clothing / Men's Wear ----
    {
      name: 'Nike Dri-FIT T-Shirt',
      slug: 'nike-dri-fit-tshirt',
      sku: 'NKE-DFTEE',
      description: 'Stay cool and dry with Nike Dri-FIT technology. Perfect for workouts and everyday wear.',
      specifications: JSON.stringify({ Material: '100% Polyester', Fit: 'Regular', Technology: 'Dri-FIT', Care: 'Machine washable' }),
      features: JSON.stringify(['Dri-FIT moisture-wicking', 'Lightweight fabric', 'Comfortable fit']),
      costPrice: 18,
      sellingPrice: 35,
      discountPrice: null,
      brandSlug: 'nike',
      subCategorySlug: 'mens-wear',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 1243,
      variants: [
        { name: 'Black / S', color: 'Black', size: 'S', price: 35, sku: 'NKE-DFTEE-BK-S' },
        { name: 'Black / M', color: 'Black', size: 'M', price: 35, sku: 'NKE-DFTEE-BK-M' },
        { name: 'Black / L', color: 'Black', size: 'L', price: 35, sku: 'NKE-DFTEE-BK-L' },
        { name: 'Black / XL', color: 'Black', size: 'XL', price: 35, sku: 'NKE-DFTEE-BK-XL' },
        { name: 'White / S', color: 'White', size: 'S', price: 35, sku: 'NKE-DFTEE-WH-S' },
        { name: 'White / M', color: 'White', size: 'M', price: 35, sku: 'NKE-DFTEE-WH-M' },
        { name: 'White / L', color: 'White', size: 'L', price: 35, sku: 'NKE-DFTEE-WH-L' },
        { name: 'Red / M', color: 'Red', size: 'M', price: 35, sku: 'NKE-DFTEE-RD-M' },
        { name: 'Blue / M', color: 'Blue', size: 'M', price: 35, sku: 'NKE-DFTEE-BL-M' },
      ],
    },
    {
      name: "Levi's 501 Original Fit Jeans",
      slug: 'levis-501-original-fit',
      sku: 'LEV-501ORG',
      description: 'The original jeans. The button-fly 501 Original Fit Jeans are the blueprint for all jeans.',
      specifications: JSON.stringify({ Material: '100% Cotton', Fit: 'Original', Rise: 'Mid', Closure: 'Button fly' }),
      features: JSON.stringify(['Classic 501 fit', 'Button fly', 'Straight leg', 'Mid rise']),
      costPrice: 35,
      sellingPrice: 69,
      discountPrice: 55,
      brandSlug: 'levis',
      subCategorySlug: 'mens-wear',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 876,
      variants: [
        { name: 'Black / S', color: 'Black', size: 'S', price: 55, sku: 'LEV-501-BK-S' },
        { name: 'Black / M', color: 'Black', size: 'M', price: 55, sku: 'LEV-501-BK-M' },
        { name: 'Black / L', color: 'Black', size: 'L', price: 55, sku: 'LEV-501-BK-L' },
        { name: 'Blue / S', color: 'Blue', size: 'S', price: 55, sku: 'LEV-501-BL-S' },
        { name: 'Blue / M', color: 'Blue', size: 'M', price: 55, sku: 'LEV-501-BL-M' },
        { name: 'Blue / L', color: 'Blue', size: 'L', price: 55, sku: 'LEV-501-BL-L' },
      ],
    },
    // ---- Clothing / Women's Wear ----
    {
      name: 'Adidas Ultraboost Running Shoes',
      slug: 'adidas-ultraboost',
      sku: 'ADS-ULTRAB',
      description: 'Responsive cushioning meets incredible energy return. The Ultraboost is designed for runners who want comfort and performance.',
      specifications: JSON.stringify({ Material: 'Primeknit+ upper', Sole: 'Continental Rubber', Midsole: 'BOOST', Weight: '310g' }),
      features: JSON.stringify(['BOOST midsole', 'Primeknit+ upper', 'Continental rubber outsole', 'Linear energy push']),
      costPrice: 89,
      sellingPrice: 190,
      discountPrice: 159,
      brandSlug: 'adidas',
      subCategorySlug: 'shoes',
      status: 'active',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 734,
      variants: [
        { name: 'Black / S', color: 'Black', size: 'S', price: 159, sku: 'ADS-ULTRAB-BK-S' },
        { name: 'Black / M', color: 'Black', size: 'M', price: 159, sku: 'ADS-ULTRAB-BK-M' },
        { name: 'Black / L', color: 'Black', size: 'L', price: 159, sku: 'ADS-ULTRAB-BK-L' },
        { name: 'White / S', color: 'White', size: 'S', price: 159, sku: 'ADS-ULTRAB-WH-S' },
        { name: 'White / M', color: 'White', size: 'M', price: 159, sku: 'ADS-ULTRAB-WH-M' },
      ],
    },
    {
      name: 'Nike Air Max 270',
      slug: 'nike-air-max-270',
      sku: 'NKE-AM270',
      description: 'The Air Max 270 features Nike\'s biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks.',
      specifications: JSON.stringify({ Material: 'Mesh and synthetic upper', Sole: 'Rubber', Air: '270-degree Air unit', Weight: '310g' }),
      features: JSON.stringify(['270 Air unit', 'Mesh upper', 'Foam midsole', 'Rubber outsole']),
      costPrice: 75,
      sellingPrice: 150,
      discountPrice: null,
      brandSlug: 'nike',
      subCategorySlug: 'shoes',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 445,
      variants: [
        { name: 'Black / S', color: 'Black', size: 'S', price: 150, sku: 'NKE-AM270-BK-S' },
        { name: 'Black / M', color: 'Black', size: 'M', price: 150, sku: 'NKE-AM270-BK-M' },
        { name: 'White / M', color: 'White', size: 'M', price: 150, sku: 'NKE-AM270-WH-M' },
        { name: 'Red / M', color: 'Red', size: 'M', price: 150, sku: 'NKE-AM270-RD-M' },
      ],
    },
    // ---- Clothing / Sportswear ----
    {
      name: 'Under Armour Storm Jacket',
      slug: 'under-armour-storm-jacket',
      sku: 'UA-STRMJK',
      description: 'Water-resistant, lightweight, and breathable. The Storm Jacket keeps you protected in any weather.',
      specifications: JSON.stringify({ Material: '100% Polyester', Water_Resistance: 'UA Storm technology', Fit: 'Loose', Weight: '340g' }),
      features: JSON.stringify(['UA Storm technology', 'Lightweight design', 'Breathable fabric', 'Secure zip pockets']),
      costPrice: 55,
      sellingPrice: 120,
      discountPrice: 99,
      brandSlug: 'under-armour',
      subCategorySlug: 'sportswear',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 312,
      variants: [
        { name: 'Black / M', color: 'Black', size: 'M', price: 99, sku: 'UA-STRM-BK-M' },
        { name: 'Black / L', color: 'Black', size: 'L', price: 99, sku: 'UA-STRM-BK-L' },
        { name: 'Navy / M', color: 'Navy', size: 'M', price: 99, sku: 'UA-STRM-NV-M' },
        { name: 'Navy / L', color: 'Navy', size: 'L', price: 99, sku: 'UA-STRM-NV-L' },
      ],
    },
    // ---- Home & Kitchen / Kitchen Appliances ----
    {
      name: 'KitchenAid Stand Mixer',
      slug: 'kitchenaid-stand-mixer',
      sku: 'KA-STNDMXR',
      description: 'The iconic KitchenAid Stand Mixer. A must-have for any kitchen, from mixing dough to whipping cream.',
      specifications: JSON.stringify({ Motor: '10 speeds', Bowl: '5-quart stainless steel', Attachments: 'Flat beater, dough hook, wire whip', Wattage: '325W' }),
      features: JSON.stringify(['10-speed motor', '5-quart bowl', 'Tilt-head design', 'Hub for attachments']),
      costPrice: 229,
      sellingPrice: 449,
      discountPrice: 379,
      brandSlug: 'kitchenaid',
      subCategorySlug: 'kitchen-appliances',
      status: 'active',
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 423,
      variants: [
        { name: 'Black', color: 'Black', price: 379, sku: 'KA-STNDMXR-BK' },
        { name: 'White', color: 'White', price: 379, sku: 'KA-STNDMXR-WH' },
        { name: 'Red', color: 'Red', price: 379, sku: 'KA-STNDMXR-RD' },
      ],
    },
    {
      name: 'Dyson V15 Detect Vacuum',
      slug: 'dyson-v15-detect',
      sku: 'DYN-V15',
      description: 'Dyson\'s most powerful cordless vacuum with laser dust detection and LCD screen showing particle counts.',
      specifications: JSON.stringify({ Run_Time: 'Up to 60 minutes', Suction: '230 AW', Filtration: 'Whole-machine HEPA', Weight: '6.8 lbs' }),
      features: JSON.stringify(['Laser dust detection', 'LCD screen', 'Piezo sensor', 'HEPA filtration']),
      costPrice: 449,
      sellingPrice: 749,
      discountPrice: null,
      brandSlug: 'dyson',
      subCategorySlug: 'kitchen-appliances',
      status: 'active',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 178,
      variants: [],
    },
    // ---- Home & Kitchen / Furniture ----
    {
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      sku: 'HM-ERGOCHR',
      description: 'Premium ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back.',
      specifications: JSON.stringify({ Material: 'Mesh and metal', Adjustments: 'Height, tilt, armrests', Weight_Capacity: '300 lbs', Warranty: '5 years' }),
      features: JSON.stringify(['Adjustable lumbar support', '4D armrests', 'Breathable mesh', 'Tilt lock mechanism']),
      costPrice: 299,
      sellingPrice: 599,
      discountPrice: 499,
      brandSlug: 'dyson',
      subCategorySlug: 'furniture',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 289,
      variants: [
        { name: 'Black', color: 'Black', price: 499, sku: 'HM-ERGOCHR-BK' },
        { name: 'Gray', color: 'Gray', price: 499, sku: 'HM-ERGOCHR-GR' },
      ],
    },
    // ---- Home & Kitchen / Bedding ----
    {
      name: 'Premium Egyptian Cotton Sheet Set',
      slug: 'premium-egyptian-cotton-sheets',
      sku: 'BD-EGYSH',
      description: 'Luxurious 1000-thread-count Egyptian cotton sheet set for the ultimate sleeping experience.',
      specifications: JSON.stringify({ Material: '100% Egyptian Cotton', Thread_Count: '1000', Pieces: 'Flat sheet, fitted sheet, 2 pillowcases', Care: 'Machine wash cold' }),
      features: JSON.stringify(['1000 thread count', 'Sateen weave', 'Deep pocket fitted sheet', 'Wrinkle resistant']),
      costPrice: 45,
      sellingPrice: 129,
      discountPrice: 99,
      brandSlug: 'kitchenaid',
      subCategorySlug: 'bedding',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      totalSold: 156,
      variants: [
        { name: 'White / Full', color: 'White', size: 'L', price: 99, sku: 'BD-EGYSH-WH-L' },
        { name: 'White / Queen', color: 'White', size: 'XL', price: 109, sku: 'BD-EGYSH-WH-XL' },
        { name: 'Gray / Queen', color: 'Gray', size: 'XL', price: 109, sku: 'BD-EGYSH-GR-XL' },
      ],
    },
    // ---- Sports / Fitness ----
    {
      name: 'Adjustable Dumbbell Set',
      slug: 'adjustable-dumbbell-set',
      sku: 'SP-ADJDB',
      description: 'Space-saving adjustable dumbbell set that replaces 15 sets of weights. Quick-change mechanism for seamless workouts.',
      specifications: JSON.stringify({ Weight_Range: '5-52.5 lbs each', Increments: '2.5-5 lbs', Mechanism: 'Dial adjustment', Dimensions: '16.5" x 8" x 8"' }),
      features: JSON.stringify(['Replaces 15 weight sets', 'Quick adjustment', 'Compact design', 'Durable construction']),
      costPrice: 199,
      sellingPrice: 399,
      discountPrice: 349,
      brandSlug: 'under-armour',
      subCategorySlug: 'fitness',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      totalSold: 234,
      variants: [],
    },
    {
      name: 'Yoga Mat Premium',
      slug: 'yoga-mat-premium',
      sku: 'SP-YOGAMT',
      description: 'Extra thick, non-slip yoga mat with alignment lines. Perfect for yoga, pilates, and floor exercises.',
      specifications: JSON.stringify({ Material: 'TPE Eco-Friendly', Thickness: '6mm', Dimensions: '72" x 26"', Weight: '2.5 lbs' }),
      features: JSON.stringify(['Non-slip surface', 'Alignment lines', 'Eco-friendly material', 'Carry strap included']),
      costPrice: 15,
      sellingPrice: 49,
      discountPrice: null,
      brandSlug: 'nike',
      subCategorySlug: 'fitness',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      totalSold: 567,
      variants: [
        { name: 'Black', color: 'Black', price: 49, sku: 'SP-YOGAMT-BK' },
        { name: 'Blue', color: 'Blue', price: 49, sku: 'SP-YOGAMT-BL' },
        { name: 'Green', color: 'Green', price: 49, sku: 'SP-YOGAMT-GN' },
        { name: 'Pink', color: 'Pink', price: 49, sku: 'SP-YOGAMT-PK' },
      ],
    },
    // ---- Sports / Outdoor ----
    {
      name: '4-Person Camping Tent',
      slug: 'camping-tent-4-person',
      sku: 'SP-CMP4P',
      description: 'Lightweight and waterproof 4-person tent perfect for backpacking and camping adventures.',
      specifications: JSON.stringify({ Capacity: '4 persons', Weight: '7.2 lbs', Setup: 'Quick-pitch 2 poles', Waterproof: '3000mm HH' }),
      features: JSON.stringify(['Quick-pitch design', 'Waterproof 3000mm', 'Ventilation system', 'Interior pockets']),
      costPrice: 89,
      sellingPrice: 199,
      discountPrice: 169,
      brandSlug: 'under-armour',
      subCategorySlug: 'outdoor',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      totalSold: 98,
      variants: [],
    },
    // ---- Books / Fiction ----
    {
      name: 'The Art of Programming',
      slug: 'the-art-of-programming',
      sku: 'BK-ARTPRG',
      description: 'A comprehensive guide to programming concepts, algorithms, and best practices for modern software development.',
      specifications: JSON.stringify({ Pages: '450', Publisher: 'Tech Press', Language: 'English', ISBN: '978-0-123456-78-9' }),
      features: JSON.stringify(['Comprehensive coverage', 'Real-world examples', 'Exercise problems', 'Online resources']),
      costPrice: 15,
      sellingPrice: 39,
      discountPrice: null,
      brandSlug: 'apple',
      subCategorySlug: 'fiction',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 345,
      variants: [],
    },
    {
      name: 'Digital Minimalism',
      slug: 'digital-minimalism',
      sku: 'BK-DIGMIN',
      description: 'A guide to choosing a focused life in a noisy world. Learn to be intentional with your technology use.',
      specifications: JSON.stringify({ Pages: '320', Publisher: 'Mindful Books', Language: 'English', ISBN: '978-0-987654-32-1' }),
      features: JSON.stringify(['Practical strategies', 'Research-backed', '30-day digital declutter', 'Case studies']),
      costPrice: 12,
      sellingPrice: 28,
      discountPrice: 22,
      brandSlug: 'samsung',
      subCategorySlug: 'non-fiction',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      totalSold: 234,
      variants: [],
    },
    // ---- More Clothing ----
    {
      name: 'Adidas Originals Hoodie',
      slug: 'adidas-originals-hoodie',
      sku: 'ADS-ORIGHOOD',
      description: 'Classic Adidas style meets modern comfort. This hoodie features the iconic 3-stripe design and cozy fleece lining.',
      specifications: JSON.stringify({ Material: '70% Cotton, 30% Polyester', Fit: 'Regular', Features: 'Kangaroo pocket, drawcord hood', Care: 'Machine washable' }),
      features: JSON.stringify(['Iconic 3-stripe design', 'Fleece lining', 'Kangaroo pocket', 'Ribbed cuffs']),
      costPrice: 35,
      sellingPrice: 80,
      discountPrice: 65,
      brandSlug: 'adidas',
      subCategorySlug: 'sportswear',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      totalSold: 678,
      variants: [
        { name: 'Black / S', color: 'Black', size: 'S', price: 65, sku: 'ADS-ORIGHOOD-BK-S' },
        { name: 'Black / M', color: 'Black', size: 'M', price: 65, sku: 'ADS-ORIGHOOD-BK-M' },
        { name: 'Black / L', color: 'Black', size: 'L', price: 65, sku: 'ADS-ORIGHOOD-BK-L' },
        { name: 'Black / XL', color: 'Black', size: 'XL', price: 65, sku: 'ADS-ORIGHOOD-BK-XL' },
        { name: 'White / M', color: 'White', size: 'M', price: 65, sku: 'ADS-ORIGHOOD-WH-M' },
        { name: 'White / L', color: 'White', size: 'L', price: 65, sku: 'ADS-ORIGHOOD-WH-L' },
      ],
    },
    {
      name: 'Samsung Galaxy Watch 6',
      slug: 'samsung-galaxy-watch-6',
      sku: 'SAM-GW6',
      description: 'Advanced health monitoring with BioActive sensor, sleep coaching, and customizable watch faces.',
      specifications: JSON.stringify({ Display: '1.4" Super AMOLED', Battery: 'Up to 40 hours', Sensors: 'BioActive, HR, SpO2', OS: 'Wear OS' }),
      features: JSON.stringify(['Body composition analysis', 'Sleep coaching', 'Fall detection', 'Custom watch faces']),
      costPrice: 199,
      sellingPrice: 329,
      discountPrice: 279,
      brandSlug: 'samsung',
      subCategorySlug: 'smartphones',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 156,
      variants: [
        { name: 'Black', color: 'Black', price: 279, sku: 'SAM-GW6-BK' },
        { name: 'White', color: 'White', price: 279, sku: 'SAM-GW6-WH' },
      ],
    },
    {
      name: 'Nike Running Shorts',
      slug: 'nike-running-shorts',
      sku: 'NKE-RNSHRT',
      description: 'Lightweight and breathable running shorts with built-in liner for maximum comfort during your runs.',
      specifications: JSON.stringify({ Material: '100% Polyester', Inseam: '5 inches', Features: 'Zip pocket, reflective details', Fit: 'Standard' }),
      features: JSON.stringify(['Dri-FIT technology', 'Built-in liner', 'Zip pocket', 'Reflective details']),
      costPrice: 15,
      sellingPrice: 45,
      discountPrice: null,
      brandSlug: 'nike',
      subCategorySlug: 'sportswear',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      totalSold: 389,
      variants: [
        { name: 'Black / S', color: 'Black', size: 'S', price: 45, sku: 'NKE-RNSHRT-BK-S' },
        { name: 'Black / M', color: 'Black', size: 'M', price: 45, sku: 'NKE-RNSHRT-BK-M' },
        { name: 'Black / L', color: 'Black', size: 'L', price: 45, sku: 'NKE-RNSHRT-BK-L' },
        { name: 'Blue / M', color: 'Blue', size: 'M', price: 45, sku: 'NKE-RNSHRT-BL-M' },
      ],
    },
    {
      name: 'Apple AirPods Pro 2nd Gen',
      slug: 'apple-airpods-pro-2',
      sku: 'APL-APP2',
      description: 'Rebuilt from the sound up. Featuring the Apple H2 chip, Adaptive Audio, and up to 2x more Active Noise Cancellation.',
      specifications: JSON.stringify({ Chip: 'Apple H2', ANC: 'Active Noise Cancellation with Adaptive Transparency', Battery: 'Up to 6 hours listening', Case: 'MagSafe charging case' }),
      features: JSON.stringify(['Adaptive Audio', 'Personalized Spatial Audio', 'Touch control', 'IP54 dust and water resistant']),
      costPrice: 179,
      sellingPrice: 249,
      discountPrice: 219,
      brandSlug: 'apple',
      subCategorySlug: 'audio',
      status: 'active',
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      totalSold: 1456,
      variants: [],
    },
    {
      name: 'Cotton Casual Shirt',
      slug: 'cotton-casual-shirt',
      sku: 'CL-COTSHT',
      description: 'Soft 100% cotton casual shirt perfect for everyday wear. Classic fit with a modern twist.',
      specifications: JSON.stringify({ Material: '100% Cotton', Fit: 'Classic', Collar: 'Button-down', Care: 'Machine washable' }),
      features: JSON.stringify(['100% cotton', 'Button-down collar', 'Chest pocket', 'Pre-shrunk']),
      costPrice: 18,
      sellingPrice: 49,
      discountPrice: 39,
      brandSlug: 'levis',
      subCategorySlug: 'mens-wear',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      totalSold: 234,
      variants: [
        { name: 'White / S', color: 'White', size: 'S', price: 39, sku: 'CL-COTSHT-WH-S' },
        { name: 'White / M', color: 'White', size: 'M', price: 39, sku: 'CL-COTSHT-WH-M' },
        { name: 'White / L', color: 'White', size: 'L', price: 39, sku: 'CL-COTSHT-WH-L' },
        { name: 'Blue / M', color: 'Blue', size: 'M', price: 39, sku: 'CL-COTSHT-BL-M' },
        { name: 'Blue / L', color: 'Blue', size: 'L', price: 39, sku: 'CL-COTSHT-BL-L' },
      ],
    },
    {
      name: 'Wireless Charging Pad',
      slug: 'wireless-charging-pad',
      sku: 'EL-WLCHPD',
      description: 'Fast wireless charging pad compatible with all Qi-enabled devices. Sleek, minimalist design.',
      specifications: JSON.stringify({ Power: '15W max', Compatibility: 'All Qi devices', Input: 'USB-C', LED: 'Status indicator' }),
      features: JSON.stringify(['15W fast charging', 'Universal Qi compatible', 'LED indicator', 'Anti-slip surface']),
      costPrice: 8,
      sellingPrice: 29,
      discountPrice: null,
      brandSlug: 'samsung',
      subCategorySlug: 'smartphones',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      totalSold: 567,
      variants: [
        { name: 'Black', color: 'Black', price: 29, sku: 'EL-WLCHPD-BK' },
        { name: 'White', color: 'White', price: 29, sku: 'EL-WLCHPD-WH' },
      ],
    },
    {
      name: 'Stainless Steel Water Bottle',
      slug: 'stainless-steel-water-bottle',
      sku: 'SP-SSWTRBL',
      description: 'Double-wall vacuum insulated stainless steel water bottle. Keeps drinks cold for 24 hours or hot for 12 hours.',
      specifications: JSON.stringify({ Material: 'Stainless Steel', Capacity: '32 oz', Insulation: 'Double-wall vacuum', BPA_Free: 'Yes' }),
      features: JSON.stringify(['Vacuum insulated', 'Leak-proof lid', 'BPA-free', 'Sweat-proof exterior']),
      costPrice: 8,
      sellingPrice: 34,
      discountPrice: null,
      brandSlug: 'under-armour',
      subCategorySlug: 'outdoor',
      status: 'active',
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      totalSold: 456,
      variants: [
        { name: 'Black', color: 'Black', price: 34, sku: 'SP-SSWTRBL-BK' },
        { name: 'White', color: 'White', price: 34, sku: 'SP-SSWTRBL-WH' },
        { name: 'Green', color: 'Green', price: 34, sku: 'SP-SSWTRBL-GN' },
      ],
    },
    {
      name: 'Smart Home Hub',
      slug: 'smart-home-hub',
      sku: 'EL-SMTHUB',
      description: 'Central hub for your smart home. Control all your devices from one place with voice commands.',
      specifications: JSON.stringify({ Compatibility: 'Works with Alexa, Google, HomeKit', Connectivity: 'WiFi, Bluetooth, Zigbee, Z-Wave', Speaker: 'Built-in', Display: '7" touchscreen' }),
      features: JSON.stringify(['Voice assistant built-in', '7" touchscreen', 'Multi-protocol support', 'Privacy controls']),
      costPrice: 79,
      sellingPrice: 149,
      discountPrice: 129,
      brandSlug: 'apple',
      subCategorySlug: 'kitchen-appliances',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 89,
      variants: [],
    },
    {
      name: 'Bluetooth Portable Speaker',
      slug: 'bluetooth-portable-speaker',
      sku: 'SNY-BTSPKR',
      description: 'Powerful sound in a compact design. This portable Bluetooth speaker features 360-degree sound, waterproof construction, and 20-hour battery life.',
      specifications: JSON.stringify({ Driver: '46mm', Battery: 'Up to 20 hours', Connectivity: 'Bluetooth 5.2', Waterproof: 'IP67', Weight: '540g' }),
      features: JSON.stringify(['360-degree sound', 'IP67 waterproof', '20-hour battery', 'USB-C charging']),
      costPrice: 49,
      sellingPrice: 99,
      discountPrice: 79,
      brandSlug: 'sony',
      subCategorySlug: 'audio',
      status: 'active',
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      totalSold: 267,
      variants: [
        { name: 'Black', color: 'Black', price: 79, sku: 'SNY-BTSPKR-BK' },
        { name: 'Blue', color: 'Blue', price: 79, sku: 'SNY-BTSPKR-BL' },
        { name: 'Green', color: 'Green', price: 79, sku: 'SNY-BTSPKR-GN' },
      ],
    },
  ];

  const products: any[] = [];

  for (const pd of productsData) {
    const brand = getBrand(pd.brandSlug);
    const subCat = subCategories[pd.subCategorySlug]?.[0]
      || subCategories['smartphones']?.[0];

    // Find the right subcategory
    let categoryId: string | undefined;
    for (const parentSlug of Object.keys(subCategories)) {
      const found = subCategories[parentSlug].find((sc: any) => sc.slug === pd.subCategorySlug);
      if (found) {
        categoryId = found.id;
        break;
      }
    }
    if (!categoryId) {
      // Fallback to parent category
      for (const parentSlug of Object.keys(subCategories)) {
        const parent = await prisma.category.findFirst({ where: { slug: parentSlug } });
        if (parent) {
          categoryId = parent.id;
          break;
        }
      }
    }

    const galleryImages = JSON.stringify([
      `https://picsum.photos/seed/${pd.slug}-1/800/800`,
      `https://picsum.photos/seed/${pd.slug}-2/800/800`,
      `https://picsum.photos/seed/${pd.slug}-3/800/800`,
    ]);

    const product = await prisma.product.create({
      data: {
        name: pd.name,
        slug: pd.slug,
        sku: pd.sku,
        description: pd.description,
        specifications: pd.specifications,
        features: pd.features,
        costPrice: pd.costPrice,
        sellingPrice: pd.sellingPrice,
        discountPrice: pd.discountPrice,
        thumbnail: `https://picsum.photos/seed/${pd.slug}/400/400`,
        gallery: galleryImages,
        status: pd.status,
        isFeatured: pd.isFeatured,
        isNewArrival: pd.isNewArrival,
        isBestSeller: pd.isBestSeller,
        totalSold: pd.totalSold,
        categoryId: categoryId!,
        brandId: brand?.id,
      },
    });

    // Create gallery images as ProductImage records
    const galleryUrls = [
      `https://picsum.photos/seed/${pd.slug}-1/800/800`,
      `https://picsum.photos/seed/${pd.slug}-2/800/800`,
      `https://picsum.photos/seed/${pd.slug}-3/800/800`,
    ];
    for (let i = 0; i < galleryUrls.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: galleryUrls[i],
          alt: `${pd.name} image ${i + 1}`,
          sortOrder: i,
        },
      });
    }

    // Create variants
    for (const vd of pd.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: vd.sku,
          name: vd.name,
          price: vd.price,
          thumbnail: `https://picsum.photos/seed/${vd.sku}/400/400`,
          isActive: true,
        },
      });

      // Link attribute values
      if (vd.color) {
        const colorVal = getColorVal(vd.color);
        if (colorVal) {
          await prisma.productVariantValue.create({
            data: { variantId: variant.id, attributeValueId: colorVal.id },
          });
        }
      }
      if (vd.size) {
        const sizeVal = getSizeVal(vd.size);
        if (sizeVal) {
          await prisma.productVariantValue.create({
            data: { variantId: variant.id, attributeValueId: sizeVal.id },
          });
        }
      }
      if (vd.storage) {
        const storageVal = getStorageVal(vd.storage);
        if (storageVal) {
          await prisma.productVariantValue.create({
            data: { variantId: variant.id, attributeValueId: storageVal.id },
          });
        }
      }
    }

    products.push(product);
  }

  console.log(`✅ Created ${products.length} products with variants and images`);
  return products;
}

// ============ Inventory ============
async function seedInventory(products: any[]) {
  console.log('📦 Seeding inventory...');

  for (const product of products) {
    const variants = await prisma.productVariant.findMany({
      where: { productId: product.id },
    });

    if (variants.length > 0) {
      // Create inventory for each variant
      for (const variant of variants) {
        await prisma.inventory.create({
          data: {
            variantId: variant.id,
            quantity: randomInt(5, 150),
            lowStockAlert: 10,
          },
        });
      }
    }

    // Also create inventory for the base product
    await prisma.inventory.create({
      data: {
        productId: product.id,
        quantity: randomInt(20, 200),
        lowStockAlert: 10,
      },
    });
  }

  console.log(`✅ Created inventory for ${products.length} products`);
}

// ============ Banners ============
async function seedBanners() {
  console.log('🎨 Seeding banners...');

  const bannersData = [
    {
      title: 'Summer Sale - Up to 50% Off',
      image: 'https://picsum.photos/seed/banner-summer/1200/400',
      link: '/shop?sale=summer',
      position: 'hero',
      sortOrder: 0,
    },
    {
      title: 'New Arrivals - Tech Collection',
      image: 'https://picsum.photos/seed/banner-tech/1200/400',
      link: '/shop?category=electronics',
      position: 'hero',
      sortOrder: 1,
    },
    {
      title: 'Free Shipping on Orders Over $50',
      image: 'https://picsum.photos/seed/banner-shipping/1200/400',
      link: '/shop',
      position: 'hero',
      sortOrder: 2,
    },
    {
      title: 'Nike Collection - Just Do It',
      image: 'https://picsum.photos/seed/banner-nike/600/400',
      link: '/shop?brand=nike',
      position: 'sidebar',
      sortOrder: 0,
    },
    {
      title: 'Weekend Deals - Limited Time',
      image: 'https://picsum.photos/seed/banner-deals/1200/400',
      link: '/shop?deals=true',
      position: 'hero',
      sortOrder: 3,
    },
  ];

  for (const bd of bannersData) {
    await prisma.banner.create({ data: bd });
  }

  console.log(`✅ Created ${bannersData.length} banners`);
}

// ============ Coupons ============
async function seedCoupons() {
  console.log('🎟️ Seeding coupons...');

  const now = new Date();
  const couponsData = [
    {
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minPurchase: 0,
      maxDiscount: 50,
      usageLimit: 1000,
      usedCount: 156,
      startsAt: new Date(now.getFullYear(), 0, 1),
      expiresAt: new Date(now.getFullYear() + 1, 11, 31),
      isActive: true,
    },
    {
      code: 'SAVE20',
      type: 'fixed',
      value: 20,
      minPurchase: 100,
      maxDiscount: null,
      usageLimit: 500,
      usedCount: 89,
      startsAt: new Date(now.getFullYear(), 0, 1),
      expiresAt: new Date(now.getFullYear() + 1, 11, 31),
      isActive: true,
    },
    {
      code: 'FREESHIP',
      type: 'fixed',
      value: 0,
      minPurchase: 50,
      maxDiscount: null,
      usageLimit: 2000,
      usedCount: 432,
      startsAt: new Date(now.getFullYear(), 0, 1),
      expiresAt: new Date(now.getFullYear() + 1, 11, 31),
      isActive: true,
    },
  ];

  for (const cd of couponsData) {
    await prisma.coupon.create({ data: cd });
  }

  console.log(`✅ Created ${couponsData.length} coupons`);
}

// ============ Orders ============
async function seedOrders(customerUsers: any[], products: any[]) {
  console.log('🛒 Seeding orders...');

  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['cod', 'stripe', 'sslcommerz'];
  const paymentStatuses = ['pending', 'paid', 'failed'];

  const orders: any[] = [];

  for (let i = 0; i < 10; i++) {
    const customer = randomElement(customerUsers);
    const numItems = randomInt(1, 4);
    const selectedProducts = subset(products, numItems);

    const orderItems: { productId: string; variantId: string | null; productName: string; variantName: string | null; sku: string; price: number; quantity: number; total: number }[] = [];
    let subtotal = 0;

    for (const product of selectedProducts) {
      const variants = await prisma.productVariant.findMany({
        where: { productId: product.id },
      });

      const quantity = randomInt(1, 3);
      let price = product.sellingPrice;
      let variantId: string | null = null;
      let variantName: string | null = null;
      let sku = product.sku;

      if (variants.length > 0 && Math.random() > 0.3) {
        const variant = randomElement(variants);
        price = variant.price;
        variantId = variant.id;
        variantName = variant.name;
        sku = variant.sku;
      }

      if (product.discountPrice) {
        price = product.discountPrice;
      }

      const total = price * quantity;
      subtotal += total;

      orderItems.push({
        productId: product.id,
        variantId,
        productName: product.name,
        variantName,
        sku,
        price,
        quantity,
        total,
      });
    }

    const shippingCost = subtotal > 50 ? 0 : 9.99;
    const taxAmount = Math.round(subtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((subtotal + shippingCost + taxAmount) * 100) / 100;

    const status = randomElement(statuses);
    const paymentMethod = randomElement(paymentMethods);
    const paymentStatus = status === 'delivered' ? 'paid' : (status === 'cancelled' ? 'failed' : randomElement(paymentStatuses));

    const addresses = await prisma.address.findMany({
      where: { customerId: customer.customer.id },
    });
    const address = addresses[0];

    const shippingAddress = JSON.stringify({
      firstName: address?.firstName || customer.name.split(' ')[0],
      lastName: address?.lastName || customer.name.split(' ')[1] || '',
      phone: customer.phone,
      address1: address?.address1 || '123 Main St',
      city: address?.city || 'New York',
      state: address?.state || 'NY',
      zipCode: address?.zipCode || '10001',
      country: address?.country || 'US',
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${String(10000 + i).padStart(6, '0')}`,
        customerId: customer.customer.id,
        status,
        subtotal,
        shippingCost,
        discountAmount: 0,
        taxAmount,
        totalAmount,
        shippingAddress,
        billingAddress: shippingAddress,
        shippingMethod: 'Standard Shipping',
        paymentMethod,
        paymentStatus,
        notes: i === 8 ? 'Please deliver after 5 PM' : null,
      },
    });

    // Create order items
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantName: item.variantName,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
        },
      });
    }

    // Create order timeline
    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: 'pending',
        note: 'Order placed',
      },
    });

    if (['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'confirmed',
          note: 'Order confirmed',
        },
      });
    }

    if (['processing', 'shipped', 'delivered'].includes(status)) {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'processing',
          note: 'Order is being processed',
        },
      });
    }

    if (['shipped', 'delivered'].includes(status)) {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'shipped',
          note: 'Order has been shipped',
        },
      });
    }

    if (status === 'delivered') {
      await prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'delivered',
          note: 'Order has been delivered',
        },
      });
    }

    // Create payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        method: paymentMethod,
        amount: totalAmount,
        status: paymentStatus,
        transactionId: paymentStatus === 'paid' ? `TXN-${Date.now()}-${i}` : null,
      },
    });

    orders.push(order);
  }

  console.log(`✅ Created ${orders.length} orders`);
  return orders;
}

// ============ Reviews ============
async function seedReviews(customerUsers: any[], products: any[]) {
  console.log('⭐ Seeding reviews...');

  const reviewData = [
    { title: 'Excellent product!', comment: 'Really impressed with the quality. Works exactly as described. Would definitely recommend to others.', rating: 5, status: 'approved' },
    { title: 'Great value', comment: 'Good product for the price. A few minor issues but overall very satisfied with my purchase.', rating: 4, status: 'approved' },
    { title: 'Decent but could improve', comment: 'The product is okay. Meets basic expectations but there is room for improvement in build quality.', rating: 3, status: 'approved' },
    { title: 'Love it!', comment: 'Amazing quality and fast shipping. This is exactly what I was looking for. Will buy again!', rating: 5, status: 'approved' },
    { title: 'Good for beginners', comment: 'Perfect for someone just starting out. Easy to use and understand. Great customer service too.', rating: 4, status: 'approved' },
    { title: 'Not what I expected', comment: 'The product looks different from the pictures. Quality is average at best. Disappointed.', rating: 2, status: 'approved' },
    { title: 'Outstanding!', comment: 'Best purchase I\'ve made this year. The quality is top-notch and it exceeds all my expectations.', rating: 5, status: 'approved' },
    { title: 'Solid choice', comment: 'Reliable and well-built. Have been using it for a month now and no issues whatsoever.', rating: 4, status: 'approved' },
    { title: 'Pretty good', comment: 'Works well for everyday use. Nothing extraordinary but gets the job done reliably.', rating: 3, status: 'approved' },
    { title: 'Highly recommended', comment: 'After extensive research, I chose this product and I\'m glad I did. Excellent performance and build quality.', rating: 5, status: 'approved' },
    { title: 'Mixed feelings', comment: 'Some features are great, others need work. The design is nice but functionality could be better.', rating: 3, status: 'pending' },
    { title: 'Perfect gift', comment: 'Bought this as a gift and the recipient absolutely loved it! Great packaging too.', rating: 5, status: 'approved' },
    { title: 'Satisfactory', comment: 'Does what it says on the box. Nothing more, nothing less. Fair price for what you get.', rating: 3, status: 'approved' },
    { title: 'Impressive quality', comment: 'The build quality is impressive for this price range. Feels premium and performs well.', rating: 4, status: 'pending' },
    { title: 'Worth every penny', comment: 'I was skeptical at first but this product proved me wrong. Absolutely worth the investment.', rating: 5, status: 'approved' },
  ];

  const featuredProducts = products.filter((_, idx) => idx % 2 === 0).slice(0, 10);

  for (let i = 0; i < reviewData.length; i++) {
    const rd = reviewData[i];
    const customer = randomElement(customerUsers);
    const product = randomElement(featuredProducts);

    await prisma.review.create({
      data: {
        customerId: customer.customer.id,
        productId: product.id,
        rating: rd.rating,
        title: rd.title,
        comment: rd.comment,
        status: rd.status,
      },
    });
  }

  // Update product average ratings
  for (const product of featuredProducts) {
    const reviews = await prisma.review.findMany({
      where: { productId: product.id },
    });
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
        },
      });
    }
  }

  console.log(`✅ Created ${reviewData.length} reviews`);
}

// ============ Blog Posts ============
async function seedBlogPosts(staffUsers: any[]) {
  console.log('📝 Seeding blog posts...');

  const blogsData = [
    {
      title: '10 Must-Have Tech Gadgets for 2024',
      slug: '10-must-have-tech-gadgets-2024',
      excerpt: 'Discover the latest tech gadgets that are revolutionizing how we live, work, and play in 2024.',
      content: `<h2>Introduction</h2><p>Technology continues to evolve at a rapid pace, and 2024 is no exception. From AI-powered devices to sustainable tech solutions, here are the top 10 gadgets you need to know about.</p><h2>1. AI Smart Assistants</h2><p>The new generation of smart assistants can understand context, remember preferences, and proactively help with daily tasks. They're no longer just voice-activated search engines—they're true digital companions.</p><h2>2. Foldable Phones</h2><p>With improved durability and lower prices, foldable phones are finally ready for the mainstream. The latest models offer seamless multitasking and incredible displays.</p><h2>3. AR Glasses</h2><p>Augmented reality glasses have become lighter, more stylish, and more capable. They overlay digital information onto the real world, transforming how we navigate and learn.</p><h2>4. Health Monitoring Wearables</h2><p>Next-gen wearables can track blood pressure, blood sugar, and even detect early signs of illness. They're like having a doctor on your wrist.</p><h2>Conclusion</h2><p>2024 is shaping up to be an exciting year for tech enthusiasts. Stay tuned for more updates and reviews!</p>`,
      category: 'Technology',
      tags: JSON.stringify(['tech', 'gadgets', '2024', 'review']),
      authorId: staffUsers[0]?.id,
      isPublished: true,
    },
    {
      title: 'Sustainable Fashion: A Guide to Eco-Friendly Shopping',
      slug: 'sustainable-fashion-guide',
      excerpt: 'Learn how to make more environmentally conscious fashion choices without sacrificing style.',
      content: `<h2>Why Sustainable Fashion Matters</h2><p>The fashion industry is one of the largest polluters globally. By making conscious choices, we can reduce our environmental impact while still looking great.</p><h2>Choose Quality Over Quantity</h2><p>Invest in well-made pieces that last longer. A $100 shirt that lasts 5 years is better value than a $20 shirt that falls apart in 6 months.</p><h2>Look for Certifications</h2><p>Certifications like GOTS, OEKO-TEX, and Fair Trade ensure that products meet environmental and social standards.</p><h2>Support Ethical Brands</h2><p>Research brands before buying. Many companies now prioritize sustainability and transparency in their supply chains.</p><h2>Conclusion</h2><p>Every purchase is a vote for the kind of world we want. Choose wisely, and together we can make fashion more sustainable.</p>`,
      category: 'Fashion',
      tags: JSON.stringify(['fashion', 'sustainability', 'eco-friendly', 'shopping']),
      authorId: staffUsers[1]?.id,
      isPublished: true,
    },
    {
      title: 'How to Set Up the Perfect Home Office',
      slug: 'perfect-home-office-setup',
      excerpt: 'Transform your workspace with our comprehensive guide to creating an ergonomic and productive home office.',
      content: `<h2>Essential Equipment</h2><p>A good home office starts with the right equipment. Here's what you need: an ergonomic chair, an adjustable desk, proper lighting, and a quality monitor.</p><h2>Ergonomics Matter</h2><p>Your health should be the top priority. Invest in an ergonomic chair that supports your lower back, and position your monitor at eye level to prevent neck strain.</p><h2>Lighting</h2><p>Natural light is best, but when it's not available, use a combination of ambient and task lighting. Avoid harsh fluorescent lights that cause eye strain.</p><h2>Stay Organized</h2><p>A cluttered workspace leads to a cluttered mind. Use organizers, cable management solutions, and keep only what you need on your desk.</p><h2>Conclusion</h2><p>Your home office should be a place where you feel comfortable and productive. Take the time to set it up right, and you'll reap the benefits every day.</p>`,
      category: 'Lifestyle',
      tags: JSON.stringify(['home office', 'productivity', 'ergonomics', 'work from home']),
      authorId: staffUsers[0]?.id,
      isPublished: true,
    },
    {
      title: 'The Ultimate Guide to Wireless Audio',
      slug: 'ultimate-guide-wireless-audio',
      excerpt: 'Everything you need to know about wireless headphones, earbuds, and speakers in 2024.',
      content: `<h2>Wireless Audio Evolution</h2><p>Wireless audio has come a long way. Today's Bluetooth codecs support near-lossless audio, and noise cancellation technology has reached new heights.</p><h2>Choosing the Right Headphones</h2><p>Over-ear headphones offer the best noise cancellation and sound quality. Earbuds are more portable and convenient. Choose based on your primary use case.</p><h2>Key Features to Look For</h2><p>Active noise cancellation, battery life, comfort, and sound quality are the most important factors. Don't forget about multipoint connectivity if you use multiple devices.</p><h2>Top Picks for 2024</h2><p>Our top recommendations include the Sony WH-1000XM5 for over-ear and the Apple AirPods Pro 2 for earbuds. Both offer exceptional sound and noise cancellation.</p><h2>Conclusion</h2><p>Wireless audio technology continues to improve. Whatever your budget, there's a great option available for you.</p>`,
      category: 'Technology',
      tags: JSON.stringify(['audio', 'headphones', 'wireless', 'review']),
      authorId: staffUsers[2]?.id,
      isPublished: true,
    },
    {
      title: 'Fitness Equipment Buying Guide: Build Your Home Gym',
      slug: 'fitness-equipment-buying-guide',
      excerpt: 'Create the perfect home gym with our expert guide to selecting the right fitness equipment.',
      content: `<h2>Start With the Basics</h2><p>You don't need a huge space or budget to start working out at home. Begin with versatile equipment like adjustable dumbbells and a yoga mat.</p><h2>Must-Have Equipment</h2><p>Adjustable dumbbells, a quality yoga mat, resistance bands, and a pull-up bar cover most workout needs. Add a bench for more exercise options.</p><h2>Space Considerations</h2><p>Measure your available space before buying equipment. Foldable and compact options are great for small spaces.</p><h2>Budget Tips</h2><p>You don't need to buy everything at once. Start with the essentials and add equipment as your fitness journey progresses. Look for sales and bundle deals.</p><h2>Conclusion</h2><p>Building a home gym is an investment in your health. Start small, be consistent, and upgrade as needed. Your future self will thank you.</p>`,
      category: 'Fitness',
      tags: JSON.stringify(['fitness', 'home gym', 'equipment', 'workout']),
      authorId: staffUsers[1]?.id,
      isPublished: true,
    },
  ];

  for (const bd of blogsData) {
    await prisma.blog.create({
      data: {
        title: bd.title,
        slug: bd.slug,
        excerpt: bd.excerpt,
        content: bd.content,
        thumbnail: `https://picsum.photos/seed/${bd.slug}/800/400`,
        category: bd.category,
        tags: bd.tags,
        metaTitle: bd.title,
        metaDescription: bd.excerpt,
        authorId: bd.authorId,
        isPublished: bd.isPublished,
      },
    });
  }

  console.log(`✅ Created ${blogsData.length} blog posts`);
}

// ============ Settings ============
async function seedSettings() {
  console.log('⚙️ Seeding settings...');

  const settingsData = [
    // General
    { key: 'site_name', value: 'ShopHub', group: 'general' },
    { key: 'site_tagline', value: 'Your One-Stop Online Shop', group: 'general' },
    { key: 'site_description', value: 'Discover amazing products at great prices. Free shipping on orders over $50.', group: 'general' },
    { key: 'site_logo', value: '/logo.svg', group: 'general' },
    { key: 'site_favicon', value: '/favicon.ico', group: 'general' },
    { key: 'currency', value: 'USD', group: 'general' },
    { key: 'currency_symbol', value: '$', group: 'general' },
    // Contact
    { key: 'contact_email', value: 'support@shophub.com', group: 'contact' },
    { key: 'contact_phone', value: '+1 (555) 123-4567', group: 'contact' },
    { key: 'contact_address', value: '123 Commerce Street, New York, NY 10001, USA', group: 'contact' },
    { key: 'business_hours', value: 'Mon-Fri: 9AM-6PM EST', group: 'contact' },
    // Social
    { key: 'social_facebook', value: 'https://facebook.com/shophub', group: 'social' },
    { key: 'social_twitter', value: 'https://twitter.com/shophub', group: 'social' },
    { key: 'social_instagram', value: 'https://instagram.com/shophub', group: 'social' },
    { key: 'social_youtube', value: 'https://youtube.com/shophub', group: 'social' },
    { key: 'social_linkedin', value: 'https://linkedin.com/company/shophub', group: 'social' },
    // SEO
    { key: 'seo_meta_title', value: 'ShopHub - Your One-Stop Online Shop', group: 'seo' },
    { key: 'seo_meta_description', value: 'Discover amazing products at great prices. Free shipping on orders over $50. Shop electronics, fashion, home & more.', group: 'seo' },
    { key: 'seo_meta_keywords', value: 'online shopping, electronics, fashion, home, kitchen, deals', group: 'seo' },
    // Payment
    { key: 'payment_cod_enabled', value: 'true', group: 'payment' },
    { key: 'payment_stripe_enabled', value: 'true', group: 'payment' },
    { key: 'payment_stripe_key', value: 'pk_test_xxxxxxxxxxxxx', group: 'payment' },
    // Shipping
    { key: 'shipping_free_threshold', value: '50', group: 'shipping' },
    { key: 'shipping_standard_cost', value: '9.99', group: 'shipping' },
    { key: 'shipping_express_cost', value: '19.99', group: 'shipping' },
    { key: 'shipping_delivery_days', value: '3-5', group: 'shipping' },
    { key: 'shipping_express_days', value: '1-2', group: 'shipping' },
  ];

  for (const sd of settingsData) {
    await prisma.setting.create({ data: sd });
  }

  console.log(`✅ Created ${settingsData.length} settings`);
}

// ============ Pages ============
async function seedPages() {
  console.log('📄 Seeding pages...');

  const pagesData = [
    {
      title: 'About Us',
      slug: 'about-us',
      content: `<h1>About ShopHub</h1><p>Welcome to ShopHub, your premier destination for quality products at competitive prices. Founded in 2020, we've grown from a small online store to one of the most trusted e-commerce platforms.</p><h2>Our Mission</h2><p>Our mission is to make online shopping accessible, enjoyable, and secure for everyone. We believe that great products shouldn't come with a hefty price tag, and exceptional customer service should be the standard, not the exception.</p><h2>What We Offer</h2><p>We curate a diverse selection of products across electronics, fashion, home & kitchen, sports, and more. Every product in our catalog is carefully selected to ensure quality and value.</p><h2>Our Team</h2><p>Our team is made up of passionate individuals who are dedicated to providing you with the best shopping experience. From our customer support representatives to our warehouse staff, everyone at ShopHub is committed to your satisfaction.</p><h2>Contact Us</h2><p>Have questions? We'd love to hear from you. Reach out to our customer support team at support@shophub.com or call us at +1 (555) 123-4567.</p>`,
      metaTitle: 'About Us - ShopHub',
      metaDescription: 'Learn about ShopHub, our mission, and our commitment to providing the best online shopping experience.',
    },
    {
      title: 'Contact Us',
      slug: 'contact-us',
      content: `<h1>Contact Us</h1><p>We'd love to hear from you! Whether you have a question about our products, need help with an order, or just want to say hello, we're here to help.</p><h2>Get in Touch</h2><p><strong>Email:</strong> support@shophub.com</p><p><strong>Phone:</strong> +1 (555) 123-4567</p><p><strong>Address:</strong> 123 Commerce Street, New York, NY 10001, USA</p><h2>Business Hours</h2><p>Monday - Friday: 9:00 AM - 6:00 PM EST</p><p>Saturday: 10:00 AM - 4:00 PM EST</p><p>Sunday: Closed</p><h2>Response Time</h2><p>We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please call us directly.</p>`,
      metaTitle: 'Contact Us - ShopHub',
      metaDescription: 'Get in touch with ShopHub. Find our contact details, business hours, and support information.',
    },
    {
      title: 'FAQ',
      slug: 'faq',
      content: `<h1>Frequently Asked Questions</h1><h2>Ordering</h2><h3>How do I place an order?</h3><p>Simply browse our products, add items to your cart, and proceed to checkout. You can pay with credit card, debit card, or cash on delivery.</p><h3>Can I modify my order after placing it?</h3><p>You can modify your order within 1 hour of placing it. After that, please contact our support team for assistance.</p><h2>Shipping</h2><h3>How long does shipping take?</h3><p>Standard shipping takes 3-5 business days. Express shipping takes 1-2 business days. Free shipping is available on orders over $50.</p><h3>Do you ship internationally?</h3><p>Currently, we ship within the United States only. International shipping will be available soon.</p><h2>Returns</h2><h3>What is your return policy?</h3><p>We offer a 30-day return policy for most items. Products must be unused and in their original packaging. Some categories may have different return windows.</p><h3>How do I initiate a return?</h3><p>Log into your account, go to your order history, and select the item you want to return. Follow the prompts to generate a return shipping label.</p>`,
      metaTitle: 'FAQ - ShopHub',
      metaDescription: 'Find answers to frequently asked questions about ordering, shipping, returns, and more at ShopHub.',
    },
    {
      title: 'Privacy Policy',
      slug: 'privacy-policy',
      content: `<h1>Privacy Policy</h1><p>Last updated: January 1, 2024</p><h2>Information We Collect</h2><p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us. This includes your name, email address, phone number, shipping address, and payment information.</p><h2>How We Use Your Information</h2><p>We use the information we collect to process your orders, communicate with you about your purchases, improve our services, and personalize your shopping experience.</p><h2>Information Sharing</h2><p>We do not sell, trade, or rent your personal information to third parties. We may share information with service providers who assist us in operating our website and processing payments.</p><h2>Data Security</h2><p>We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology.</p><h2>Cookies</h2><p>We use cookies to improve your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings.</p><h2>Your Rights</h2><p>You have the right to access, update, or delete your personal information at any time. Contact us at privacy@shophub.com for assistance.</p>`,
      metaTitle: 'Privacy Policy - ShopHub',
      metaDescription: 'Read ShopHub\'s privacy policy to understand how we collect, use, and protect your personal information.',
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms-conditions',
      content: `<h1>Terms & Conditions</h1><p>Last updated: January 1, 2024</p><h2>Agreement to Terms</h2><p>By accessing and using ShopHub, you agree to be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.</p><h2>Use of Service</h2><p>You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account and password.</p><h2>Products and Pricing</h2><p>All products are subject to availability. Prices are listed in USD and may change without notice. We make every effort to display accurate pricing and product information.</p><h2>Orders and Payment</h2><p>By placing an order, you agree to pay the total amount including applicable taxes and shipping charges. We reserve the right to cancel orders for any reason.</p><h2>Shipping and Delivery</h2><p>Delivery times are estimates and not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or other factors beyond our control.</p><h2>Returns and Refunds</h2><p>Products may be returned within 30 days of delivery for a full refund. Items must be unused and in original packaging. Shipping costs for returns are the responsibility of the customer unless the item is defective.</p><h2>Limitation of Liability</h2><p>ShopHub shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services.</p>`,
      metaTitle: 'Terms & Conditions - ShopHub',
      metaDescription: 'Read the terms and conditions for using ShopHub\'s online shopping services.',
    },
  ];

  for (const pd of pagesData) {
    await prisma.page.create({ data: pd });
  }

  console.log(`✅ Created ${pagesData.length} pages`);
}

// ============ Main ============
async function main() {
  console.log('🌱 Starting database seeding...\n');

  const startTime = Date.now();

  // Cleanup
  await cleanup();

  // Seed in order respecting foreign keys
  const { roles } = await seedRolesAndPermissions();
  const { staffUsers, customerUsers } = await seedUsers(roles);
  const { subCategories } = await seedCategories();
  const brands = await seedBrands();
  const attributeMap = await seedAttributes();
  const products = await seedProducts(subCategories, brands, attributeMap);
  await seedInventory(products);
  await seedBanners();
  await seedCoupons();
  await seedOrders(customerUsers, products);
  await seedReviews(customerUsers, products);
  await seedBlogPosts(staffUsers);
  await seedSettings();
  await seedPages();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(50));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(50));

  // Count all records
  const counts = {
    roles: await prisma.role.count(),
    permissions: await prisma.permission.count(),
    users: await prisma.user.count(),
    customers: await prisma.customer.count(),
    categories: await prisma.category.count(),
    brands: await prisma.brand.count(),
    attributes: await prisma.attribute.count(),
    attributeValues: await prisma.attributeValue.count(),
    products: await prisma.product.count(),
    productVariants: await prisma.productVariant.count(),
    productImages: await prisma.productImage.count(),
    inventory: await prisma.inventory.count(),
    banners: await prisma.banner.count(),
    coupons: await prisma.coupon.count(),
    orders: await prisma.order.count(),
    orderItems: await prisma.orderItem.count(),
    reviews: await prisma.review.count(),
    blogs: await prisma.blog.count(),
    pages: await prisma.page.count(),
    settings: await prisma.setting.count(),
    addresses: await prisma.address.count(),
  };

  for (const [key, count] of Object.entries(counts)) {
    console.log(`  ${key}: ${count}`);
  }

  console.log(`\n⏱️  Completed in ${duration}s`);
  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
