import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { SocialSettings } from '../../types';
import { 
  Share2, 
  Facebook, 
  Instagram, 
  Twitter, 
  Music2, 
  Youtube, 
  MessageCircle, 
  Linkedin, 
  Save, 
  Globe, 
  Sparkles,
  Eye,
  RefreshCw
} from 'lucide-react';

export const AdminSocial: React.FC = () => {
  const { socialSettings, updateSocialSettings } = useStore();
  const [formData, setFormData] = useState<SocialSettings>(socialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof SocialSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSocialSettings(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Share2 className="w-64 h-64 text-amber-400" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Footer & Community Integration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
            Social Media Channels & Links
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Configure social icons rendered across the website footer. Toggle platform visibility and manage destination profile links.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Community Header Options */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Community Badge & Title Settings</h3>
              <p className="text-xs text-slate-400">Customize the header label and follower counter displayed above social icons</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Section Headline Title
              </label>
              <input
                type="text"
                value={formData.communityTitle || ''}
                onChange={(e) => handleInputChange('communityTitle', e.target.value)}
                placeholder="e.g. Join Our Community"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Follower Base Badge / Count
              </label>
              <input
                type="text"
                value={formData.communityCount || ''}
                onChange={(e) => handleInputChange('communityCount', e.target.value)}
                placeholder="e.g. 150K+ or 250,000+ Fans"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Channels Configuration Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Social Media Platforms</h3>
                <p className="text-xs text-slate-400">Toggle enabled status and set direct profile destination URLs</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.facebookEnabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#1877F2]/10 border border-[#1877F2]/30 text-[#1877F2]">
                    <Facebook className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Facebook</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.facebookEnabled ?? true}
                    onChange={(e) => handleInputChange('facebookEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1877F2]" />
                </label>
              </div>
              <input
                type="text"
                value={formData.facebook || ''}
                onChange={(e) => handleInputChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-[#1877F2]"
              />
            </div>

            {/* Instagram */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.instagramEnabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-500">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Instagram</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.instagramEnabled ?? true}
                    onChange={(e) => handleInputChange('instagramEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500" />
                </label>
              </div>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Twitter / X */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.twitterEnabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
                    <Twitter className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">Twitter / X</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.twitterEnabled ?? true}
                    onChange={(e) => handleInputChange('twitterEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500" />
                </label>
              </div>
              <input
                type="text"
                value={formData.twitter || ''}
                onChange={(e) => handleInputChange('twitter', e.target.value)}
                placeholder="https://x.com/yourhandle"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-400"
              />
            </div>

            {/* TikTok */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.tiktokEnabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    <Music2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">TikTok</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.tiktokEnabled ?? true}
                    onChange={(e) => handleInputChange('tiktokEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500" />
                </label>
              </div>
              <input
                type="text"
                value={formData.tiktok || ''}
                onChange={(e) => handleInputChange('tiktok', e.target.value)}
                placeholder="https://tiktok.com/@yourhandle"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* YouTube */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.youtubeEnabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">YouTube</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.youtubeEnabled ?? false}
                    onChange={(e) => handleInputChange('youtubeEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500" />
                </label>
              </div>
              <input
                type="text"
                value={formData.youtube || ''}
                onChange={(e) => handleInputChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* WhatsApp */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.whatsappEnabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">WhatsApp</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.whatsappEnabled ?? true}
                    onChange={(e) => handleInputChange('whatsappEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                placeholder="https://wa.me/1234567890"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* LinkedIn */}
            <div className={`p-4 rounded-xl border transition-all ${
              formData.linkedinEnabled ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-800/50 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-600/30 text-blue-500">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-white">LinkedIn</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.linkedinEnabled ?? false}
                    onChange={(e) => handleInputChange('linkedinEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
              </div>
              <input
                type="text"
                value={formData.linkedin || ''}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourbrand"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Live Footer Preview Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Eye className="w-4 h-4" />
              <span>Real-Time Footer Preview</span>
            </div>
            <span className="text-[11px] text-slate-500">Live Customer View</span>
          </div>

          <div className="bg-slate-900/90 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-500" />
                <span>{formData.communityTitle || 'Join Our Community'}</span>
              </span>
              {formData.communityCount && (
                <span className="text-[10px] text-amber-400 font-bold">
                  {formData.communityCount}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {formData.facebookEnabled && formData.facebook && (
                <div className="w-9 h-9 bg-slate-800 text-[#1877F2] rounded-xl flex items-center justify-center border border-slate-700">
                  <Facebook className="w-4 h-4" />
                </div>
              )}
              {formData.instagramEnabled && formData.instagram && (
                <div className="w-9 h-9 bg-slate-800 text-pink-500 rounded-xl flex items-center justify-center border border-slate-700">
                  <Instagram className="w-4 h-4" />
                </div>
              )}
              {formData.twitterEnabled && formData.twitter && (
                <div className="w-9 h-9 bg-slate-800 text-sky-400 rounded-xl flex items-center justify-center border border-slate-700">
                  <Twitter className="w-4 h-4" />
                </div>
              )}
              {formData.tiktokEnabled && formData.tiktok && (
                <div className="w-9 h-9 bg-slate-800 text-cyan-400 rounded-xl flex items-center justify-center border border-slate-700">
                  <Music2 className="w-4 h-4" />
                </div>
              )}
              {formData.youtubeEnabled && formData.youtube && (
                <div className="w-9 h-9 bg-slate-800 text-red-500 rounded-xl flex items-center justify-center border border-slate-700">
                  <Youtube className="w-4 h-4" />
                </div>
              )}
              {formData.whatsappEnabled && formData.whatsapp && (
                <div className="w-9 h-9 bg-slate-800 text-emerald-400 rounded-xl flex items-center justify-center border border-slate-700">
                  <MessageCircle className="w-4 h-4" />
                </div>
              )}
              {formData.linkedinEnabled && formData.linkedin && (
                <div className="w-9 h-9 bg-slate-800 text-blue-500 rounded-xl flex items-center justify-center border border-slate-700">
                  <Linkedin className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Save className="w-4.5 h-4.5" />}
            <span>{isSaving ? 'Saving Changes...' : 'Save Social Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
