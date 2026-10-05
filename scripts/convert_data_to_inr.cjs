const fs = require('fs');

let content = fs.readFileSync('./src/data/initialData.ts', 'utf-8');

// Price map for the 20 products:
const productPriceMap = {
  'prod-001': { price: 2499, compare: 3999, cost: 850 },
  'prod-007': { price: 1299, compare: 1999, cost: 450 },
  'prod-008': { price: 799,  compare: 1499, cost: 250 },
  'prod-009': { price: 1999, compare: 3499, cost: 700 },
  'prod-002': { price: 1499, compare: 2499, cost: 500 },
  'prod-006': { price: 1799, compare: 2999, cost: 600 },
  'prod-010': { price: 1299, compare: 2199, cost: 400 },
  'prod-011': { price: 1599, compare: 2799, cost: 550 },
  'prod-003': { price: 2199, compare: 3699, cost: 750 },
  'prod-012': { price: 1699, compare: 2999, cost: 600 },
  'prod-013': { price: 999,  compare: 1799, cost: 350 },
  'prod-014': { price: 1499, compare: 2499, cost: 500 },
  'prod-004': { price: 2299, compare: 3799, cost: 800 },
  'prod-015': { price: 899,  compare: 1599, cost: 300 },
  'prod-016': { price: 2499, compare: 3999, cost: 900 },
  'prod-017': { price: 1499, compare: 2599, cost: 500 },
  'prod-005': { price: 1199, compare: 1999, cost: 400 },
  'prod-018': { price: 1999, compare: 3299, cost: 700 },
  'prod-019': { price: 899,  compare: 1499, cost: 280 },
  'prod-020': { price: 1299, compare: 2199, cost: 450 },
};

for (const [id, vals] of Object.entries(productPriceMap)) {
  // Regex to match block for this product
  const idRegex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?sku:\\s*'[^']+',\\s*\\n\\s*price:\\s*)[0-9\\.]+(,\\s*\\n\\s*compareAtPrice:\\s*)[0-9\\.]+(,\\s*\\n\\s*costPrice:\\s*)[0-9\\.]+`);
  content = content.replace(idRegex, `$1${vals.price}.00$2${vals.compare}.00$3${vals.cost}.00`);
}

// Convert Promos
content = content.replace("minSpend: 50", "minSpend: 499");
content = content.replace("minSpend: 40", "minSpend: 399");
content = content.replace("minSpend: 30", "minSpend: 299");

// Convert Top Notification
content = content.replace(
  "🔥 Limited Stock Available — Free Express Worldwide Shipping Over $50",
  "🔥 Limited Stock Available — Free Express Delivery Across India Over ₹499"
);

// Convert sample orders to INR
content = content.replace("subtotal: 129.99,\n    discount: 10.00,\n    shippingFee: 0.00,\n    total: 119.99,", "subtotal: 2499.00,\n    discount: 200.00,\n    shippingFee: 0.00,\n    total: 2299.00,");
content = content.replace("price: 129.99,\n        quantity: 1", "price: 2499.00,\n        quantity: 1");

content = content.replace("subtotal: 139.98,\n    discount: 0.00,\n    shippingFee: 0.00,\n    total: 139.98,", "subtotal: 3698.00,\n    discount: 0.00,\n    shippingFee: 0.00,\n    total: 3698.00,");
content = content.replace("price: 89.99,\n        quantity: 1", "price: 2199.00,\n        quantity: 1");
content = content.replace("price: 49.99,\n        quantity: 1", "price: 1499.00,\n        quantity: 1");

fs.writeFileSync('./src/data/initialData.ts', content, 'utf-8');
console.log("Updated initialData.ts with Indian Rupee prices and settings successfully!");
