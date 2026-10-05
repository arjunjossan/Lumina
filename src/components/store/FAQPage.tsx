import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, ChevronDown, HelpCircle, Mail, PackageSearch, Truck, ShieldCheck, CreditCard, Sparkles, CheckCircle2 } from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'Shipping' | 'Returns' | 'Orders' | 'Payments' | 'Products';
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'Shipping',
    question: 'How long does shipping take for my order?',
    answer: 'Orders placed before 2:00 PM EST are fulfilled within 12-24 hours. Standard shipping takes 3-5 business days within the US/EU, and Express priority air arrives in 1-3 business days. International deliveries take 5-8 business days.'
  },
  {
    id: 'faq-2',
    category: 'Shipping',
    question: 'Is shipping really free over ₹999?',
    answer: 'Yes! All orders with a subtotal of ₹999 or more automatically receive FREE Express Air Shipping at checkout. Orders under ₹999 ship for a flat rate of ₹99.'
  },
  {
    id: 'faq-3',
    category: 'Shipping',
    question: 'How do I track my package in real-time?',
    answer: 'Once your order is dispatched, you will receive an email with a live carrier tracking code. You can also visit our "Track Package" page and enter your Order Reference Number (e.g. LUM-98214) to view step-by-step courier updates.'
  },
  {
    id: 'faq-4',
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer a hassle-free 30-Day Money Back Guarantee. If you are not completely satisfied with your product, simply visit our Returns Center to request a prepaid shipping return label for a full refund.'
  },
  {
    id: 'faq-5',
    category: 'Returns',
    question: 'Who pays for return shipping fees?',
    answer: 'If your item is defective, damaged during transit, or incorrect, Lumina covers 100% of return shipping costs. For voluntary returns, a small standard courier deduction (₹399) applies.'
  },
  {
    id: 'faq-6',
    category: 'Orders',
    question: 'Can I change or cancel my order after placing it?',
    answer: 'Because we process orders rapidly within 2 hours, please reach out to our Contact Support Team immediately if you need to modify your shipping address or cancel your order before dispatch.'
  },
  {
    id: 'faq-7',
    category: 'Orders',
    question: 'What if my package arrives damaged or missing parts?',
    answer: 'Don’t worry! Send us a quick note via our Contact Support form with a photo of the box. We will immediately reship a brand-new replacement unit at no extra charge.'
  },
  {
    id: 'faq-8',
    category: 'Payments',
    question: 'What payment methods do you accept?',
    answer: 'We support all major credit/debit cards (Visa, Mastercard, American Express, Discover), Apple Pay, Google Pay, PayPal, Shop Pay, and encrypted SSL checkout.'
  },
  {
    id: 'faq-9',
    category: 'Payments',
    question: 'How do I apply a promotional discount coupon code?',
    answer: 'You can enter promo codes (such as WINNING20 or VIP15) during checkout or in your Shopping Cart Drawer before placing the order to instantly reduce your total balance.'
  },
  {
    id: 'faq-10',
    category: 'Products',
    question: 'Are Lumina products authentic with genuine manufacturer warranty?',
    answer: 'Absolutely. Every winning product curated by Lumina undergoes strict multi-stage quality testing and comes backed by our 1-Year Official Lumina Equipment Warranty.'
  }
];

export const FAQPage: React.FC = () => {
  const { navigateTo } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [openIds, setOpenIds] = useState<string[]>(['faq-1', 'faq-4']);

  // Schema.org FAQPage structured data object for search engines
  const faqSchemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQ_DATA.map((faq) => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  // Inject schema directly into document head for external crawlers & cleanup on unmount
  useEffect(() => {
    const scriptId = 'faq-jsonld-schema';
    let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
    
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(faqSchemaData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) {
        el.remove();
      }
    };
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCat = selectedCat === 'All' || faq.category === selectedCat;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Schema.org FAQPage JSON-LD Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />

      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base & Assistance</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-serif text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Find instant answers about shipping timelines, return policies, package tracking, and store orders.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search FAQs (e.g. tracking, free shipping, refund, warranty)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Shipping', 'Returns', 'Orders', 'Payments', 'Products'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-slate-900 text-xs sm:text-sm hover:text-amber-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                      {faq.category}
                    </span>
                    {faq.question}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180 text-amber-500' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-slate-500 font-medium text-xs">No questions matched your search criteria.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCat('All'); }}
              className="text-amber-600 text-xs font-bold hover:underline"
            >
              Clear filters and view all FAQs
            </button>
          </div>
        )}
      </div>

      {/* Still Need Help CTA */}
      <div className="bg-slate-950 text-white p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base font-bold font-serif text-white flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Still have questions or need human assistance?</span>
          </h3>
          <p className="text-xs text-slate-400">
            Our 24/7 VIP Customer Support Team is ready to help you with any inquiry.
          </p>
        </div>

        <button
          onClick={() => navigateTo('contact')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-6 py-3 rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-lg"
        >
          <Mail className="w-4 h-4" />
          <span>Contact Support Team</span>
        </button>
      </div>
    </div>
  );
};
