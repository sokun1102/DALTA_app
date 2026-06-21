import { MigrationInterface, QueryRunner } from 'typeorm';

type PartSeed = {
  name: string;
  sku: string;
  categorySlug: string;
  brandSlug: string;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  color: string;
  size: string;
  weight: string;
  image: string;
  tags: string;
  description: string;
  specifications: Record<string, string>;
};

const categories = [
  {
    name: 'Aerodynamics',
    slug: 'aerodynamics',
    description: 'Carbon aero parts: wings, diffusers, splitters and airflow control pieces.',
    image: '/images/cars/AT-SPLIT-FRT-11.png',
    displayOrder: 1,
  },
  {
    name: 'Engine & Exhaust',
    slug: 'engine-exhaust',
    description: 'Performance intake, exhaust, ECU and powertrain upgrades.',
    image: '/images/cars/AT-CNC-INT-05.png',
    displayOrder: 2,
  },
  {
    name: 'Braking System',
    slug: 'braking-system',
    description: 'Carbon ceramic rotors, calipers, brake lines and track pads.',
    image: '/images/cars/AT-TRK-PAD-09.png',
    displayOrder: 3,
  },
  {
    name: 'Suspension & Chassis',
    slug: 'suspension-chassis',
    description: 'Adaptive dampers, chassis braces, coilovers and handling components.',
    image: '/images/cars/AT-MAG-SUSP-04.png',
    displayOrder: 4,
  },
  {
    name: 'Wheels & Tyres',
    slug: 'wheels-tyres',
    description: 'Forged wheels, motorsport tyres and unsprung mass reduction parts.',
    image: '/images/cars/AT-MONO-RIM-08.png',
    displayOrder: 5,
  },
  {
    name: 'Electronics & Cooling',
    slug: 'electronics-cooling',
    description: 'ECU modules, telemetry, cooling packages and electrical performance systems.',
    image: '/images/cars/AT-DUAL-RAD-10.png',
    displayOrder: 6,
  },
];

const brands = [
  {
    name: 'AEROTEC',
    slug: 'aerotec',
    description: 'Premium motorsport performance parts and carbon aero engineering.',
    logo: '/images/cars/aerotec-logo.png',
    website: 'https://aerotec.local',
  },
  {
    name: 'Brembo Spec',
    slug: 'brembo-spec',
    description: 'Track braking packages inspired by endurance racing hardware.',
    logo: '/images/cars/AT-TRK-PAD-09.png',
    website: 'https://brembo.local',
  },
  {
    name: 'Ohlins Spec',
    slug: 'ohlins-spec',
    description: 'Adaptive suspension and damper systems for high performance cars.',
    logo: '/images/cars/AT-MAG-SUSP-04.png',
    website: 'https://ohlins.local',
  },
  {
    name: 'Recaro Spec',
    slug: 'recaro-spec',
    description: 'Driver focused cockpit, forged wheel and motorsport fitment parts.',
    logo: '/images/cars/AT-MONO-RIM-08.png',
    website: 'https://recaro.local',
  },
];

