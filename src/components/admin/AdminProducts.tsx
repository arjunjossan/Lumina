import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Category, ProductSpec } from '../../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Eye, 
  Check, 
  X, 
  AlertCircle, 
  Image as ImageIcon, 
  RefreshCw, 
  Database,
  Layers,
  Film,
  IndianRupee,
  Tag,
  AlignLeft,
  Settings2,
  Upload,
  FileImage,
  Link,
  Code,
  LayoutTemplate,
  TrendingUp,
  Box,
  ShieldCheck,
  Percent,
  Loader2,
  Copy,
  Truck,
  Package
} from 'lucide-react';
import { RichDescriptionRenderer } from '../common/RichDescriptionRenderer';
import { AdminSaveButton, SaveButtonState } from './AdminSaveButton';
import { uploadProductMediaFile, SUPABASE_PRODUCT_STORAGE_BUCKET_SQL } from '../../lib/productMediaStorage';

export const AdminProducts: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    toggleProductStatus, 
    resetProductsToDefault,
    pullAllFromSupabase,
    supabaseStatus
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

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
  const [badge, setBadge] = useState('🔥 VIRAL WINNER');
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
    setTimeout(() => setToastMessage(null), 3500);
  };

  const openCreateModal = () => {
    setProductSaveState('idle');
    setEditingProduct(null);
    setTitle('');
    setSubtitle('');
    setSku(`LUM-${Math.floor(100 + Math.random() * 900)}`);
    setPrice('49.99');
    setCompareAtPrice('89.99');
    setCostPrice('15.00');
    setCategory('Home Innovation');
    setStock('25');
    setStatus('Active');
    setIsWinningProduct(true);
    setIsBestSeller(false);
    setIsTrending(true);
    setBadge('🔥 VIRAL WINNER');
    setCodAllowed(true);
    setShortDescription('Unique winning product designed for viral performance.');
    setDescription('Experience premium quality craftsmanship engineered for modern lifestyles.');
    setImagesText('https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80');
    setGifUrlsText('');
    setFeaturesText("360° Magnetic Levitation\nTouch Dimmable Warm Light\nBluetooth 5.3 Acoustic Audio");
    setSpecifications([
      { name: 'Material', value: 'Aerospace Grade Aluminum & ABS' },
      { name: 'Power Input', value: 'Type-C USB Fast Charging (5V/2A)' },
      { name: 'Dimensions', value: '180mm x 140mm x 65mm' },
      { name: 'Warranty', value: '1 Year Full Replacement Guarantee' }
    ]);
    setShippingWarranty('Orders are processed within 24 hours. Express tracked shipping takes 3 - 5 business days worldwide.\n\n30-Day Money Back Guarantee: If you are not 100% satisfied with your Lumina product, contact our support team within 30 days of receiving your item for an effortless full refund or unit replacement.');
    setShowFeatures(true);
    setShowSpecs(true);
    setShowShippingWarranty(true);
    setDescriptionPreviewMode('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setProductSaveState('idle');
    setEditingProduct(p);
    setTitle(p.title);
    setSubtitle(p.subtitle || '');
    setSku(p.sku);
    setPrice(p.price.toString());
    setCompareAtPrice(p.compareAtPrice ? p.compareAtPrice.toString() : '');
    setCostPrice(p.costPrice ? p.costPrice.toString() : '');
    setCategory(p.category);
    setStock(p.stock.toString());
    setStatus(p.status);
    setIsWinningProduct(!!p.isWinningProduct);
    setIsBestSeller(!!p.isBestSeller);
    setIsTrending(!!p.isTrending);
    setBadge(p.badge || '');
    setCodAllowed(p.codAllowed !== false);
    setShortDescription(p.shortDescription || '');
    setDescription(p.description || '');
    setImagesText(p.images ? p.images.join('\n') : '');
    setGifUrlsText(p.gifUrls ? p.gifUrls.join('\n') : '');
    setFeaturesText(p.features ? p.features.join('\n') : '');
    setSpecifications(p.specifications && p.specifications.length > 0 ? p.specifications : [
      { name: 'Material', value: 'Aerospace Grade Aluminum & ABS' },
      { name: 'Power Input', value: 'Type-C USB Fast Charging (5V/2A)' },
      { name: 'Dimensions', value: '180mm x 140mm x 65mm' },
      { name: 'Warranty', value: '1 Year Full Replacement Guarantee' }
    ]);
    setShippingWarranty(p.shippingWarranty || '');
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

  // Helper to read file as Data URL
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
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
        
        // Ensure clean spacing around the tag if needed
        const needsLeadingNewline = before.length > 0 && !before.endsWith('\n\n') && !before.endsWith('\n');
        const needsTrailingNewline = after.length > 0 && !after.startsWith('\n\n') && !after.startsWith('\n');

        const formattedTag = `${needsLeadingNewline ? '\n\n' : ''}${tag}${needsTrailingNewline ? '\n\n' : ''}`;
        const updated = before + formattedTag + after;

        // Restore caret focus right after the inserted tag
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
      // Upload directly into Supabase Storage Bucket ('products' / 'product-media' / 'images')
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
      e.preventDefault(); // Stop default raw base64 or blob string dumping
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
        // Convert base64 data to Blob
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
      updateProduct({
        ...editingProduct,
        title,
        subtitle: subtitle.trim() || undefined,
        sku,
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        category,
        stock: parseInt(stock, 10) || 0,
        status,
        isWinningProduct,
        isBestSeller,
        isTrending,
        badge: badge.trim() || undefined,
        codAllowed,
        shortDescription,
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
    } else {
      addProduct({
        title,
        subtitle: subtitle.trim() || undefined,
        sku,
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        category,
        stock: parseInt(stock, 10) || 0,
        status,
        isWinningProduct,
        isBestSeller,
        isTrending,
        badge: badge.trim() || undefined,
        codAllowed,
        shortDescription,
        description,
        images: imageArray.length ? imageArray : ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=80'],
        gifUrls: gifArray.length ? gifArray : undefined,
        features: featureArray.length ? featureArray : ['Premium Build Quality', 'Express Shipping Included'],
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
    }, 700);
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.subtitle && p.subtitle.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white font-serif">Product Catalog Management (CRUD)</h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage products, subtitles, technical specifications, media & database sync.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openCreateModal}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-5 py-3 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add New Product</span>
              </button>
            </div>
          </div>

      {/* Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search Title, Subtitle or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {['All', 'Home Innovation', 'Smart Gadgets', 'Tech & Audio', 'Personal Care', 'Lifestyle'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as Category)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table listing */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-4">Product & Subtitle</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price / Cost</th>
                <th className="p-4">Stock & Specs</th>
                <th className="p-4">COD Option</th>
                <th className="p-4">Winning Flag</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0" />
                      <div className="min-w-0 max-w-sm">
                        <p className="font-bold text-white truncate">{p.title}</p>
                        {p.subtitle && (
                          <p className="text-[10px] text-amber-400/90 truncate font-medium">{p.subtitle}</p>
                        )}
                        <p className="text-[10px] text-slate-500 font-mono">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-slate-300 font-medium">{p.category}</td>

                  <td className="p-4">
                    <p className="font-bold text-white">₹{p.price.toFixed(2)}</p>
                    {p.costPrice && (
                      <p className="text-[10px] text-slate-500">Cost: ₹{p.costPrice.toFixed(2)} (Margin: {Math.round(((p.price - p.costPrice) / p.price) * 100)}%)</p>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg font-bold text-[10px] ${
                        p.stock <= 10 ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-200'
                      }`}>
                        {p.stock} units
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {p.specifications?.length || 0} Specs, {p.images?.length || 0} Images
                      </p>
                    </div>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => updateProduct({ ...p, codAllowed: p.codAllowed === false ? true : false })}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                        p.codAllowed !== false
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                      title="Click to toggle Cash on Delivery for this product"
                    >
                      {p.codAllowed !== false ? '✓ COD Allowed' : '✕ Online Only'}
                    </button>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => updateProduct({ ...p, isWinningProduct: !p.isWinningProduct })}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                        p.isWinningProduct 
                          ? 'bg-amber-500 text-slate-950' 
                          : 'bg-slate-900 text-slate-500 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{p.isWinningProduct ? 'Winning Product' : 'Standard'}</span>
                    </button>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => toggleProductStatus(p.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {p.status}
                    </button>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-2 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl transition-colors"
                        title="Edit Product Details & Specs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeletingProductId(p.id)}
                        className="p-2 bg-slate-900 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
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
                      {editingProduct ? 'Edit Product Catalog Entry' : 'Add New Winning Product'}
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
                    {editingProduct ? `Updating SKU ${editingProduct.sku} • Synced with database & storefront` : 'Configure product identity, media, specs, and commercial pricing'}
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
                          <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                            Product Title <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. AuraSphere 360° Magnetic Levitation Ambient Lamp"
                            required
                            className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-medium placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                          />
                        </div>

                        {/* Subtitle / Marketing Tagline */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[11px] font-bold text-slate-300">
                              Marketing Subtitle / Tagline
                            </label>
                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Displayed prominently beneath main title
                            </span>
                          </div>
                          <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="e.g. Floating Warm Light with Built-in Hi-Fi Bluetooth Speaker"
                            className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                          />
                        </div>

                        {/* Short Description */}
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                            Short Teaser Description (1-2 Sentences) <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            required
                            placeholder="e.g. Zero-gravity floating levitation orb with dimmable ambient glow and 360° acoustic chamber."
                            className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                          />
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
                          
                          {/* Upload GIF/Image button with direct server storage */}
                          <button
                            type="button"
                            disabled={isUploadingDescMedia}
                            onClick={() => descGifFileInputRef.current?.click()}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-2.5 py-1 rounded-lg text-[10px] border border-amber-500/30 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                            title="Upload GIF or Image directly to server storage (no base64 clutter)"
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
                            title="Insert GIF or image from external URL"
                          >
                            <Link className="w-3 h-3 text-amber-400" />
                            <span>+ Media URL</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDescription(prev => prev + '\n\n### Section Title\n')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded-lg text-[10px] border border-slate-700 cursor-pointer transition-colors"
                            title="Insert Heading"
                          >
                            + Heading
                          </button>

                          <button
                            type="button"
                            onClick={() => setDescription(prev => prev + '\n- Feature bullet point\n- Key customer benefit\n')}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded-lg text-[10px] border border-slate-700 cursor-pointer transition-colors"
                            title="Insert Bullet List"
                          >
                            + List
                          </button>

                          {/* Toggle: Edit vs Live Customer Render */}
                          <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-700/80 ml-1">
                            <button
                              type="button"
                              onClick={() => setDescriptionPreviewMode('edit')}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                                descriptionPreviewMode === 'edit'
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDescriptionPreviewMode('preview')}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                                descriptionPreviewMode === 'preview'
                                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                              <span>Live View</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Base64 Migration Banner (Auto-detected) */}
                      {extractEmbeddedMedia(description).some(m => m.isBase64) && (
                        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-amber-200 text-[11px]">
                              Base64 code detected in description. Convert to clean hosted files to optimize database size.
                            </span>
                          </div>
                          <button
                            type="button"
                            disabled={isMigratingDescBase64}
                            onClick={handleCleanBase64InDescription}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] px-3 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            {isMigratingDescBase64 ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Converting...</span>
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-3 h-3" />
                                <span>Clean Base64 Now</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {descriptionPreviewMode === 'edit' ? (
                        <div className="space-y-2 relative">
                          <div className="relative">
                            <textarea
                              ref={descriptionTextareaRef}
                              rows={8}
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              onPaste={handleDescriptionPaste}
                              onDrop={handleDescriptionDrop}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setIsDragOverDesc(true);
                              }}
                              onDragLeave={() => setIsDragOverDesc(false)}
                              required
                              placeholder="Type product details, format markdown, or directly press Ctrl+V / Cmd+V to paste images & animated GIFs anywhere in the text..."
                              className={`w-full p-3.5 bg-slate-900/90 rounded-xl text-xs text-white focus:outline-none font-mono transition-all leading-relaxed ${
                                isDragOverDesc 
                                  ? 'border-2 border-dashed border-amber-400 bg-amber-500/10' 
                                  : 'border border-slate-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30'
                              }`}
                            />

                            {/* Floating Uploading Banner */}
                            {isUploadingDescMedia && (
                              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-2 border border-amber-500/40 z-10 animate-in fade-in">
                                <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                                <span className="text-xs font-bold text-amber-300">
                                  Uploading & Linking Media to Hosted Storage...
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Saving directly at cursor position without heavy database text
                                </span>
                              </div>
                            )}

                            {/* Drag-over indicator overlay */}
                            {isDragOverDesc && (
                              <div className="absolute inset-0 bg-amber-500/10 border-2 border-dashed border-amber-400 rounded-xl flex items-center justify-center gap-2 pointer-events-none z-10">
                                <Upload className="w-5 h-5 text-amber-400 animate-bounce" />
                                <span className="text-xs font-bold text-amber-300">Drop Image/GIF to insert at cursor</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-400 px-1">
                            <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Direct Paste: Press <strong>Ctrl+V / Cmd+V</strong> or drag-and-drop to paste images & GIFs inline</span>
                            </span>
                            <span className="font-mono text-slate-500">{description.length} characters</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-300 text-slate-900 max-h-80 overflow-y-auto shadow-inner">
                          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2.5 flex items-center justify-between border-b border-slate-200 pb-2">
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Live Customer Storefront Preview</span>
                            </span>
                            <span className="text-slate-400 font-normal">Exact render as seen on product detail page</span>
                          </div>
                          <RichDescriptionRenderer content={description} className="text-slate-800" />
                        </div>
                      )}

                      {/* Embedded Visual Media Asset Cards */}
                      {extractEmbeddedMedia(description).length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-800/80">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                              <span>Embedded Media Assets ({extractEmbeddedMedia(description).length})</span>
                            </span>
                            <span className="text-[9px] text-emerald-400 font-mono">● Database Bucket Storage</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {extractEmbeddedMedia(description).map((media, idx) => (
                              <div 
                                key={idx} 
                                className="bg-slate-900/90 border border-slate-800 p-2 rounded-xl flex items-center gap-2.5 group"
                              >
                                <div className="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                                  <img 
                                    src={media.url} 
                                    alt={media.alt} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80';
                                    }}
                                  />
                                  {media.isBase64 && (
                                    <span className="absolute top-0.5 left-0.5 bg-amber-500 text-slate-950 font-black text-[7px] px-1 rounded">
                                      B64
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1 text-[10px]">
                                  <span className="font-bold text-white truncate block">{media.alt}</span>
                                  <span className="font-mono text-slate-400 text-[9px] truncate block">
                                    {media.isBase64 ? 'Legacy Base64 String' : media.url}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(media.raw);
                                      setCopiedMediaIndex(idx);
                                      showNotification('Copied markdown tag to clipboard!');
                                      setTimeout(() => setCopiedMediaIndex(null), 1500);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                                    title="Copy markdown tag"
                                  >
                                    {copiedMediaIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEmbeddedMedia(media.raw)}
                                    className="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="Remove this asset from description"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span>💡 Tip: Clicking</span>
                        <strong className="text-amber-400">+ Upload GIF/Image</strong>
                        <span>saves files directly to the server, keeping your description field light, responsive, and easy to edit.</span>
                      </p>
                    </div>

                    {/* SECTION 4: TECHNICAL SPECIFICATIONS */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Settings2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Technical Specifications</h4>
                            <p className="text-[10px] text-slate-400">Key-value structured rows rendered in the storefront specifications sheet</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Specs Section Visibility Toggle */}
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
                              title="Toggle visibility of Technical Specifications tab on product page"
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
                            className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1 self-start sm:self-auto transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Spec Row</span>
                          </button>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-500 font-semibold">Quick Presets:</span>
                        {[
                          { name: 'Material', val: 'Aircraft Aluminum & ABS' },
                          { name: 'Dimensions', val: '160mm x 160mm x 280mm' },
                          { name: 'Weight', val: '450g Ultra-Light' },
                          { name: 'Battery Life', val: '12 Hours Continuous Play' },
                          { name: 'Connectivity', val: 'Bluetooth 5.3 + Type-C' },
                          { name: 'Warranty', val: '1 Year Full Replacement' }
                        ].map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => handleAddSpecPreset(preset.name, preset.val)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md hover:text-white transition-colors cursor-pointer"
                          >
                            + {preset.name}
                          </button>
                        ))}
                      </div>

                      {/* Spec Rows */}
                      <div className="space-y-2">
                        {specifications.map((spec, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-900/90 p-2 sm:p-2.5 rounded-xl border border-slate-800">
                            <div className="w-2/5 sm:w-1/3">
                              <input
                                type="text"
                                value={spec.name}
                                onChange={(e) => handleUpdateSpec(idx, 'name', e.target.value)}
                                placeholder="Spec Name (e.g. Material)"
                                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white font-bold text-xs placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={spec.value}
                                onChange={(e) => handleUpdateSpec(idx, 'value', e.target.value)}
                                placeholder="Value (e.g. Aerospace Grade Aluminum)"
                                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(idx)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0 cursor-pointer"
                              title="Delete specification"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {specifications.length === 0 && (
                          <div className="text-center py-5 bg-slate-900/40 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                            No technical specifications added yet. Click "+ Add Spec Row" or use a quick preset above.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SECTION 5: SHIPPING AND WARRANTY */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Truck className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Shipping & Warranty Information</h4>
                            <p className="text-[10px] text-slate-400">Custom shipping timelines, return policy, and warranty terms for this product</p>
                          </div>
                        </div>

                        {/* Shipping & Warranty Section Visibility Toggle */}
                        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl self-start sm:self-auto">
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
                            title="Toggle visibility of Shipping & Warranty tab on product page"
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow transition duration-200 ease-in-out ${
                                showShippingWarranty ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Quick Template Fill Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                        <span className="text-slate-500 font-semibold">Quick Templates:</span>
                        {[
                          {
                            label: 'Standard Free Shipping + 1 Year Warranty',
                            content: `• Free Express Delivery across India (Delivered in 2-4 business days).\n• Cash on Delivery (COD) available with open-box delivery option.\n• 7-Day Hassle-Free Replacement if defective or transit-damaged.\n• 1-Year Comprehensive Brand Warranty against any manufacturing defects.`
                          },
                          {
                            label: 'Premium Overnight + 2 Year Extended Warranty',
                            content: `• Priority Air Express: Dispatched within 12 hours (Delivered in 1-2 business days).\n• 10-Day No-Questions-Asked Return & Refund Guarantee.\n• 2-Year VIP Replacement Warranty with door-step pickup and drop service.\n• Tamper-proof luxury gift packaging included.`
                          },
                          {
                            label: 'Fragile Electronic Delivery Protocol',
                            content: `• Specialized shock-resistant bubble packaging with fragile transit insurance.\n• Fast insured dispatch via Bluedart / Delhivery Air (3-5 business days).\n• 1-Year Manufacturer Warranty covering hardware and electrical components.\n• Dedicated 24x7 WhatsApp customer concierge support.`
                          }
                        ].map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setShippingWarranty(tmpl.content)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md hover:text-white transition-colors cursor-pointer"
                          >
                            + {tmpl.label}
                          </button>
                        ))}
                      </div>

                      <div>
                        <textarea
                          rows={4}
                          value={shippingWarranty}
                          onChange={(e) => setShippingWarranty(e.target.value)}
                          placeholder="Enter custom shipping and warranty details (e.g. Free delivery within 3-5 days, 1-year replacement warranty, 7-day return policy)..."
                          className="w-full p-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all leading-relaxed"
                        />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          If left blank, the storefront will display default store shipping and warranty terms. Supports bullet points (•) and multiple lines.
                        </span>
                      </div>
                    </div>

                    {/* SECTION 6: LIVE DEMONSTRATION */}
                    <div className="bg-slate-950/70 p-5 sm:p-6 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                            <Film className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Live Demonstration</h4>
                            <p className="text-[10px] text-slate-400">Interactive live showcase GIFs for customer engagement</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            ref={demoGifUploadInputRef}
                            multiple
                            accept="image/gif,image/*"
                            onChange={handleDemoGifFilesUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => demoGifUploadInputRef.current?.click()}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload GIF File(s)</span>
                          </button>
                        </div>
                      </div>

                      {/* GIF Showcase Input */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1.5">
                            Live Demonstration GIFs (Feature Showcase)
                          </label>
                          <textarea
                            rows={2}
                            value={gifUrlsText}
                            onChange={(e) => setGifUrlsText(e.target.value)}
                            placeholder="https://media.giphy.com/media/.../giphy.gif (One per line or upload files above)"
                            className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl font-mono text-[11px] text-white placeholder-slate-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 focus:outline-none transition-all"
                          />
                        </div>

                        {parsedGifList.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                            {parsedGifList.map((gif, idx) => (
                              <div
                                key={idx}
                                className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 aspect-video flex items-center justify-center"
                              >
                                <img
                                  src={gif}
                                  alt={`Demo GIF ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80';
                                  }}
                                />
                                <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveGifAtIndex(idx)}
                                    className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition-colors cursor-pointer"
                                    title="Remove GIF"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-300">
                                  GIF #{idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* RIGHT COLUMN: PRICING, INVENTORY, TAXONOMY & VISIBILITY (4 COLS) */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* CARD 1: PUBLISHING & VISIBILITY */}
                    <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <Eye className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Publishing & Status</h4>
                          <p className="text-[10px] text-slate-400">Visibility state across website</p>
                        </div>
                      </div>

                      {/* Publish Status */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Publish Status</label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as 'Active' | 'Draft')}
                          className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white font-medium focus:border-amber-500 focus:outline-none cursor-pointer"
                        >
                          <option value="Active">🟢 Active (Visible in Store)</option>
                          <option value="Draft">🟡 Draft (Hidden from Customers)</option>
                        </select>
                      </div>

                      {/* Badge Callout */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1.5">Promotional Badge</label>
                        <input
                          type="text"
                          value={badge}
                          onChange={(e) => setBadge(e.target.value)}
                          placeholder="e.g. 🔥 VIRAL WINNER"
                          className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                        />
                      </div>

                      {/* Feature Toggles */}
                      <div className="space-y-2 pt-2 border-t border-slate-800/80">
                        {/* Winning Product Spotlight */}
                        <label className="flex items-center gap-3 p-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 rounded-xl cursor-pointer transition-colors group">
                          <input
                            type="checkbox"
                            checked={isWinningProduct}
                            onChange={(e) => setIsWinningProduct(e.target.checked)}
                            className="accent-amber-500 w-4 h-4 rounded cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-amber-400 block group-hover:text-amber-300">⭐ Winning Product Spotlight</span>
                            <span className="text-[10px] text-slate-400 block">Featured on hero and viral showcase</span>
                          </div>
                        </label>

                        {/* Best Seller */}
                        <label className="flex items-center gap-3 p-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 rounded-xl cursor-pointer transition-colors group">
                          <input
                            type="checkbox"
                            checked={isBestSeller}
                            onChange={(e) => setIsBestSeller(e.target.checked)}
                            className="accent-amber-500 w-4 h-4 rounded cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-slate-200 block group-hover:text-white">🏆 Best Seller Badge</span>
                            <span className="text-[10px] text-slate-400 block">Highlights proven buyer demand</span>
                          </div>
                        </label>

                        {/* Trending */}
                        <label className="flex items-center gap-3 p-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 rounded-xl cursor-pointer transition-colors group">
                          <input
                            type="checkbox"
                            checked={isTrending}
                            onChange={(e) => setIsTrending(e.target.checked)}
                            className="accent-amber-500 w-4 h-4 rounded cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-slate-200 block group-hover:text-white">🔥 Trending Now</span>
                            <span className="text-[10px] text-slate-400 block">Boosts catalog visibility</span>
                          </div>
                        </label>

                        {/* Cash on Delivery (COD) */}
                        <label className="flex items-center gap-3 p-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 rounded-xl cursor-pointer transition-colors group">
                          <input
                            type="checkbox"
                            checked={codAllowed}
                            onChange={(e) => setCodAllowed(e.target.checked)}
                            className="accent-amber-500 w-4 h-4 rounded cursor-pointer shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="font-bold text-xs text-slate-200 block group-hover:text-white">💵 Cash on Delivery (COD)</span>
                            <span className="text-[10px] text-slate-400 block">Permit cash on delivery checkout</span>
                          </div>
                        </label>
                      </div>

                      {/* Storefront Section Visibility Controls */}
                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Storefront Tab & Section Visibility
                        </span>

                        <div className="space-y-1.5">
                          {/* Key Features Toggle */}
                          <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                            <span className="text-xs text-slate-300 font-medium">✨ Key Highlights</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={showFeatures}
                              onClick={() => setShowFeatures(!showFeatures)}
                              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                showFeatures ? 'bg-amber-500' : 'bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-slate-950 shadow transition duration-200 ease-in-out ${
                                  showFeatures ? 'translate-x-3' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Technical Specs Toggle */}
                          <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                            <span className="text-xs text-slate-300 font-medium">⚙️ Technical Specifications</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={showSpecs}
                              onClick={() => setShowSpecs(!showSpecs)}
                              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                showSpecs ? 'bg-amber-500' : 'bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-slate-950 shadow transition duration-200 ease-in-out ${
                                  showSpecs ? 'translate-x-3' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Shipping & Warranty Toggle */}
                          <div className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
                            <span className="text-xs text-slate-300 font-medium">📦 Shipping & Warranty</span>
                            <button
                              type="button"
                              role="switch"
                              aria-checked={showShippingWarranty}
                              onClick={() => setShowShippingWarranty(!showShippingWarranty)}
                              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                showShippingWarranty ? 'bg-amber-500' : 'bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-slate-950 shadow transition duration-200 ease-in-out ${
                                  showShippingWarranty ? 'translate-x-3' : 'translate-x-0'
                                }`}
                              />
                            </button>
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
                          <p className="text-[10px] text-slate-400">Unit pricing and profit analytics</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Selling Price */}
                        <div>
                          <label className="text-[11px] font-bold text-white block mb-1">
                            Selling Price (₹) <span className="text-amber-400">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-slate-400 font-bold">₹</span>
                            <input
                              type="number"
                              step="0.01"
                              value={price}
                              onChange={(e) => setPrice(e.target.value)}
                              required
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
                              onClick={() => setSku(`LUM-${Math.floor(100 + Math.random() * 900)}`)}
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
                      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-3">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white">Catalog Category</h4>
                          <p className="text-[10px] text-slate-400">Collection grouping in store</p>
                        </div>
                      </div>

                      <div>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value as Category)}
                          className="w-full p-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white text-xs font-semibold focus:border-amber-500 focus:outline-none cursor-pointer"
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
                    idleText={editingProduct ? 'Save Changes & Sync' : 'Publish Product'}
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
            <h3 className="text-base font-bold text-white">Delete Product?</h3>
            <p className="text-xs text-slate-400">
              Are you sure you want to remove this product from your catalog? This will automatically delete all associated customer reviews, video success stories, and media files from database storage buckets.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeletingProductId(null)}
                className="bg-slate-800 text-slate-300 text-xs font-bold px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-rose-500"
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

