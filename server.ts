import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://hphfyrciaufkdkfqpdfm.supabase.co').trim();
const SUPABASE_ANON_KEY = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable__CCD2fDominO0tnNU4RUkQ_jwLSEyMC').trim();
const serverSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Uploads a video buffer directly into Supabase Storage buckets:
 * Tries 'videos', 'products', 'product-media', 'images', 'success-stories'
 */
async function uploadBufferToSupabaseStorage(
  buffer: Buffer,
  filename: string,
  mimetype = 'video/mp4'
): Promise<{ url: string; bucket: string; path: string } | null> {
  const candidateBuckets = ['videos', 'products', 'product-media', 'images', 'success-stories'];
  for (const bucket of candidateBuckets) {
    try {
      const storageFilePath = bucket === 'products' || bucket === 'product-media' || bucket === 'images'
        ? `videos/${filename}`
        : filename;

      const { data: uploadData, error: sbError } = await serverSupabase.storage
        .from(bucket)
        .upload(storageFilePath, buffer, {
          contentType: mimetype,
          upsert: true
        });

      if (!sbError && uploadData) {
        const { data: publicData } = serverSupabase.storage
          .from(bucket)
          .getPublicUrl(storageFilePath);

        if (publicData?.publicUrl) {
          console.log(`[Server Supabase Storage] Successfully uploaded to bucket '${bucket}': ${publicData.publicUrl}`);
          return {
            url: publicData.publicUrl,
            bucket,
            path: storageFilePath
          };
        }
      } else if (sbError) {
        console.warn(`[Server Supabase Storage] Bucket '${bucket}' attempt: ${sbError.message}`);
      }
    } catch (err: any) {
      console.warn(`[Server Supabase Storage] Error querying bucket '${bucket}':`, err?.message);
    }
  }
  return null;
}

const distPath = path.join(process.cwd(), 'dist');
const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
const imagesUploadsDir = path.join(process.cwd(), 'uploads', 'images');

// Ensure upload directories exist
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(imagesUploadsDir)) {
    fs.mkdirSync(imagesUploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('[Server] Could not create uploads directories:', e);
}

// Multer storage engine for image & GIF files
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesUploadsDir);
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname || '');
    if (!ext) {
      if (file.mimetype === 'image/gif') ext = '.gif';
      else if (file.mimetype === 'image/jpeg') ext = '.jpg';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else if (file.mimetype === 'image/svg+xml') ext = '.svg';
      else ext = '.png';
    }
    const rawBase = file.originalname ? path.basename(file.originalname, ext) : 'media';
    const cleanBase = rawBase.replace(/[^a-zA-Z0-9_-]/g, '_') || 'media';
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `desc_${cleanBase}_${uniqueId}${ext}`);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit for high-res animated GIFs & images
});

// Multer storage engine for video files
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.mp4';
    const cleanBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    cb(null, `story_${cleanBase}_${uniqueId}${ext}`);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for high quality video reviews
});

interface OtpEntry {
  otp: string;
  expiresAt: number;
}

