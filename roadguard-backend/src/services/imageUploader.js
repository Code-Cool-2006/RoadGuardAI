const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Ensure public uploads directory exists locally
const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initialize Supabase Client if credentials are provided
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}

/**
 * Normalizes and processes incoming photo input (URL, base64 data, or local path)
 * Returns a fully accessible public HTTP URL.
 */
async function processAndUploadImage(photoInput, reqHost = 'localhost:4000') {
  if (!photoInput || typeof photoInput !== 'string') {
    return `http://${reqHost}/uploads/default_hazard.jpg`;
  }

  // 1. If already a valid remote HTTP/HTTPS URL, return as is
  if (photoInput.startsWith('http://') || photoInput.startsWith('https://')) {
    return photoInput;
  }

  // 2. Handle base64 data URI or raw base64 string
  let base64Data = photoInput;
  let ext = 'jpg';
  let mimeType = 'image/jpeg';

  if (photoInput.startsWith('data:')) {
    const matches = photoInput.match(/^data:(image\/(\w+));base64,(.+)$/);
    if (matches) {
      mimeType = matches[1];
      ext = matches[2] === 'jpeg' ? 'jpg' : matches[2];
      base64Data = matches[3];
    } else {
      // Stripping potential data prefix if format slightly differs
      base64Data = photoInput.replace(/^data:image\/\w+;base64,/, '');
    }
  }

  try {
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const filename = `complaint_${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
    const localFilePath = path.join(UPLOADS_DIR, filename);

    // Save locally on server first
    fs.writeFileSync(localFilePath, imageBuffer);
    const localPublicUrl = `http://${reqHost}/uploads/${filename}`;

    // Try Supabase Storage Upload if Supabase client is active
    if (supabase) {
      try {
        const bucketName = 'complaints';
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filename, imageBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filename);

          if (publicUrlData && publicUrlData.publicUrl) {
            console.log(`[ImageUploader] Successfully uploaded to Supabase Bucket: ${publicUrlData.publicUrl}`);
            return publicUrlData.publicUrl;
          }
        } else {
          console.warn('[ImageUploader] Supabase upload note:', error ? error.message : 'No data returned. Using server local storage.');
        }
      } catch (sbErr) {
        console.warn('[ImageUploader] Supabase storage exception:', sbErr.message);
      }
    }

    console.log(`[ImageUploader] Image saved locally: ${localPublicUrl}`);
    return localPublicUrl;

  } catch (err) {
    console.error('[ImageUploader] Error processing image buffer:', err.message);
    return photoInput;
  }
}

module.exports = { processAndUploadImage };
