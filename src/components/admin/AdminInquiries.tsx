import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SupportInquiry, InquiryStatus } from '../../types';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';
import { Headphones, Search, Filter, Trash2, CheckCircle, Clock, Mail, MessageSquare, Send, Check, AlertCircle, ArrowUpRight } from 'lucide-react';

export const AdminInquiries: React.FC = () => {
  const { supportInquiries, updateInquiryStatus, deleteInquiry, showNotification } = useStore();

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Inquiry for Modal or Expanded View
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySaveState, setReplySaveState] = useState<SaveButtonState>('idle');

  const filteredInquiries = supportInquiries.filter((inq) => {
    const matchesStatus = filterStatus === 'All' || inq.status === filterStatus;
    const matchesCat = filterCategory === 'All' || inq.category === filterCategory;
    const matchesQuery = !searchQuery ||
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.orderNumber && inq.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesCat && matchesQuery;
  });

  const newCount = supportInquiries.filter((i) => i.status === 'New').length;

  const handleSaveReply = (id: string) => {
    if (!replyText.trim()) return;
    setReplySaveState('saving');
    updateInquiryStatus(id, 'Resolved', replyText.trim());
    setReplySaveState('saved');
    setTimeout(() => {
      setActiveReplyId(null);
      setReplyText('');
      setReplySaveState('idle');
      showNotification(`Response saved and ticket #${id} marked as Resolved!`);
    }, 700);
  };

  return (
    <div className="space-y-6 text-xs text-slate-200">
      {/* Header Banner */}
      <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <Headphones className="w-5 h-5 text-amber-400" />
            <span>Customer Support Inquiries & Tickets</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            View, manage, and respond to incoming customer messages submitted through the Contact Support page and Returns portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {newCount > 0 && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{newCount} Unresolved Tickets</span>
            </span>
          )}
          <span className="bg-slate-900 text-slate-300 border border-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl">
            {supportInquiries.length} Total Queries
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search queries by customer name, email, order #, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Statuses</option>
            <option value="New">New / Unread</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Categories</option>
            <option value="General Question">General Question</option>
            <option value="Order Tracking">Order Tracking</option>
            <option value="Returns & Refunds">Returns & Refunds</option>
            <option value="Shipping Issue">Shipping Issue</option>
            <option value="Product Inquiry">Product Inquiry</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.length > 0 ? (
          filteredInquiries.map((inq) => {
            const formattedDate = new Date(inq.createdAt).toLocaleString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            const isReplying = activeReplyId === inq.id;

            return (
              <div
                key={inq.id}
                className={`bg-slate-950 p-5 rounded-3xl border transition-all ${
                  inq.status === 'New'
                    ? 'border-amber-500/50 bg-slate-950/90 shadow-md shadow-amber-500/5'
                    : 'border-slate-800'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-amber-400 font-bold">{inq.id}</span>
                    
                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inq.status === 'New'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : inq.status === 'In Progress'
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {inq.status}
                    </span>

                    {/* Category Tag */}
                    <span className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {inq.category}
                    </span>

                    {inq.orderNumber && (
                      <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        Order #{inq.orderNumber}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-500">{formattedDate}</span>
                </div>

                {/* Customer Details & Subject */}
                <div className="py-3 space-y-2">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <span className="font-bold text-white text-sm block">{inq.name}</span>
                      <a
                        href={`mailto:${inq.email}`}
                        className="text-amber-400 hover:underline text-xs flex items-center gap-1 font-mono"
                      >
                        <Mail className="w-3 h-3" />
                        <span>{inq.email}</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Status quick switch buttons */}
                      <button
                        onClick={() => updateInquiryStatus(inq.id, 'New')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          inq.status === 'New' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        New
                      </button>
                      <button
                        onClick={() => updateInquiryStatus(inq.id, 'In Progress')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          inq.status === 'In Progress' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => updateInquiryStatus(inq.id, 'Resolved')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          inq.status === 'Resolved' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        Resolved
                      </button>

                      <button
                        onClick={() => deleteInquiry(inq.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors ml-2"
                        title="Delete Inquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5">
                    <p className="font-bold text-amber-300 text-xs">Subject: {inq.subject}</p>
                    <p className="text-slate-300 leading-relaxed text-xs whitespace-pre-wrap">{inq.message}</p>
                  </div>

                  {/* Admin Reply Record */}
                  {inq.adminReply && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-2xl text-emerald-300 space-y-1">
                      <p className="font-bold text-[10px] uppercase text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Admin Official Reply Saved:</span>
                      </p>
                      <p className="text-xs text-emerald-200 leading-relaxed">{inq.adminReply}</p>
                    </div>
                  )}
                </div>

                {/* Reply Drawer / Inline Actions */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-3">
                  <a
                    href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject)}&body=${encodeURIComponent(`Hi ${inq.name},\n\nRegarding your ticket #${inq.id}:\n\n`)}`}
                    className="text-slate-400 hover:text-white text-xs flex items-center gap-1 hover:underline"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Open Email Client</span>
                  </a>

                  {!isReplying ? (
                    <button
                      onClick={() => {
                        setActiveReplyId(inq.id);
                        setReplyText(inq.adminReply || '');
                      }}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{inq.adminReply ? 'Edit Admin Response' : 'Write Admin Reply & Resolve'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveReplyId(null)}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      Cancel Reply
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {isReplying && (
                  <div className="mt-3 p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
                    <label className="font-bold text-white text-xs block">Write Official Admin Response / Internal Note:</label>
                    <textarea
                      rows={3}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response to the customer..."
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <AdminSaveButton
                        onClick={() => handleSaveReply(inq.id)}
                        saveState={replySaveState}
                        idleText="Save Response & Mark Resolved"
                        savingText="Saving Response..."
                        savedText="Response Saved!"
                        idleIcon={<Send className="w-3.5 h-3.5" />}
                        variant="emerald"
                        size="sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-slate-950 p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <Headphones className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-bold text-sm">No customer support queries found matching filters.</p>
            <p className="text-slate-500 text-xs">Customer submissions from the Contact Support page will show up here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};
