import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ChatSession, ChatMessage } from '../../types';
import { 
  MessageCircle, 
  Search, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Send, 
  User, 
  Mail, 
  Phone,
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Filter,
  XCircle,
  Tag,
  Truck,
  HelpCircle,
  MessageSquare,
  Users,
  UserCheck
} from 'lucide-react';

export const AdminLiveChat: React.FC = () => {
  const { 
    chatSessions, 
    sendChatMessage, 
    markChatReadByAdmin, 
    updateChatSessionStatus, 
    deleteChatSession,
    refreshChatSessions
  } = useStore();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(() => {
    return chatSessions.length > 0 ? chatSessions[0].id : null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Unread' | 'Resolved'>('All');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'members' | 'guests'>('all');
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Keep selected session synced or auto select first if deleted
  useEffect(() => {
    if (chatSessions.length > 0) {
      if (!selectedSessionId || !chatSessions.some((s) => s.id === selectedSessionId)) {
        setSelectedSessionId(chatSessions[0].id);
      }
    } else {
      setSelectedSessionId(null);
    }
  }, [chatSessions, selectedSessionId]);

  // Find active session object
  const activeSession = chatSessions.find((s) => s.id === selectedSessionId);

  // Auto-mark session read when selected by admin
  useEffect(() => {
    if (activeSession && activeSession.unreadForAdmin > 0) {
      markChatReadByAdmin(activeSession.id);
    }
  }, [selectedSessionId, activeSession?.unreadForAdmin]);

  // Scroll message container to bottom on message updates
  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages.length, selectedSessionId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshChatSessions();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Counts for tabs
  const membersCount = chatSessions.filter(
    (s) => s.userType === 'member' || s.id.includes('member')
  ).length;

  const guestsCount = chatSessions.filter(
    (s) => s.userType === 'guest' || (!s.userType && !s.id.includes('member')) || s.id.includes('guest')
  ).length;

  // Filter sessions
  const filteredSessions = chatSessions.filter((s) => {
    const isMember = s.userType === 'member' || s.id.includes('member');
    const isGuest = s.userType === 'guest' || (!s.userType && !s.id.includes('member')) || s.id.includes('guest');

    if (userTypeFilter === 'members' && !isMember) return false;
    if (userTypeFilter === 'guests' && !isGuest) return false;

    const matchesSearch = 
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.customerPhone && s.customerPhone.includes(searchQuery)) ||
      s.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'Open') return s.status === 'Open';
    if (statusFilter === 'Resolved') return s.status === 'Resolved';
    if (statusFilter === 'Unread') return s.unreadForAdmin > 0;
    return true;
  });

  const handleSendAdminReply = (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const text = (customText || adminReplyText).trim();
    if (!text || !selectedSessionId) return;

    sendChatMessage(selectedSessionId, 'admin', text);
    setAdminReplyText('');
  };

  const handleApplyCannedReply = (text: string) => {
    handleSendAdminReply(undefined, text);
  };

  const totalUnread = chatSessions.reduce((sum, s) => sum + (s.unreadForAdmin || 0), 0);
  const openCount = chatSessions.filter((s) => s.status === 'Open').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-widest mb-1">
            <MessageCircle className="w-4 h-4" />
            <span>Customer Service Concierge</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white font-serif">Live Chat Control Desk</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-threaded messaging with storefront visitors and customer accounts.
          </p>
        </div>

        {/* Quick Stats Pills & Refresh */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            title="Sync latest chats from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Active Sessions</span>
            <span className="text-base font-black text-white">{chatSessions.length}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <span className="block text-[10px] font-extrabold text-amber-400 uppercase">Open Threads</span>
            <span className="text-base font-black text-amber-400">{openCount}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-2xl text-center">
            <span className="block text-[10px] font-extrabold text-rose-400 uppercase">Unread Messages</span>
            <span className="text-base font-black text-rose-400">{totalUnread}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
        
        {/* Left Column: Chat Sessions List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-800 space-y-3 shrink-0">
            {/* Member vs Guest Filter Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 text-xs font-black">
              <button
                onClick={() => setUserTypeFilter('all')}
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  userTypeFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>All Chats</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${userTypeFilter === 'all' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {chatSessions.length}
                </span>
              </button>

              <button
                onClick={() => setUserTypeFilter('members')}
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  userTypeFilter === 'members'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Members</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${userTypeFilter === 'members' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {membersCount}
                </span>
              </button>

              <button
                onClick={() => setUserTypeFilter('guests')}
                className={`py-2 px-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  userTypeFilter === 'guests'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Guests</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${userTypeFilter === 'guests' ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {guestsCount}
                </span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search name, email, phone, message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
              {(['All', 'Open', 'Unread', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl transition-all shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-200 text-slate-950 font-black shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60">
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2 text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-bold">No chat sessions match filter.</p>
                <p className="text-[11px] text-slate-600">
                  {userTypeFilter !== 'all' ? `Try switching to ${userTypeFilter === 'members' ? 'Guests' : 'Members'} tab.` : 'New customer chats will appear here automatically.'}
                </p>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = session.id === selectedSessionId;
                const lastMsg = session.messages[session.messages.length - 1];
                const isMember = session.userType === 'member' || session.id.includes('member');

                return (
                  <button
                    key={session.id}
                    onClick={() => setSelectedSessionId(session.id)}
                    className={`w-full text-left p-4 transition-all flex flex-col space-y-2 relative cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-l-4 border-amber-500'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border ${
                          isMember 
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' 
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                        }`}>
                          {session.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-black text-white truncate">{session.customerName}</h4>
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                              isMember 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {isMember ? 'Member' : 'Guest'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{session.customerEmail}</p>
                          {session.customerPhone && (
                            <p className="text-[9px] text-slate-500 font-mono">{session.customerPhone}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[10px] font-semibold text-slate-500">
                          {new Date(session.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          session.status === 'Open'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                    </div>

                    {/* Message Snippet & Unread Badge */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <p className="text-[11px] text-slate-400 truncate flex-1">
                        {lastMsg ? lastMsg.text : 'No messages yet'}
                      </p>
                      {session.unreadForAdmin > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                          {session.unreadForAdmin} new
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Thread Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col overflow-hidden">
          {activeSession ? (
            <>
              {/* Active Session Top Bar */}
              <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 font-extrabold rounded-2xl flex items-center justify-center text-sm shadow-md ${
                    activeSession.userType === 'member' || activeSession.id.includes('member')
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-indigo-600 text-white'
                  }`}>
                    {activeSession.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{activeSession.customerName}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        activeSession.userType === 'member' || activeSession.id.includes('member')
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {activeSession.userType === 'member' || activeSession.id.includes('member') ? '👤 Member' : '🏷️ Guest'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        activeSession.status === 'Open'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {activeSession.status}
                      </span>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{activeSession.customerEmail}</span>
                      </span>
                      {activeSession.customerPhone && (
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{activeSession.customerPhone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateChatSessionStatus(
                      activeSession.id, 
                      activeSession.status === 'Open' ? 'Resolved' : 'Open'
                    )}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 border cursor-pointer ${
                      activeSession.status === 'Open'
                        ? 'bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border-emerald-500/30'
                        : 'bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border-amber-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeSession.status === 'Open' ? 'Mark Resolved' : 'Reopen Chat'}</span>
                  </button>

                  <button
                    onClick={() => deleteChatSession(activeSession.id)}
                    className="text-slate-400 hover:text-rose-400 p-2 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer"
                    title="Delete Chat Thread"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Thread Scroll View */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4 bg-slate-900/20">
                {activeSession.messages.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 px-1 text-[10px] font-bold text-slate-400">
                        <span>{msg.senderName}</span>
                        <span>•</span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs shadow-md'
                            : 'bg-slate-900 text-slate-100 rounded-bl-xs border border-slate-800'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Quick Canned Replies Bar */}
              <div className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Quick Admin Canned Replies</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyCannedReply("Hi! Orders ship within 24 hours with free express live tracking!")}
                    className="text-[10px] font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1"
                  >
                    <Truck className="w-3 h-3 text-blue-400" />
                    <span>Shipping Info</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCannedReply("You can use code WINNING20 at checkout for 20% OFF your entire order!")}
                    className="text-[10px] font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-emerald-400" />
                    <span>20% Promo Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCannedReply("Is there anything else I can assist you with today?")}
                    className="text-[10px] font-bold bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-xl transition-all flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    <span>Anything Else?</span>
                  </button>
                </div>
              </div>

              {/* Admin Reply Form Input */}
              <form
                onSubmit={handleSendAdminReply}
                className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Type admin reply to customer..."
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-amber-500 text-xs text-white placeholder-slate-500 px-4 py-3 rounded-2xl focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!adminReplyText.trim()}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-2xl transition-all disabled:opacity-40 flex items-center gap-2 shrink-0 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send Reply</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
              <MessageCircle className="w-12 h-12 text-slate-700" />
              <p className="text-sm font-bold text-slate-300">Select a live customer conversation to begin messaging</p>
              <p className="text-xs text-slate-500 max-w-sm">
                New messages from storefront visitors will appear in the left column in real-time.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
