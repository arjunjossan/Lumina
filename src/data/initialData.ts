import { Product, Order, PromoCode, SuccessStory, TopNotificationConfig, SocialSettings, DesktopHeroConfig, MobileHeroConfig } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-84920',
    createdAt: '2026-08-07T14:22:00Z',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    shippingAddress: {
      fullName: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-001',
        productTitle: 'AuraSphere 360° Magnetic Levitation Ambient Lamp',
        productImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=300&q=80',
        price: 2499.00,
        quantity: 1
      }
    ],
    subtotal: 2499.00,
    discount: 200.00,
    shippingFee: 0.00,
    total: 2299.00,
    status: 'Shipped',
    paymentMethod: 'Credit Card (Visa)',
    trackingNumber: 'TRK-USPS-9400111899562',
    carrier: 'USPS Priority Mail',
    estimatedDelivery: 'Aug 10, 2026'
  },
  {
    id: 'ORD-84921',
    createdAt: '2026-08-08T02:10:00Z',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@techcorp.io',
    shippingAddress: {
      fullName: 'Marcus Vance',
      email: 'm.vance@techcorp.io',
      phone: '+1 (555) 987-6543',
      address: '100 Ocean Drive, Suite 400',
      city: 'Miami',
      state: 'FL',
      zipCode: '33139',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-003',
        productTitle: 'PulsePod Active ANC Wireless Noise-Canceling Earbuds',
        productImage: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80',
        price: 2199.00,
        quantity: 1
      },
      {
        productId: 'prod-002',
        productTitle: 'NovaPulse Ultrasonic Jewellery & Glasses Cleaner Pro',
        productImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80',
        price: 1499.00,
        quantity: 1
      }
    ],
    subtotal: 3698.00,
    discount: 0.00,
    shippingFee: 0.00,
    total: 3698.00,
    status: 'Processing',
    paymentMethod: 'Apple Pay'
  },
  {
    id: 'ORD-84918',
    createdAt: '2026-08-06T11:45:00Z',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@gmail.com',
    shippingAddress: {
      fullName: 'Elena Rostova',
      email: 'elena.rostova@gmail.com',
      phone: '+1 (555) 443-2211',
      address: '1540 Broadway, Apt 12B',
      city: 'New York',
      state: 'NY',
      zipCode: '10036',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-004',
        productTitle: 'GlowBar Hydrating Facial LED Light Therapy Mask',
        productImage: 'https://images.unsplash.com/photo-1512290900673-7002fe5cd6a7?auto=format&fit=crop&w=300&q=80',
        price: 119.99,
        quantity: 1
      }
    ],
    subtotal: 119.99,
    discount: 15.00,
    shippingFee: 0.00,
    total: 104.99,
    status: 'Delivered',
    paymentMethod: 'PayPal',
    trackingNumber: 'TRK-FEDEX-782291039',
    carrier: 'FedEx Express',
    estimatedDelivery: 'Aug 07, 2026'
  }
];

export const INITIAL_PROMOS: PromoCode[] = [
  { code: 'WINNING20', discountPercent: 20, active: true, minSpend: 499 },
  { code: 'LUMINA10', discountPercent: 10, active: true },
  { code: 'FREESHIP', discountPercent: 15, active: true, minSpend: 399 },
  { code: 'FLASH20', discountPercent: 20, active: true, minSpend: 299 }
];

