const fs = require('fs');

let content = fs.readFileSync('./src/components/store/CheckoutModal.tsx', 'utf-8');

// Replace template literal currency prefixes:
// e.g. `$${...}` -> `₹${...}`
content = content.replace(/\$\$\{/g, '₹${');

// e.g. `-$${...}` -> `-₹${...}`
content = content.replace(/-\$\$\{/g, '-₹${');

// e.g. `+$${...}` -> `+₹${...}`
content = content.replace(/\+\$\$\{/g, '+₹${');

// e.g. `Pay $${` or `Pay ${`
content = content.replace(/Pay \$/g, 'Pay ₹');
content = content.replace(/Pay \$\{/g, 'Pay ₹${');

// e.g. `+ ${partialOptionDueLater` -> `+ ₹${partialOptionDueLater`
content = content.replace(/\+ \$\{partial/g, '+ ₹${partial');
content = content.replace(/\+ \$\{cod/g, '+ ₹${cod');

// Replace remaining occurrences:
content = content.replace(/Save \$([0-9]|{)/g, 'Save ₹$1');
content = content.replace(/SAVE \$([0-9]|{)/g, 'SAVE ₹$1');
content = content.replace(/Saved \$([0-9]|{)/g, 'Saved ₹$1');
content = content.replace(/Extra \$([0-9]|{)/g, 'Extra ₹$1');
content = content.replace(/COD: \$([0-9]|{)/g, 'COD: ₹$1');
content = content.replace(/TODAY\s*\(\$([0-9]|{)/g, 'TODAY (₹$1');
content = content.replace(/ORDER\s*\(\$([0-9]|{)/g, 'ORDER (₹$1');
content = content.replace(/Order\s*\(\$([0-9]|{)/g, 'Order (₹$1');
content = content.replace(/Online\s*\(\$([0-9]|{)/g, 'Online (₹$1');
content = content.replace(/online \+ \$([0-9]|{)/g, 'online + ₹$1');
content = content.replace(/cash\/UPI to courier/g, 'cash/UPI to courier');
content = content.replace(/in cash\/UPI to courier/g, 'in cash/UPI to courier');
content = content.replace(/Pay Remaining \$([0-9]|{)/g, 'Pay Remaining ₹$1');
content = content.replace(/SWITCH TO ONLINE & SAVE \$([0-9]|{)/g, 'SWITCH TO ONLINE & SAVE ₹$1');
content = content.replace(/Pay \$\{onlineAmountDueNow/g, 'Pay ₹${onlineAmountDueNow');
content = content.replace(/Pay Remaining \$\{codAmountDueLater/g, 'Pay Remaining ₹${codAmountDueLater');

// In JSX spans:
content = content.replace(/>\$\{unitPrice/g, '>₹${unitPrice');
content = content.replace(/>\$\{lineSubtotal/g, '>₹${lineSubtotal');
content = content.replace(/>\$\{discountedLineTotal/g, '>₹${discountedLineTotal');
content = content.replace(/>\$\{subtotal/g, '>₹${subtotal');
content = content.replace(/>-\$\{bundleDiscount/g, '>-₹${bundleDiscount');
content = content.replace(/>-\$\{promoDiscount/g, '>-₹${promoDiscount');
content = content.replace(/>-\$\{paymentDiscount/g, '>-₹${paymentDiscount');
content = content.replace(/>\$\{shippingFee/g, '>₹${shippingFee');
content = content.replace(/>\$\{grandTotal/g, '>₹${grandTotal');
content = content.replace(/>\$\{onlineAmountDueNow/g, '>₹${onlineAmountDueNow');
content = content.replace(/>\$\{codAmountDueLater/g, '>₹${codAmountDueLater');
content = content.replace(/>\$\{payOnlineOptionTotal/g, '>₹${payOnlineOptionTotal');
content = content.replace(/>\$\{codOptionTotal/g, '>₹${codOptionTotal');
content = content.replace(/>\$\{\(subtotalAfterPromo/g, '>₹${(subtotalAfterPromo');
content = content.replace(/>-\$\{onlineSavingsAmount/g, '>-₹${onlineSavingsAmount');
content = content.replace(/>\$\{Math\.max\(0,\s*subtotalAfterPromo/g, '>₹${Math.max(0, subtotalAfterPromo');
content = content.replace(/>\$\{\(unitPrice \* qty\)/g, '>₹${(unitPrice * qty)');
content = content.replace(/>\$\{\(itemBundle\.discountedUnitPrice/g, '>₹${(itemBundle.discountedUnitPrice');
content = content.replace(/>\$\{paidOnline/g, '>₹${paidOnline');
content = content.replace(/>\$\{codDue/g, '>₹${codDue');
content = content.replace(/'\$0\.00'/g, "'₹0.00'");
content = content.replace(/`\$0\.00`/g, "`₹0.00`");
content = content.replace(/"\$0\.00"/g, '"₹0.00"');

// Fix string templates like `PROCEED TO PAY $${...}`
content = content.replace(/PROCEED TO PAY \$([0-9]|{)/g, 'PROCEED TO PAY ₹$1');
content = content.replace(/CONFIRM COD ORDER \(\$([0-9]|{)/g, 'CONFIRM COD ORDER (₹$1');
content = content.replace(/CONFIRM PARTIAL PAYMENT \(\$([0-9]|{)/g, 'CONFIRM PARTIAL PAYMENT (₹$1');
content = content.replace(/Proceed to Pay \$([0-9]|{)/g, 'Proceed to Pay ₹$1');
content = content.replace(/Confirm COD Order \(\$([0-9]|{)/g, 'Confirm COD Order (₹$1');
content = content.replace(/Saved \$\{itemBundle\.discountPercent\}% \(\$([0-9]|{)/g, 'Saved ${itemBundle.discountPercent}% (₹$1');
content = content.replace(/Saved \$\{itemBundle\.discountPercent\}% \(\$\{/g, 'Saved ${itemBundle.discountPercent}% (₹${');
content = content.replace(/Saved \$\{itemBundle\.discountPercent\}% \(\(\$\{/g, 'Saved ${itemBundle.discountPercent}% ((₹${');
content = content.replace(/\(\$\{itemBundle\.discountAmount\}\)/g, '(₹${itemBundle.discountAmount})');

fs.writeFileSync('./src/components/store/CheckoutModal.tsx', content, 'utf-8');
console.log('Updated CheckoutModal.tsx successfully!');