const parts: PartSeed[] = [
  {
    name: 'Apex Forged Carbon Rear Wing',
    sku: 'AT-APEX-WING-01',
    categorySlug: 'aerodynamics',
    brandSlug: 'aerotec',
    price: 120000000,
    originalPrice: 145000000,
    stock: 5,
    rating: 4.9,
    reviewCount: 18,
    soldCount: 11,
    color: 'Forged Carbon Black',
    size: 'GT Wing Kit',
    weight: '-8.5 kg',
    image: '/images/cars/apex-r7.png',
    tags: 'car-part,aero,carbon,downforce,track',
    description:
      'Autoclave cured forged carbon rear wing engineered for high speed stability and adjustable downforce on track focused builds.',
    specifications: {
      type: 'Aerodynamics',
      material: 'Forged carbon fiber',
      weightReduction: '-8.5 kg',
      gain: '+180 kg downforce at high speed',
      fitment: 'Universal GT coupe chassis with custom brackets',
      warranty: '24 months',
      displayPrice: '120.0M VND',
      accent: '#e11d48',
    },
  },
  {
    name: 'Titanium Valved Exhaust System',
    sku: 'AT-TITAN-EXH-02',
    categorySlug: 'engine-exhaust',
    brandSlug: 'aerotec',
    price: 280000000,
    originalPrice: 320000000,
    stock: 3,
    rating: 5,
    reviewCount: 24,
    soldCount: 9,
    color: 'Burnt Titanium',
    size: 'Cat-back System',
    weight: '-14.0 kg',
    image: '/images/cars/vector-gt.png',
    tags: 'car-part,engine,exhaust,titanium,power',
    description:
      'Grade 5 titanium exhaust with active valves, TIG welded sections and ECU drive-mode integration for street and track sound control.',
    specifications: {
      type: 'Engine & Exhaust',
      material: 'Titanium Grade 5',
      weightReduction: '-14.0 kg',
      gain: '+18 HP with reduced back pressure',
      fitment: 'V6/V8 performance coupe platforms',
      warranty: '24 months',
      displayPrice: '280.0M VND',
      accent: '#f59e0b',
    },
  },
  {
    name: 'Carbon Ceramic Brake Rotor Kit',
    sku: 'AT-CERAM-BRK-03',
    categorySlug: 'braking-system',
    brandSlug: 'brembo-spec',
    price: 350000000,
    originalPrice: 390000000,
    stock: 2,
    rating: 4.8,
    reviewCount: 16,
    soldCount: 7,
    color: 'Carbon Grey',
    size: 'Front + Rear Rotor Kit',
    weight: '-18.0 kg',
    image: '/images/cars/nova-x.png',
    tags: 'car-part,brake,ceramic,track,rotor',
    description:
      'Ventilated carbon ceramic rotor package designed for repeated high temperature braking with near zero fade on circuit sessions.',
    specifications: {
      type: 'Braking System',
      material: 'Carbon ceramic matrix',
      weightReduction: '-18.0 kg',
      gain: 'Zero fade braking up to 1000C',
      fitment: 'Big brake conversion 390-420 mm',
      warranty: '18 months',
      displayPrice: '350.0M VND',
      accent: '#38bdf8',
    },
  },
  {
    name: 'Active-Mag Adaptive Damper Set',
    sku: 'AT-MAG-SUSP-04',
    categorySlug: 'suspension-chassis',
    brandSlug: 'ohlins-spec',
    price: 195000000,
    originalPrice: 230000000,
    stock: 4,
    rating: 4.7,
    reviewCount: 12,
    soldCount: 8,
    color: 'Anodized Gold',
    size: '4-corner Damper Kit',
    weight: '-3.2 kg',
    image: '/images/cars/AT-MAG-SUSP-04.png',
    tags: 'car-part,suspension,damper,handling,chassis',
    description:
      'Electronically adaptive damper set with 1000Hz response control for road comfort and aggressive track compression mapping.',
    specifications: {
      type: 'Suspension & Chassis',
      material: 'CNC billet aluminum',
      weightReduction: '-3.2 kg',
      gain: '1000Hz adaptive damping response',
      fitment: 'Double wishbone and multi-link sports cars',
      warranty: '24 months',
      displayPrice: '195.0M VND',
      accent: '#f59e0b',
    },
  },
  {
    name: 'CNC Billet Intake Manifold',
    sku: 'AT-CNC-INT-05',
    categorySlug: 'engine-exhaust',
    brandSlug: 'aerotec',
    price: 85000000,
    originalPrice: 99000000,
    stock: 8,
    rating: 4.6,
    reviewCount: 10,
    soldCount: 14,
    color: 'Satin Aluminum',
    size: 'High-flow Intake',
    weight: '-2.0 kg',
    image: '/images/cars/AT-CNC-INT-05.png',
    tags: 'car-part,intake,engine,aluminum,power',
    description:
      'Five-axis CNC machined intake manifold optimized for smoother airflow and improved throttle response on tuned engines.',
    specifications: {
      type: 'Engine & Exhaust',
      material: '6061-T6 aerospace aluminum',
      weightReduction: '-2.0 kg',
      gain: '+12 HP intake airflow gain',
      fitment: 'Turbocharged inline and V engines',
      warranty: '18 months',
      displayPrice: '85.0M VND',
      accent: '#94a3b8',
    },
  },
  {
    name: 'Neural Performance ECU Module',
    sku: 'AT-NEUR-ECU-06',
    categorySlug: 'electronics-cooling',
    brandSlug: 'aerotec',
    price: 110000000,
    originalPrice: 135000000,
    stock: 7,
    rating: 4.9,
    reviewCount: 21,
    soldCount: 15,
    color: 'Black Heat Sink',
    size: 'Plug-in ECU',
    weight: '-0.5 kg',
    image: '/images/cars/AT-NEUR-ECU-06.png',
    tags: 'car-part,ecu,electronics,tuning,power',
    description:
      'Smart ECU module with telemetry based calibration, boost control maps and configurable safety limits for performance builds.',
    specifications: {
      type: 'Electronics & Cooling',
      material: 'Silicon processor with aluminum case',
      weightReduction: '-0.5 kg',
      gain: '+35 HP optimized ignition and boost maps',
      fitment: 'CAN bus performance platforms',
      warranty: '24 months',
      displayPrice: '110.0M VND',
      accent: '#38bdf8',
    },
  },
  {
    name: 'Vortex Carbon Rear Diffuser',
    sku: 'AT-VORT-DIFF-07',
    categorySlug: 'aerodynamics',
    brandSlug: 'aerotec',
    price: 145000000,
    originalPrice: 168000000,
    stock: 6,
    rating: 4.7,
    reviewCount: 13,
    soldCount: 10,
    color: '3K Carbon Weave',
    size: 'Rear Diffuser',
    weight: '-6.0 kg',
    image: '/images/cars/AT-VORT-DIFF-07.png',
    tags: 'car-part,aero,diffuser,carbon,downforce',
    description:
      'Prepreg carbon rear diffuser using vortex channels to stabilize rear axle airflow and improve ground effect at speed.',
    specifications: {
      type: 'Aerodynamics',
      material: '3K prepreg carbon fiber',
      weightReduction: '-6.0 kg',
      gain: '+90 kg rear downforce at 250 km/h',
      fitment: 'Low-slung sports coupe rear bumper',
      warranty: '24 months',
      displayPrice: '145.0M VND',
      accent: '#e11d48',
    },
  },
  {
    name: 'Forged Monoblock Wheel Set',
    sku: 'AT-MONO-RIM-08',
    categorySlug: 'wheels-tyres',
    brandSlug: 'recaro-spec',
    price: 220000000,
    originalPrice: 260000000,
    stock: 4,
    rating: 4.8,
    reviewCount: 15,
    soldCount: 6,
    color: 'Matte Gunmetal',
    size: '20 inch staggered set',
    weight: '-24.0 kg set',
    image: '/images/cars/AT-MONO-RIM-08.png',
    tags: 'car-part,wheel,forged,monoblock,handling',
    description:
      'Single piece forged aluminum wheel set reducing unsprung mass while improving brake cooling and steering precision.',
    specifications: {
      type: 'Wheels & Tyres',
      material: 'Forged 6061-T6 aluminum',
      weightReduction: '-24.0 kg full set',
      gain: 'Reduced unsprung mass',
      fitment: '5-lug performance fitments',
      warranty: '36 months',
      displayPrice: '220.0M VND',
      accent: '#94a3b8',
    },
  },
  {
    name: 'Track Compound Brake Pad Set',
    sku: 'AT-TRK-PAD-09',
    categorySlug: 'braking-system',
    brandSlug: 'brembo-spec',
    price: 42000000,
    originalPrice: 52000000,
    stock: 18,
    rating: 4.5,
    reviewCount: 9,
    soldCount: 25,
    color: 'Graphite',
    size: 'Front + Rear Pads',
    weight: 'N/A',
    image: '/images/cars/AT-TRK-PAD-09.png',
    tags: 'car-part,brake,pads,track,consumable',
    description:
      'High friction track pad compound with stable pedal feel across repeated hot laps and heavy braking zones.',
    specifications: {
      type: 'Braking System',
      material: 'Semi-metallic track compound',
      weightReduction: 'N/A',
      gain: 'Stable friction under repeated heat cycles',
      fitment: 'Big brake caliper systems',
      warranty: 'Consumable part',
      displayPrice: '42.0M VND',
      accent: '#38bdf8',
    },
  },
  {
    name: 'Dual Core Aluminum Radiator',
    sku: 'AT-DUAL-RAD-10',
    categorySlug: 'electronics-cooling',
    brandSlug: 'aerotec',
    price: 76000000,
    originalPrice: 91000000,
    stock: 9,
    rating: 4.6,
    reviewCount: 8,
    soldCount: 12,
    color: 'Brushed Aluminum',
    size: 'Dual Core Cooling Pack',
    weight: '-1.8 kg',
    image: '/images/cars/AT-DUAL-RAD-10.png',
    tags: 'car-part,cooling,radiator,engine,aluminum',
    description:
      'Dual core aluminum radiator with high density fins for improved cooling stability during high boost street and track use.',
    specifications: {
      type: 'Electronics & Cooling',
      material: 'Brazed aluminum dual core',
      weightReduction: '-1.8 kg',
      gain: '-12C average coolant temperature',
      fitment: 'Turbocharged sports platforms',
      warranty: '24 months',
      displayPrice: '76.0M VND',
      accent: '#94a3b8',
    },
  },
  {
    name: 'Carbon Front Splitter Blade',
    sku: 'AT-SPLIT-FRT-11',
    categorySlug: 'aerodynamics',
    brandSlug: 'aerotec',
    price: 98000000,
    originalPrice: 118000000,
    stock: 6,
    rating: 4.7,
    reviewCount: 11,
    soldCount: 13,
    color: 'Gloss Carbon',
    size: 'Front Splitter',
    weight: '-4.4 kg',
    image: '/images/cars/AT-SPLIT-FRT-11.png',
    tags: 'car-part,aero,splitter,carbon,front-end',
    description:
      'Front splitter blade increasing front axle bite and reducing lift with reinforced mounting points for track curb strikes.',
    specifications: {
      type: 'Aerodynamics',
      material: 'Gloss carbon fiber reinforced core',
      weightReduction: '-4.4 kg',
      gain: '+65 kg front downforce',
      fitment: 'Performance coupe front bumper',
      warranty: '18 months',
      displayPrice: '98.0M VND',
      accent: '#e11d48',
    },
  },
  {
    name: 'Adjustable Chassis Brace Kit',
    sku: 'AT-CHAS-BRACE-12',
    categorySlug: 'suspension-chassis',
    brandSlug: 'ohlins-spec',
    price: 64000000,
    originalPrice: 79000000,
    stock: 10,
    rating: 4.4,
    reviewCount: 7,
    soldCount: 18,
    color: 'Satin Black',
    size: 'Front + Rear Brace',
    weight: '+2.1 kg',
    image: '/images/cars/AT-CHAS-BRACE-12.png',
    tags: 'car-part,chassis,brace,handling,rigidity',
    description:
      'Adjustable chassis brace kit improving torsional rigidity and steering consistency under heavy cornering loads.',
    specifications: {
      type: 'Suspension & Chassis',
      material: 'Chromoly steel and billet aluminum joints',
      weightReduction: '+2.1 kg reinforcement',
      gain: '+18 percent chassis torsional rigidity',
      fitment: 'Front strut and rear subframe mounting',
      warranty: '36 months',
      displayPrice: '64.0M VND',
      accent: '#f59e0b',
    },
  },
];

