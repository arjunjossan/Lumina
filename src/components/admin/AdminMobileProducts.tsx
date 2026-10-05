import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Category, ProductSpec } from '../../types';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Check, 
  CheckCircle2,
  Lock,
  X, 
  AlertCircle, 
  Eye, 
  Upload, 
  RefreshCw, 
  Sparkles, 
  Tag, 
  Layers, 
  IndianRupee, 
  Database, 
  Percent, 
  AlignLeft, 
  Settings2, 
  Truck, 
  Film, 
  Image as ImageIcon, 
  Link, 
  Copy, 
  Loader2, 
  Smartphone, 
  Edit3 
} from 'lucide-react';
import { RichDescriptionRenderer } from '../common/RichDescriptionRenderer';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';
import { uploadProductMediaFile } from '../../lib/productMediaStorage';

export const AdminMobileProducts: React.FC = () => {
  const { 
    mobileProducts, 
    products: desktopProducts,
    updateMobileProduct, 
    deleteMobileProduct, 
    toggleMobileProductStatus, 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft' | 'winning'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('49.99');
  const [compareAtPrice, setCompareAtPrice] = useState('89.99');
  const [costPrice, setCostPrice] = useState('15.00');
  const [category, setCategory] = useState<Category>('Home Innovation');
  const [stock, setStock] = useState('25');
  const [status, setStatus] = useState<'Active' | 'Draft'>('Active');
  const [isWinningProduct, setIsWinningProduct] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isTrending, setIsTrending] = useState(true);
  const [badge, setBadge] = useState('🔥 MOBILE VIRAL PICK');
  const [codAllowed, setCodAllowed] = useState(true);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [imagesText, setImagesText] = useState('https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80');
  const [gifUrlsText, setGifUrlsText] = useState('');
  const [featuresText, setFeaturesText] = useState("360° Magnetic Levitation\nTouch Dimmable Warm Light\nBluetooth 5.3 Acoustic Audio");
  const [specifications, setSpecifications] = useState<ProductSpec[]>([
    { name: 'Material', value: 'Aerospace Grade Aluminum & ABS' },
    { name: 'Power Input', value: 'Type-C USB Fast Charging (5V/2A)' },
    { name: 'Dimensions', value: '180mm x 140mm x 65mm' },
    { name: 'Warranty', value: '1 Year Full Replacement Guarantee' }
  ]);
  const [shippingWarranty, setShippingWarranty] = useState('');
  const [showFeatures, setShowFeatures] = useState(true);
  const [showSpecs, setShowSpecs] = useState(true);
  const [showShippingWarranty, setShowShippingWarranty] = useState(true);

  // Description live preview toggle & image upload refs
  const [descriptionPreviewMode, setDescriptionPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [isUploadingDescMedia, setIsUploadingDescMedia] = useState(false);
  const [isMigratingDescBase64, setIsMigratingDescBase64] = useState(false);
  const [isDragOverDesc, setIsDragOverDesc] = useState(false);
  const [copiedMediaIndex, setCopiedMediaIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [productSaveState, setProductSaveState] = useState<SaveButtonState>('idle');
  const productImagesInputRef = useRef<HTMLInputElement>(null);
  const demoGifUploadInputRef = useRef<HTMLInputElement>(null);
  const descGifFileInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter products list
  const currentList = mobileProducts || [];
  const filteredProducts = currentList.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.subtitle && p.subtitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.badge && p.badge.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    const matchesStatus = 
      filterStatus === 'all' ? true :
      filterStatus === 'active' ? p.status === 'Active' :
      filterStatus === 'draft' ? p.status === 'Draft' :
      filterStatus === 'winning' ? p.isWinningProduct : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const isDesktopProduct = Boolean(
    editingProduct && (desktopProducts.some((dp) => dp.id === editingProduct.id) || desktopProducts.length > 0)
  );

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    const matchingDesktop = desktopProducts.find((dp) => dp.id === p.id);
    setTitle(matchingDesktop ? matchingDesktop.title : p.title);
    setSubtitle(matchingDesktop ? (matchingDesktop.marketingSubtitle ?? matchingDesktop.subtitle ?? '') : (p.subtitle || ''));
    setCategory(p.category || (matchingDesktop ? matchingDesktop.category : 'Home Innovation'));
    setShortDescription(matchingDesktop ? (matchingDesktop.shortDescription || '') : (p.shortDescription || ''));
    setSku(p.sku);
    setPrice(p.price.toString());
    setCompareAtPrice(p.compareAtPrice ? p.compareAtPrice.toString() : '');
    setCostPrice(p.costPrice ? p.costPrice.toString() : '');
    setStock(p.stock.toString());
    setStatus(p.status);
    setIsWinningProduct(!!p.isWinningProduct);
    setIsBestSeller(!!p.isBestSeller);
    setIsTrending(!!p.isTrending);
    setBadge(p.badge || '');
    setCodAllowed(p.codAllowed !== false);
    setDescription(p.description || (matchingDesktop?.description || ''));
    setImagesText(p.images && p.images.length > 0 ? p.images.join('\n') : (matchingDesktop?.images ? matchingDesktop.images.join('\n') : ''));
    setGifUrlsText(p.gifUrls ? p.gifUrls.join('\n') : '');
    setFeaturesText(p.features && p.features.length > 0 ? p.features.join('\n') : (matchingDesktop?.features ? matchingDesktop.features.join('\n') : ''));
    setSpecifications(p.specifications && p.specifications.length > 0 ? p.specifications : (matchingDesktop?.specifications && matchingDesktop.specifications.length > 0 ? matchingDesktop.specifications : [
      { name: 'Material', value: 'Aerospace Grade Aluminum & ABS' },
      { name: 'Power Input', value: 'Type-C USB Fast Charging (5V/2A)' },
      { name: 'Dimensions', value: '180mm x 140mm x 65mm' },
      { name: 'Warranty', value: '1 Year Full Replacement Guarantee' }
    ]));
    setShippingWarranty(p.shippingWarranty || (matchingDesktop?.shippingWarranty || ''));
    setShowFeatures(p.showFeatures !== false);
    setShowSpecs(p.showSpecs !== false);
    setShowShippingWarranty(p.showShippingWarranty !== false);
    setDescriptionPreviewMode('edit');
    setIsModalOpen(true);
  };

  // Spec management helpers
  const handleAddSpecRow = () => {
    setSpecifications([...specifications, { name: '', value: '' }]);
  };

  const handleUpdateSpec = (index: number, field: 'name' | 'value', val: string) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: val };
    setSpecifications(updated);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleAddSpecPreset = (presetName: string, defaultValue: string) => {
    if (!specifications.some(s => s.name.toLowerCase() === presetName.toLowerCase())) {
      setSpecifications([...specifications, { name: presetName, value: defaultValue }]);
    }
  };

  // Image Upload handler for product gallery (Direct Database Bucket Storage)
  const handleProductImageFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showNotification(`Uploading ${files.length} gallery image(s) to database storage...`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await uploadProductMediaFile(file, file.name, 'gallery');
        if (res.url) {
          setImagesText((prev) => (prev.trim() ? `${prev.trim()}\n${res.url}` : res.url));
        }
      } catch (err) {
        console.warn('Gallery upload notice:', err);
      }
    }
    showNotification(`✅ Gallery images stored in database bucket!`);
    if (e.target) e.target.value = '';
  };

  // Core unified helper to upload image/GIF to Supabase database bucket storage and insert into description at exact caret/cursor position
  const uploadAndInsertMediaAtCursor = async (file: File, cursorStart?: number, cursorEnd?: number) => {
    setIsUploadingDescMedia(true);
    const cleanName = file.name ? file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9 _-]/g, " ").trim() : 'Visual Asset';

    const insertTagIntoDescription = (tag: string) => {
      setDescription((currentDesc) => {
        const textarea = descriptionTextareaRef.current;
        const start = cursorStart !== undefined ? cursorStart : (textarea ? textarea.selectionStart : currentDesc.length);
        const end = cursorEnd !== undefined ? cursorEnd : (textarea ? textarea.selectionEnd : currentDesc.length);

        const before = currentDesc.substring(0, start);
        const after = currentDesc.substring(end);
        
        const needsLeadingNewline = before.length > 0 && !before.endsWith('\n\n') && !before.endsWith('\n');
        const needsTrailingNewline = after.length > 0 && !after.startsWith('\n\n') && !after.startsWith('\n');

        const formattedTag = `${needsLeadingNewline ? '\n\n' : ''}${tag}${needsTrailingNewline ? '\n\n' : ''}`;
        const updated = before + formattedTag + after;

        setTimeout(() => {
          if (descriptionTextareaRef.current) {
            const nextCursor = start + formattedTag.length;
            descriptionTextareaRef.current.focus();
            descriptionTextareaRef.current.setSelectionRange(nextCursor, nextCursor);
          }
        }, 60);

        return updated;
      });
    };

    try {
      const res = await uploadProductMediaFile(file, file.name, 'descriptions');

      if (res.url) {
        const markdownTag = `![${cleanName || 'Demonstration Media'}](${res.url})`;
        insertTagIntoDescription(markdownTag);

        if (res.source === 'supabase_bucket') {
          showNotification(`🚀 Uploaded directly to database storage bucket '${res.bucket}' (${(file.size / 1024).toFixed(1)} KB)!`);
        } else if (res.source === 'server_storage') {
          showNotification(`📋 Uploaded to server storage & inserted (${(file.size / 1024).toFixed(1)} KB)!`);
        } else {
          showNotification(`📋 Visual pasted directly into description.`);
        }
      } else {
        showNotification('Could not process media file.');
      }
    } catch (err: any) {
      console.warn('Upload media error:', err);
      showNotification('Failed to upload to storage bucket. Please verify bucket setup.');
    } finally {
      setIsUploadingDescMedia(false);
    }
  };

  // Upload and insert hosted GIF or Image directly from file picker
  const handleDescGifFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const textarea = descriptionTextareaRef.current;
    const startPos = textarea ? textarea.selectionStart : undefined;
    const endPos = textarea ? textarea.selectionEnd : undefined;
    await uploadAndInsertMediaAtCursor(file, startPos, endPos);
    if (e.target) e.target.value = '';
  };

  // Direct Clipboard Paste handler for Description textarea (Ctrl+V / Cmd+V)
  const handleDescriptionPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      const textarea = descriptionTextareaRef.current;
      const startPos = textarea ? textarea.selectionStart : undefined;
      const endPos = textarea ? textarea.selectionEnd : undefined;

      for (const file of imageFiles) {
        await uploadAndInsertMediaAtCursor(file, startPos, endPos);
      }
    }
  };

  // Drag-and-drop media directly into textarea
  const handleDescriptionDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragOverDesc(false);
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const imageFiles: File[] = (Array.from(files) as File[]).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      const textarea = descriptionTextareaRef.current;
      const startPos = textarea ? textarea.selectionStart : undefined;
      const endPos = textarea ? textarea.selectionEnd : undefined;

      for (const file of imageFiles) {
        await uploadAndInsertMediaAtCursor(file, startPos, endPos);
      }
    }
  };

  const handleInsertGifUrlToDescription = () => {
    const url = window.prompt("Enter GIF or Image URL to embed into description (e.g. https://media.giphy.com/... or /uploads/images/...):");
    if (url && url.trim()) {
      const markdownGif = `![Visual Demonstration](${url.trim()})`;
      const textarea = descriptionTextareaRef.current;
      const startPos = textarea ? textarea.selectionStart : undefined;
      const endPos = textarea ? textarea.selectionEnd : undefined;
      
      setDescription((currentDesc) => {
        const start = startPos !== undefined ? startPos : currentDesc.length;
        const end = endPos !== undefined ? endPos : currentDesc.length;
        const before = currentDesc.substring(0, start);
        const after = currentDesc.substring(end);
        const needsLeadingNewline = before.length > 0 && !before.endsWith('\n\n') && !before.endsWith('\n');
        const needsTrailingNewline = after.length > 0 && !after.startsWith('\n\n') && !after.startsWith('\n');
        const formattedTag = `${needsLeadingNewline ? '\n\n' : ''}${markdownGif}${needsTrailingNewline ? '\n\n' : ''}`;
        return before + formattedTag + after;
      });
      showNotification('Inserted media URL at cursor position.');
    }
  };

  // Helper to extract embedded markdown images/GIFs from the description
  const extractEmbeddedMedia = (text: string) => {
    if (!text) return [];
    const regex = /!\[(.*?)\]\((.*?)\)/g;
    const matches: { alt: string; url: string; raw: string; isBase64: boolean }[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        alt: match[1] || 'Product Visual',
        url: match[2],
        raw: match[0],
        isBase64: match[2].startsWith('data:image')
      });
    }
    return matches;
  };

  // One-click cleaner to convert legacy Base64 in description to Supabase Storage bucket URLs
  const handleCleanBase64InDescription = async () => {
    const mediaList = extractEmbeddedMedia(description);
    const base64Items = mediaList.filter(m => m.isBase64);
    if (base64Items.length === 0) {
      showNotification('No Base64 strings detected in description. Everything is clean!');
      return;
    }

    setIsMigratingDescBase64(true);
    let updatedDesc = description;
    let convertedCount = 0;

    for (const item of base64Items) {
      try {
        const fetchRes = await fetch(item.url);
        const blob = await fetchRes.blob();
        const res = await uploadProductMediaFile(blob, `${item.alt || 'migrated_media'}.png`, 'descriptions');
        if (res.url) {
          const newTag = `![${item.alt}](${res.url})`;
          updatedDesc = updatedDesc.replace(item.raw, newTag);
          convertedCount++;
        }
      } catch (err) {
        console.warn('Migration error for item notice:', err);
      }
    }

    setDescription(updatedDesc);
    setIsMigratingDescBase64(false);
    showNotification(`✨ Successfully converted ${convertedCount} base64 images into database bucket URLs!`);
  };

  const handleRemoveEmbeddedMedia = (rawTag: string) => {
    setDescription(prev => prev.replace(rawTag, '').trim());
    showNotification('Removed media attachment from description.');
  };

  const parsedImageList = imagesText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleRemoveImageAtIndex = (idx: number) => {
    const updated = parsedImageList.filter((_, i) => i !== idx);
    setImagesText(updated.join('\n'));
  };

  const handleSetPrimaryImage = (idx: number) => {
    if (idx === 0) return;
    const selected = parsedImageList[idx];
    const rest = parsedImageList.filter((_, i) => i !== idx);
    setImagesText([selected, ...rest].join('\n'));
  };

  // Live Demonstration GIF Upload & List Management (Direct Database Bucket Storage)
  const handleDemoGifFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showNotification(`Uploading ${files.length} demo GIF(s) to database bucket...`);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const res = await uploadProductMediaFile(file, file.name, 'gifs');
        if (res.url) {
          setGifUrlsText((prev) => (prev.trim() ? `${prev.trim()}\n${res.url}` : res.url));
        }
      } catch (err) {
        console.warn('Demo GIF upload error:', err);
      }
    }
    showNotification(`✅ Demonstration GIFs saved to database bucket!`);
    if (e.target) e.target.value = '';
  };

  const parsedGifList = gifUrlsText
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);

  const handleRemoveGifAtIndex = (idx: number) => {
    const updated = parsedGifList.filter((_, i) => i !== idx);
    setGifUrlsText(updated.join('\n'));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setProductSaveState('saving');

    const imageArray = imagesText.split('\n').map(s => s.trim()).filter(Boolean);
    const gifArray = gifUrlsText.split('\n').map(s => s.trim()).filter(Boolean);
    const featureArray = featuresText.split('\n').map(s => s.trim()).filter(Boolean);
    const validSpecs = specifications.filter(s => s.name.trim() || s.value.trim());

    const defaultSpecs: ProductSpec[] = [
      { name: 'Warranty', value: '1 Year Full Replacement' },
      { name: 'Package', value: 'Includes Device, Manual & Type-C Cable' }
    ];

    const finalSpecs = validSpecs.length ? validSpecs : defaultSpecs;

    if (editingProduct) {
      const matchingDesktop = desktopProducts.find(dp => dp.id === editingProduct.id);
      const finalTitle = matchingDesktop ? matchingDesktop.title : title;
      const finalSubtitle = matchingDesktop ? (matchingDesktop.marketingSubtitle ?? matchingDesktop.subtitle) : (subtitle.trim() || undefined);
      const finalCategory = category;
      const finalShortDescription = matchingDesktop ? matchingDesktop.shortDescription : shortDescription;

      updateMobileProduct({
        ...editingProduct,
        title: finalTitle,
        subtitle: finalSubtitle,
        marketingSubtitle: finalSubtitle,
        sku,
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        category: finalCategory,
        stock: parseInt(stock, 10) || 0,
        status,
        isWinningProduct,
        isBestSeller,
        isTrending,
        badge: badge.trim() || undefined,
        codAllowed,
        shortDescription: finalShortDescription,
        description,
        images: imageArray.length ? imageArray : [editingProduct.images[0]],
        gifUrls: gifArray.length ? gifArray : undefined,
        features: featureArray.length ? featureArray : editingProduct.features,
        specifications: finalSpecs,
        shippingWarranty: shippingWarranty.trim() || undefined,
        showFeatures,
        showSpecs,
        showShippingWarranty
      });
    }

    setProductSaveState('saved');
    setTimeout(() => {
      setProductSaveState('idle');
      setIsModalOpen(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner / Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">Mobile Product Catalog</h2>
          <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
            {currentList.length} Mobile Products
          </span>
        </div>

        {/* Synchronization Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Synced with Desktop Catalog ({desktopProducts.length} Products)</span>
          </div>
        </div>
      </div>

      {/* MOBILE PRODUCTS LIST */}
      <div className="space-y-4">
        {/* Filters Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search mobile items by title, SKU, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category & Status Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Categories</option>
              <option value="Home Innovation">Home Innovation</option>
              <option value="Smart Gadgets">Smart Gadgets</option>
              <option value="Tech & Audio">Tech & Audio</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Lifestyle">Lifestyle</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:border-amber-500 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="draft">Drafts Only</option>
              <option value="winning">⭐ Winning Picks Only</option>
            </select>
          </div>
        </div>

        {/* Products Table Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mobile Product</th>
                  <th className="py-3.5 px-4">Category & SKU</th>
                  <th className="py-3.5 px-4">Price (₹)</th>
                  <th className="py-3.5 px-4">Inventory</th>
                  <th className="py-3.5 px-4">Badges</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <Smartphone className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                      <p className="font-semibold text-sm text-slate-400">No mobile products found</p>
                      <p className="text-xs mt-1">Try adjusting your search filter or add new products via the Desktop Product Catalog.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const primaryImg = product.images?.[0] || 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80';
                    return (
                      <tr key={product.id} className="hover:bg-slate-800/40 transition-colors group">
                        {/* Product Info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0 relative">
                              <img
                                src={primaryImg}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                              {product.isWinningProduct && (
                                <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-slate-950" />
                              )}
                            </div>
                            <div className="space-y-0.5 min-w-0 max-w-xs">
                              <div className="font-bold text-white truncate text-sm flex items-center gap-1.5">
                                <span>{product.title}</span>
                                {product.isWinningProduct && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-1.5 py-0.2 rounded">
                                    ⭐ WINNER
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {product.subtitle || product.shortDescription || 'No subtitle'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category & SKU */}
                        <td className="py-3 px-4 text-slate-300">
                          <div className="font-medium text-slate-200">{product.category}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{product.sku || product.id}</div>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-amber-400 text-sm">
                            ₹{product.price.toLocaleString('en-IN')}
                          </div>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <div className="text-[11px] text-slate-500 line-through">
                              ₹{product.compareAtPrice.toLocaleString('en-IN')}
                            </div>
                          )}
                        </td>

                        {/* Inventory */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            product.stock <= 5 
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                              : product.stock <= 15
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {product.stock} in stock
                          </span>
                        </td>

                        {/* Badges */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {product.badge && (
                              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {product.badge}
                              </span>
                            )}
                            {product.isTrending && (
                              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                Trending
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleMobileProductStatus(product.id)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border transition-all cursor-pointer ${
                              product.status === 'Active'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {product.status}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingProductId(product.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRODUCT CREATE / EDIT MODAL (MATCHING DESKTOP STRUCTURE & LAYOUT EXACTLY) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
          <div className="bg-slate-900 my-auto rounded-3xl max-w-6xl w-full border border-slate-800 shadow-2xl shadow-black/80 flex flex-col max-h-[92vh] overflow-hidden text-xs text-slate-200">
            
            {/* STICKY MODAL HEADER */}
            <div className="px-5 py-4 sm:px-6 sm:py-4.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white font-serif tracking-tight truncate">
                      Edit Mobile Product Catalog Entry
                    </h3>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold shrink-0">
                      {sku || 'NO SKU'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                      status === 'Active' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      ● {status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {editingProduct ? `Updating SKU ${editingProduct.sku} • Linked to Desktop Product Catalog` : 'Configure mobile product customizations'}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-3"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL FORM & BODY (2-COLUMN RESPONSIVE LAYOUT) */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
              <div className="p-4 sm:p-6 lg:p-7 space-y-6 flex-1">
                {isDesktopProduct && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
                    <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400 shrink-0 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-amber-300">Synchronized with Desktop Product Catalog</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Core identity fields (<strong className="text-slate-200">Product Title</strong>, <strong className="text-slate-200">Marketing Subtitle</strong>, and <strong className="text-slate-200">Short Description</strong>) are fixed to maintain brand consistency across desktop and mobile. All other options (categories, long descriptions with images, media gallery, GIFs, pricing, specifications, and shipping policies) are editable individually.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* LEFT COLUMN: PRIMARY DETAILS, MEDIA, DESCRIPTION, SPECS (8 COLS) */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* SECTION 1: PRODUCT IDENTITY & CORE MARKETING */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Tag className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product Identity & Marketing Hook</h4>
                            <p className="text-[10px] text-slate-400">Main storefront titles, positioning tagline, and benefits</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Product Title */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                              Product Title <span className="text-amber-400">*</span>
                            </label>
                            {isDesktopProduct && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Fixed from Desktop Catalog
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isDesktopProduct}
                            placeholder="e.g. AuraSphere 360° Magnetic Levitation Ambient Lamp"
                            required
                            className={`w-full p-3 rounded-xl text-xs font-medium transition-all ${
                              isDesktopProduct
                                ? 'bg-slate-900/40 border border-slate-800 text-slate-400 cursor-not-allowed select-none'
                                : 'bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none'
                            }`}
                          />
                          {isDesktopProduct && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              Managed in Desktop Product Catalog to keep the product name consistent across the website.
                            </p>
                          )}
                        </div>

                        {/* Subtitle / Marketing Tagline */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                              Marketing Subtitle / Tagline
                            </label>
                            {isDesktopProduct ? (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Fixed from Desktop Catalog
                              </span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Displayed prominently beneath main title
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            disabled={isDesktopProduct}
                            placeholder="e.g. Floating Warm Light with Built-in Hi-Fi Bluetooth Speaker"
                            className={`w-full p-2.5 rounded-xl text-xs transition-all ${
                              isDesktopProduct
                                ? 'bg-slate-900/40 border border-slate-800 text-slate-400 cursor-not-allowed select-none'
                                : 'bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none'
                            }`}
                          />
                          {isDesktopProduct && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              Managed in Desktop Product Catalog to ensure marketing messaging alignment.
                            </p>
                          )}
                        </div>

                        {/* Short Description */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                              Short Teaser Description (1-2 Sentences) <span className="text-amber-400">*</span>
                            </label>
                            {isDesktopProduct && (
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Fixed from Desktop Catalog
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            disabled={isDesktopProduct}
                            required
                            placeholder="e.g. Zero-gravity floating levitation orb with dimmable ambient glow and 360° acoustic chamber."
                            className={`w-full p-2.5 rounded-xl text-xs transition-all ${
                              isDesktopProduct
                                ? 'bg-slate-900/40 border border-slate-800 text-slate-400 cursor-not-allowed select-none'
                                : 'bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none'
                            }`}
                          />
                          {isDesktopProduct && (
                            <p className="text-[10px] text-slate-500 mt-1">
                              Managed in Desktop Product Catalog to keep the summary consistent across desktop and mobile.
                            </p>
                          )}
                        </div>

                        {/* Key Features Bullet Points */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <div>
                              <label className="text-[11px] font-bold text-slate-300 block">
                                Key Feature Highlights (One feature per line) <span className="text-amber-400">*</span>
                              </label>
                              <span className="text-[10px] text-slate-400">Displayed in quick benefit checklist and feature card</span>
                            </div>
                            
                            {/* Key Highlights Section Visibility Toggle */}
                            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl">
                              <span className="text-[10px] font-bold text-slate-300">
                                {showFeatures ? 'Shown on Page' : 'Hidden on Page'}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={showFeatures}
                                onClick={() => setShowFeatures(!showFeatures)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  showFeatures ? 'bg-amber-500' : 'bg-slate-700'
                                }`}
                                title="Toggle visibility of Key Features on the product page"
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow transition duration-200 ease-in-out ${
                                    showFeatures ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                          <textarea
                            rows={3}
                            value={featuresText}
                            onChange={(e) => setFeaturesText(e.target.value)}
                            required
                            placeholder="Zero-gravity magnetic levitation&#10;Stepless touch dimming warm light&#10;Bluetooth 5.3 Acoustic Audio Chamber"
                            className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: UPLOAD PHOTOS FOR THE PRODUCT */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product Photos & Catalog Gallery</h4>
                            <p className="text-[10px] text-slate-400">High-resolution catalog photography, cover images, and product angles</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={productImagesInputRef}
                            multiple
                            accept="image/*"
                            onChange={handleProductImageFilesUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => productImagesInputRef.current?.click()}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image File(s)</span>
                          </button>
                        </div>
                      </div>

                      {/* Active Image Gallery Queue */}
                      {parsedImageList.length > 0 && (
                        <div className="space-y-2 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>Gallery Order ({parsedImageList.length} assets)</span>
                            </span>
                            <span className="text-[10px] text-slate-400">First image acts as primary storefront cover</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                            {parsedImageList.map((imgUrl, idx) => (
                              <div 
                                key={idx} 
                                className={`relative group rounded-xl overflow-hidden border bg-slate-900 aspect-square flex items-center justify-center transition-all ${
                                  idx === 0 ? 'border-amber-500 ring-2 ring-amber-500/30 shadow-md' : 'border-slate-800 hover:border-slate-600'
                                }`}
                              >
                                <img 
                                  src={imgUrl} 
                                  alt={`Product ${idx}`} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80';
                                  }}
                                />
                                
                                <div className={`absolute top-1 left-1 backdrop-blur-xs text-[9px] font-bold px-1.5 py-0.5 rounded shadow ${
                                  idx === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-950/80 text-white'
                                }`}>
                                  {idx === 0 ? '★ Cover' : `#${idx + 1}`}
                                </div>

                                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1.5">
                                  {idx !== 0 && (
                                    <button
                                      type="button"
                                      onClick={() => handleSetPrimaryImage(idx)}
                                      className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-1 rounded-lg hover:bg-amber-400 w-full text-center transition-colors cursor-pointer"
                                    >
                                      Make Cover
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImageAtIndex(idx)}
                                    className="text-[10px] bg-rose-600 text-white font-bold px-2 py-1 rounded-lg hover:bg-rose-500 w-full text-center transition-colors cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Image URLs Input */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                          Image URLs (One URL or base64 data string per line) <span className="text-amber-400">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={imagesText}
                          onChange={(e) => setImagesText(e.target.value)}
                          required
                          placeholder="https://images.unsplash.com/photo-...&#10;https://images.unsplash.com/photo-..."
                          className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl font-mono text-[11px] text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* SECTION 3: COMPREHENSIVE PRODUCT DESCRIPTION & LIVE PREVIEW */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                            <AlignLeft className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Detailed Description & Customer View</h4>
                              {extractEmbeddedMedia(description).length > 0 && (
                                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                                  {extractEmbeddedMedia(description).length} Visual Assets
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400">Upload or paste GIFs/images directly to database storage buckets, format headings, and preview customer view</p>
                          </div>
                        </div>

                        {/* Editor Action Buttons & View Mode Toggle */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <input
                            type="file"
                            ref={descGifFileInputRef}
                            accept="image/gif,image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleDescGifFileUpload}
                            className="hidden"
                          />
                          
                          {/* Upload GIF/Image button with direct database bucket storage */}
                          <button
                            type="button"
                            disabled={isUploadingDescMedia}
                            onClick={() => descGifFileInputRef.current?.click()}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                            title="Upload GIF or Image directly to database storage bucket"
                          >
                            {isUploadingDescMedia ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3" />
                                <span>+ Upload GIF/Image</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleInsertGifUrlToDescription}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Link className="w-3 h-3 text-amber-400" />
                            <span>+ Media URL</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const textarea = descriptionTextareaRef.current;
                              const start = textarea ? textarea.selectionStart : description.length;
                              const end = textarea ? textarea.selectionEnd : description.length;
                              const before = description.substring(0, start);
                              const after = description.substring(end);
                              const heading = `\n\n### New Section Heading\n`;
                              setDescription(before + heading + after);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-slate-700 cursor-pointer"
                          >
                            + Heading
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const textarea = descriptionTextareaRef.current;
                              const start = textarea ? textarea.selectionStart : description.length;
                              const end = textarea ? textarea.selectionEnd : description.length;
                              const before = description.substring(0, start);
                              const after = description.substring(end);
                              const bullets = `\n\n- Benefit feature bullet 1\n- Benefit feature bullet 2\n- Benefit feature bullet 3\n`;
                              setDescription(before + bullets + after);
                            }}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-slate-700 cursor-pointer"
                          >
                            + List
                          </button>

                          {/* Toggle Edit vs Live View */}
                          <div className="flex bg-slate-900 border border-slate-700 rounded-lg p-0.5 ml-1">
                            <button
                              type="button"
                              onClick={() => setDescriptionPreviewMode('edit')}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                                descriptionPreviewMode === 'edit'
                                  ? 'bg-amber-500 text-slate-950 shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Edit Markdown
                            </button>
                            <button
                              type="button"
                              onClick={() => setDescriptionPreviewMode('preview')}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                descriptionPreviewMode === 'preview'
                                  ? 'bg-amber-500 text-slate-950 shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                              <span>Live Customer View</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Clean Base64 Alert Banner if Base64 detected */}
                      {extractEmbeddedMedia(description).some(m => m.isBase64) && (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-3 text-amber-200 text-xs">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              <strong>Base64 Strings Detected:</strong> Some media in this description are stored as raw text. Click to convert them to lightweight database bucket files.
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={isMigratingDescBase64}
                            onClick={handleCleanBase64InDescription}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm text-xs disabled:opacity-50"
                          >
                            {isMigratingDescBase64 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                            <span>Convert to Bucket Files</span>
                          </button>
                        </div>
                      )}

                      {/* EDIT MODE: Textarea with Drag & Drop and Clipboard Paste */}
                      {descriptionPreviewMode === 'edit' ? (
                        <div className="space-y-3">
                          <div 
                            className={`relative rounded-xl transition-all ${
                              isDragOverDesc ? 'ring-2 ring-amber-500 bg-amber-500/5' : ''
                            }`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragOverDesc(true); }}
                            onDragLeave={() => setIsDragOverDesc(false)}
                            onDrop={handleDescriptionDrop}
                          >
                            <textarea
                              ref={descriptionTextareaRef}
                              rows={8}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              onPaste={handleDescriptionPaste}
                              placeholder="Type product story, customer problem & solution. Paste (Ctrl+V) or Drag & Drop images/GIFs directly here to store them automatically in the database bucket..."
                              className="w-full p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all leading-relaxed"
                            />

                            {isDragOverDesc && (
                              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs rounded-xl flex items-center justify-center text-amber-400 font-bold text-xs pointer-events-none border-2 border-dashed border-amber-400">
                                Drop image or GIF to upload to database bucket & insert into description...
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                            <span className="flex items-center gap-1">
                              <span>💡 Tip:</span> Press <strong>Ctrl+V / Cmd+V</strong> with any image copied to your clipboard to insert directly into database storage!
                            </span>
                            <span>Supports Markdown (# Headings, - Lists, **Bold**)</span>
                          </div>
                        </div>
                      ) : (
                        /* PREVIEW MODE: Live Customer Storefront View */
                        <div className="p-5 bg-slate-900 rounded-xl border border-slate-700/80 min-h-[200px]">
                          <div className="border-b border-slate-800 pb-2 mb-4 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Storefront Customer Preview</span>
                            </span>
                            <span className="text-[10px] text-slate-400">Rendered exactly as seen on mobile product page</span>
                          </div>

                          {description ? (
                            <RichDescriptionRenderer content={description} className="text-white text-xs" />
                          ) : (
                            <div className="text-slate-500 text-center py-8 italic">
                              Description is currently empty. Switch to "Edit Markdown" to add marketing copy and demonstration visuals.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Visual Media Embedded Assets Management */}
                      {extractEmbeddedMedia(description).length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 space-y-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Attached Visual Media Assets in Description ({extractEmbeddedMedia(description).length})
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {extractEmbeddedMedia(description).map((media, idx) => (
                              <div key={idx} className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                                  <img src={media.url} alt={media.alt} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-bold text-white truncate">{media.alt || 'Asset'}</p>
                                  <p className="text-[9px] text-slate-400 truncate">
                                    {media.isBase64 ? '⚠️ Base64 String' : 'Database Storage Bucket'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(media.raw);
                                      setCopiedMediaIndex(idx);
                                      setTimeout(() => setCopiedMediaIndex(null), 2000);
                                      showNotification('Copied markdown tag to clipboard!');
                                    }}
                                    className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                                    title="Copy Markdown Tag"
                                  >
                                    {copiedMediaIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEmbeddedMedia(media.raw)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                                    title="Remove from description"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SECTION 4: TECHNICAL SPECIFICATIONS */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Settings2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Technical Specifications</h4>
                            <p className="text-[10px] text-slate-400">Structured parameters, materials, power requirements, dimensions</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Visibility Toggle */}
                          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl">
                            <span className="text-[10px] font-bold text-slate-300">
                              {showSpecs ? 'Shown on Page' : 'Hidden on Page'}
                            </span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={showSpecs}
                              onClick={() => setShowSpecs(!showSpecs)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                showSpecs ? 'bg-amber-500' : 'bg-slate-700'
                              }`}
                              title="Toggle visibility of Technical Specs on the product page"
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow transition duration-200 ease-in-out ${
                                  showSpecs ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={handleAddSpecRow}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1 text-xs cursor-pointer transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Spec Row</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Spec Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => handleAddSpecPreset('Material', 'Aerospace Grade Aluminum & ABS')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          + Material
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSpecPreset('Power Input', 'Type-C USB Fast Charging (5V/2A)')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          + Power Input
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSpecPreset('Dimensions', '180mm x 140mm x 65mm')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          + Dimensions
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSpecPreset('Battery Capacity', '4000mAh Lithium-Ion Rechargeable')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          + Battery
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSpecPreset('Connectivity', 'Bluetooth 5.3 High Definition Audio')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          + Connectivity
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddSpecPreset('Weight', '680g Lightweight Portable')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          + Weight
                        </button>
                      </div>

                      {/* Spec Rows */}
                      <div className="space-y-2">
                        {specifications.map((spec, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleUpdateSpec(idx, 'name', e.target.value)}
                              placeholder="Parameter (e.g. Material)"
                              className="w-1/3 p-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-semibold focus:border-amber-500 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                              placeholder="Value (e.g. Aerospace Aluminum & ABS)"
                              className="w-2/3 p-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs focus:border-amber-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(idx)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl cursor-pointer"
                              title="Delete Row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 5: SHIPPING & WARRANTY DETAILS */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Shipping & Warranty Information</h4>
                            <p className="text-[10px] text-slate-400">Delivery dispatch timelines, replacement guarantee, and customer protection</p>
                          </div>
                        </div>

                        {/* Visibility Toggle */}
                        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-300">
                            {showShippingWarranty ? 'Shown on Page' : 'Hidden on Page'}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={showShippingWarranty}
                            onClick={() => setShowShippingWarranty(!showShippingWarranty)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              showShippingWarranty ? 'bg-amber-500' : 'bg-slate-700'
                            }`}
                            title="Toggle visibility of Shipping & Warranty on the product page"
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow transition duration-200 ease-in-out ${
                                showShippingWarranty ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Quick Templates */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-slate-400">Quick Templates:</span>
                        <button
                          type="button"
                          onClick={() => setShippingWarranty('All orders are dispatched within 24 hours via express air logistics. Delivery typically takes 2-4 business days across India. Includes 1-Year Full Replacement Warranty.')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Standard Express (1-3 Days)
                        </button>
                        <button
                          type="button"
                          onClick={() => setShippingWarranty('Heavy items are delivered via dedicated surface logistics with insured transit and white-glove doorstep delivery. Includes 2-Year Manufacturer Replacement Guarantee.')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Heavy Appliance Template
                        </button>
                        <button
                          type="button"
                          onClick={() => setShippingWarranty('Delicate electronics packaged with dual air-cushioned chambers and shock indicators. Enjoy a 7-day hassle-free doorstep replacement guarantee if transit damage occurs.')}
                          className="text-[10px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                        >
                          Fragile Electronics
                        </button>
                      </div>

                      <div>
                        <textarea
                          rows={3}
                          value={shippingWarranty}
                          onChange={(e) => setShippingWarranty(e.target.value)}
                          placeholder="e.g. Dispatched in 24 hours with express tracking. 7 days easy return & 1 year full replacement guarantee..."
                          className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* SECTION 6: LIVE DEMONSTRATION & VIDEO LOOPS */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Film className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Live Demonstration (Animated GIFs / Video Loops)</h4>
                            <p className="text-[10px] text-slate-400">Featured in dedicated demonstration banner section</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={demoGifUploadInputRef}
                            multiple
                            accept="image/gif,image/webp,video/mp4"
                            onChange={handleDemoGifFilesUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => demoGifUploadInputRef.current?.click()}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload GIF File(s)</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                          Demonstration Video / GIF URLs (One URL per line)
                        </label>
                        <textarea
                          rows={2}
                          value={gifUrlsText}
                          onChange={(e) => setGifUrlsText(e.target.value)}
                          placeholder="https://media.giphy.com/media/...&#10;https://..."
                          className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl font-mono text-[11px] text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Demonstration GIF Thumbnails */}
                      {parsedGifList.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                          {parsedGifList.map((gifUrl, idx) => (
                            <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video flex items-center justify-center">
                              <img src={gifUrl} alt={`Demo ${idx}`} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveGifAtIndex(idx)}
                                  className="text-[10px] bg-rose-600 text-white font-bold px-2 py-1 rounded-lg hover:bg-rose-500 transition-colors cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* RIGHT COLUMN: PRICING, INVENTORY, SKU, BADGES & CATEGORIES (4 COLS) */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* CARD 1: PUBLISHING & STOREFRONT VISIBILITY */}
                    <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Publishing & Status</h4>
                          <p className="text-[10px] text-slate-400">Visibility and marketing triggers</p>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        {/* Status Selection */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Publish Status
                          </label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'Active' | 'Draft')}
                            className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-semibold focus:border-amber-500 focus:outline-none cursor-pointer"
                          >
                            <option value="Active">🟢 Active (Live on Storefront)</option>
                            <option value="Draft">🟡 Draft (Hidden from Buyers)</option>
                          </select>
                        </div>

                        {/* Promotional Tag / Badge */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Promotional Badge (Storefront Pill)
                          </label>
                          <input
                            type="text"
                            value={badge}
                            onChange={(e) => setBadge(e.target.value)}
                            placeholder="e.g. 🔥 VIRAL PICK or ⚡ LIMITED DROP"
                            className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* Feature Toggles */}
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                            <input
                              type="checkbox"
                              checked={isWinningProduct}
                              onChange={(e) => setIsWinningProduct(e.target.checked)}
                              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                            />
                            <span>⭐ Winning Product Spotlight</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                            <input
                              type="checkbox"
                              checked={isBestSeller}
                              onChange={(e) => setIsBestSeller(e.target.checked)}
                              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                            />
                            <span>🏆 Best Seller Badge</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                            <input
                              type="checkbox"
                              checked={isTrending}
                              onChange={(e) => setIsTrending(e.target.checked)}
                              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                            />
                            <span>🔥 Trending Now</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-white">
                            <input
                              type="checkbox"
                              checked={codAllowed}
                              onChange={(e) => setCodAllowed(e.target.checked)}
                              className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                            />
                            <span>💵 Cash on Delivery (COD) Allowed</span>
                          </label>
                        </div>

                        {/* Storefront Section Toggles Group */}
                        <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Storefront Tab & Section Visibility
                          </label>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Key Feature Highlights</span>
                              <input
                                type="checkbox"
                                checked={showFeatures}
                                onChange={(e) => setShowFeatures(e.target.checked)}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Technical Specifications</span>
                              <input
                                type="checkbox"
                                checked={showSpecs}
                                onChange={(e) => setShowSpecs(e.target.checked)}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-slate-300">Shipping & Warranty Info</span>
                              <input
                                type="checkbox"
                                checked={showShippingWarranty}
                                onChange={(e) => setShowShippingWarranty(e.target.checked)}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/30"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD 2: PRICING & MARGIN ANALYTICS */}
                    <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <IndianRupee className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Pricing & Margins</h4>
                          <p className="text-[10px] text-slate-400">Commercial retail and cost pricing</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Selling Price */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Selling Price (₹) <span className="text-amber-400">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-amber-400 font-bold">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              required
                              placeholder="49.99"
                              className="w-full pl-7 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-bold focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Compare At / MSRP */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Compare At / MSRP (₹)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={compareAtPrice}
                              onChange={(e) => setCompareAtPrice(e.target.value)}
                              placeholder="89.99"
                              className="w-full pl-7 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Cost Price */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Cost of Goods (₹) (Profit Analytics)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={costPrice}
                              onChange={(e) => setCostPrice(e.target.value)}
                              placeholder="15.00"
                              className="w-full pl-7 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* LIVE PROFIT MARGIN WIDGET */}
                        {parseFloat(price) > 0 && (
                          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 mt-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 font-semibold flex items-center gap-1">
                                <Percent className="w-3 h-3 text-emerald-400" />
                                <span>Gross Margin</span>
                              </span>
                              <span className={`font-mono font-bold px-2 py-0.5 rounded-full text-[10px] ${
                                (parseFloat(price) - (parseFloat(costPrice) || 0)) > 0 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-slate-800 text-slate-300'
                              }`}>
                                {(((parseFloat(price) - (parseFloat(costPrice) || 0)) / parseFloat(price)) * 100).toFixed(1)}% Margin
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between pt-1.5 border-t border-slate-800">
                              <span className="text-[10px] text-slate-400">Est. Unit Profit:</span>
                              <span className="text-sm font-black text-emerald-400 font-mono">
                                +₹{Math.max(0, parseFloat(price) - (parseFloat(costPrice) || 0)).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CARD 3: INVENTORY & SKU CODE */}
                    <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Inventory & SKU</h4>
                          <p className="text-[10px] text-slate-400">Warehouse stock & identifier</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* SKU Code */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-slate-300">
                              SKU Code <span className="text-amber-400">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setSku(`MOB-${Math.floor(100 + Math.random() * 900)}`)}
                              className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                            >
                              + Auto-Generate
                            </button>
                          </div>
                          <input
                            type="text"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            required
                            className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl font-mono text-white text-xs uppercase focus:border-amber-500 focus:outline-none"
                          />
                        </div>

                        {/* Stock Quantity */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[11px] font-bold text-slate-300">
                              Stock Units <span className="text-amber-400">*</span>
                            </label>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              (parseInt(stock, 10) || 0) > 10
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : (parseInt(stock, 10) || 0) > 0
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              ● {(parseInt(stock, 10) || 0) > 10 ? 'In Stock' : (parseInt(stock, 10) || 0) > 0 ? 'Low Stock' : 'Out of Stock'}
                            </span>
                          </div>
                          <input
                            type="number"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            required
                            className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* CARD 4: CATEGORY TAXONOMY */}
                    <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Catalog Category</h4>
                            <p className="text-[10px] text-slate-400">Collection grouping in mobile store</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as Category)}
                          className="w-full p-2.5 rounded-xl text-xs font-semibold focus:outline-none transition-all bg-slate-900/90 border border-slate-700/80 text-white focus:border-amber-500 cursor-pointer"
                        >
                          <option value="Home Innovation">🏠 Home Innovation</option>
                          <option value="Smart Gadgets">⚡ Smart Gadgets</option>
                          <option value="Tech & Audio">🎧 Tech & Audio</option>
                          <option value="Personal Care">✨ Personal Care</option>
                          <option value="Lifestyle">🌿 Lifestyle</option>
                        </select>
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              {/* STICKY MODAL FOOTER */}
              <div className="px-5 py-3.5 sm:px-6 sm:py-4 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between shrink-0 z-20">
                <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Category: <strong className="text-white">{category}</strong></span>
                  <span>•</span>
                  <span>Price: <strong className="text-amber-400">₹{parseFloat(price) || 0}</strong></span>
                  <span>•</span>
                  <span>Photos: <strong className="text-white">{parsedImageList.length}</strong></span>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer text-xs"
                  >
                    Cancel
                  </button>
                  <AdminSaveButton
                    type="submit"
                    saveState={productSaveState}
                    idleText={editingProduct ? 'Save Changes & Sync' : 'Publish Mobile Product'}
                    savingText={editingProduct ? 'Saving Product...' : 'Publishing Product...'}
                    savedText={editingProduct ? 'Product Saved & Synced!' : 'Product Published!'}
                    idleIcon={editingProduct ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  />
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl max-w-sm w-full p-6 border border-slate-800 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Delete Mobile Product?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this product from your mobile catalog? This will automatically delete all associated customer reviews, video success stories, and media files from database storage buckets and tables.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingProductId(null)}
                className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteMobileProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-rose-500 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION POPUP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl border border-amber-500/40 shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
