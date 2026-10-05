import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  CheckCheck, 
  User, 
  ChevronDown, 
  Clock, 
  HelpCircle, 
  Package, 
  Truck, 
  Tag, 
  LogIn, 
  UserCheck, 
  ShieldCheck, 
  Phone, 
  Mail, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export const CustomerChatWidget: React.FC = () => {
  const { 
    chatSessions, 
    sendChatMessage, 
    markChatReadByCustomer, 
    customerChatSessionId, 
    customerUser,
    isCustomerAuthenticated,
    setIsCustomerAuthModalOpen,
    guestChatUser,
    setGuestChatUser,
    activePage 
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  // Guest registration form state
  const [guestModeActive, setGuestModeActive] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestError, setGuestError] = useState('');

  const [isSettingInfo, setIsSettingInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Don't show floating widget inside Admin Control Center
  if (activePage === 'admin') return null;

  // Determine current active chat session
  const currentSession = chatSessions.find((s) => s.id === customerChatSessionId);
  const unreadCount = currentSession ? currentSession.unreadForCustomer : 0;
  const messages = currentSession ? currentSession.messages : [];

  // Check if customer identity is established (either Member or Guest)
  const isIdentified = isCustomerAuthenticated || Boolean(guestChatUser);

  // Scroll to bottom when new messages arrive or chat opens
  useEffect(() => {
    if (isOpen && isIdentified) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      if (unreadCount > 0) {
        markChatReadByCustomer(customerChatSessionId);
      }
    }
  }, [isOpen, messages.length, unreadCount, isIdentified]);

  const handleOpenChat = () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      markChatReadByCustomer(customerChatSessionId);
    }
  };

  const handleChooseLogin = () => {
    setIsCustomerAuthModalOpen(true);
  };

  const handleStartGuestChat = (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError('');

    if (!guestName.trim()) {
      setGuestError('Please enter your full name.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setGuestError('Please enter a valid email address.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.trim().length < 6) {
      setGuestError('Please enter a valid contact phone number.');
      return;
    }

    const sessionId = `chat-guest-${Date.now()}`;
    const newGuest = {
      name: guestName.trim(),
      email: guestEmail.trim().toLowerCase(),
      phone: guestPhone.trim(),
      sessionId
    };

    setGuestChatUser(newGuest);
    setGuestModeActive(false);

    // Send initial greeting into the session
    setTimeout(() => {
      sendChatMessage(
        sessionId,
        'admin',
        `Hello ${newGuest.name}! 👋 Thank you for contacting Lumina Concierge as a guest visitor. A support specialist has received your inquiry and contact details (${newGuest.email} / ${newGuest.phone}) and will assist you shortly. What can we help you with today?`,
        { name: newGuest.name, email: newGuest.email, phone: newGuest.phone },
        'guest'
      );
    }, 400);
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || messageText).trim();
    if (!text) return;

    let effectiveName = 'Visitor';
    let effectiveEmail = 'guest@example.com';
    let effectivePhone: string | undefined = undefined;
    let userType: 'member' | 'guest' = 'guest';

    if (isCustomerAuthenticated && customerUser) {
      effectiveName = customerUser.name || customerUser.email.split('@')[0];
      effectiveEmail = customerUser.email;
      effectivePhone = customerUser.phone;
      userType = 'member';
    } else if (guestChatUser) {
      effectiveName = guestChatUser.name;
      effectiveEmail = guestChatUser.email;
      effectivePhone = guestChatUser.phone;
      userType = 'guest';
    }

    sendChatMessage(
      customerChatSessionId,
      'customer',
      text,
      { name: effectiveName, email: effectiveEmail, phone: effectivePhone },
      userType
    );

    setMessageText('');

    // If it's a brand new chat session with only 1 customer message and no prior bot greeting, trigger a quick concierge acknowledgment
    if (!currentSession || currentSession.messages.length === 0) {
      setTimeout(() => {
        sendChatMessage(
          customerChatSessionId,
          'admin',
          `Thank you for your message, ${effectiveName}! A customer care agent has been assigned to your chat. We typically respond within 1-2 minutes during active business hours.`,
          { name: effectiveName, email: effectiveEmail, phone: effectivePhone },
          userType
        );
      }, 1200);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleSwitchIdentity = () => {
    setGuestChatUser(null);
    setGuestModeActive(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 font-sans">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={handleOpenChat}
          className="group relative bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 p-3.5 sm:p-4 rounded-2xl shadow-2xl transition-all duration-300 flex items-center gap-2.5 sm:gap-3 border border-slate-700 hover:border-amber-400 hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open Live Chat Support"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:text-slate-950 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          </div>
          <div className="hidden sm:flex flex-col items-start pr-1 text-left">
            <span className="text-xs font-black tracking-wider uppercase">Live Chat</span>
            <span className="text-[10px] text-slate-300 group-hover:text-slate-900 font-semibold">Concierge Support</span>
          </div>

          {/* Unread Message Badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-rose-500 text-white font-extrabold text-[11px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Box Window */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[410px] h-[500px] max-h-[calc(100vh-150px)] sm:h-[540px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white font-serif tracking-tight flex items-center gap-1.5">
                  <span>Lumina Live Concierge</span>
                </h3>
                <p className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Support Team Active</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isIdentified && (
                <button
                  onClick={() => setIsSettingInfo(!isSettingInfo)}
                  className="text-slate-400 hover:text-amber-400 p-1.5 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
                  title="Your Profile Details"
                >
                  <User className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
                title="Minimize chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Info Bar / Status Bar when identified */}
          {isIdentified && (
            <div className="bg-slate-900 px-4 py-2 text-white border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                  isCustomerAuthenticated 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {isCustomerAuthenticated ? '👤 Member' : '🏷️ Guest'}
                </span>
                <span className="text-[11px] font-bold text-slate-200 truncate">
                  {isCustomerAuthenticated && customerUser 
                    ? (customerUser.name || customerUser.email) 
                    : guestChatUser?.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!isCustomerAuthenticated && (
                  <button
                    onClick={handleChooseLogin}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                  >
                    Login with OTP
                  </button>
                )}
                <button
                  onClick={handleSwitchIdentity}
                  className="text-[10px] text-slate-400 hover:text-white cursor-pointer"
                  title="Switch chat session or guest profile"
                >
                  Switch
                </button>
              </div>
            </div>
          )}

          {/* User Info Dropdown Bar */}
          {isSettingInfo && isIdentified && (
            <div className="bg-amber-50/95 border-b border-amber-200 p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-amber-950 font-bold text-[11px]">
                <span>Active Chat Session Info</span>
                <button 
                  onClick={() => setIsSettingInfo(false)}
                  className="text-amber-800 hover:underline text-[10px] cursor-pointer"
                >
                  Close
                </button>
              </div>
              <p className="text-slate-600 text-[11px]">
                <strong>Name:</strong> {isCustomerAuthenticated && customerUser ? (customerUser.name || 'Member') : guestChatUser?.name}
              </p>
              <p className="text-slate-600 text-[11px]">
                <strong>Email:</strong> {isCustomerAuthenticated && customerUser ? customerUser.email : guestChatUser?.email}
              </p>
              {guestChatUser?.phone && (
                <p className="text-slate-600 text-[11px]">
                  <strong>Phone:</strong> {guestChatUser.phone}
                </p>
              )}
            </div>
          )}

          {/* CASE 1: UNIDENTIFIED VISITOR -> INITIAL SELECTION MODAL (LOGIN VS GUEST) */}
          {!isIdentified && !guestModeActive && (
            <div className="flex-1 flex flex-col justify-center p-6 bg-slate-50 space-y-6 overflow-y-auto">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-slate-900 font-serif">
                  Welcome to Live Support
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  How would you like to connect with our concierge team today?
                </p>
              </div>

              {/* Two Main Choices */}
              <div className="space-y-3">
                {/* 1. Login with OTP */}
                <button
                  type="button"
                  onClick={handleChooseLogin}
                  className="w-full p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl border border-slate-800 transition-all flex items-center justify-between group shadow-sm hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Sign In as Member</span>
                        <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-md">
                          Recommended
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Email & OTP verification • Syncs order history & tickets
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </button>

                {/* 2. Continue as Guest */}
                <button
                  type="button"
                  onClick={() => setGuestModeActive(true)}
                  className="w-full p-4 bg-white hover:bg-amber-50/50 text-slate-900 rounded-2xl border border-slate-200 transition-all flex items-center justify-between group shadow-2xs hover:scale-[1.01] cursor-pointer"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-amber-100 group-hover:text-amber-900">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">
                        Continue as Guest
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Quick inquiry with Name, Email, and Phone number
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-Bit SSL Encrypted Customer Assistance</span>
                </span>
              </div>
            </div>
          )}

          {/* CASE 2: GUEST FORM ENTRY */}
          {!isIdentified && guestModeActive && (
            <div className="flex-1 flex flex-col justify-between p-6 bg-slate-50 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-black text-slate-900 font-serif">
                      Guest Chat Registration
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGuestModeActive(false)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    Back
                  </button>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Please provide your contact information so our support desk can assist you and send follow-up details if needed.
                </p>

                {guestError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                    {guestError}
                  </div>
                )}

                <form id="guest-chat-form" onSubmit={handleStartGuestChat} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="e.g. Michael Scott"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        placeholder="e.g. michael@example.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="e.g. +1 (555) 345-6789"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 focus:border-amber-500 rounded-xl text-xs text-slate-900 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-2">
                <button
                  type="submit"
                  form="guest-chat-form"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Start Live Chat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  Data stored securely and integrated with Lumina admin desk.
                </p>
              </div>
            </div>
          )}

          {/* CASE 3: ACTIVE LIVE CHAT THREAD (USER IDENTIFIED AS MEMBER OR GUEST) */}
          {isIdentified && (
            <>
              {/* Chat Messages Scroll Container */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                {/* Security Trust banner */}
                <div className="text-center space-y-1 my-1">
                  <span className="inline-block px-3 py-1 bg-slate-200/80 text-slate-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    🔒 256-Bit Encrypted Concierge Channel
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Ask about order status, tracking, product recommendations, or warranty!
                  </p>
                </div>

                {messages.length === 0 ? (
                  <div className="text-center py-8 space-y-3 text-slate-400">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200/60">
                      <Bot className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600">
                      Welcome {isCustomerAuthenticated && customerUser ? (customerUser.name || 'valued member') : guestChatUser?.name}! How can we assist you today?
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isCustomer = msg.sender === 'customer';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1`}
                      >
                        <div className="flex items-center gap-1.5 px-1 text-[10px] text-slate-400 font-semibold">
                          <span>{msg.senderName}</span>
                          <span>•</span>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                            isCustomer
                              ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs'
                              : 'bg-slate-900 text-slate-100 rounded-bl-xs border border-slate-800'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Recommendations Chips */}
              <div className="p-2 bg-slate-100/80 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                <button
                  onClick={() => handleQuickPrompt("Where is my order?")}
                  className="shrink-0 text-[10px] font-bold bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Package className="w-3 h-3 text-amber-500" />
                  <span>Order Status</span>
                </button>
                <button
                  onClick={() => handleQuickPrompt("Do you have active coupon codes?")}
                  className="shrink-0 text-[10px] font-bold bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Tag className="w-3 h-3 text-emerald-500" />
                  <span>Coupons</span>
                </button>
                <button
                  onClick={() => handleQuickPrompt("What is the return policy?")}
                  className="shrink-0 text-[10px] font-bold bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Truck className="w-3 h-3 text-blue-500" />
                  <span>Returns</span>
                </button>
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 bg-slate-100 focus:bg-white border border-slate-200 focus:border-amber-500 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 disabled:opacity-40 p-2.5 rounded-xl transition-all shrink-0 cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

        </div>
      )}
    </div>
  );
};