export const INITIAL_REVIEWS: Record<string, import('../types').ProductReview[]> = {
  'prod-001': [
    {
      id: 'rev-001-1',
      productId: 'prod-001',
      author: 'David K.',
      rating: 5,
      date: 'Aug 02, 2026',
      title: 'Mind-blowing levitation & surreal ambient vibe!',
      comment: 'Everyone who comes into my office instantly asks where I got this. The floating orb looks unreal, and the built-in speaker sound is surprisingly crisp and deep.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80',
      helpfulCount: 24
    },
    {
      id: 'rev-001-2',
      productId: 'prod-001',
      author: 'Jessica M.',
      rating: 5,
      date: 'Jul 29, 2026',
      title: 'Worth every single penny',
      comment: 'Super easy magnetic setup. The auto-catch feature works perfectly if power trips. Build quality is luxury solid walnut.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 18
    },
    {
      id: 'rev-001-3',
      productId: 'prod-001',
      author: 'Brandon T.',
      rating: 5,
      date: 'Aug 10, 2026',
      title: 'The magnetic float is seamless',
      comment: 'Touch dimming is smooth and responsive. It doubles as a futuristic art centerpiece.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 9
    }
  ],
  'prod-007': [
    {
      id: 'rev-007-1',
      productId: 'prod-007',
      author: 'Elena R.',
      rating: 5,
      date: 'Aug 05, 2026',
      title: 'Cozy fireplace aesthetic in a compact diffuser',
      comment: 'The 3D flame mist simulation is stunning in the dark. Adds incredible humidity and soothing lavender aroma to my bedroom.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1608248597359-f19b153f31b2?auto=format&fit=crop&w=400&q=80',
      helpfulCount: 31
    },
    {
      id: 'rev-007-2',
      productId: 'prod-007',
      author: 'Carlos G.',
      rating: 4,
      date: 'Jul 26, 2026',
      title: 'Very quiet and relaxing',
      comment: 'Mist output is consistent and the ice blue mode looks like cyber fire. Automatic shut-off works reliably.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 14
    }
  ],
  'prod-008': [
    {
      id: 'rev-008-1',
      productId: 'prod-008',
      author: 'Maya S.',
      rating: 5,
      date: 'Aug 08, 2026',
      title: 'Golden hour pictures in my room anytime!',
      comment: 'The optical quartz lens creates vibrant saturated halos without color distortion. The remote control lets you mix gradients easily.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 19
    }
  ],
  'prod-009': [
    {
      id: 'rev-009-1',
      productId: 'prod-009',
      author: 'Julian F.',
      rating: 5,
      date: 'Aug 01, 2026',
      title: 'Ultimate desk meditation',
      comment: 'Watching the chrome ball draw geometric mandala rings is hypnotizing. High quality glass top and premium wood finish.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 22
    },
    {
      id: 'rev-009-2',
      productId: 'prod-009',
      author: 'Rachel P.',
      rating: 5,
      date: 'Jul 21, 2026',
      title: 'Unique conversation starter',
      comment: 'Silent mechanism and soothing warm backlight. Everyone in our living room is mesmerized by the sand patterns.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 11
    }
  ],
  'prod-002': [
    {
      id: 'rev-002-1',
      productId: 'prod-002',
      author: 'Robert B.',
      rating: 5,
      date: 'Aug 04, 2026',
      title: 'Restored my gold watch and eyeglasses like magic',
      comment: 'I put my glasses in for 3 minutes and the amount of invisible oils and dirt that came out was insane. Clear crystal vision again!',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
      helpfulCount: 35
    },
    {
      id: 'rev-002-2',
      productId: 'prod-002',
      author: 'Samantha L.',
      rating: 5,
      date: 'Jul 30, 2026',
      title: 'Essential for jewelry owners',
      comment: 'Diamond rings and silver chains look brand new straight out of the jeweler store. Super quiet operation.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 20
    }
  ],
  'prod-006': [
    {
      id: 'rev-006-1',
      productId: 'prod-006',
      author: 'Tyler W.',
      rating: 5,
      date: 'Aug 09, 2026',
      title: 'Insane power for such a small blower!',
      comment: '110,000 RPM is no joke. It blasted all water droplets off my car side mirrors in seconds and dried my mechanical keyboard thoroughly.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      helpfulCount: 42
    },
    {
      id: 'rev-006-2',
      productId: 'prod-006',
      author: 'Lucas M.',
      rating: 5,
      date: 'Jul 28, 2026',
      title: 'CNC aluminum body feels indestructible',
      comment: 'Battery life easily lasts several heavy cleaning sessions. Great portable gadget for tech lovers.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 16
    }
  ],
  'prod-010': [
    {
      id: 'rev-010-1',
      productId: 'prod-010',
      author: 'Kevin H.',
      rating: 5,
      date: 'Aug 03, 2026',
      title: 'Laser precision and instant room measurements',
      comment: 'Measured my entire apartment floorplan in 10 minutes. Bluetooth auto-calculation of area and volume saves so much time.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 15
    }
  ],
  'prod-011': [
    {
      id: 'rev-011-1',
      productId: 'prod-011',
      author: 'Daniel V.',
      rating: 5,
      date: 'Aug 06, 2026',
      title: 'The only travel charger you need',
      comment: 'Folds flat like a wallet. Charges my iPhone 15, Apple Watch Ultra, and AirPods simultaneously with zero heating issues.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 28
    },
    {
      id: 'rev-011-2',
      productId: 'prod-011',
      author: 'Chloe N.',
      rating: 4,
      date: 'Jul 25, 2026',
      title: 'Magnetic snap is super strong',
      comment: 'Phone holds securely in both portrait and standby mode on the bedside table. Great build quality.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 8
    }
  ],
  'prod-003': [
    {
      id: 'rev-003-1',
      productId: 'prod-003',
      author: 'Marcus V.',
      rating: 5,
      date: 'Aug 07, 2026',
      title: 'Active noise cancellation punches way above its price',
      comment: 'Blocks airplane cabin hum and loud cafe chatter completely. Deep rich bass and crystal clear call microphones.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
      helpfulCount: 39
    },
    {
      id: 'rev-003-2',
      productId: 'prod-003',
      author: 'Ashley B.',
      rating: 5,
      date: 'Jul 31, 2026',
      title: 'Comfortable for all-day gym workouts',
      comment: 'IPX7 sweatproof is legit. They never slip out while running and battery lasts 8 hours on a single charge.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 19
    }
  ],
  'prod-012': [
    {
      id: 'rev-012-1',
      productId: 'prod-012',
      author: 'Leo G.',
      rating: 5,
      date: 'Aug 04, 2026',
      title: 'RGB lighting syncs to the music rhythm!',
      comment: 'Perfect compact soundbar for under-monitor gaming setups. Dual subwoofers deliver punchy acoustic sound.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 17
    }
  ],
  'prod-013': [
    {
      id: 'rev-013-1',
      productId: 'prod-013',
      author: 'Heather K.',
      rating: 5,
      date: 'Aug 02, 2026',
      title: 'Total 100% blackout & soothing side-sleeper audio',
      comment: 'Zero eye pressure contoured memory foam. Ultra-thin flat speakers let you sleep comfortably on your side without hurting your ears.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 26
    },
    {
      id: 'rev-013-2',
      productId: 'prod-013',
      author: 'Jonathan D.',
      rating: 5,
      date: 'Jul 24, 2026',
      title: 'Cured my jetlag and insomnia',
      comment: 'Pairs instantly with white noise apps. Silk breathable lining stays cool all night.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 12
    }
  ],
  'prod-014': [
    {
      id: 'rev-014-1',
      productId: 'prod-014',
      author: 'Natalie C.',
      rating: 5,
      date: 'Aug 05, 2026',
      title: 'Vintage aesthetic with modern Bluetooth punch',
      comment: 'Looks like a classic 1960s vinyl player with gold brass knobs. Surprisingly loud sound with zero distortion.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 14
    }
  ],
  'prod-004': [
    {
      id: 'rev-004-1',
      productId: 'prod-004',
      author: 'Elena Rostova',
      rating: 5,
      date: 'Aug 06, 2026',
      title: 'Clinically visible skin smoothing in 3 weeks',
      comment: 'I use the Red Light mode (630nm) 10 minutes every evening. My skin texture and fine lines have noticeably softened. Medical-grade soft silicone fits comfortably.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1512290900673-7002fe5cd6a7?auto=format&fit=crop&w=400&q=80',
      helpfulCount: 46
    },
    {
      id: 'rev-004-2',
      productId: 'prod-004',
      author: 'Victoria W.',
      rating: 5,
      date: 'Jul 27, 2026',
      title: 'Blue light mode cleared my breakouts',
      comment: 'Completely wireless with comfortable eye cushions so you can read or watch TV while doing your therapy session.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 23
    }
  ],
  'prod-015': [
    {
      id: 'rev-015-1',
      productId: 'prod-015',
      author: 'Brian S.',
      rating: 5,
      date: 'Aug 01, 2026',
      title: 'Telescopic pocket flosser with dental power',
      comment: 'Collapses down to the size of a smartphone for travel. The pulse pressure removes everything between teeth effortlessly.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 18
    }
  ],
  'prod-016': [
    {
      id: 'rev-016-1',
      productId: 'prod-016',
      author: 'Grace H.',
      rating: 5,
      date: 'Aug 03, 2026',
      title: 'Melts away desk neck tension instantly',
      comment: 'The 3D Shiatsu rotating nodes feel like actual human hands kneading your trapezius muscles. Warm infrared heat is heaven.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 29
    },
    {
      id: 'rev-016-2',
      productId: 'prod-016',
      author: 'Oliver T.',
      rating: 5,
      date: 'Jul 22, 2026',
      title: 'Rechargeable cordless freedom',
      comment: 'Wear it on the sofa or while working at your desk. 3 speed intensity levels with reversible direction.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 15
    }
  ],
  'prod-017': [
    {
      id: 'rev-017-1',
      productId: 'prod-017',
      author: 'Sophia Martinez',
      rating: 5,
      date: 'Aug 08, 2026',
      title: 'Ice-cooling pulse makes treatments 100% painless',
      comment: 'No burning sensation at all thanks to the sapphire contact cooling plate. Hair regrowth slowed down dramatically after 4 sessions.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 33
    }
  ],
  'prod-005': [
    {
      id: 'rev-005-1',
      productId: 'prod-005',
      author: 'Megan D.',
      rating: 5,
      date: 'Aug 05, 2026',
      title: 'Crushes frozen berries and ice in 20 seconds',
      comment: '6 stainless steel 3D serrated blades blend smoothies super smooth. The direct sip sports lid is so convenient for gym.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 27
    },
    {
      id: 'rev-005-2',
      productId: 'prod-005',
      author: 'Eric W.',
      rating: 4,
      date: 'Jul 29, 2026',
      title: 'Self-cleaning mode is brilliant',
      comment: 'Add a drop of dish soap and water, double tap power, and it washes itself completely.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 16
    }
  ],
  'prod-018': [
    {
      id: 'rev-018-1',
      productId: 'prod-018',
      author: 'Jordan K.',
      rating: 5,
      date: 'Aug 07, 2026',
      title: 'UV-C cap keeps water 100% odor-free',
      comment: 'No funky bottle smell even after weeks of gym use. Keeps ice water cold for over 24 hours in insulated stainless steel.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 21
    }
  ],
  'prod-019': [
    {
      id: 'rev-019-1',
      productId: 'prod-019',
      author: 'Aaron L.',
      rating: 5,
      date: 'Aug 02, 2026',
      title: 'Coccyx U-cutout eliminated my lower back soreness',
      comment: 'High density memory foam doesn’t flatten after 8 hours of desk sitting. Cooling gel layer prevents sweating.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 30
    }
  ],
  'prod-020': [
    {
      id: 'rev-020-1',
      productId: 'prod-020',
      author: 'Lucas Vance',
      rating: 5,
      date: 'Aug 06, 2026',
      title: 'TSA lock and hidden pockets provide ultimate peace of mind',
      comment: 'Traveled across 4 international airports with this pack. Fits my 17” laptop, camera gear, and charges phone on the go.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 38
    },
    {
      id: 'rev-020-2',
      productId: 'prod-020',
      author: 'Emily R.',
      rating: 5,
      date: 'Jul 26, 2026',
      title: 'Waterproof ballistic nylon is premium quality',
      comment: 'Got caught in heavy rain and everything inside remained bone dry. Ergonomic shoulder straps distribute weight evenly.',
      verified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
      helpfulCount: 22
    }
  ]
};

