const fs = require('fs');

let c = fs.readFileSync('./src/components/store/CheckoutModal.tsx', 'utf-8');

// Fix + ₹$
c = c.replace(/\+\s*₹\$/g, '+ ₹');

// Fix lines like:
// <span ...>
//   ${payOnlineOptionTotal.toFixed(2)}
// </span>
c = c.replace(/([>\n\s])\$\{payOnlineOptionTotal/g, '$1₹${payOnlineOptionTotal');
c = c.replace(/([>\n\s])\$\{codOptionTotal/g, '$1₹${codOptionTotal');
c = c.replace(/([>\n\s])\$\{\(subtotalAfterPromo/g, '$1₹${(subtotalAfterPromo');
c = c.replace(/([>\n\s])\$\{unitPrice\.toFixed\(2\)\}\s*each/g, '$1₹${unitPrice.toFixed(2)} each');
c = c.replace(/([>\n\s])\$\{lineSubtotal/g, '$1₹${lineSubtotal');
c = c.replace(/([>\n\s])\$\{discountedLineTotal/g, '$1₹${discountedLineTotal');
c = c.replace(/([>\n\s])\$\{shippingFee/g, '$1₹${shippingFee');
c = c.replace(/([>\n\s])\$\{grandTotal/g, '$1₹${grandTotal');
c = c.replace(/([>\n\s])\$\{\(unitPrice \* qty\)/g, '$1₹${(unitPrice * qty)');
c = c.replace(/([>\n\s])\$\{\(itemBundle\.discountedUnitPrice/g, '$1₹${(itemBundle.discountedUnitPrice');
c = c.replace(/([>\n\s])\$\{Math\.max\(0/g, '$1₹${Math.max(0');

c = c.replace(/"\$0\.00"/g, '"₹0.00"');
c = c.replace(/'\$0\.00'/g, "'₹0.00'");
c = c.replace(/\(\$\{\(lineSubtotal/g, '(₹${(lineSubtotal');
c = c.replace(/\(\$\{\(itemBundle\.discountAmount\)\}/g, '(₹${(itemBundle.discountAmount)}');

fs.writeFileSync('./src/components/store/CheckoutModal.tsx', c, 'utf-8');
console.log('Cleaned CheckoutModal.tsx successfully!');