// In-memory OTP store (email -> OtpEntry)
const otpStore = new Map<string, OtpEntry>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support up to 100MB payloads for base64 fallback uploads
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Static serving for uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==========================================
  // IMAGE & GIF STORAGE ROUTES (Rich Descriptions & Media)
  // ==========================================

  // Multipart Form Image/GIF Upload
  app.post('/api/images/upload', (req, res) => {
    imageUpload.single('image')(req, res, (err: any) => {
      if (err) {
        console.error('[Image Upload Error]:', err);
        return res.status(400).json({ success: false, message: err.message || 'Image/GIF upload failed.' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image file provided in the request.' });
      }

      const imageUrl = `/uploads/images/${req.file.filename}`;
      console.log(`[Image Upload Success] Stored ${req.file.filename} (${(req.file.size / 1024).toFixed(1)} KB)`);

      return res.json({
        success: true,
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    });
  });

  // Base64 Image/GIF Upload Fallback
  app.post('/api/images/upload-base64', (req, res) => {
    try {
      const { base64, filename, mimeType } = req.body;
      if (!base64 || typeof base64 !== 'string') {
        return res.status(400).json({ success: false, message: 'Missing base64 image data.' });
      }

      const cleanBase64 = base64.replace(/^data:image\/[a-zA-Z0-9.+_-]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      let ext = '.png';
      if (mimeType?.includes('gif') || base64.startsWith('data:image/gif')) ext = '.gif';
      else if (mimeType?.includes('jpeg') || mimeType?.includes('jpg') || base64.startsWith('data:image/jpeg')) ext = '.jpg';
      else if (mimeType?.includes('webp') || base64.startsWith('data:image/webp')) ext = '.webp';
      else if (mimeType?.includes('svg') || base64.startsWith('data:image/svg')) ext = '.svg';

      const cleanBase = (filename || 'media').replace(/[^a-zA-Z0-9_-]/g, '_');
      const outFilename = `desc_${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const targetPath = path.join(imagesUploadsDir, outFilename);

      fs.writeFileSync(targetPath, buffer);
      console.log(`[Base64 Image Upload Success] Stored ${outFilename} (${(buffer.length / 1024).toFixed(1)} KB)`);

      return res.json({
        success: true,
        url: `/uploads/images/${outFilename}`,
        filename: outFilename,
        size: buffer.length,
        mimetype: mimeType || (ext === '.gif' ? 'image/gif' : 'image/png')
      });
    } catch (err: any) {
      console.error('[Base64 Image Upload Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Failed to save base64 image.' });
    }
  });

  // Delete Image/GIF File
  app.delete('/api/images/:filename', (req, res) => {
    try {
      const safeFilename = path.basename(req.params.filename);
      const filePath = path.join(imagesUploadsDir, safeFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return res.json({ success: true, message: 'Image deleted.' });
      }
      return res.json({ success: true, message: 'File already absent.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // ==========================================
  // VIDEO STORAGE & STREAMING ROUTES
  // ==========================================

  // Multipart Form Video Upload (Standard)
  app.post('/api/videos/upload', (req, res, next) => {
    videoUpload.single('video')(req, res, async (err: any) => {
      if (err) {
        console.error('[Video Upload Error]:', err);
        return res.status(400).json({ success: false, message: err.message || 'Video upload failed.' });
      }
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No video file provided in the request.' });
      }

      const localVideoUrl = `/api/videos/${req.file.filename}`;
      console.log(`[Video Upload Success] Stored local file ${req.file.filename} (${(req.file.size / (1024 * 1024)).toFixed(2)} MB)`);

      // Attempt to push to Supabase Storage bucket
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const supabaseResult = await uploadBufferToSupabaseStorage(fileBuffer, req.file.filename, req.file.mimetype);
        if (supabaseResult?.url) {
          return res.json({
            success: true,
            url: supabaseResult.url,
            source: 'supabase',
            bucket: supabaseResult.bucket,
            filename: supabaseResult.path,
            size: req.file.size,
            mimetype: req.file.mimetype
          });
        }
      } catch (sbErr) {
        console.warn('[Server Supabase Storage] Upload attempt notice:', sbErr);
      }

      return res.json({
        success: true,
        url: localVideoUrl,
        source: 'server',
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    });
  });

  // Base64 Video Upload Fallback
  app.post('/api/videos/upload-base64', async (req, res) => {
    try {
      const { base64, filename, mimeType } = req.body;
      if (!base64 || typeof base64 !== 'string') {
        return res.status(400).json({ success: false, message: 'Missing base64 video data.' });
      }

      const cleanBase64 = base64.replace(/^data:video\/[a-zA-Z0-9.-]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const ext = mimeType?.includes('webm') ? '.webm' : (mimeType?.includes('quicktime') || mimeType?.includes('mov')) ? '.mov' : '.mp4';
      const cleanBase = (filename || 'video').replace(/[^a-zA-Z0-9_-]/g, '_');
      const outFilename = `story_${cleanBase}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${ext}`;
      const targetPath = path.join(uploadsDir, outFilename);

      fs.writeFileSync(targetPath, buffer);
      console.log(`[Base64 Video Upload Success] Stored ${outFilename} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)`);

      // Attempt to push to Supabase Storage
      try {
        const supabaseResult = await uploadBufferToSupabaseStorage(buffer, outFilename, mimeType || 'video/mp4');
        if (supabaseResult?.url) {
          return res.json({
            success: true,
            url: supabaseResult.url,
            source: 'supabase',
            bucket: supabaseResult.bucket,
            filename: supabaseResult.path,
            size: buffer.length,
            mimetype: mimeType || 'video/mp4'
          });
        }
      } catch (sbErr) {
        console.warn('[Server Supabase Storage] Base64 upload to supabase exception:', sbErr);
      }

      return res.json({
        success: true,
        url: `/api/videos/${outFilename}`,
        source: 'server',
        filename: outFilename,
        size: buffer.length,
        mimetype: mimeType || 'video/mp4'
      });
    } catch (err: any) {
      console.error('[Base64 Video Upload Error]:', err);
      return res.status(500).json({ success: false, message: err.message || 'Failed to save base64 video.' });
    }
  });

  // Stream Video with HTTP 206 Partial Content (Range requests for smooth playback on Chrome, Safari, iOS, etc.)
  app.get('/api/videos/:filename', (req, res) => {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(uploadsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    const ext = path.extname(safeFilename).toLowerCase();
    let contentType = 'video/mp4';
    if (ext === '.webm') contentType = 'video/webm';
    if (ext === '.mov') contentType = 'video/quicktime';
    if (ext === '.ogg' || ext === '.ogv') contentType = 'video/ogg';

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize) {
        res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
        return;
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  });

  // Delete Video File
  app.delete('/api/videos/:filename', (req, res) => {
    try {
      const safeFilename = path.basename(req.params.filename);
      const filePath = path.join(uploadsDir, safeFilename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return res.json({ success: true, message: 'Video deleted.' });
      }
      return res.json({ success: true, message: 'File already absent.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  });

  // Check Resend Status
  app.get('/api/auth/resend-status', (req, res) => {
    const key = process.env.RESEND_API_KEY;
    const customFrom = process.env.RESEND_FROM_EMAIL;
    res.json({
      configured: Boolean(key && key.trim().length > 0),
      maskedKey: key ? `${key.substring(0, 6)}...` : null,
      fromEmail: customFrom || 'onboarding@resend.dev'
    });
  });

  // Update Resend API Key dynamically
  app.post('/api/auth/resend-key', (req, res) => {
    const { apiKey, fromEmail } = req.body;
    if (typeof apiKey === 'string') {
      process.env.RESEND_API_KEY = apiKey.trim();
    }
    if (typeof fromEmail === 'string' && fromEmail.trim().length > 0) {
      process.env.RESEND_FROM_EMAIL = fromEmail.trim();
    }
    return res.json({ success: true, message: 'Resend email configuration updated successfully!' });
  });

  // SEND OTP ROUTE
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Valid email address is required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpStore.set(normalizedEmail, { otp, expiresAt });

      const resendApiKey = process.env.RESEND_API_KEY?.trim();

      if (resendApiKey && resendApiKey.length > 0) {
        try {
          // Determine valid from header: Use 'onboarding@resend.dev' for default or if domain is resend.dev
          const customFrom = process.env.RESEND_FROM_EMAIL?.trim();
          let fromAddress = 'onboarding@resend.dev';
          if (customFrom && customFrom.length > 0 && !customFrom.includes('resend.dev')) {
            if (customFrom.includes('<') && customFrom.includes('>')) {
              fromAddress = customFrom;
            } else if (customFrom.includes('@')) {
              fromAddress = `Lumina Store <${customFrom}>`;
            }
          }

          const emailPayload = {
            from: fromAddress,
            to: [normalizedEmail],
            subject: 'Your Lumina Store Login Verification Code',
            text: `Your Lumina Store login verification code is: ${otp}. This code is valid for 10 minutes. Do not share this code with anyone.`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background-color: #0f172a; border-radius: 20px; color: #f8fafc;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <h1 style="color: #f59e0b; font-family: Georgia, serif; font-size: 24px; margin: 0;">LUMINA BOUTIQUE</h1>
                  <p style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Customer Verification Code</p>
                </div>
                
                <div style="background-color: #1e293b; padding: 20px; border-radius: 16px; border: 1px solid #334155; text-align: center; margin-bottom: 20px;">
                  <p style="margin: 0 0 12px 0; color: #cbd5e1; font-size: 14px;">Your 6-digit email login verification code is:</p>
                  <div style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #f59e0b; background-color: #0f172a; padding: 14px 28px; border-radius: 12px; display: inline-block; border: 1px solid #475569;">
                    ${otp}
                  </div>
                  <p style="margin: 12px 0 0 0; color: #64748b; font-size: 11px;">Valid for 10 minutes. Do not share this code with anyone.</p>
                </div>

                <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; text-align: center;">
                  Thank you for shopping at Lumina. Enter this verification code directly in the login modal to proceed with your orders and checkout.
                </p>
              </div>
            `
          };

          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailPayload)
          });

          if (response.ok) {
            const data: any = await response.json();
            console.log(`[Resend Success] Email delivered to ${normalizedEmail}, ID: ${data?.id}`);
            return res.json({
              success: true,
              sentToRealEmail: true,
              message: `Verification code sent to ${normalizedEmail}! Please check your email inbox.`,
              resendEmailId: data?.id || null
            });
          } else {
            const errData: any = await response.json().catch(() => ({}));
            const errMsg = errData.message || errData.name || 'Resend delivery restriction (test accounts may only send to their registered email).';
            console.log(`[Resend Delivery Notice]: ${errMsg}`);
            return res.json({
              success: true,
              sentToRealEmail: false,
              message: `Verification code generated: ${otp}`,
              debugOtp: otp,
              resendError: errMsg
            });
          }
        } catch (resendError: any) {
          const errMsg = resendError?.message || 'Network error connecting to email service';
          console.log(`[Resend Network Notice]: ${errMsg}`);
          return res.json({
            success: true,
            sentToRealEmail: false,
            message: `Verification code generated: ${otp}`,
            debugOtp: otp,
            resendError: errMsg
          });
        }
      } else {
        // RESEND_API_KEY is not set yet
        return res.json({
          success: true,
          sentToRealEmail: false,
          message: `Verification code generated: ${otp}`,
          debugOtp: otp,
          isDemoMode: true
        });
      }

    } catch (err: any) {
      console.error('Send OTP Error:', err);
      res.status(500).json({ success: false, message: 'Server error generating OTP.' });
    }
  });

  // VERIFY OTP ROUTE
  app.post('/api/auth/verify-otp', (req, res) => {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP code are required.' });
      }

      const normalizedEmail = email.trim().toLowerCase();
      const stored = otpStore.get(normalizedEmail);

      if (!stored) {
        return res.status(400).json({ success: false, message: 'No OTP code was requested for this email. Please request a new code.' });
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
      }

      if (stored.otp !== otp.trim()) {
        return res.status(400).json({ success: false, message: 'Incorrect verification code. Please check your email and try again.' });
      }

      // Valid OTP
      otpStore.delete(normalizedEmail);

      return res.json({
        success: true,
        message: 'Authentication successful!',
        user: {
          email: normalizedEmail,
          authenticatedAt: new Date().toISOString()
        }
      });

    } catch (err: any) {
      console.error('Verify OTP Error:', err);
      res.status(500).json({ success: false, message: 'Server error verifying OTP.' });
    }
  });

  // Vite Middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Lumina Full-Stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