export const INITIAL_SUCCESS_STORIES: SuccessStory[] = [];

export const DEFAULT_TOP_NOTIFICATION_CONFIG: TopNotificationConfig = {
  enabled: true,
  leftBadgeText: 'LUMINA EXCLUSIVE DEALS',
  leftBadgeIcon: 'sparkles',
  centerMessage: '🔥 Limited Stock Available — Free Express Delivery Across India Over ₹499',
  centerHighlightText: 'Claim Deals',
  centerLinkAction: 'catalog',
  rightTag1Text: '2-Day Delivery',
  rightTag1Icon: 'truck',
  rightTag2Text: '30-Day Guarantee',
  rightTag2Icon: 'shield',
  themePreset: 'dark',
  customBgColor: '#0f172a',
  customTextColor: '#f8fafc',
  customAccentColor: '#fcd34d',
  isAnimatedPulse: true
};

export const DEFAULT_SOCIAL_SETTINGS: SocialSettings = {
  facebook: 'https://facebook.com',
  facebookEnabled: true,
  instagram: 'https://instagram.com',
  instagramEnabled: true,
  twitter: 'https://x.com',
  twitterEnabled: true,
  tiktok: 'https://tiktok.com',
  tiktokEnabled: true,
  youtube: 'https://youtube.com',
  youtubeEnabled: false,
  pinterest: 'https://pinterest.com',
  pinterestEnabled: false,
  whatsapp: 'https://wa.me',
  whatsappEnabled: true,
  linkedin: 'https://linkedin.com',
  linkedinEnabled: false,
  communityTitle: 'Join Our Community',
  communityCount: '150K+'
};

