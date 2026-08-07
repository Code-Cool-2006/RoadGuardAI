const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Optional Supabase client initialization
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
}
/**
 * Normalizes and processes incoming photo input (URL, base64 data, or local path)
 * Returns a fully accessible public HTTP URL.
 */
async function processAndSavePhoto(photoInput, reqHost = 'localhost:4000', reqProtocol = 'http') {
  if (!photoInput || typeof photoInput !== 'string') {
    return `${reqProtocol}://${reqHost}/uploads/default_pothole.jpg`;
  }

  // 1. If it's already a valid HTTP/HTTPS URL, return directly
  if (photoInput.startsWith('http://') || photoInput.startsWith('https://')) {
    return photoInput;
  }

  const filename = `complaint_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
  const localFilePath = path.join(uploadsDir, filename);

  let imageBuffer = null;

  // 2. Handle base64 Data URIs (e.g., data:image/jpeg;base64,...)
  if (photoInput.startsWith('data:image') || photoInput.includes(';base64,')) {
    const base64Data = photoInput.replace(/^data:image\/\w+;base64,/, '');
    imageBuffer = Buffer.from(base64Data, 'base64');
  } else if (photoInput.length > 200 && !photoInput.startsWith('file://')) {
    // Treat raw base64 string
    imageBuffer = Buffer.from(photoInput, 'base64');
  }

  if (imageBuffer) {
    // Write locally to public/uploads
    fs.writeFileSync(localFilePath, imageBuffer);
    const localPublicUrl = `${reqProtocol}://${reqHost}/uploads/${filename}`;

    // Attempt Supabase Storage upload if bucket exists
    if (supabase) {
      try {
        const { data, error } = await supabase.storage
          .from('complaints')
          .upload(filename, imageBuffer, { contentType: 'image/jpeg', upsert: true });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from('complaints')
            .getPublicUrl(filename);
          if (publicUrlData?.publicUrl) {
            return publicUrlData.publicUrl;
          }
        }
      } catch (sbErr) {
        console.warn('⚠️ Supabase Storage upload fallback to local storage:', sbErr.message);
      }
    }

    return localPublicUrl;
  }

  // 3. Fallback placeholder URL
  return `${reqProtocol}://${reqHost}/uploads/default_pothole.jpg`;
}

module.exports = { processAndSavePhoto };
