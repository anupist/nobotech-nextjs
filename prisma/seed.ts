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
  await prisma.footerWidgetLink.deleteMany();
  await prisma.footerWidget.deleteMany();
  await prisma.navigationItem.deleteMany();
  await prisma.featureItem.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.fAQCategory.deleteMany();
  await prisma.aboutSection.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.area.deleteMany();
  await prisma.city.deleteMany();
  await prisma.state.deleteMany();
  await prisma.country.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.shippingMethod.deleteMany();

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
    // Tax
    { key: 'tax_enabled', value: 'true', group: 'tax' },
    { key: 'tax_rate', value: '8', group: 'tax' },
  ];

  for (const sd of settingsData) {
    await prisma.setting.create({ data: sd });
  }

  console.log(`✅ Created ${settingsData.length} settings`);
}

// ============ Locations (Country / State / City) ============
async function seedLocations() {
  console.log('🌍 Seeding locations...');

  const countriesData = [{ id: 18, code: 'BD', name: 'Bangladesh', status: 1 }];

  const statesData = [
    { id: 9, name: 'Rangpur Division', countryId: 18, status: 1 },
    { id: 10, name: 'Mymensingh Division', countryId: 18, status: 1 },
    { id: 11, name: 'Dhaka Division', countryId: 18, status: 1 },
    { id: 12, name: 'Barisal Division', countryId: 18, status: 1 },
    { id: 13, name: 'Khulna Division', countryId: 18, status: 1 },
    { id: 14, name: 'Rajshahi Division', countryId: 18, status: 1 },
    { id: 15, name: 'Chittagong Division', countryId: 18, status: 1 },
    { id: 348, name: 'Sylhet Division', countryId: 18, status: 1 },
  ];

  const citiesData = [
    { id: 708, name: 'Dhaka City', stateId: 11 },
    { id: 709, name: 'Savar (Dhaka Sub Area)', stateId: 11 },
    { id: 710, name: 'Narayanganj (Dhaka Sub Area)', stateId: 11 },
    { id: 711, name: 'Tongi', stateId: 11 },
    { id: 714, name: 'Natore', stateId: 14 },
    { id: 715, name: 'Chapainawabganj', stateId: 14 },
    { id: 716, name: 'Pabna', stateId: 14 },
    { id: 717, name: 'Gazipur', stateId: 11 },
    { id: 718, name: 'Joypurhat', stateId: 14 },
    { id: 719, name: 'Naogaon', stateId: 14 },
    { id: 721, name: 'Bogura', stateId: 14 },
    { id: 723, name: 'Magura', stateId: 13 },
    { id: 724, name: 'Rajshahi', stateId: 14 },
    { id: 725, name: 'Chandpur', stateId: 15 },
    { id: 726, name: 'Jashore', stateId: 13 },
    { id: 727, name: 'Jhenaidah', stateId: 13 },
    { id: 728, name: 'Dinajpur', stateId: 9 },
    { id: 729, name: 'Patuakhali', stateId: 12 },
    { id: 731, name: 'Kushtia', stateId: 13 },
    { id: 732, name: 'Jhalokati', stateId: 12 },
    { id: 734, name: 'Khulna', stateId: 13 },
    { id: 735, name: 'Meherpur', stateId: 13 },
    { id: 736, name: 'Bhola', stateId: 12 },
    { id: 741, name: 'Satkhira', stateId: 13 },
    { id: 742, name: 'Sherpur', stateId: 10 },
    { id: 743, name: 'Barisal', stateId: 12 },
    { id: 744, name: 'Rangpur', stateId: 9 },
    { id: 745, name: 'Rangamati', stateId: 15 },
    { id: 746, name: 'Barguna District', stateId: 12 },
    { id: 748, name: 'Brahmanbaria', stateId: 15 },
    { id: 749, name: 'Lakshmipur', stateId: 15 },
    { id: 750, name: 'Habiganj', stateId: 348 },
    { id: 751, name: 'Gaibandha', stateId: 9 },
    { id: 752, name: 'Jamalpur', stateId: 10 },
    { id: 753, name: 'Pirojpur', stateId: 12 },
    { id: 754, name: 'Netrokona', stateId: 10 },
    { id: 755, name: 'Cumilla', stateId: 15 },
    { id: 757, name: 'Mymensingh', stateId: 10 },
    { id: 758, name: 'Chittagong Area', stateId: 15 },
    { id: 759, name: 'Kurigram', stateId: 9 },
    { id: 760, name: 'Sunamganj', stateId: 348 },
    { id: 761, name: 'Thakurgaon', stateId: 9 },
    { id: 763, name: 'Moulvibazar', stateId: 348 },
    { id: 764, name: 'Panchagarh', stateId: 9 },
    { id: 765, name: 'Feni', stateId: 15 },
    { id: 766, name: 'Sylhet', stateId: 348 },
    { id: 768, name: 'Noakhali', stateId: 15 },
    { id: 769, name: 'Nilphamari', stateId: 9 },
    { id: 771, name: 'Faridpur', stateId: 11 },
    { id: 772, name: 'Lalmonirhat', stateId: 9 },
    { id: 773, name: 'Madaripur', stateId: 11 },
    { id: 774, name: 'Kishoreganj', stateId: 11 },
    { id: 775, name: 'Manikganj', stateId: 11 },
    { id: 776, name: 'Bandarban District', stateId: 15 },
    { id: 777, name: 'Munshiganj', stateId: 11 },
    { id: 778, name: 'Gopalganj', stateId: 11 },
    { id: 780, name: "Cox's Bazar", stateId: 15 },
    { id: 827, name: 'Sirajganj', stateId: 14 },
    { id: 48360, name: 'Rajbari', stateId: 11 },
    { id: 48361, name: 'Narsingdi', stateId: 11 },
    { id: 48362, name: 'Tangail', stateId: 11 },
    { id: 48364, name: 'Shariatpur', stateId: 11 },
    { id: 48366, name: 'Narail', stateId: 13 },
    { id: 48367, name: 'Chuadanga', stateId: 13 },
    { id: 48368, name: 'Bagerhat District', stateId: 13 },
    { id: 48369, name: 'Khagrachari', stateId: 15 },
    { id: 48372, name: 'Dhamrai', stateId: 11 },
    { id: 48373, name: 'Dohar Upazila', stateId: 11 },
  ];

  const areasData = [
    { id: 1, name: 'Adabor', cityId: 708, cost: 60 },
    { id: 3, name: 'Ashkona', cityId: 708, cost: 60 },
    { id: 4, name: 'Agargoan', cityId: 708, cost: 60 },
    { id: 5, name: 'Azampur (Uttara)', cityId: 708, cost: 60 },
    { id: 6, name: 'Azimpur (Old Dhaka)', cityId: 708, cost: 60 },
    { id: 7, name: 'Baily Road', cityId: 708, cost: 60 },
    { id: 8, name: 'Bakshibazar', cityId: 708, cost: 60 },
    { id: 9, name: 'Banani', cityId: 708, cost: 60 },
    { id: 10, name: 'Banani DOHS', cityId: 708, cost: 60 },
    { id: 11, name: 'Banasree (Rampura)', cityId: 708, cost: 60 },
    { id: 12, name: 'Bangla Bazar', cityId: 708, cost: 60 },
    { id: 14, name: 'Baridhara R/A', cityId: 708, cost: 60 },
    { id: 15, name: 'Banglamotor', cityId: 708, cost: 60 },
    { id: 16, name: 'Bashabo', cityId: 708, cost: 60 },
    { id: 17, name: 'Bashundhara R/A', cityId: 708, cost: 60 },
    { id: 18, name: 'Bangshal', cityId: 708, cost: 60 },
    { id: 19, name: 'Bosila', cityId: 708, cost: 60 },
    { id: 20, name: 'Chankharpul', cityId: 708, cost: 60 },
    { id: 21, name: 'Chawkbazar (Dhaka)', cityId: 708, cost: 60 },
    { id: 22, name: 'Dakshinkhan', cityId: 708, cost: 60 },
    { id: 23, name: 'Darussalam', cityId: 708, cost: 60 },
    { id: 24, name: 'Demra', cityId: 708, cost: 100 },
    { id: 25, name: 'Dhaka Medical College', cityId: 708, cost: 60 },
    { id: 26, name: 'Dhaka University', cityId: 708, cost: 60 },
    { id: 27, name: 'Dhanmondi', cityId: 708, cost: 60 },
    { id: 28, name: 'Donia', cityId: 708, cost: 60 },
    { id: 29, name: 'Estern Housing (Adabor)', cityId: 708, cost: 60 },
    { id: 30, name: 'Estern Housing (Pallabi)', cityId: 708, cost: 60 },
    { id: 31, name: 'ECB Chattar', cityId: 708, cost: 60 },
    { id: 32, name: 'Elephant Road Dhaka', cityId: 708, cost: 60 },
    { id: 33, name: 'Eskaton', cityId: 708, cost: 60 },
    { id: 34, name: 'Faridabad (Jatrabari)', cityId: 708, cost: 60 },
    { id: 35, name: 'Farmgate', cityId: 708, cost: 60 },
    { id: 36, name: 'Gabtoli', cityId: 708, cost: 60 },
    { id: 37, name: 'Gandaria', cityId: 708, cost: 60 },
    { id: 38, name: 'Gulshan', cityId: 708, cost: 60 },
    { id: 39, name: 'Gulistan', cityId: 708, cost: 60 },
    { id: 40, name: 'Jahangir Gate', cityId: 708, cost: 60 },
    { id: 41, name: 'Jatrabari', cityId: 708, cost: 60 },
    { id: 42, name: 'Jigatola', cityId: 708, cost: 60 },
    { id: 43, name: 'Jurain', cityId: 708, cost: 60 },
    { id: 44, name: 'Kakrail', cityId: 708, cost: 60 },
    { id: 45, name: 'Kalabagan', cityId: 708, cost: 60 },
    { id: 46, name: 'Kallyanpur', cityId: 708, cost: 60 },
    { id: 47, name: 'Kalshi', cityId: 708, cost: 60 },
    { id: 48, name: 'Kamlapur', cityId: 708, cost: 60 },
    { id: 49, name: 'Kamrangichar', cityId: 708, cost: 100 },
    { id: 50, name: 'Kawran Bazar', cityId: 708, cost: 60 },
    { id: 51, name: 'Khilkhet (Uttara)', cityId: 708, cost: 60 },
    { id: 52, name: 'Khilgaon', cityId: 708, cost: 60 },
    { id: 53, name: 'Kodomtoli (Jatrabari)', cityId: 708, cost: 60 },
    { id: 54, name: 'Kotwali (Old Dhaka)', cityId: 708, cost: 60 },
    { id: 55, name: 'Kuril', cityId: 708, cost: 60 },
    { id: 56, name: 'Kurmitola', cityId: 708, cost: 60 },
    { id: 57, name: 'Lalbagh', cityId: 708, cost: 60 },
    { id: 58, name: 'Lalmatia', cityId: 708, cost: 60 },
    { id: 59, name: 'Malibagh', cityId: 708, cost: 60 },
    { id: 60, name: 'Manik Nagar', cityId: 708, cost: 60 },
    { id: 61, name: 'Malibagh Taltola', cityId: 708, cost: 60 },
    { id: 62, name: 'Matuail', cityId: 708, cost: 60 },
    { id: 63, name: 'Merul Badda', cityId: 708, cost: 60 },
    { id: 64, name: 'Middle Badda', cityId: 708, cost: 60 },
    { id: 65, name: 'Mirpur', cityId: 708, cost: 60 },
    { id: 66, name: 'Mirpur DOHS', cityId: 708, cost: 60 },
    { id: 67, name: 'Moghbazar', cityId: 708, cost: 60 },
    { id: 68, name: 'Mohakhali', cityId: 708, cost: 60 },
    { id: 69, name: 'Mohakhali DOHS', cityId: 708, cost: 60 },
    { id: 70, name: 'Mohammadpur', cityId: 708, cost: 60 },
    { id: 71, name: 'Monipuripara', cityId: 708, cost: 60 },
    { id: 72, name: 'Motijheel', cityId: 708, cost: 60 },
    { id: 73, name: 'Mouchak', cityId: 708, cost: 60 },
    { id: 74, name: 'Mugdapara', cityId: 708, cost: 60 },
    { id: 75, name: 'Nakhalpara', cityId: 708, cost: 60 },
    { id: 76, name: 'Nawabgonj (Old Dhaka)', cityId: 708, cost: 60 },
    { id: 77, name: 'Naya Paltan', cityId: 708, cost: 60 },
    { id: 78, name: 'Niketon', cityId: 708, cost: 60 },
    { id: 79, name: 'Nikunja', cityId: 708, cost: 60 },
    { id: 80, name: 'Pallabi', cityId: 708, cost: 60 },
    { id: 81, name: 'Pilkhana', cityId: 708, cost: 60 },
    { id: 82, name: 'Postogola', cityId: 708, cost: 60 },
    { id: 83, name: 'Purana Paltan', cityId: 708, cost: 60 },
    { id: 84, name: 'Rajarbag', cityId: 708, cost: 60 },
    { id: 85, name: 'Ramna', cityId: 708, cost: 60 },
    { id: 86, name: 'Rampura', cityId: 708, cost: 60 },
    { id: 87, name: 'Rayer Bazar', cityId: 708, cost: 60 },
    { id: 88, name: 'Shahbag', cityId: 708, cost: 60 },
    { id: 89, name: 'Shahjahanpur (Dhaka)', cityId: 708, cost: 60 },
    { id: 90, name: 'Shankar', cityId: 708, cost: 60 },
    { id: 91, name: 'Shegunbagicha', cityId: 708, cost: 60 },
    { id: 92, name: 'Shekhertek', cityId: 708, cost: 60 },
    { id: 93, name: 'Sher-E-Bangla Nagar', cityId: 708, cost: 60 },
    { id: 94, name: 'Shewrapara', cityId: 708, cost: 60 },
    { id: 95, name: 'Shonir Akhra', cityId: 708, cost: 60 },
    { id: 96, name: 'Shyamoli', cityId: 708, cost: 60 },
    { id: 97, name: 'Siddweswari', cityId: 708, cost: 60 },
    { id: 98, name: 'Tejgaon', cityId: 708, cost: 60 },
    { id: 99, name: 'Tejkunipara', cityId: 708, cost: 60 },
    { id: 100, name: 'Uttar Badda', cityId: 708, cost: 60 },
    { id: 101, name: 'Uttara', cityId: 708, cost: 60 },
    { id: 102, name: 'Vashantek', cityId: 708, cost: 60 },
    { id: 103, name: 'Zigatola', cityId: 708, cost: 60 },
    { id: 104, name: 'Savar City Area', cityId: 709, cost: 120 },
    { id: 105, name: 'Jahangirnagar University', cityId: 709, cost: 120 },
    { id: 106, name: 'Savar Cantonment', cityId: 709, cost: 120 },
    { id: 107, name: 'Narayanganj City Area', cityId: 710, cost: 120 },
    { id: 108, name: 'Bandar', cityId: 710, cost: 120 },
    { id: 109, name: 'Chashara', cityId: 710, cost: 120 },
    { id: 110, name: 'Cittagong Road', cityId: 710, cost: 120 },
    { id: 111, name: 'Signboard', cityId: 710, cost: 120 },
    { id: 112, name: 'Other (Not Listed)', cityId: 710, cost: 120 },
    { id: 113, name: 'Tongi Bazar', cityId: 711, cost: 80 },
    { id: 114, name: 'College Gate', cityId: 711, cost: 80 },
    { id: 115, name: 'Ashulia', cityId: 709, cost: 120 },
    { id: 116, name: 'Bogura Sadar', cityId: 721, cost: 120 },
    { id: 117, name: 'Outside Bogura Sadar', cityId: 721, cost: 120 },
    { id: 118, name: 'Dinajpur Sadar', cityId: 728, cost: 120 },
    { id: 119, name: 'Outside Dinajpur Sadar', cityId: 728, cost: 120 },
    { id: 120, name: 'Rangpur Sadar', cityId: 744, cost: 120 },
    { id: 121, name: 'Saidpur City', cityId: 769, cost: 120 },
    { id: 122, name: 'Saidpur Cantonment', cityId: 769, cost: 120 },
    { id: 123, name: 'BAUST', cityId: 769, cost: 120 },
    { id: 124, name: 'Khulna Sadar', cityId: 734, cost: 120 },
    { id: 125, name: 'KUET', cityId: 734, cost: 120 },
    { id: 126, name: 'Outside Khulna Sadar', cityId: 734, cost: 120 },
    { id: 127, name: 'Rangamati Sadar', cityId: 745, cost: 120 },
    { id: 128, name: 'Outside Rangamati Sadar', cityId: 745, cost: 120 },
    { id: 129, name: 'Jhenaidah Sadar', cityId: 727, cost: 120 },
    { id: 130, name: 'Outside Jhenaidah Sadar', cityId: 727, cost: 120 },
    { id: 131, name: "Cox's Bazar Sadar", cityId: 780, cost: 120 },
    { id: 132, name: "Outside Cox's Bazar Sadar", cityId: 780, cost: 120 },
    { id: 133, name: 'Bandarban Sadar', cityId: 776, cost: 120 },
    { id: 134, name: 'Bandarban Other', cityId: 776, cost: 120 },
    { id: 135, name: 'Noakhali Sadar', cityId: 768, cost: 120 },
    { id: 136, name: 'Outside Noakhali Sadar', cityId: 768, cost: 120 },
    { id: 137, name: 'Feni Sadar', cityId: 765, cost: 120 },
    { id: 138, name: 'Outside Feni Sadar', cityId: 765, cost: 120 },
    { id: 139, name: 'Inside Chittagong Metropoliton', cityId: 758, cost: 120 },
    { id: 140, name: 'Outside Chittagong Metropoliton', cityId: 758, cost: 120 },
    { id: 141, name: 'Comilla Sadar', cityId: 755, cost: 120 },
    { id: 142, name: 'Outside Cumilla Sadar', cityId: 755, cost: 120 },
    { id: 143, name: 'Lakshmipur Sadar', cityId: 749, cost: 120 },
    { id: 144, name: 'Outside Lakshmipur Sadar', cityId: 749, cost: 120 },
    { id: 145, name: 'Brahmanbaria Sadar', cityId: 748, cost: 120 },
    { id: 146, name: 'Outside Brahmanbaria Sadar', cityId: 748, cost: 120 },
    { id: 147, name: 'Chandpur Sadar', cityId: 725, cost: 120 },
    { id: 148, name: 'Outside Chandpur Sadar', cityId: 725, cost: 120 },
    { id: 149, name: 'Gaibandha Sadar', cityId: 751, cost: 120 },
    { id: 150, name: 'Outside Gaibandha Sadar', cityId: 751, cost: 120 },
    { id: 151, name: 'Kurigram Sadar', cityId: 759, cost: 120 },
    { id: 152, name: 'Outside Kurigram Sadar', cityId: 759, cost: 120 },
    { id: 153, name: 'Thakurgaon Sadar', cityId: 761, cost: 120 },
    { id: 154, name: 'Outside Thakurgaon Sadar', cityId: 761, cost: 120 },
    { id: 155, name: 'Panchagarh Sadar', cityId: 764, cost: 120 },
    { id: 156, name: 'Outside Panchagarh Sadar', cityId: 764, cost: 120 },
    { id: 157, name: 'Lalmonirhat Sadar', cityId: 772, cost: 120 },
    { id: 158, name: 'Outside Lalmonirhat Sadar', cityId: 772, cost: 120 },
    { id: 159, name: 'Mymensingh City', cityId: 757, cost: 120 },
    { id: 160, name: 'Bangladesh Agricultural University (BAU)', cityId: 757, cost: 120 },
    { id: 161, name: 'Outside Mymensingh City', cityId: 757, cost: 120 },
    { id: 162, name: 'Sherpur Sadar', cityId: 742, cost: 120 },
    { id: 163, name: 'Outside Sherpur Sadar', cityId: 742, cost: 120 },
    { id: 164, name: 'Jamalpur Sadar', cityId: 752, cost: 120 },
    { id: 165, name: 'Outside Jamalpur Sadar', cityId: 752, cost: 120 },
    { id: 166, name: 'Netrokona Sadar', cityId: 754, cost: 120 },
    { id: 167, name: 'Outside Netrokona Sadar', cityId: 754, cost: 120 },
    { id: 168, name: 'Patuakhali Sadar', cityId: 729, cost: 120 },
    { id: 169, name: 'Outside Patuakhali Sadar', cityId: 729, cost: 120 },
    { id: 170, name: 'Patuakhali Science & Technology University (PSTU)', cityId: 729, cost: 120 },
    { id: 171, name: 'Jhalokati Sadar', cityId: 732, cost: 120 },
    { id: 172, name: 'Outside Jhalokati Sadar', cityId: 732, cost: 120 },
    { id: 173, name: 'Bhola Sadar', cityId: 736, cost: 120 },
    { id: 174, name: 'Outside Bhola Sadar', cityId: 736, cost: 120 },
    { id: 175, name: 'Barishal City', cityId: 743, cost: 120 },
    { id: 176, name: 'Outside Barishal City', cityId: 743, cost: 120 },
    { id: 177, name: 'University Of Barishal', cityId: 743, cost: 120 },
    { id: 178, name: 'Barguna Sadar', cityId: 746, cost: 120 },
    { id: 179, name: 'Barguna Other', cityId: 746, cost: 120 },
    { id: 180, name: 'Pirojpur Sadar', cityId: 753, cost: 120 },
    { id: 181, name: 'Outside Pirojpur Sadar', cityId: 753, cost: 120 },
    { id: 182, name: 'Magura Sadar', cityId: 723, cost: 120 },
    { id: 183, name: 'Outside Magura Sadar', cityId: 723, cost: 120 },
    { id: 184, name: 'Jashore City', cityId: 726, cost: 120 },
    { id: 185, name: 'Outside Jashore City', cityId: 726, cost: 120 },
    { id: 186, name: 'Jashore University of Science & Technology', cityId: 726, cost: 120 },
    { id: 187, name: 'Kushtia Sadar', cityId: 731, cost: 120 },
    { id: 188, name: 'Outside Kushtia Sadar', cityId: 731, cost: 120 },
    { id: 189, name: 'Meherpur Sadar', cityId: 735, cost: 120 },
    { id: 190, name: 'Satkhira Sadar', cityId: 741, cost: 120 },
    { id: 191, name: 'Outside Satkhira Sadar', cityId: 741, cost: 120 },
    { id: 192, name: 'Natore Sadar', cityId: 714, cost: 120 },
    { id: 193, name: 'Outside Natore Sadar', cityId: 714, cost: 120 },
    { id: 194, name: 'Chapainawabganj Sadar', cityId: 715, cost: 120 },
    { id: 195, name: 'Outside Chapainawabganj Sadar', cityId: 715, cost: 120 },
    { id: 196, name: 'Pabna Sadar', cityId: 716, cost: 120 },
    { id: 197, name: 'Outside Pabna Sadar', cityId: 716, cost: 120 },
    { id: 198, name: 'Pabna University of Science and Technology', cityId: 716, cost: 120 },
    { id: 199, name: 'Pabna Medical College', cityId: 716, cost: 120 },
    { id: 200, name: 'Joypurhat Sadar', cityId: 718, cost: 120 },
    { id: 201, name: 'Outside Joypurhat Sadar', cityId: 718, cost: 120 },
    { id: 202, name: 'Naogaon Sadar', cityId: 719, cost: 120 },
    { id: 203, name: 'Outside Naogaon Sadar', cityId: 719, cost: 120 },
    { id: 204, name: 'Bogura Cantonment', cityId: 721, cost: 120 },
    { id: 205, name: 'Rajshahi City', cityId: 724, cost: 120 },
    { id: 206, name: 'Outside Rajshahi City', cityId: 724, cost: 120 },
    { id: 207, name: 'University of Rajshahi', cityId: 724, cost: 120 },
    { id: 208, name: 'RUET', cityId: 724, cost: 120 },
    { id: 209, name: 'Sirajganj Sadar', cityId: 827, cost: 120 },
    { id: 210, name: 'Outside Sirajganj Sadar', cityId: 827, cost: 120 },
    { id: 211, name: 'Habiganj Sadar', cityId: 750, cost: 120 },
    { id: 212, name: 'Outside Habiganj Sadar', cityId: 750, cost: 120 },
    { id: 213, name: 'Sunamganj Sadar', cityId: 760, cost: 120 },
    { id: 214, name: 'Outside Sunamganj Sadar', cityId: 760, cost: 120 },
    { id: 215, name: 'Moulvibazar Sadar', cityId: 763, cost: 120 },
    { id: 216, name: 'Outside Moulvibazar Sadar', cityId: 763, cost: 120 },
    { id: 217, name: 'Sylhet City', cityId: 766, cost: 120 },
    { id: 218, name: 'Outside Sylhet City', cityId: 766, cost: 120 },
    { id: 219, name: 'SUST', cityId: 766, cost: 120 },
    { id: 220, name: 'Munshiganj Sadar', cityId: 777, cost: 120 },
    { id: 221, name: 'Gazipur Chowrasta', cityId: 717, cost: 120 },
    { id: 222, name: 'Gazipur Sreepur', cityId: 717, cost: 120 },
    { id: 223, name: 'Gazipur Kaliganj', cityId: 717, cost: 120 },
    { id: 224, name: 'Gazipur Other', cityId: 717, cost: 120 },
    { id: 225, name: 'Faridpur Sadar', cityId: 771, cost: 120 },
    { id: 226, name: 'Outside Faridpur Sadar', cityId: 771, cost: 120 },
    { id: 227, name: 'Mirzapur', cityId: 48362, cost: 120 },
    { id: 228, name: 'Keraniganj', cityId: 708, cost: 120 },
    { id: 229, name: 'Manikganj Inter City', cityId: 775, cost: 120 },
    { id: 230, name: 'Narsingdi City', cityId: 48361, cost: 120 },
    { id: 231, name: 'Kishorganj Outside', cityId: 774, cost: 120 },
    { id: 232, name: 'Madaripur Inside Area', cityId: 708, cost: 120 },
    { id: 234, name: 'Narayanganj City Outside', cityId: 710, cost: 120 },
    { id: 235, name: 'Tangail Sadar', cityId: 48362, cost: 120 },
    { id: 236, name: 'Gpalgonj Sadar', cityId: 778, cost: 130 },
    { id: 237, name: 'Outside Gopalganj Sadar', cityId: 778, cost: 130 },
    { id: 239, name: 'Shariatpur Sadar', cityId: 48364, cost: 130 },
    { id: 241, name: 'Madaripur Sadar Area', cityId: 773, cost: 130 },
    { id: 242, name: 'Rajbari Inter City', cityId: 48360, cost: 130 },
    { id: 243, name: 'Narail Sadar', cityId: 48366, cost: 130 },
    { id: 244, name: 'Outside Narail Sadar', cityId: 48366, cost: 130 },
    { id: 245, name: 'Kishoreganj Sadar', cityId: 774, cost: 130 },
    { id: 246, name: 'Chuadanga Sadar', cityId: 48367, cost: 130 },
    { id: 247, name: 'Chuadanga Sadar Outside', cityId: 48367, cost: 130 },
    { id: 248, name: 'Wari', cityId: 708, cost: 60 },
    { id: 249, name: 'Madaripur Inside Area', cityId: 708, cost: 130 },
    { id: 250, name: 'Bagerhat Sadar', cityId: 48368, cost: 130 },
    { id: 251, name: 'Bagerhat Other', cityId: 48368, cost: 130 },
    { id: 252, name: 'Outside Khagrachari', cityId: 48369, cost: 130 },
    { id: 253, name: 'Khagrachari Sadar', cityId: 48369, cost: 130 },
    { id: 255, name: 'Madaripur Kazi Bari', cityId: 773, cost: 130 },
    { id: 257, name: 'Brindaban Govt. College', cityId: 750, cost: 130 },
    { id: 258, name: 'Rajnagor R/A', cityId: 750, cost: 130 },
    { id: 259, name: 'Asampara (Chunarughat)', cityId: 750, cost: 130 },
    { id: 260, name: 'DIT Project (Merul Badda)', cityId: 708, cost: 60 },
    { id: 261, name: 'Adarsha Nagar (Middle Badda)', cityId: 708, cost: 60 },
    { id: 262, name: 'Pallabi (Mirpur)', cityId: 708, cost: 60 },
    { id: 263, name: 'Kochukhet (Kafrul Mirpur)', cityId: 708, cost: 60 },
    { id: 264, name: 'Matikata (Mirpur)', cityId: 708, cost: 60 },
    { id: 265, name: 'Manikdi (Mirpur)', cityId: 708, cost: 60 },
    { id: 266, name: 'Rupnagar (Mirpur)', cityId: 708, cost: 60 },
    { id: 267, name: 'Mazar Road (Mirpur)', cityId: 708, cost: 60 },
    { id: 268, name: 'West Kazipara (Mirpur)', cityId: 708, cost: 60 },
    { id: 269, name: 'Tolarbag (Mirpur)', cityId: 708, cost: 60 },
    { id: 270, name: 'Pirerbag 60 Feet (Mirpur)', cityId: 708, cost: 60 },
    { id: 271, name: 'Purobi Bus Stand (Mirpur)', cityId: 708, cost: 60 },
    { id: 272, name: 'Senpara Parbata (Mirpur)', cityId: 708, cost: 60 },
    { id: 273, name: 'Mirpur 11', cityId: 708, cost: 60 },
    { id: 274, name: 'Mirpur 12', cityId: 708, cost: 60 },
    { id: 275, name: 'Mirpur 13', cityId: 708, cost: 60 },
    { id: 276, name: 'Mirpur 14', cityId: 708, cost: 60 },
    { id: 277, name: 'Mirpur 11.5', cityId: 708, cost: 60 },
    { id: 278, name: 'MIST (Mirpur)', cityId: 708, cost: 60 },
    { id: 279, name: 'Mirpur 10', cityId: 708, cost: 60 },
    { id: 280, name: 'Paikpara (Mirpur)', cityId: 708, cost: 60 },
    { id: 281, name: 'Mirpur 1 Block A', cityId: 708, cost: 60 },
    { id: 282, name: 'Mirpur 1 Block B', cityId: 708, cost: 60 },
    { id: 283, name: 'Mirpur 1 Block C', cityId: 708, cost: 60 },
    { id: 284, name: 'Mirpur 1 Block D', cityId: 708, cost: 60 },
    { id: 285, name: 'Mirpur 1 Block E', cityId: 708, cost: 60 },
    { id: 286, name: 'Mirpur 1 Block F', cityId: 708, cost: 60 },
    { id: 287, name: 'Mirpur 1 Block G', cityId: 708, cost: 60 },
    { id: 288, name: 'Mirpur 1 Block H', cityId: 708, cost: 60 },
    { id: 289, name: 'Uttara Sector 1', cityId: 708, cost: 60 },
    { id: 290, name: 'Uttara Sector 2', cityId: 708, cost: 60 },
    { id: 291, name: 'Uttara Sector 3', cityId: 708, cost: 60 },
    { id: 292, name: 'Uttara Sector 4', cityId: 708, cost: 60 },
    { id: 293, name: 'Uttara Sector 5', cityId: 708, cost: 60 },
    { id: 294, name: 'Uttara Sector 6', cityId: 708, cost: 60 },
    { id: 295, name: 'Uttara Sector 7', cityId: 708, cost: 60 },
    { id: 296, name: 'Uttara Sector 8', cityId: 708, cost: 60 },
    { id: 297, name: 'Uttara Sector 9', cityId: 708, cost: 60 },
    { id: 298, name: 'Uttara Sector 10', cityId: 708, cost: 60 },
    { id: 299, name: 'Uttara Sector 11', cityId: 708, cost: 60 },
    { id: 300, name: 'Uttara Sector 12', cityId: 708, cost: 60 },
    { id: 301, name: 'Uttara Sector 13', cityId: 708, cost: 60 },
    { id: 302, name: 'Uttara Sector 14', cityId: 708, cost: 60 },
    { id: 303, name: 'Uttara Sector 15', cityId: 708, cost: 60 },
    { id: 304, name: 'Uttara Sector 16', cityId: 708, cost: 60 },
    { id: 305, name: 'Uttara Sector 17', cityId: 708, cost: 60 },
    { id: 306, name: 'Uttara Sector 18', cityId: 708, cost: 60 },
    { id: 307, name: 'Turag (Uttara)', cityId: 708, cost: 60 },
    { id: 308, name: 'House Building (Uttara)', cityId: 708, cost: 60 },
    { id: 309, name: 'Kakoli Banani', cityId: 708, cost: 60 },
    { id: 310, name: 'Chairman Bari (Banani)', cityId: 708, cost: 60 },
    { id: 311, name: 'Banani Block A', cityId: 708, cost: 60 },
    { id: 312, name: 'Banani Block B', cityId: 708, cost: 60 },
    { id: 313, name: 'Banani Block C', cityId: 708, cost: 60 },
    { id: 314, name: 'Banani Block D', cityId: 708, cost: 60 },
    { id: 315, name: 'Banani Block E', cityId: 708, cost: 60 },
    { id: 316, name: 'Banani Block F', cityId: 708, cost: 60 },
    { id: 317, name: 'Banani Block G', cityId: 708, cost: 60 },
    { id: 318, name: 'Banani Block H', cityId: 708, cost: 60 },
    { id: 319, name: 'Banani Block I', cityId: 708, cost: 60 },
    { id: 320, name: 'Banani Block J', cityId: 708, cost: 60 },
    { id: 321, name: 'Banani Block K', cityId: 708, cost: 60 },
    { id: 322, name: 'Banani Block L', cityId: 708, cost: 60 },
    { id: 323, name: 'Banasree Block A', cityId: 708, cost: 60 },
    { id: 324, name: 'Banasree Block B', cityId: 708, cost: 60 },
    { id: 325, name: 'Banasree Block C', cityId: 708, cost: 60 },
    { id: 326, name: 'Banasree Block D', cityId: 708, cost: 60 },
    { id: 327, name: 'Banasree Block E', cityId: 708, cost: 60 },
    { id: 328, name: 'Banasree Block F', cityId: 708, cost: 60 },
    { id: 329, name: 'Banasree Block G', cityId: 708, cost: 60 },
    { id: 330, name: 'Banasree Block H', cityId: 708, cost: 60 },
    { id: 331, name: 'Banasree Block I', cityId: 708, cost: 60 },
    { id: 332, name: 'Banasree Block J', cityId: 708, cost: 60 },
    { id: 333, name: 'Banasree Block K', cityId: 708, cost: 60 },
    { id: 334, name: 'Banasree Block L', cityId: 708, cost: 60 },
    { id: 335, name: 'Banasree Block M', cityId: 708, cost: 60 },
    { id: 336, name: 'Banasree Block N', cityId: 708, cost: 60 },
    { id: 337, name: 'Aftabnagar', cityId: 708, cost: 60 },
    { id: 338, name: 'Alubazar (Old Dhaka)', cityId: 708, cost: 60 },
    { id: 339, name: 'Amin Bazar', cityId: 709, cost: 100 },
    { id: 340, name: 'Babubazar (Old Dhaka)', cityId: 708, cost: 60 },
    { id: 341, name: 'Balughat (Mirpur)', cityId: 708, cost: 60 },
    { id: 342, name: 'Nadda (Baridhara)', cityId: 708, cost: 60 },
    { id: 343, name: 'Armanitola (Old Dhaka)', cityId: 708, cost: 60 },
    { id: 344, name: 'Askona', cityId: 708, cost: 60 },
    { id: 345, name: 'Savar Bus Stand', cityId: 709, cost: 130 },
    { id: 346, name: 'Kaliakoir', cityId: 717, cost: 130 },
    { id: 347, name: 'Chandra', cityId: 717, cost: 130 },
    { id: 348, name: 'Sonargaon', cityId: 710, cost: 130 },
    { id: 349, name: 'Fatullah', cityId: 710, cost: 130 },
    { id: 350, name: 'Shibu Market', cityId: 708, cost: 130 },
    { id: 351, name: 'Siddhirganj', cityId: 710, cost: 130 },
    { id: 352, name: 'Jalkuri', cityId: 710, cost: 130 },
    { id: 353, name: 'City Center Savar City', cityId: 709, cost: 130 },
    { id: 354, name: 'Hemayetpur Savar', cityId: 709, cost: 130 },
    { id: 355, name: 'Niribili Dhamrai', cityId: 48372, cost: 130 },
    { id: 356, name: 'Noyarhat Dhamrai', cityId: 48372, cost: 130 },
    { id: 357, name: 'Dhulivita Dhamrai', cityId: 48372, cost: 130 },
    { id: 358, name: 'Other (Not Listed)', cityId: 48372, cost: 130 },
    { id: 359, name: 'Gosairhat', cityId: 48364, cost: 130 },
    { id: 360, name: 'Zajira', cityId: 48364, cost: 130 },
    { id: 361, name: 'Damudya', cityId: 48364, cost: 130 },
    { id: 362, name: 'Bhedarganj', cityId: 48364, cost: 130 },
    { id: 363, name: 'Naria', cityId: 48364, cost: 130 },
    { id: 364, name: 'Kalihati', cityId: 48362, cost: 130 },
    { id: 365, name: 'Ghatail', cityId: 48362, cost: 130 },
    { id: 366, name: 'Dhanbari', cityId: 48362, cost: 130 },
    { id: 367, name: 'Shakhipur', cityId: 48362, cost: 130 },
    { id: 368, name: 'Other', cityId: 48362, cost: 130 },
    { id: 369, name: 'Rupganj', cityId: 710, cost: 130 },
    { id: 370, name: 'Lalmatia Block A', cityId: 708, cost: 60 },
    { id: 371, name: 'Lalmatia Block B', cityId: 708, cost: 60 },
    { id: 372, name: 'Lalmatia Block C', cityId: 708, cost: 60 },
    { id: 373, name: 'Lalmatia Block D', cityId: 708, cost: 60 },
    { id: 374, name: 'Lalmatia Block E', cityId: 708, cost: 60 },
    { id: 375, name: 'Lalmatia Block F', cityId: 708, cost: 60 },
    { id: 376, name: 'Lalmatia Block G', cityId: 708, cost: 60 },
    { id: 377, name: 'Anandapur Savar', cityId: 709, cost: 130 },
    { id: 378, name: 'Bottola Savar', cityId: 709, cost: 130 },
    { id: 379, name: 'Jamgora Savar', cityId: 709, cost: 130 },
    { id: 380, name: 'Fakirhat', cityId: 48368, cost: 130 },
    { id: 381, name: 'Mollahat', cityId: 48368, cost: 130 },
    { id: 382, name: 'Kachua', cityId: 48368, cost: 130 },
    { id: 383, name: 'Chitalmari', cityId: 48368, cost: 130 },
    { id: 384, name: 'Rampal', cityId: 48368, cost: 130 },
    { id: 385, name: 'Mongla', cityId: 48368, cost: 130 },
    { id: 386, name: 'Morrelganj', cityId: 48368, cost: 130 },
    { id: 387, name: 'Sarankhola', cityId: 48368, cost: 130 },
    { id: 388, name: 'Lama', cityId: 776, cost: 130 },
    { id: 389, name: 'Alikadam', cityId: 776, cost: 130 },
    { id: 390, name: 'Naikhongchhari Upazila', cityId: 776, cost: 130 },
    { id: 391, name: 'Ruma', cityId: 776, cost: 130 },
    { id: 392, name: 'Rowangchhari', cityId: 776, cost: 130 },
    { id: 393, name: 'Thanchi', cityId: 776, cost: 130 },
    { id: 394, name: 'Betagi', cityId: 746, cost: 130 },
    { id: 395, name: 'Amtali', cityId: 746, cost: 130 },
    { id: 396, name: 'Bamna', cityId: 746, cost: 130 },
    { id: 397, name: 'Patharghata', cityId: 746, cost: 130 },
    { id: 398, name: 'Taltali', cityId: 746, cost: 130 },
    { id: 399, name: 'Dhanmondi 7A', cityId: 708, cost: 60 },
    { id: 400, name: 'Dhanmondi 7', cityId: 708, cost: 60 },
    { id: 401, name: 'Dhanmondi 4A', cityId: 708, cost: 60 },
    { id: 402, name: 'Dhanmondi 10', cityId: 708, cost: 60 },
    { id: 403, name: 'Dhanmondi 27', cityId: 708, cost: 60 },
    { id: 404, name: 'Dhanmondi 32', cityId: 708, cost: 60 },
    { id: 405, name: 'Gulshan 1', cityId: 708, cost: 60 },
    { id: 406, name: 'Gulshan 2', cityId: 708, cost: 60 },
    { id: 407, name: 'Anderkilla', cityId: 758, cost: 130 },
    { id: 408, name: 'Agrabad', cityId: 758, cost: 130 },
    { id: 409, name: 'Halishahar', cityId: 758, cost: 130 },
    { id: 410, name: 'Pahartali', cityId: 758, cost: 130 },
    { id: 411, name: 'New Market CTG', cityId: 758, cost: 130 },
    { id: 412, name: 'Panchlaish', cityId: 758, cost: 130 },
    { id: 413, name: 'Nasirabad', cityId: 758, cost: 130 },
    { id: 414, name: 'Kotwali', cityId: 758, cost: 130 },
    { id: 415, name: 'Chawk Bazar', cityId: 758, cost: 130 },
    { id: 416, name: 'Oxygen', cityId: 758, cost: 130 },
    { id: 417, name: 'Bashkhali', cityId: 758, cost: 130 },
    { id: 418, name: 'Sitakunda', cityId: 758, cost: 130 },
    { id: 419, name: 'Sadarghat', cityId: 758, cost: 130 },
    { id: 420, name: 'Bakoliya', cityId: 758, cost: 130 },
    { id: 421, name: 'Bayazid', cityId: 758, cost: 130 },
    { id: 422, name: 'Lohagara', cityId: 758, cost: 130 },
    { id: 423, name: 'Bondor', cityId: 758, cost: 130 },
    { id: 424, name: 'EPZ', cityId: 758, cost: 130 },
    { id: 425, name: 'Hathazari', cityId: 758, cost: 130 },
    { id: 427, name: 'Fatikchhari', cityId: 758, cost: 130 },
    { id: 428, name: 'Mirsharai', cityId: 758, cost: 130 },
    { id: 429, name: 'Raozan Upazila', cityId: 758, cost: 130 },
    { id: 430, name: 'Keranihat', cityId: 758, cost: 130 },
    { id: 431, name: 'Chandgaon', cityId: 758, cost: 130 },
    { id: 432, name: 'Dohajari', cityId: 758, cost: 130 },
    { id: 433, name: 'Khulshi', cityId: 758, cost: 130 },
    { id: 434, name: 'Nazirhat', cityId: 758, cost: 130 },
    { id: 435, name: 'Rangunia Upazila', cityId: 758, cost: 130 },
    { id: 436, name: 'Patenga', cityId: 758, cost: 130 },
    { id: 437, name: 'Kalkini Upazila', cityId: 773, cost: 130 },
    { id: 438, name: 'Rajoir Upazila', cityId: 773, cost: 130 },
    { id: 439, name: 'Shibchar Upazila', cityId: 773, cost: 130 },
    { id: 440, name: 'Dasar Upazila', cityId: 773, cost: 130 },
    { id: 441, name: 'Dohar Upazila Area', cityId: 48373, cost: 130 },
    { id: 442, name: 'Shyampur', cityId: 708, cost: 60 },
    { id: 443, name: 'Nabinagar Bus Stand', cityId: 709, cost: 130 },
    { id: 444, name: 'Birganj Upazila', cityId: 728, cost: 130 },
    { id: 445, name: 'Shahjadpur Upazila', cityId: 827, cost: 130 },
    { id: 446, name: 'Ullapara Upazila', cityId: 827, cost: 130 },
    { id: 447, name: 'Tarash Upazila', cityId: 827, cost: 130 },
    { id: 448, name: 'Raiganj Upazila', cityId: 827, cost: 130 },
    { id: 449, name: 'Nilphamari Sadar Area', cityId: 769, cost: 130 },
    { id: 450, name: 'Dimla Upazila', cityId: 769, cost: 130 },
    { id: 451, name: 'Domar Upazila', cityId: 769, cost: 130 },
    { id: 452, name: 'Jaldhaka Upazila', cityId: 769, cost: 130 },
    { id: 453, name: 'Other (Not Listed)', cityId: 769, cost: 130 },
    { id: 454, name: 'Sherpur Bogura', cityId: 721, cost: 130 },
    { id: 455, name: 'Dupchanchia Bogura', cityId: 721, cost: 130 },
    { id: 456, name: 'Shibganj Bogura', cityId: 721, cost: 130 },
    { id: 457, name: 'Sonatola Bogura', cityId: 721, cost: 130 },
    { id: 458, name: 'Shajahanpur Bogura', cityId: 721, cost: 130 },
    { id: 459, name: 'Sariakandi Bogura', cityId: 721, cost: 130 },
    { id: 460, name: 'Adamdighi Bogura', cityId: 721, cost: 130 },
    { id: 461, name: 'Nandigram Bogura', cityId: 721, cost: 130 },
    { id: 462, name: 'Dhunat Bogura', cityId: 721, cost: 130 },
    { id: 463, name: 'Palash Upazila', cityId: 48361, cost: 130 },
    { id: 464, name: 'Shibpur Upazila', cityId: 48361, cost: 130 },
    { id: 465, name: 'Belabo Upazila', cityId: 48361, cost: 130 },
    { id: 466, name: 'Monohardi Upazila', cityId: 48361, cost: 130 },
    { id: 467, name: 'Raipura Upazila', cityId: 48361, cost: 130 },
    { id: 468, name: 'Goalanda Upazila', cityId: 48360, cost: 130 },
    { id: 469, name: 'Pangsha Upazila', cityId: 48360, cost: 130 },
    { id: 470, name: 'Baliakandi Upazila', cityId: 48360, cost: 130 },
    { id: 471, name: 'Kalukhali Upazila', cityId: 48360, cost: 130 },
    { id: 472, name: 'Araihazar', cityId: 710, cost: 130 },
    { id: 473, name: 'Biral Upazila', cityId: 728, cost: 130 },
    { id: 474, name: 'Parbatipur Upazila', cityId: 728, cost: 130 },
    { id: 475, name: 'Birampur Upazila', cityId: 728, cost: 130 },
    { id: 476, name: 'Khansama Upazila', cityId: 728, cost: 130 },
    { id: 477, name: 'Chirirbandar Upazila', cityId: 728, cost: 130 },
    { id: 478, name: 'Fulbari Dinajpur', cityId: 728, cost: 130 },
    { id: 479, name: 'Nawabganj Upazila', cityId: 728, cost: 130 },
    { id: 480, name: 'Trishal Upazila', cityId: 757, cost: 130 },
    { id: 481, name: 'Bhaluka Upazila', cityId: 757, cost: 130 },
    { id: 482, name: 'Tarakanda Upazila', cityId: 757, cost: 130 },
    { id: 483, name: 'Muktagacha Upazila', cityId: 757, cost: 130 },
    { id: 484, name: 'Gouripur Upazila', cityId: 757, cost: 130 },
    { id: 485, name: 'Nandail Upazila', cityId: 757, cost: 130 },
    { id: 486, name: 'Phulpur Mymensingh', cityId: 757, cost: 130 },
    { id: 487, name: 'Sharsha Upazila', cityId: 726, cost: 130 },
    { id: 488, name: 'Manirampur Upazila', cityId: 726, cost: 130 },
    { id: 489, name: 'Keshabpur Upazila', cityId: 726, cost: 130 },
    { id: 490, name: 'Jhikargacha Upazila', cityId: 726, cost: 130 },
    { id: 491, name: 'Chougachha Upazila', cityId: 726, cost: 130 },
    { id: 492, name: 'Bagherpara Upazila', cityId: 726, cost: 130 },
    { id: 493, name: 'Abhaynagar Upazila', cityId: 726, cost: 130 },
    { id: 494, name: 'Khulna University (KU)', cityId: 734, cost: 130 },
    { id: 495, name: 'Rupsha Upazila', cityId: 734, cost: 130 },
    { id: 496, name: 'Phultala Upazila', cityId: 734, cost: 130 },
    { id: 497, name: 'Paikgasa Upazila', cityId: 734, cost: 130 },
    { id: 498, name: 'Koyra Upazila', cityId: 734, cost: 130 },
    { id: 499, name: 'Dacope Upazila', cityId: 734, cost: 130 },
    { id: 500, name: 'Terokhada Upazila', cityId: 734, cost: 130 },
    { id: 501, name: 'Dumuria Upazila', cityId: 734, cost: 130 },
    { id: 503, name: 'Paba Upazila', cityId: 724, cost: 130 },
    { id: 504, name: 'Durgapur Upazila', cityId: 724, cost: 130 },
    { id: 505, name: 'Mohonpur Upazila', cityId: 724, cost: 130 },
    { id: 506, name: 'Charghat Upazila', cityId: 724, cost: 130 },
    { id: 507, name: 'Puthia Upazila', cityId: 724, cost: 130 },
    { id: 508, name: 'Bagha Upazila', cityId: 724, cost: 130 },
    { id: 509, name: 'Godagari Upazila', cityId: 724, cost: 130 },
    { id: 510, name: 'Tanore Upazila', cityId: 724, cost: 130 },
    { id: 511, name: 'Bagmara Upazila', cityId: 724, cost: 130 },
    { id: 512, name: 'Atghoria Upazila', cityId: 716, cost: 130 },
    { id: 513, name: 'Bera Upazila', cityId: 716, cost: 130 },
    { id: 514, name: 'Chatmohar Upazila', cityId: 716, cost: 130 },
    { id: 515, name: 'Ishwardi Upazila', cityId: 716, cost: 130 },
    { id: 516, name: 'Bhangura Upazila', cityId: 716, cost: 130 },
    { id: 517, name: 'Sujanagar Upazila', cityId: 716, cost: 130 },
    { id: 518, name: 'Santhia Upazila', cityId: 716, cost: 130 },
    { id: 519, name: 'Jaintapur Upazila', cityId: 766, cost: 130 },
    { id: 520, name: 'Dakshin Surma Upazila', cityId: 766, cost: 130 },
    { id: 521, name: 'Golapganj Upazila', cityId: 766, cost: 130 },
    { id: 522, name: 'Bishwanath Upazila', cityId: 766, cost: 130 },
    { id: 523, name: 'Companiganj Upazila', cityId: 766, cost: 130 },
    { id: 524, name: 'Gowainghat Upazila', cityId: 766, cost: 130 },
    { id: 525, name: 'Fenchuganj Upazila', cityId: 766, cost: 130 },
    { id: 526, name: 'Beanibazar Upazila', cityId: 766, cost: 130 },
    { id: 527, name: 'Osmani Nagar Upazila', cityId: 766, cost: 130 },
    { id: 528, name: 'Zakiganj Upazila', cityId: 766, cost: 130 },
    { id: 529, name: 'Balaganj Upazila', cityId: 766, cost: 130 },
    { id: 530, name: 'Kanaighat Upazila', cityId: 766, cost: 130 },
    { id: 531, name: 'Agailjhara Upazila', cityId: 743, cost: 130 },
    { id: 532, name: 'Gournadi Upazila', cityId: 743, cost: 130 },
    { id: 533, name: 'Babuganj Upazila', cityId: 743, cost: 130 },
    { id: 534, name: 'Bakerganj Upazila', cityId: 743, cost: 130 },
    { id: 535, name: 'Banaripara Upazila', cityId: 743, cost: 130 },
    { id: 536, name: 'Mehendiganj Upazila', cityId: 743, cost: 130 },
    { id: 537, name: 'Muladi Upazila', cityId: 743, cost: 130 },
    { id: 538, name: 'Wazirpur Upazila', cityId: 743, cost: 130 },
    { id: 539, name: 'Hizla Upazila', cityId: 743, cost: 130 },
    { id: 540, name: 'Sadullapur Upazila', cityId: 751, cost: 130 },
    { id: 541, name: 'Fulchhari Upazila', cityId: 751, cost: 130 },
    { id: 542, name: 'Gobindaganj Upazila', cityId: 751, cost: 130 },
    { id: 543, name: 'Palashbari Upazila', cityId: 751, cost: 130 },
    { id: 544, name: 'Saghata Upazila', cityId: 751, cost: 130 },
    { id: 545, name: 'Sundarganj Upazila', cityId: 751, cost: 130 },
    { id: 546, name: 'Akkelpur Upazila', cityId: 718, cost: 130 },
    { id: 547, name: 'Kalai Upazila', cityId: 718, cost: 130 },
    { id: 548, name: 'Khetlal Upazila', cityId: 718, cost: 130 },
    { id: 549, name: 'Panchbibi Upazila', cityId: 718, cost: 130 },
    { id: 550, name: 'Patgram Upazila', cityId: 772, cost: 130 },
    { id: 551, name: 'Kaliganj Upazila', cityId: 772, cost: 130 },
    { id: 552, name: 'Hatibandha Upazila', cityId: 772, cost: 130 },
    { id: 553, name: 'Aditmari Upazila', cityId: 772, cost: 130 },
    { id: 554, name: 'Chakaria Upazila', cityId: 780, cost: 130 },
    { id: 555, name: 'Pekua Upazila', cityId: 780, cost: 130 },
    { id: 556, name: 'Kutubdia Upazila', cityId: 780, cost: 130 },
    { id: 557, name: 'Moheskhali Upazila', cityId: 780, cost: 130 },
    { id: 558, name: 'Ramu Upazila', cityId: 780, cost: 130 },
    { id: 559, name: 'Ukhiya Upazila', cityId: 780, cost: 130 },
    { id: 560, name: 'Teknaf Upazila', cityId: 780, cost: 130 },
    { id: 561, name: 'Eidgaon Upazila', cityId: 780, cost: 130 },
    { id: 562, name: 'Niamatpur Upazila', cityId: 719, cost: 130 },
    { id: 563, name: 'Atrai Upazila', cityId: 719, cost: 130 },
    { id: 564, name: 'Mohadevpur Upazila', cityId: 719, cost: 130 },
    { id: 565, name: 'Patnitala Upazila', cityId: 719, cost: 130 },
    { id: 566, name: 'Sapahar Upazila', cityId: 719, cost: 0 },
    { id: 567, name: 'Porsha Upazila', cityId: 719, cost: 130 },
    { id: 568, name: 'Nazipur Naogaon', cityId: 719, cost: 130 },
    { id: 569, name: 'Tilakpur Naogaon', cityId: 719, cost: 130 },
    { id: 570, name: 'Shantahar Bogura', cityId: 721, cost: 130 },
    { id: 571, name: 'Mithapukur Upazila', cityId: 744, cost: 130 },
    { id: 572, name: 'Taraganj Upazila', cityId: 744, cost: 130 },
    { id: 573, name: 'Badarganj Upazila', cityId: 744, cost: 130 },
    { id: 574, name: 'Pirganj Upazila', cityId: 744, cost: 130 },
    { id: 575, name: 'Pirgachha Upazila', cityId: 744, cost: 130 },
    { id: 576, name: 'Outside Rangpur Sadar', cityId: 744, cost: 130 },
    { id: 577, name: 'Tetulia Upazila', cityId: 764, cost: 130 },
    { id: 578, name: 'Atwari Upazila', cityId: 764, cost: 130 },
    { id: 579, name: 'Debiganj Upazila', cityId: 764, cost: 130 },
    { id: 580, name: 'Boda Upazila', cityId: 764, cost: 130 },
    { id: 581, name: 'Ranisankail Upazila', cityId: 761, cost: 130 },
    { id: 582, name: 'Baliadangi Upazila', cityId: 761, cost: 130 },
    { id: 583, name: 'Ulipur Upazila', cityId: 759, cost: 130 },
    { id: 584, name: 'Phulbari Upazila', cityId: 759, cost: 130 },
    { id: 585, name: 'Rowmari Upazila', cityId: 759, cost: 130 },
    { id: 586, name: 'Chilmari Upazila', cityId: 759, cost: 130 },
    { id: 587, name: 'Nageshwari Upazila', cityId: 759, cost: 130 },
    { id: 588, name: 'Bhurungamari', cityId: 759, cost: 130 },
    { id: 589, name: 'Rajarhat Upazila', cityId: 759, cost: 130 },
    { id: 590, name: 'Rajibpur Upazila', cityId: 759, cost: 130 },
    { id: 591, name: 'Lohagara Upazila', cityId: 48366, cost: 130 },
    { id: 592, name: 'Kalia Upazila', cityId: 48366, cost: 130 },
    { id: 593, name: 'Alamdanga Upazila', cityId: 48367, cost: 130 },
    { id: 594, name: 'Damurhuda Upazila', cityId: 48367, cost: 130 },
    { id: 595, name: 'Jibannagar Upazila', cityId: 48367, cost: 130 },
    { id: 596, name: 'Shailkupa Upazila', cityId: 727, cost: 130 },
    { id: 597, name: 'Harinakundu Upazila', cityId: 727, cost: 130 },
    { id: 598, name: 'Kaliganj Jhenaidah', cityId: 727, cost: 130 },
    { id: 599, name: 'Kotchandpur Upazila', cityId: 727, cost: 130 },
    { id: 600, name: 'Moheshpur Upazila', cityId: 727, cost: 130 },
    { id: 601, name: 'Kasba Upazila', cityId: 748, cost: 130 },
    { id: 602, name: 'Nasirnagar Upazila', cityId: 748, cost: 130 },
    { id: 603, name: 'Sarail Upazila', cityId: 748, cost: 130 },
    { id: 604, name: 'Ashuganj Upazila', cityId: 748, cost: 130 },
    { id: 605, name: 'Akhaura Upazila', cityId: 748, cost: 130 },
    { id: 606, name: 'Nabinagar Upazila', cityId: 748, cost: 130 },
    { id: 607, name: 'Bijoynagar Upazila', cityId: 748, cost: 130 },
    { id: 608, name: 'Bancharampur Upazila', cityId: 748, cost: 130 },
    { id: 609, name: 'Debidwar Upazila', cityId: 755, cost: 130 },
    { id: 610, name: 'Barura Upazila', cityId: 755, cost: 130 },
    { id: 611, name: 'Daudkandi Upazila', cityId: 755, cost: 130 },
    { id: 612, name: 'Burichang Upazila', cityId: 755, cost: 130 },
    { id: 613, name: 'Chauddagram Upazila', cityId: 755, cost: 130 },
    { id: 614, name: 'Muradnagar Upazila', cityId: 755, cost: 130 },
    { id: 615, name: 'Manoharganj Upazila', cityId: 755, cost: 130 },
    { id: 616, name: 'Laksam Upazila', cityId: 755, cost: 130 },
    { id: 617, name: 'Nangalkot Upazila', cityId: 755, cost: 130 },
    { id: 618, name: 'Titas Upazila', cityId: 755, cost: 130 },
    { id: 619, name: 'Chandina Upazila', cityId: 755, cost: 130 },
    { id: 620, name: 'Meghna Upazila', cityId: 755, cost: 130 },
    { id: 621, name: 'Lalmai Upazila', cityId: 755, cost: 130 },
    { id: 622, name: 'Begumganj Upazila', cityId: 768, cost: 130 },
    { id: 623, name: 'Senbug Upazila', cityId: 768, cost: 130 },
    { id: 624, name: 'Sonaimuri Upazila', cityId: 768, cost: 130 },
    { id: 625, name: 'Chatkhil Upazila', cityId: 768, cost: 130 },
    { id: 626, name: 'Companiganj Noakhali', cityId: 768, cost: 130 },
    { id: 627, name: 'Kabirhat Upazila', cityId: 768, cost: 130 },
    { id: 628, name: 'Subarnachar Upazila', cityId: 768, cost: 130 },
    { id: 629, name: 'Hatia Island', cityId: 768, cost: 130 },
    { id: 630, name: 'Madhukhali Upazila', cityId: 771, cost: 130 },
    { id: 631, name: 'Boalmari Upazila', cityId: 771, cost: 130 },
    { id: 632, name: 'Alfadanga Upazila', cityId: 771, cost: 130 },
    { id: 633, name: 'Saltha Upazila', cityId: 771, cost: 130 },
    { id: 634, name: 'Nagarkanda Upazila', cityId: 771, cost: 130 },
    { id: 635, name: 'Bhanga Upazila', cityId: 771, cost: 130 },
    { id: 636, name: 'Charbhadrasan Upazila', cityId: 771, cost: 130 },
    { id: 637, name: 'Sadarpur Upazila', cityId: 771, cost: 130 },
    { id: 638, name: 'Tungipara Upazila', cityId: 778, cost: 130 },
    { id: 639, name: 'Kotalipara Upazila', cityId: 778, cost: 130 },
    { id: 640, name: 'Musksudpur Upazila', cityId: 778, cost: 130 },
    { id: 641, name: 'Kashiani Upazila', cityId: 778, cost: 130 },
    { id: 642, name: 'Shafipur Gazipur', cityId: 717, cost: 130 },
    { id: 643, name: 'Haziganj Chandpur', cityId: 725, cost: 130 },
    { id: 645, name: 'Homna', cityId: 755, cost: 130 },
    { id: 646, name: 'Chandina', cityId: 755, cost: 130 },
    { id: 647, name: 'Brahmanpara Upazila', cityId: 755, cost: 130 },
    { id: 648, name: 'Monohargonj Upazila', cityId: 755, cost: 130 },
    { id: 649, name: 'Sadarsouth Upazila', cityId: 755, cost: 130 },
    { id: 650, name: 'Chhagalnaiya Upazila', cityId: 765, cost: 130 },
    { id: 651, name: 'Sonagazi Upazila', cityId: 765, cost: 130 },
    { id: 652, name: 'Fulgazi Upazila', cityId: 765, cost: 130 },
    { id: 653, name: 'Parshuram Upazila', cityId: 765, cost: 130 },
    { id: 654, name: 'Daganbhuiyan Upazila', cityId: 765, cost: 130 },
    { id: 655, name: 'Kaptai Upazila', cityId: 745, cost: 130 },
    { id: 656, name: 'Kawkhali Upazila', cityId: 745, cost: 130 },
    { id: 657, name: 'Baghaichari Upazila', cityId: 745, cost: 130 },
    { id: 658, name: 'Barkal Upazila', cityId: 745, cost: 130 },
    { id: 659, name: 'Langadu Upazila', cityId: 745, cost: 130 },
    { id: 660, name: 'Rajasthali Upazila', cityId: 745, cost: 130 },
    { id: 661, name: 'Belaichari Upazila', cityId: 745, cost: 130 },
    { id: 662, name: 'Juraichari Upazila', cityId: 745, cost: 130 },
    { id: 663, name: 'Naniarchar Upazila', cityId: 745, cost: 130 },
    { id: 664, name: 'Haimchar Upazila', cityId: 725, cost: 130 },
    { id: 665, name: 'Kachua Upazila', cityId: 725, cost: 130 },
    { id: 666, name: 'Shahrasti Upazila', cityId: 725, cost: 130 },
    { id: 667, name: 'Matlabsouth Upazila', cityId: 725, cost: 130 },
    { id: 668, name: 'Hajiganj Upazila', cityId: 725, cost: 130 },
    { id: 669, name: 'Matlabnorth Upazila', cityId: 725, cost: 130 },
    { id: 670, name: 'Faridgonj Upazila', cityId: 725, cost: 130 },
    { id: 671, name: 'Kamalnagar Upazila', cityId: 749, cost: 130 },
    { id: 672, name: 'Raipur Upazila', cityId: 749, cost: 130 },
    { id: 673, name: 'Ramgati Upazila', cityId: 749, cost: 130 },
    { id: 674, name: 'Ramganj Upazila', cityId: 749, cost: 130 },
    { id: 675, name: 'Rangunia Upazila', cityId: 758, cost: 130 },
    { id: 676, name: 'Mirsharai Upazila', cityId: 758, cost: 130 },
    { id: 677, name: 'Patiya Upazila', cityId: 758, cost: 130 },
    { id: 678, name: 'Sandwip Upazila', cityId: 758, cost: 130 },
    { id: 679, name: 'Banshkhali Upazila', cityId: 758, cost: 130 },
    { id: 680, name: 'Boalkhali Upazila', cityId: 758, cost: 130 },
    { id: 681, name: 'Anwara Upazila', cityId: 758, cost: 130 },
    { id: 682, name: 'Chandanaish Upazila', cityId: 758, cost: 130 },
    { id: 683, name: 'Satkania Upazila', cityId: 758, cost: 130 },
    { id: 684, name: 'Lohagara Upazila', cityId: 758, cost: 130 },
    { id: 685, name: 'Hathazari Upazila', cityId: 758, cost: 130 },
    { id: 686, name: 'Fatikchhari Upazila', cityId: 758, cost: 130 },
    { id: 687, name: 'Raozan Upazila', cityId: 758, cost: 130 },
    { id: 688, name: 'Karnafuli Upazila', cityId: 758, cost: 130 },
    { id: 689, name: 'Dighinala Upazila', cityId: 48369, cost: 130 },
    { id: 690, name: 'Panchari Upazila', cityId: 48369, cost: 130 },
    { id: 691, name: 'Laxmichhari Upazila', cityId: 48369, cost: 130 },
    { id: 692, name: 'Mohalchari Upazila', cityId: 48369, cost: 130 },
    { id: 693, name: 'Manikchari Upazila', cityId: 48369, cost: 130 },
    { id: 694, name: 'Ramgarh Upazila', cityId: 48369, cost: 130 },
    { id: 695, name: 'Matiranga Upazila', cityId: 48369, cost: 130 },
    { id: 696, name: 'Guimara Upazila', cityId: 48369, cost: 130 },
    { id: 697, name: 'Guimara Upazila', cityId: 48369, cost: 130 },
    { id: 698, name: 'Belkuchi Upazila', cityId: 827, cost: 130 },
    { id: 699, name: 'Chauhali Upazila', cityId: 827, cost: 130 },
    { id: 700, name: 'Kamarkhand Upazila', cityId: 827, cost: 130 },
    { id: 701, name: 'Kazipur Upazila', cityId: 827, cost: 130 },
    { id: 702, name: 'Faridpur Upazila', cityId: 716, cost: 130 },
    { id: 703, name: 'Kahaloo Upazila', cityId: 721, cost: 130 },
    { id: 704, name: 'Shariakandi Upazila', cityId: 721, cost: 130 },
    { id: 705, name: 'Nondigram Upazila', cityId: 721, cost: 130 },
    { id: 706, name: 'Sonatala Upazila', cityId: 721, cost: 130 },
    { id: 707, name: 'Dhunot Upazila', cityId: 721, cost: 130 },
    { id: 708, name: 'Gabtali Upazila', cityId: 721, cost: 130 },
    { id: 709, name: 'Singra Upazila', cityId: 714, cost: 130 },
    { id: 710, name: 'Baraigram Upazila', cityId: 714, cost: 130 },
    { id: 711, name: 'Bagatipara Upazila', cityId: 714, cost: 130 },
    { id: 712, name: 'Lalpur Upazila', cityId: 714, cost: 130 },
    { id: 713, name: 'Gurudaspur Upazila', cityId: 714, cost: 130 },
    { id: 714, name: 'Naldanga Upazila', cityId: 714, cost: 130 },
    { id: 715, name: 'Gomostapur Upazila', cityId: 715, cost: 130 },
    { id: 716, name: 'Nachol Upazila', cityId: 715, cost: 130 },
    { id: 717, name: 'Bholahat Upazila', cityId: 715, cost: 130 },
    { id: 718, name: 'Shibganj Upazila', cityId: 715, cost: 130 },
    { id: 719, name: 'Badalgachi Upazila', cityId: 719, cost: 130 },
    { id: 720, name: 'Dhamoirhat Upazila', cityId: 719, cost: 130 },
    { id: 721, name: 'Manda Upazila', cityId: 719, cost: 130 },
    { id: 722, name: 'Raninagar Upazila', cityId: 719, cost: 130 },
    { id: 723, name: 'Assasuni Upazila', cityId: 741, cost: 130 },
    { id: 724, name: 'Debhata Upazila', cityId: 741, cost: 130 },
    { id: 725, name: 'Kalaroa Upazila', cityId: 741, cost: 130 },
    { id: 726, name: 'Shyamnagar Upazila', cityId: 741, cost: 130 },
    { id: 727, name: 'Tala Upazila', cityId: 741, cost: 130 },
    { id: 728, name: 'Kaliganj Upazila', cityId: 741, cost: 130 },
    { id: 729, name: 'Mujibnagar Upazila', cityId: 735, cost: 130 },
    { id: 730, name: 'Gangni Upazila', cityId: 735, cost: 130 },
    { id: 731, name: 'Kumarkhali Upazila', cityId: 731, cost: 130 },
    { id: 732, name: 'Khoksa Upazila', cityId: 731, cost: 130 },
    { id: 733, name: 'Mirpur Upazila', cityId: 731, cost: 130 },
    { id: 734, name: 'Daulatpur Upazila', cityId: 731, cost: 130 },
    { id: 735, name: 'Bheramara Upazila', cityId: 731, cost: 130 },
    { id: 736, name: 'Shalikha Upazila', cityId: 723, cost: 130 },
    { id: 737, name: 'Sreepur Upazila', cityId: 723, cost: 130 },
    { id: 738, name: 'Mohammadpur Upazila', cityId: 723, cost: 130 },
    { id: 739, name: 'Fultola Upazila', cityId: 734, cost: 130 },
    { id: 740, name: 'Botiaghata Upazila', cityId: 734, cost: 130 },
    { id: 741, name: 'Kathalia Upazila', cityId: 732, cost: 130 },
    { id: 742, name: 'Nalchity Upazila', cityId: 732, cost: 130 },
    { id: 743, name: 'Rajapur Upazila', cityId: 732, cost: 130 },
    { id: 744, name: 'Bauphal Upazila', cityId: 729, cost: 130 },
    { id: 745, name: 'Dumki Upazila', cityId: 729, cost: 130 },
    { id: 746, name: 'Dashmina Upazila', cityId: 729, cost: 130 },
    { id: 747, name: 'Kalapara Upazila', cityId: 729, cost: 130 },
    { id: 748, name: 'Mirzaganj Upazila', cityId: 729, cost: 130 },
    { id: 749, name: 'Galachipa Upazila', cityId: 729, cost: 130 },
    { id: 750, name: 'Rangabali Upazila', cityId: 729, cost: 130 },
    { id: 751, name: 'Nazirpur Upazila', cityId: 753, cost: 130 },
    { id: 752, name: 'Kawkhali Upazila', cityId: 753, cost: 130 },
    { id: 753, name: 'Bhandaria Upazila', cityId: 753, cost: 130 },
    { id: 754, name: 'Mathbaria Upazila', cityId: 753, cost: 130 },
    { id: 755, name: 'Nesarabad Upazila', cityId: 753, cost: 130 },
    { id: 756, name: 'Indurkani Upazila', cityId: 753, cost: 130 },
    { id: 757, name: 'Borhanuddin Upazila', cityId: 736, cost: 130 },
    { id: 758, name: 'Charfesson Upazila', cityId: 736, cost: 130 },
    { id: 759, name: 'Doulatkhan Upazila', cityId: 736, cost: 130 },
    { id: 760, name: 'Monpura Upazila', cityId: 736, cost: 130 },
    { id: 761, name: 'Tazumuddin Upazila', cityId: 736, cost: 130 },
    { id: 762, name: 'Lalmohan Upazila', cityId: 736, cost: 130 },
    { id: 763, name: 'Barlekha Upazila', cityId: 763, cost: 130 },
    { id: 764, name: 'Kamolganj Upazila', cityId: 763, cost: 130 },
    { id: 765, name: 'Kulaura Upazila', cityId: 763, cost: 130 },
    { id: 766, name: 'Rajnagar Upazila', cityId: 763, cost: 130 },
    { id: 767, name: 'Sreemangal Upazila', cityId: 763, cost: 130 },
    { id: 768, name: 'Juri Upazila', cityId: 763, cost: 130 },
    { id: 769, name: 'Nabiganj Upazila', cityId: 750, cost: 130 },
    { id: 770, name: 'Bahubal Upazila', cityId: 750, cost: 130 },
    { id: 771, name: 'Ajmiriganj Upazila', cityId: 750, cost: 130 },
    { id: 772, name: 'Baniachong Upazila', cityId: 750, cost: 130 },
    { id: 773, name: 'Lakhai Upazila', cityId: 750, cost: 130 },
    { id: 774, name: 'Chunarughat Upazila', cityId: 750, cost: 130 },
    { id: 775, name: 'Madhabpur Upazila', cityId: 750, cost: 130 },
    { id: 776, name: 'Shayestaganj Upazila', cityId: 750, cost: 130 },
    { id: 778, name: 'Bishwambarpur Upazila', cityId: 760, cost: 130 },
    { id: 779, name: 'Chhatak Upazila', cityId: 760, cost: 130 },
    { id: 780, name: 'Jagannathpur Upazila', cityId: 760, cost: 130 },
    { id: 781, name: 'Dowarabazar Upazila', cityId: 760, cost: 130 },
    { id: 782, name: 'Tahirpur Upazila', cityId: 760, cost: 130 },
    { id: 783, name: 'Dharmapasha Upazila', cityId: 760, cost: 130 },
    { id: 784, name: 'Jamalganj Upazila', cityId: 760, cost: 130 },
    { id: 785, name: 'Shalla Upazila', cityId: 760, cost: 130 },
    { id: 786, name: 'Derai Upazila', cityId: 760, cost: 130 },
    { id: 787, name: 'Madhyanagar Upazila', cityId: 760, cost: 130 },
    { id: 788, name: 'Sadar Upazila', cityId: 717, cost: 130 },
    { id: 789, name: 'Sreepur Upazila', cityId: 717, cost: 130 },
    { id: 790, name: 'Narayanganj sadar Upazila', cityId: 710, cost: 130 },
    { id: 791, name: 'Basail Upazila', cityId: 48362, cost: 130 },
    { id: 792, name: 'Bhuapur Upazila', cityId: 48362, cost: 130 },
    { id: 793, name: 'Delduar Upazila', cityId: 48362, cost: 130 },
    { id: 794, name: 'Gopalpur Upazila', cityId: 48362, cost: 130 },
    { id: 795, name: 'Madhupur Upazila', cityId: 48362, cost: 130 },
    { id: 796, name: 'Nagarpur Upazila', cityId: 48362, cost: 130 },
    { id: 797, name: 'Sakhipur Upazila', cityId: 48362, cost: 130 },
    { id: 798, name: 'Itna Upazila', cityId: 774, cost: 130 },
    { id: 799, name: 'Katiadi Upazila', cityId: 774, cost: 130 },
    { id: 800, name: 'Bhairab Upazila', cityId: 774, cost: 130 },
    { id: 801, name: 'Tarail Upazila', cityId: 774, cost: 130 },
    { id: 802, name: 'Hossainpur Upazila', cityId: 774, cost: 130 },
    { id: 803, name: 'Pakundia Upazila', cityId: 774, cost: 130 },
    { id: 804, name: 'Kuliarchar Upazila', cityId: 774, cost: 130 },
    { id: 805, name: 'Karimgonj Upazila', cityId: 774, cost: 130 },
    { id: 806, name: 'Bajitpur Upazila', cityId: 774, cost: 130 },
    { id: 807, name: 'Austagram Upazila', cityId: 774, cost: 130 },
    { id: 808, name: 'Mithamoin Upazila', cityId: 774, cost: 130 },
    { id: 809, name: 'Nikli Upazila', cityId: 774, cost: 130 },
    { id: 810, name: 'Harirampur Upazila', cityId: 775, cost: 130 },
    { id: 811, name: 'Saturia Upazila', cityId: 775, cost: 130 },
    { id: 812, name: 'Sadar Upazila', cityId: 775, cost: 130 },
    { id: 813, name: 'Gior Upazila', cityId: 775, cost: 130 },
    { id: 814, name: 'Shibaloy Upazila', cityId: 775, cost: 130 },
    { id: 815, name: 'Doulatpur Upazila', cityId: 775, cost: 130 },
    { id: 816, name: 'Singiar Upazila', cityId: 775, cost: 130 },
    { id: 817, name: 'Tongibari Upazila', cityId: 777, cost: 130 },
    { id: 818, name: 'Gajaria Upazila', cityId: 777, cost: 130 },
    { id: 819, name: 'Louhajanj Upazila', cityId: 777, cost: 130 },
    { id: 820, name: 'Sirajdikhan Upazila', cityId: 777, cost: 130 },
    { id: 821, name: 'Sreenagar Upazila', cityId: 777, cost: 130 },
    { id: 822, name: 'Ghoraghat Upazila', cityId: 728, cost: 130 },
    { id: 823, name: 'Bochaganj Upazila', cityId: 728, cost: 130 },
    { id: 824, name: 'Kaharol Upazila', cityId: 728, cost: 130 },
    { id: 825, name: 'Hakimpur Upazila', cityId: 728, cost: 130 },
    { id: 826, name: 'Birol Upazila', cityId: 728, cost: 130 },
    { id: 827, name: 'Kishorganj Upazila', cityId: 769, cost: 130 },
    { id: 828, name: 'Pirganj Upazila', cityId: 761, cost: 130 },
    { id: 829, name: 'Haripur Upazila', cityId: 761, cost: 130 },
    { id: 830, name: 'Gangachara Upazila', cityId: 744, cost: 130 },
    { id: 831, name: 'Mithapukur Upazila', cityId: 744, cost: 130 },
    { id: 832, name: 'Kaunia Upazila', cityId: 744, cost: 130 },
    { id: 833, name: 'Charrajibpur Upazila', cityId: 744, cost: 130 },
    { id: 834, name: 'Nalitabari Upazila', cityId: 744, cost: 130 },
    { id: 835, name: 'Sreebordi Upazila', cityId: 742, cost: 130 },
    { id: 836, name: 'Nokla Upazila', cityId: 742, cost: 130 },
    { id: 837, name: 'Jhenaigati Upazila', cityId: 744, cost: 130 },
    { id: 838, name: 'Fulbaria Upazila', cityId: 757, cost: 130 },
    { id: 839, name: 'Dhobaura Upazila', cityId: 757, cost: 130 },
    { id: 840, name: 'Haluaghat Upazila', cityId: 757, cost: 130 },
    { id: 841, name: 'Gafargaon Upazila', cityId: 757, cost: 130 },
    { id: 842, name: 'Iswarganj Upazila', cityId: 757, cost: 130 },
    { id: 843, name: 'Melandah Upazila', cityId: 752, cost: 130 },
    { id: 844, name: 'Islampur Upazila', cityId: 752, cost: 130 },
    { id: 845, name: 'Dewangonj Upazila', cityId: 752, cost: 130 },
    { id: 846, name: 'Sarishabari Upazila', cityId: 752, cost: 130 },
    { id: 847, name: 'Madarganj Upazila', cityId: 752, cost: 130 },
    { id: 849, name: 'Barhatta Upazila', cityId: 754, cost: 130 },
    { id: 850, name: 'Durgapur Upazila', cityId: 754, cost: 130 },
    { id: 851, name: 'Kendua Upazila', cityId: 754, cost: 130 },
    { id: 852, name: 'Atpara Upazila', cityId: 754, cost: 130 },
    { id: 853, name: 'Madan Upazila', cityId: 754, cost: 130 },
    { id: 854, name: 'Khaliajuri Upazila', cityId: 754, cost: 130 },
    { id: 855, name: 'Kalmakanda Upazila', cityId: 754, cost: 130 },
    { id: 856, name: 'Mohongonj Upazila', cityId: 754, cost: 130 },
    { id: 857, name: 'Purbadhala Upazila', cityId: 754, cost: 130 },
    { id: 858, name: 'Bokshiganj Upazila', cityId: 752, cost: 130 },
    { id: 860, name: 'Darshana', cityId: 48367, cost: 130 },
    { id: 861, name: 'Joydebpur', cityId: 717, cost: 130 },
    { id: 862, name: 'konabari', cityId: 717, cost: 130 },
  ];

  for (const cd of countriesData) {
    await prisma.country.upsert({
      where: { id: cd.id },
      update: cd,
      create: cd,
    });
  }

  for (const sd of statesData) {
    await prisma.state.upsert({
      where: { id: sd.id },
      update: sd,
      create: sd,
    });
  }

  for (const cd of citiesData) {
    await prisma.city.upsert({
      where: { id: cd.id },
      update: cd,
      create: cd,
    });
  }

  for (const ad of areasData) {
    await prisma.area.upsert({
      where: { id: ad.id },
      update: ad,
      create: ad,
    });
  }

  console.log(
    `✅ Created ${countriesData.length} countries, ${statesData.length} states, ${citiesData.length} cities, ${areasData.length} areas`
  );
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

// ============ Navigation ============
async function seedNavigation() {
  console.log('🧭 Seeding navigation items...');

  const navItems = [
    { label: 'Home', url: 'home', location: 'header', sortOrder: 1, isActive: true },
    { label: 'Products', url: 'products', location: 'header', sortOrder: 2, isActive: true },
    { label: 'Deals', url: 'deals', location: 'header', sortOrder: 3, isActive: true },
    { label: 'Blog', url: 'blog', location: 'header', sortOrder: 4, isActive: true },
    { label: 'Contact', url: 'contact', location: 'header', sortOrder: 5, isActive: true },
    { label: 'FAQ', url: 'faq', location: 'header', sortOrder: 6, isActive: true },
  ];

  for (const item of navItems) {
    await prisma.navigationItem.create({ data: item });
  }

  console.log(`✅ Created ${navItems.length} navigation items`);
}

// ============ Footer Widgets ============
async function seedFooterWidgets() {
  console.log('🧩 Seeding footer widgets...');

  await prisma.footerWidget.create({
    data: {
      title: 'Quick Links',
      location: 'quick_links',
      sortOrder: 1,
      links: {
        create: [
          { label: 'Home', url: 'home', sortOrder: 1 },
          { label: 'All Products', url: 'products', sortOrder: 2 },
          { label: 'New Arrivals', url: 'products?newArrival=true', sortOrder: 3 },
          { label: 'Best Sellers', url: 'products?bestSeller=true', sortOrder: 4 },
          { label: 'Featured', url: 'products?featured=true', sortOrder: 5 },
          { label: 'My Account', url: 'account', sortOrder: 6 },
          { label: 'My Wishlist', url: 'wishlist', sortOrder: 7 },
          { label: 'Blog', url: 'blog', sortOrder: 8 },
          { label: 'Gift Cards', url: 'gift-cards', sortOrder: 9 },
        ],
      },
    },
  });

  await prisma.footerWidget.create({
    data: {
      title: 'Customer Service',
      location: 'customer_service',
      sortOrder: 2,
      links: {
        create: [
          { label: 'Contact Us', url: 'contact', sortOrder: 1 },
          { label: 'FAQ', url: 'faq', sortOrder: 2 },
          { label: 'About Us', url: 'about', sortOrder: 3 },
          { label: 'Track Order', url: 'order-tracking', sortOrder: 4 },
          { label: 'Return Request', url: 'return-request', sortOrder: 5 },
        ],
      },
    },
  });

  console.log('✅ Created 2 footer widgets with 14 links');
}

// ============ Features ============
async function seedFeatures() {
  console.log('⭐ Seeding features...');

  const features = [
    { icon: 'Truck', title: 'Free Shipping', description: 'Free shipping on all orders over $50', sortOrder: 1 },
    { icon: 'Shield', title: 'Secure Payment', description: '100% secure payment processing', sortOrder: 2 },
    { icon: 'RotateCcw', title: 'Easy Returns', description: '30-day hassle-free return policy', sortOrder: 3 },
  ];

  for (const f of features) {
    await prisma.featureItem.create({ data: { ...f, isActive: true } });
  }

  console.log(`✅ Created ${features.length} features`);
}

// ============ Shipping Methods ============
async function seedShippingMethods() {
  console.log('🚚 Seeding shipping methods...');

  const methods = [
    { name: 'Inside Dhaka', cost: 60, freeAbove: 1000, sortOrder: 1 },
    { name: 'Outside Dhaka', cost: 120, freeAbove: 2000, sortOrder: 2 },
    { name: 'Express Delivery', cost: 150, freeAbove: null, sortOrder: 3 },
  ];

  for (const m of methods) {
    await prisma.shippingMethod.create({ data: { ...m, isActive: true } });
  }

  console.log(`✅ Created ${methods.length} shipping methods`);
}

// ============ Payment Methods ============
async function seedPaymentMethods() {
  console.log('💳 Seeding payment methods...');

  const methods = [
    { name: 'Cash on Delivery', image: 'https://picsum.photos/seed/cod/64/64', sortOrder: 1 },
    { name: 'bKash', image: 'https://picsum.photos/seed/bkash/64/64', sortOrder: 2 },
    { name: 'Nagad', image: 'https://picsum.photos/seed/nagad/64/64', sortOrder: 3 },
    { name: 'Credit / Debit Card', image: 'https://picsum.photos/seed/card/64/64', sortOrder: 4 },
  ];

  for (const m of methods) {
    await prisma.paymentMethod.create({ data: { ...m, isActive: true } });
  }

  console.log(`✅ Created ${methods.length} payment methods`);
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
  await seedLocations();
  await seedNavigation();
  await seedFooterWidgets();
  await seedFeatures();
  await seedShippingMethods();
  await seedPaymentMethods();

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(50));
  console.log('📊 SEEDING SUMMARY');
  console.log('='.repeat(50));

  // Seed notifications for admin users
  const existingNotifs = await prisma.notification.count();
  if (existingNotifs === 0) {
    const adminUsers = await prisma.user.findMany({
      where: { email: { in: ['superadmin@shop.com', 'admin@shop.com'] } },
    });
    for (const u of adminUsers) {
      await prisma.notification.createMany({
        data: [
          { userId: u.id, title: 'New order #1234 received', description: 'A new order has been placed and needs processing.', type: 'order', read: false },
          { userId: u.id, title: 'Low stock alert: Samsung Galaxy Watch 6', description: 'Only 3 units remaining. Consider restocking soon.', type: 'warning', read: false },
          { userId: u.id, title: 'New review on Apple AirPods Pro 2', description: 'A customer left a 5-star review with photos.', type: 'info', read: false },
          { userId: u.id, title: 'Coupon WELCOME10 expiring soon', description: 'This coupon expires in 2 days. Review and extend if needed.', type: 'warning', read: false },
          { userId: u.id, title: '5 new customer registrations today', description: 'New signups are up 25% compared to last week.', type: 'success', read: true },
        ],
      });
    }
  }

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
    notifications: await prisma.notification.count(),
    settings: await prisma.setting.count(),
    addresses: await prisma.address.count(),
    navigationItems: await prisma.navigationItem.count(),
    footerWidgets: await prisma.footerWidget.count(),
    footerWidgetLinks: await prisma.footerWidgetLink.count(),
    features: await prisma.featureItem.count(),
    testimonials: await prisma.testimonial.count(),
    faqCategories: await prisma.fAQCategory.count(),
    faqs: await prisma.fAQ.count(),
    aboutSections: await prisma.aboutSection.count(),
    announcements: await prisma.announcement.count(),
    paymentMethods: await prisma.paymentMethod.count(),
    shippingMethods: await prisma.shippingMethod.count(),
    countries: await prisma.country.count(),
    states: await prisma.state.count(),
    cities: await prisma.city.count(),
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