export const DEFAULT_DESKTOP_HERO_CONFIG: DesktopHeroConfig = {
  activeHeroType: 'default', // 'default' = dynamic flagship showcase, 'custom' = custom uploaded banner with 2 buttons
  imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=2000&q=85',
  imageAltText: 'Featured Exclusive Electronics & Smart Innovations',
  viewFitting: 'fit_screen',
  maxHeightVh: 82, // Optimal screen fitting: visible in one open without scrolling
  button1: {
    id: 'button_1',
    name: 'Left Button (Hotspot 1)',
    enabled: true,
    actionType: 'product_page',
    productId: 'prod-001',
    x: 28, // 28% from left
    y: 72, // 72% from top
    width: 20, // 20% width
    height: 8, // 8% height
    borderRadius: 14,
    glowColor: 'amber'
  },
  button2: {
    id: 'button_2',
    name: 'Right Button (Hotspot 2)',
    enabled: true,
    actionType: 'catalog',
    productId: 'prod-007',
    x: 52, // 52% from left
    y: 72, // 72% from top
    width: 20, // 20% width
    height: 8, // 8% height
    borderRadius: 14,
    glowColor: 'cyan'
  },
  updatedAt: '2026-09-14T20:00:00Z'
};

export const DEFAULT_MOBILE_HERO_CONFIG: MobileHeroConfig = {
  activeHeroType: 'default', // 'default' = dynamic mobile flagship showcase, 'custom' = custom uploaded banner with 2 buttons
  imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1000&q=85',
  imageAltText: 'Featured Mobile Deals & Innovations',
  viewFitting: 'fit_screen',
  maxHeightVh: 75, // Screen height fitting for mobile viewports
  button1: {
    id: 'button_1',
    name: 'Action Button 1 (Primary / Top)',
    enabled: true,
    actionType: 'product_page',
    productId: 'mob-prod-001',
    x: 10, // 10% from left
    y: 65, // 65% from top
    width: 80, // 80% width (prominent full-width button on mobile)
    height: 10, // 10% height
    borderRadius: 14,
    glowColor: 'amber'
  },
  button2: {
    id: 'button_2',
    name: 'Action Button 2 (Secondary / Bottom)',
    enabled: true,
    actionType: 'catalog',
    productId: 'mob-prod-002',
    x: 10, // 10% from left
    y: 78, // 78% from top
    width: 80, // 80% width
    height: 10, // 10% height
    borderRadius: 14,
    glowColor: 'cyan'
  },
  updatedAt: '2026-09-20T00:00:00Z'
};

export const INITIAL_MOBILE_PRODUCTS: Product[] = [];