export class ResetCatalogToCarParts1720000005000 implements MigrationInterface {
  name = 'ResetCatalogToCarParts1720000005000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM cart_items');
    await queryRunner.query('DELETE FROM wishlist_items');
    await queryRunner.query('DELETE FROM product_reviews');
    await queryRunner.query('DELETE FROM product_images');
    await queryRunner.query('DELETE FROM products');
    await queryRunner.query('DELETE FROM categories');
    await queryRunner.query('DELETE FROM brands');

    for (const category of categories) {
      await queryRunner.query(
        `
          INSERT INTO categories (name, slug, description, image, isActive, displayOrder)
          VALUES (?, ?, ?, ?, 1, ?)
        `,
        [
          category.name,
          category.slug,
          category.description,
          category.image,
          category.displayOrder,
        ],
      );
    }

    for (const brand of brands) {
      await queryRunner.query(
        `
          INSERT INTO brands (name, slug, description, logo, website, isActive)
          VALUES (?, ?, ?, ?, ?, 1)
        `,
        [brand.name, brand.slug, brand.description, brand.logo, brand.website],
      );
    }

    const categoryRows = (await queryRunner.query('SELECT id, slug FROM categories')) as Array<{
      id: number;
      slug: string;
    }>;
    const brandRows = (await queryRunner.query('SELECT id, slug, name FROM brands')) as Array<{
      id: number;
      slug: string;
      name: string;
    }>;
    const categoryIdBySlug = new Map<string, number>(
      categoryRows.map((row) => [row.slug, row.id]),
    );
    const brandBySlug = new Map<string, { id: number; slug: string; name: string }>(
      brandRows.map((row) => [row.slug, row]),
    );

    for (const part of parts) {
      const brand = brandBySlug.get(part.brandSlug);
      const categoryId = categoryIdBySlug.get(part.categorySlug);

      await queryRunner.query(
        `
          INSERT INTO products (
            name, price, originalPrice, description, brand, sku, stock, isActive,
            rating, reviewCount, soldCount, viewCount, specifications, color, size,
            weight, categoryId, brandId, tags
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          part.name,
          part.price,
          part.originalPrice,
          part.description,
          brand?.name || 'AEROTEC',
          part.sku,
          part.stock,
          part.rating,
          part.reviewCount,
          part.soldCount,
          JSON.stringify(part.specifications),
          part.color,
          part.size,
          part.weight,
          categoryId,
          brand?.id || null,
          part.tags,
        ],
      );

      await queryRunner.query(
        `
          INSERT INTO product_images (url, isPrimary, displayOrder, altText, productId)
          SELECT ?, 1, 0, ?, p.id
          FROM products p
          WHERE p.sku = ?
        `,
        [part.image, part.name, part.sku],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM cart_items');
    await queryRunner.query('DELETE FROM wishlist_items');
    await queryRunner.query('DELETE FROM product_reviews');
    await queryRunner.query('DELETE FROM product_images');
    await queryRunner.query('DELETE FROM products');
    await queryRunner.query('DELETE FROM categories');
    await queryRunner.query('DELETE FROM brands');
  }
}
