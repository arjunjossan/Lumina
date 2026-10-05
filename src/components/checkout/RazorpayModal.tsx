import React, { useState } from 'react';
import { PaymentSettings } from '../../types';
import { 
  GooglePayIcon, 
  PhonePeIcon, 
  PaytmIcon, 
  UpiIcon, 
  VisaIcon, 
  MastercardIcon, 
  RuPayIcon, 
  HdfcBankIcon, 
  SbiBankIcon, 
  IciciBankIcon, 
  AxisBankIcon, 
  CredIcon, 
  RazorpayBadgeIcon 
} from '../store/PaymentBrandIcons';
import { 
  ShieldCheck, 
  Lock, 
  X, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Building2, 
  Wallet, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  Loader2,
  Smartphone
} from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentDetails: { razorpayPaymentId: string; razorpayOrderId: string }) => void;
  amount: number;
  paymentType: 'FullPay' | 'PartialPay';
  paymentSettings: PaymentSettings;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  codBalanceRemaining?: number;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  paymentType,
  paymentSettings,
  customerName,
  customerEmail,
  customerPhone,
  codBalanceRemaining
}) => {
  const [activeTab, setActiveTab] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('customer@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8899');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('992');
  const [cardName, setCardName] = useState(customerName || 'John Doe');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  if (!isOpen) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    setProcessingStep('Initializing secure connection to Razorpay Payment Gateway...');

    setTimeout(() => {
      setProcessingStep('Authorizing transaction with issuing bank / UPI network...');
    }, 1200);

    setTimeout(() => {
      setProcessingStep('Payment successful! Verifying signature...');
    }, 2400);

    setTimeout(() => {
      setIsProcessing(false);
      const razorpayPaymentId = `pay_${Math.random().toString(36).substring(2, 11)}`;
      const razorpayOrderId = `order_${Math.random().toString(36).substring(2, 11)}`;
      onSuccess({ razorpayPaymentId, razorpayOrderId });
    }, 3200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Razorpay Header Bar */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 p-5 text-white flex items-center justify-between border-b border-blue-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/30 border border-blue-400/40 rounded-2xl flex items-center justify-center text-blue-400 font-extrabold text-xs">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-wide text-white">RAZORPAY SECURE</span>
                {paymentSettings.razorpayTestMode && (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                    TEST MODE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-200/80">
                {paymentType === 'FullPay' ? '100% Prepaid Discount Checkout' : 'Upfront Advance Deposit Payment'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Header Banner */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">
              {paymentType === 'FullPay' ? 'Amount Payable Online Now' : 'Upfront Online Deposit Due Now'}
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              ₹{amount.toFixed(2)}
            </span>
          </div>

          {paymentType === 'PartialPay' && codBalanceRemaining && (
            <div className="text-right bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-amber-300 block font-bold">Doorstep COD Balance</span>
              <span className="text-xs font-black text-amber-400 font-mono">₹{codBalanceRemaining.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        {isProcessing ? (
          <div className="p-8 text-center space-y-6 my-auto">
            <div className="w-16 h-16 bg-blue-500/20 border border-blue-500/40 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white font-serif">Processing Payment with Razorpay</h4>
              <p className="text-xs text-blue-300/90 font-mono bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {processingStep}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Do not refresh or close this modal</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-200">
            
            {/* Customer Contact Brief */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-400">Payer: </span>
                <span className="font-bold text-white">{customerName}</span>
                <span className="text-slate-500 mx-1">•</span>
                <span className="text-slate-300">{customerEmail}</span>
              </div>
              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                Encrypted
              </span>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'upi'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <UpiIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px]">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'card'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-[10px]">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'netbanking'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px]">Netbanking</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wallet')}
                className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                  activeTab === 'wallet'
                    ? 'bg-blue-600/20 border-blue-500 text-white font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wallet className="w-4 h-4 text-purple-400" />
                <span className="text-[10px]">Wallets</span>
              </button>
            </div>

            {/* TAB CONTENT: UPI / QR */}
            {activeTab === 'upi' && (
              <div className="space-y-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-1.5">
                    <UpiIcon className="w-4 h-4" />
                    <span>Instant UPI Apps & Dynamic QR</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    0% Extra Fee
                  </span>
                </div>

                {/* UPI App Quick Chooser */}
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setUpiId(`${customerEmail ? customerEmail.split('@')[0] : 'user'}@okaxis`)}
                    className="bg-slate-900 hover:bg-slate-800 p-2 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col items-center gap-1 transition-all group"
                  >
                    <GooglePayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-200">GPay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpiId(`${customerEmail ? customerEmail.split('@')[0] : 'user'}@ybl`)}
                    className="bg-slate-900 hover:bg-slate-800 p-2 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col items-center gap-1 transition-all group"
                  >
                    <PhonePeIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-200">PhonePe</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpiId(`${customerEmail ? customerEmail.split('@')[0] : 'user'}@paytm`)}
                    className="bg-slate-900 hover:bg-slate-800 p-2 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col items-center gap-1 transition-all group"
                  >
                    <PaytmIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-200">Paytm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpiId(`${customerEmail ? customerEmail.split('@')[0] : 'user'}@upi`)}
                    className="bg-slate-900 hover:bg-slate-800 p-2 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col items-center gap-1 transition-all group"
                  >
                    <UpiIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-slate-200">BHIM</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                    {/* Simulated Razorpay QR Code */}
                    <div className="w-full h-full bg-slate-950 p-1.5 rounded flex flex-col items-center justify-center text-center">
                      <QrCode className="w-16 h-16 text-white" />
                      <span className="text-[8px] font-mono text-amber-400 font-bold mt-1">RAZORPAY QR</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <p className="text-[11px] text-slate-300 font-medium">
                      Scan with Google Pay, PhonePe, Paytm, or enter your UPI ID below.
                    </p>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1">Enter UPI VPA ID</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CARD */}
            {activeTab === 'card' && (
              <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs block">Credit / Debit Card</span>
                  <div className="flex items-center gap-1.5">
                    <VisaIcon className="w-5 h-3.5" />
                    <MastercardIcon className="w-5 h-3.5" />
                    <RuPayIcon className="w-5 h-3.5" />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">CVV / Security Code</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      maxLength={4}
                      className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: NETBANKING */}
            {activeTab === 'netbanking' && (
              <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="font-bold text-white text-xs block">Popular Netbanking Banks</span>
                
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'HDFC Bank', icon: <HdfcBankIcon className="w-4 h-4" /> },
                    { name: 'State Bank of India', icon: <SbiBankIcon className="w-4 h-4" /> },
                    { name: 'ICICI Bank', icon: <IciciBankIcon className="w-4 h-4" /> },
                    { name: 'Axis Bank', icon: <AxisBankIcon className="w-4 h-4" /> },
                    { name: 'Kotak Mahindra', icon: <Building2 className="w-4 h-4 text-rose-500" /> },
                    { name: 'IndusInd Bank', icon: <Building2 className="w-4 h-4 text-amber-500" /> }
                  ].map((bank) => (
                    <button
                      key={bank.name}
                      type="button"
                      onClick={() => setSelectedBank(bank.name)}
                      className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all flex items-center gap-2 ${
                        selectedBank === bank.name
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {bank.icon}
                      <span className="truncate">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: WALLET */}
            {activeTab === 'wallet' && (
              <div className="space-y-3 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="font-bold text-white text-xs block">Supported Mobile Wallets & PayLater</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-white">
                    <PaytmIcon className="w-4 h-4" />
                    <span>Paytm Wallet</span>
                  </div>
                  <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-white">
                    <CredIcon className="w-4 h-4" />
                    <span>CRED Pay</span>
                  </div>
                  <div className="bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-white">
                    <Wallet className="w-4 h-4 text-amber-400" />
                    <span>Amazon Pay</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">Direct wallet balance deduction with instant 1-click OTP confirmation.</p>
              </div>
            )}

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePayNow}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>PAY ₹{amount.toFixed(2)} SECURELY VIA RAZORPAY</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/80 pt-3">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>PCI-DSS Level 1 Compliant</span>
              </span>
              <span>Merchant ID: {paymentSettings.razorpayKeyId || 'rzp_test_123'}</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
