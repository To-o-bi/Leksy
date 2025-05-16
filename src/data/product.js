export const products = [
  {
    id: "1",
    name: "Hydrating Facial Serum",
    image: "/assets/images/products/product-1.jpg",
    description: "A lightweight, fast-absorbing serum that deeply hydrates skin with hyaluronic acid and vitamin B5. This formula helps restore moisture balance and improve skin texture, leaving your complexion plump, smooth, and radiant.",
    shortDescription: "Intense hydration with hyaluronic acid and vitamin B5",
    price: 49.99,
    oldPrice: 59.99,
    images: [
      "/assets/images/products/product-1.jpg",
      "/assets/images/products/product-1.jpg",
      "/assets/images/products/product-1.jpg"
    ],
    category: "Serums",
    rating: 4.8,
    reviewCount: 124,
    stock: 50,
    sku: "LS-HYD-SER-001",
    isNew: true,
    isOnSale: true,
    featured: true,
    freeShipping: true,
    createdAt: "2024-01-15T10:00:00Z",
    tags: ["Hydrating", "Serum", "Hyaluronic Acid", "Sensitive Skin"],
    concerns: ["Dry Skin", "Sensitive skin"],
    features: [
      "Deeply hydrates with 2% hyaluronic acid complex",
      "Soothes and strengthens skin barrier with vitamin B5",
      "Suitable for all skin types, including sensitive skin",
      "Oil-free and non-comedogenic formula",
      "Dermatologist tested and approved"
    ],
    specs: {
      "Size": "30ml",
      "Skin Type": "All Skin Types",
      "Main Ingredients": "Hyaluronic Acid, Vitamin B5, Glycerin",
      "Free From": "Parabens, Sulfates, Fragrance"
    },
    variants: [
      {
        id: "1-1",
        name: "30ml",
        price: 49.99
      },
      {
        id: "1-2",
        name: "50ml",
        price: 69.99
      }
    ]
  },
  {
    id: "2",
    name: "Vitamin C Brightening Moisturizer",
    image: "/assets/images/products/product-1.jpg",
    description: "This advanced formula combines 15% stabilized vitamin C with niacinamide and natural extracts to visibly brighten skin and reduce the appearance of dark spots. The lightweight, non-greasy texture absorbs quickly to deliver powerful antioxidant protection while improving skin tone and radiance.",
    shortDescription: "Brighten and even skin tone with 15% vitamin C",
    price: 54.99,
    images: [
      "/assets/images/products/new-1.jpg",
      "/assets/images/products/new-2.jpg"
    ],
    category: "Moisturizers",
    rating: 4.7,
    reviewCount: 98,
    stock: 35,
    sku: "LS-VTC-MST-002",
    isNew: false,
    isOnSale: false,
    featured: true,
    freeShipping: true,
    createdAt: "2024-01-20T14:30:00Z",
    tags: ["Vitamin C", "Brightening", "Moisturizer", "Anti-aging"],
    concerns: ["Hyperpigmentation", "Anti-Aging"],
    features: [
      "15% stabilized vitamin C for powerful brightening",
      "Niacinamide helps even skin tone and reduce dark spots",
      "Antioxidant protection against environmental damage",
      "Lightweight, non-greasy formula",
      "Suitable for normal, combination, and oily skin"
    ],
    specs: {
      "Size": "50ml",
      "Skin Type": "Normal, Combination, Oily",
      "Main Ingredients": "Vitamin C, Niacinamide, Green Tea Extract",
      "Free From": "Parabens, Artificial Colors, Mineral Oil"
    },
    variants: [
      {
        id: "2-1",
        name: "50ml",
        price: 54.99
      }
    ]
  },
  {
    id: "3",
    name: "Retinol Night Renewal Cream",
    image: "/assets/images/products/product-1.jpg",
    description: "Transform your skin while you sleep with this powerful yet gentle retinol formula. Encapsulated retinol works throughout the night to increase cell turnover, reduce the appearance of fine lines, and improve skin texture. The nourishing cream also contains ceramides and peptides to strengthen the skin barrier and provide lasting hydration.",
    shortDescription: "Advanced retinol cream for overnight skin renewal",
    price: 64.99,
    oldPrice: 74.99,
    images: [
      "/assets/images/products/new-3.jpg",
      "/assets/images/products/new-3.jpg",
      "/assets/images/products/new-3.jpg"
    ],
    category: "Moisturizers",
    rating: 4.9,
    reviewCount: 87,
    stock: 25,
    sku: "LS-RTN-CRM-003",
    isNew: false,
    isOnSale: true,
    featured: true,
    freeShipping: true,
    createdAt: "2024-01-25T09:15:00Z",
    tags: ["Retinol", "Anti-aging", "Night Cream", "Fine Lines"],
    concerns: ["Anti-Aging", "Dry Skin"],
    features: [
      "0.5% encapsulated retinol for gradual release",
      "Reduces appearance of fine lines and wrinkles",
      "Ceramides and peptides strengthen skin barrier",
      "Improves skin texture and tone over time",
      "Non-irritating formula suitable for most skin types"
    ],
    specs: {
      "Size": "50ml",
      "Skin Type": "Normal, Combination, Dry",
      "Main Ingredients": "Retinol, Ceramides, Peptides, Shea Butter",
      "Free From": "Parabens, Phthalates, Sulfates"
    },
    variants: [
      {
        id: "3-1",
        name: "Standard",
        price: 64.99
      },
      {
        id: "3-2",
        name: "Intensive (1% Retinol)",
        price: 79.99
      }
    ]
  },
  {
    id: "4",
    name: "Rose Clay Purifying Mask",
    image: "/assets/images/products/product-1.jpg",
    description: "This gentle yet effective clay mask draws out impurities and excess oil without stripping the skin. Infused with rose extract and kaolin clay, it helps minimize the appearance of pores and leaves skin looking clarified and refreshed. Aloe vera and glycerin ensure your skin stays hydrated and comfortable throughout the treatment.",
    shortDescription: "Purifying clay mask with rose extract for balanced skin",
    price: 39.99,
    images: [
      "/assets/images/products/new-4.jpg",
      "/assets/images/products/new-4.jpg"
    ],
    category: "Face Cleansers",
    rating: 4.6,
    reviewCount: 54,
    stock: 40,
    sku: "LS-CLA-MSK-004",
    isNew: true,
    isOnSale: false,
    featured: false,
    freeShipping: false,
    createdAt: "2024-02-05T11:20:00Z",
    tags: ["Mask", "Clay", "Purifying", "Pores"],
    concerns: ["Oily Skin"],
    features: [
      "Pink kaolin clay draws out impurities",
      "Rose extract soothes and calms redness",
      "Aloe vera provides hydration during treatment",
      "Helps minimize the appearance of pores",
      "Suitable for normal, combination, and oily skin"
    ],
    specs: {
      "Size": "100ml",
      "Skin Type": "Normal, Combination, Oily",
      "Main Ingredients": "Kaolin Clay, Rose Extract, Aloe Vera",
      "Free From": "Parabens, Sulfates, Artificial Fragrances"
    },
    variants: [
      {
        id: "4-1",
        name: "Standard Size",
        price: 39.99
      },
      {
        id: "4-2",
        name: "Travel Size",
        price: 19.99
      }
    ]
  },
  {
    id: "5",
    name: "Oil Control Mattifying Primer",
    image: "/assets/images/products/product-1.jpg",
    description: "Create the perfect canvas for your makeup with this oil-controlling primer. The silky formula glides on smoothly to minimize the appearance of pores and control shine throughout the day. Infused with bamboo extract and salicylic acid, it helps keep breakouts at bay while extending the wear of your foundation.",
    shortDescription: "Long-lasting shine control and pore-minimizing primer",
    price: 34.99,
    images: [
      "/assets/images/products/product-5.jpg",
      "/assets/images/products/product-5.jpg"
    ],
    category: "Makeup",
    rating: 4.7,
    reviewCount: 76,
    stock: 60,
    sku: "LS-OIL-PRM-005",
    isNew: false,
    isOnSale: false,
    featured: true,
    freeShipping: true,
    createdAt: "2024-02-10T13:45:00Z",
    tags: ["Primer", "Oil Control", "Mattifying", "Pore Minimizing"],
    concerns: ["Oily Skin"],
    features: [
      "Controls oil and shine for up to 12 hours",
      "Minimizes the appearance of pores",
      "Extends makeup wear time",
      "Contains salicylic acid to prevent breakouts",
      "Lightweight, non-greasy formula"
    ],
    specs: {
      "Size": "30ml",
      "Skin Type": "Combination, Oily",
      "Main Ingredients": "Silica, Bamboo Extract, Salicylic Acid",
      "Free From": "Oil, Alcohol, Fragrance"
    },
    variants: [
      {
        id: "5-1",
        name: "Standard",
        price: 34.99
      }
    ]
  },
  {
    id: "6",
    name: "Long-Lasting Liquid Foundation",
    image: "/assets/images/products/product-1.jpg",
    description: "This weightless, medium-to-full coverage foundation delivers a natural matte finish that lasts all day. The buildable formula blends seamlessly into skin, concealing imperfections while letting your natural beauty shine through. Enriched with hyaluronic acid and vitamin E, it keeps your skin comfortable and hydrated throughout wear.",
    shortDescription: "Comfortable, long-wearing foundation with medium-to-full coverage",
    price: 42.99,
    oldPrice: 47.99,
    images: [
      "/assets/images/products/product-5.jpg",
      "/assets/images/products/product-5.jpg",
      "/assets/images/products/product-5.jpg"
    ],
    category: "Makeup",
    rating: 4.8,
    reviewCount: 112,
    stock: 75,
    sku: "LS-LIQ-FND-006",
    isNew: false,
    isOnSale: true,
    featured: true,
    freeShipping: true,
    createdAt: "2024-02-15T10:30:00Z",
    tags: ["Foundation", "Liquid", "Long-Lasting", "Medium Coverage"],
    concerns: ["Hyperpigmentation", "Sensitive skin"],
    features: [
      "Buildable medium-to-full coverage",
      "Natural matte finish that lasts up to 24 hours",
      "Enriched with hyaluronic acid for hydration",
      "Transfer-resistant and sweat-proof formula",
      "Available in 30 inclusive shades"
    ],
    specs: {
      "Size": "30ml",
      "Finish": "Natural Matte",
      "Coverage": "Medium to Full",
      "Free From": "Parabens, Oil, Fragrance"
    },
    variants: [
      {
        id: "6-1",
        name: "Fair 01",
        price: 42.99
      },
      {
        id: "6-2",
        name: "Fair 02",
        price: 42.99
      },
      {
        id: "6-3",
        name: "Light 01",
        price: 42.99
      },
      {
        id: "6-4",
        name: "Medium 01",
        price: 42.99
      },
      {
        id: "6-5",
        name: "Tan 01",
        price: 42.99
      },
      {
        id: "6-6",
        name: "Deep 01",
        price: 42.99
      }
    ]
  },
  {
    id: "7",
    name: "Botanical Cleansing Balm",
    image: "/assets/images/products/product-1.jpg",
    description: "Dissolve makeup, sunscreen, and impurities with this luxurious cleansing balm. The rich texture transforms from a balm to an oil upon application, then emulsifies with water to rinse away completely. Infused with plant oils and extracts, it leaves skin feeling clean, soft, and nourished—never stripped or tight.",
    shortDescription: "Nourishing cleansing balm that melts away makeup and impurities",
    price: 44.99,
    images: [
      "/assets/images/products/product-3.jpg",
      "/assets/images/products/product-3.jpg"
    ],
    category: "Face Cleansers",
    rating: 4.9,
    reviewCount: 89,
    stock: 30,
    sku: "LS-BOT-CLB-007",
    isNew: false,
    isOnSale: false,
    featured: true,
    freeShipping: true,
    createdAt: "2024-02-20T15:10:00Z",
    tags: ["Cleanser", "Balm", "Makeup Remover", "Nourishing"],
    concerns: ["Dry Skin", "Sensitive skin"],
    features: [
      "Effectively removes all makeup, including waterproof formulas",
      "Dissolves sunscreen and daily impurities",
      "Preserves skin's natural moisture barrier",
      "Rich in antioxidants from plant extracts",
      "Suitable for all skin types, including sensitive"
    ],
    specs: {
      "Size": "100ml",
      "Skin Type": "All Skin Types",
      "Main Ingredients": "Sunflower Oil, Chamomile Extract, Vitamin E",
      "Free From": "Mineral Oil, Parabens, Sulfates"
    },
    variants: [
      {
        id: "7-1",
        name: "Standard",
        price: 44.99
      },
      {
        id: "7-2",
        name: "Travel Size",
        price: 24.99
      }
    ]
  },
  {
    id: "8",
    name: "Volumizing Mascara",
    image: "/assets/images/products/product-1.jpg",
    description: "Achieve dramatic volume and length with this buildable mascara formula. The unique brush design separates and coats each lash from root to tip for clump-free definition. The smudge-proof and flake-resistant formula stays put all day while conditioning ingredients keep lashes soft and healthy.",
    shortDescription: "Dramatic volume and length without clumps or smudges",
    price: 28.99,
    images: [
      "/assets/images/products/product-2.jpg",
      "/assets/images/products/product-2.jpg"
    ],
    category: "Makeup",
    rating: 4.6,
    reviewCount: 103,
    stock: 85,
    sku: "LS-VOL-MSC-008",
    isNew: true,
    isOnSale: false,
    featured: false,
    freeShipping: false,
    createdAt: "2024-02-25T12:40:00Z",
    tags: ["Mascara", "Volumizing", "Lengthening", "Smudge-proof"],
    concerns: ["Sensitive skin"],
    features: [
      "Buildable formula for customizable volume",
      "Unique brush design separates lashes",
      "Smudge-proof and flake-resistant wear",
      "Conditioning ingredients for lash health",
      "Easily removed with warm water"
    ],
    specs: {
      "Size": "10ml",
      "Color": "Intense Black",
      "Main Ingredients": "Beeswax, Keratin, Vitamin B5",
      "Free From": "Parabens, Phthalates, Fragrance"
    },
    variants: [
      {
        id: "8-1",
        name: "Intense Black",
        price: 28.99
      },
      {
        id: "8-2",
        name: "Brown Black",
        price: 28.99
      },
      {
        id: "8-3",
        name: "Waterproof Black",
        price: 30.99
      }
    ]
  },
  {
    id: "9",
    name: "Gentle Exfoliating Toner",
    image: "/assets/images/products/product-1.jpg",
    description: "Refine your skin's texture with this gentle exfoliating toner. Formulated with a blend of AHAs and BHAs, it removes dead skin cells and unclogs pores without harsh scrubbing. Rose water and aloe vera provide soothing hydration, making it suitable for daily use.",
    shortDescription: "Gentle chemical exfoliation for smoother, clearer skin",
    price: 32.99,
    images: [
      "/assets/images/products/product-6.jpg",
      "/assets/images/products/product-6.jpg"
    ],
    category: "Toners",
    rating: 4.7,
    reviewCount: 68,
    stock: 45,
    sku: "LS-EXF-TNR-009",
    isNew: true,
    isOnSale: false,
    featured: true,
    freeShipping: true,
    createdAt: "2024-03-05T08:20:00Z",
    tags: ["Toner", "Exfoliating", "AHA", "BHA"],
    concerns: ["Oily Skin", "Hyperpigmentation"],
    features: [
      "Blend of glycolic, lactic, and salicylic acids",
      "Removes dead skin cells and unclogs pores",
      "Improves skin texture and tone",
      "Prepares skin to better absorb serums and moisturizers",
      "Alcohol-free and non-drying formula"
    ],
    specs: {
      "Size": "200ml",
      "Skin Type": "All Skin Types",
      "Main Ingredients": "Glycolic Acid, Salicylic Acid, Rose Water",
      "Free From": "Alcohol, Parabens, Sulfates"
    },
    variants: [
      {
        id: "9-1",
        name: "Standard",
        price: 32.99
      }
    ]
  },
  {
    id: "10",
    name: "SPF 50 UV Shield Sunscreen",
    image: "/assets/images/products/product-1.jpg",
    description: "This lightweight, broad-spectrum sunscreen offers superior protection against UVA and UVB rays without leaving a white cast or greasy residue. Enriched with antioxidants and skin-soothing ingredients, it helps shield against environmental damage while keeping skin comfortable and hydrated.",
    shortDescription: "Invisible, lightweight UV protection for daily use",
    price: 36.99,
    images: [
      "/assets/images/products/product-7.jpg",
      "/assets/images/products/product-7.jpg"
    ],
    category: "Sunscreens",
    rating: 4.9,
    reviewCount: 127,
    stock: 55,
    sku: "LS-SPF-SUN-010",
    isNew: false,
    isOnSale: false,
    featured: true,
    freeShipping: true,
    createdAt: "2024-03-10T13:15:00Z",
    tags: ["Sunscreen", "SPF 50", "Broad Spectrum", "Daily Protection"],
    concerns: ["Sensitive skin", "Hyperpigmentation"],
    features: [
      "Broad-spectrum SPF 50 protection",
      "Invisible finish on all skin tones",
      "Water-resistant for up to 80 minutes",
      "Antioxidants protect against environmental damage",
      "Suitable for face and body"
    ],
    specs: {
      "Size": "50ml",
      "Skin Type": "All Skin Types",
      "Main Ingredients": "Zinc Oxide, Titanium Dioxide, Vitamin E",
      "Free From": "Oxybenzone, Parabens, Fragrance"
    },
    variants: [
      {
        id: "10-1",
        name: "Face Formula",
        price: 36.99
      },
      {
        id: "10-2",
        name: "Body Formula",
        price: 39.99
      }
    ]
  },
  {
    id: "11",
    name: "Hydrating Body Lotion",
    image: "/assets/images/products/product-1.jpg",
    description: "This fast-absorbing body lotion provides 48-hour hydration without feeling heavy or greasy. Shea butter and ceramides strengthen the skin barrier, while hyaluronic acid draws moisture into the skin. The subtle, clean scent makes it perfect for everyday use.",
    shortDescription: "Long-lasting moisture for soft, smooth skin",
    price: 29.99,
    oldPrice: 34.99,
    images: [
      "/assets/images/products/product-8.jpg",
      "/assets/images/products/product-8.jpg"
    ],
    category: "Bathe and Body",
    rating: 4.8,
    reviewCount: 93,
    stock: 70,
    sku: "LS-HYD-BDY-011",
    isNew: false,
    isOnSale: true,
    featured: false,
    freeShipping: true,
    createdAt: "2024-03-15T10:40:00Z",
    tags: ["Body Lotion", "Hydrating", "Moisturizer"],
    concerns: ["Dry Skin"],
    features: [
      "48-hour hydration with lightweight feel",
      "Shea butter and ceramides strengthen skin barrier",
      "Fast-absorbing, non-greasy formula",
      "Subtle, clean scent",
      "Suitable for all skin types"
    ],
    specs: {
      "Size": "400ml",
      "Skin Type": "All Skin Types",
      "Main Ingredients": "Shea Butter, Ceramides, Hyaluronic Acid",
      "Free From": "Parabens, Mineral Oil, Silicones"
    },
    variants: [
      {
        id: "11-1",
        name: "Standard",
        price: 29.99
      },
      {
        id: "11-2",
        name: "Travel Size",
        price: 14.99
      }
    ]
  },
  {
    id: "12",
    name: "Refreshing Cucumber Gel Mask",
    image: "/assets/images/products/product-1.jpg",
    description: "Cool and soothe stressed skin with this refreshing gel mask. Cucumber extract and aloe vera calm redness and irritation, while hyaluronic acid provides deep hydration. Perfect as a quick pick-me-up or overnight treatment for dehydrated, sensitive, or sun-exposed skin.",
    shortDescription: "Cooling gel mask to soothe and hydrate stressed skin",
    price: 38.99,
    images: [
      "/assets/images/products/product-9.jpg",
      "/assets/images/products/product-9.jpg"
    ],
    category: "Face Cleansers",
    rating: 4.7,
    reviewCount: 72,
    stock: 40,
    sku: "LS-CCM-MSK-012",
    isNew: false,
    isOnSale: false,
    featured: false,
    freeShipping: false,
    createdAt: "2024-03-20T14:50:00Z",
    tags: ["Mask", "Gel", "Cooling", "Soothing"],
    concerns: ["Sensitive skin"],
    features: [
      "Instantly cools and soothes irritated skin",
      "Cucumber extract reduces redness and puffiness",
      "Hyaluronic acid provides deep hydration",
      "Can be used as a 10-minute treatment or overnight mask",
      "Suitable for all skin types, especially sensitive"
    ],
    specs: {
      "Size": "75ml",
      "Skin Type": "All Skin Types, Sensitive",
      "Main Ingredients": "Cucumber Extract, Aloe Vera, Hyaluronic Acid",
      "Free From": "Alcohol, Parabens, Artificial Fragrances"
    },
    variants: [
      {
        id: "12-1",
        name: "Standard",
        price: 38.99
      }
    ]
  }
];