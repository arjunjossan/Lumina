import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/store/HeroBanner';
import { ProductGrid } from './components/store/ProductGrid';
import { ProductDetailsPage } from './components/store/ProductDetailsPage';
import { CheckoutModal } from './components/store/CheckoutModal';
import { OrderSuccessPage } from './components/store/OrderSuccessPage';
import { OrderTrackingPage } from './components/store/OrderTrackingPage';
import { CustomerOrdersPage } from './components/store/CustomerOrdersPage';
import { ShippingPolicyPage } from './components/store/ShippingPolicyPage';
import { ReturnsPolicyPage } from './components/store/ReturnsPolicyPage';
import { FAQPage } from './components/store/FAQPage';
import { ContactPage } from './components/store/ContactPage';
import { CartPage } from './components/store/CartPage';
import { CartDrawer } from './components/store/CartDrawer';
import { WishlistDrawer } from './components/store/WishlistDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { NotificationToast } from './components/common/NotificationToast';
import { FlashSalePopupModal } from './components/common/FlashSalePopupModal';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverview } from './components/admin/AdminOverview';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminMobileProducts } from './components/admin/AdminMobileProducts';
import { AdminDesktopHero } from './components/admin/AdminDesktopHero';
import { AdminMobileHero } from './components/admin/AdminMobileHero';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminInquiries } from './components/admin/AdminInquiries';
import { AdminLiveChat } from './components/admin/AdminLiveChat';
import { AdminReviews } from './components/admin/AdminReviews';
import { AdminShipping } from './components/admin/AdminShipping';
import { AdminPayments } from './components/admin/AdminPayments';
import { AdminBundles } from './components/admin/AdminBundles';
import { AdminCoupons } from './components/admin/AdminCoupons';
import { AdminPromoPopup } from './components/admin/AdminPromoPopup';
import { AdminTopNotification } from './components/admin/AdminTopNotification';
import { AdminLogo } from './components/admin/AdminLogo';
import { AdminSocial } from './components/admin/AdminSocial';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { CustomerAuthModal } from './components/auth/CustomerAuthModal';
import { CustomerLoginPage } from './components/auth/CustomerLoginPage';
import { CustomerChatWidget } from './components/chat/CustomerChatWidget';
import { ScrollToTop } from './components/common/ScrollToTop';
import { ProductCompareModal } from './components/common/ProductCompareModal';
import { FloatingCompareBar } from './components/common/FloatingCompareBar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { MobileAddToCartFancyPopup } from './components/store/MobileAddToCartFancyPopup';

const MainContent: React.FC = () => {
  const { activePage, adminTab } = useStore();

  // If in Admin Dashboard mode
  if (activePage === 'admin') {
    return (
      <>
        <AdminLayout>
          {adminTab === 'overview' && <AdminOverview />}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'mobile_products' && <AdminMobileProducts />}
          {adminTab === 'desktop_hero' && <AdminDesktopHero />}
          {adminTab === 'mobile_hero' && <AdminMobileHero />}
          {adminTab === 'orders' && <AdminOrders />}
          {adminTab === 'inquiries' && <AdminInquiries />}
          {adminTab === 'live_chat' && <AdminLiveChat />}
          {adminTab === 'reviews' && <AdminReviews />}
          {adminTab === 'shipping' && <AdminShipping />}
          {adminTab === 'payments' && <AdminPayments />}
          {adminTab === 'bundles' && <AdminBundles />}
          {adminTab === 'coupons' && <AdminCoupons />}
          {adminTab === 'top_notification' && <AdminTopNotification />}
          {adminTab === 'promo_popup' && <AdminPromoPopup />}
          {adminTab === 'logo' && <AdminLogo />}
          {adminTab === 'social' && <AdminSocial />}
          {adminTab === 'settings' && <AdminSettings />}
        </AdminLayout>
        <AdminLoginModal />
        <FlashSalePopupModal />
        <NotificationToast />
      </>
    );
  }

  // Customer Storefront Mode
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 pb-20 md:pb-0">
        {activePage === 'home' && (
          <>
            <HeroBanner />
            <ProductGrid />
          </>
        )}

        {activePage === 'catalog' && <ProductGrid />}
        {activePage === 'product-detail' && <ProductDetailsPage />}
        {activePage === 'cart' && <CartPage />}
        {activePage === 'checkout' && <CheckoutModal />}
        {activePage === 'order-success' && <OrderSuccessPage />}
        {activePage === 'order-tracking' && <OrderTrackingPage />}
        {activePage === 'my-orders' && <CustomerOrdersPage />}
        {activePage === 'shipping-policy' && <ShippingPolicyPage />}
        {activePage === 'returns-policy' && <ReturnsPolicyPage />}
        {activePage === 'faq' && <FAQPage />}
        {activePage === 'contact' && <ContactPage />}
        {activePage === 'login' && <CustomerLoginPage />}
      </main>

      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Drawers & Overlays */}
      <CartDrawer />
      <WishlistDrawer />
      <QuickViewModal />
      <FlashSalePopupModal />
      <ProductCompareModal />
      <FloatingCompareBar />
      <NotificationToast />
      <MobileAddToCartFancyPopup />
      <AdminLoginModal />
      <CustomerAuthModal />
      <CustomerChatWidget />
      <ScrollToTop />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
