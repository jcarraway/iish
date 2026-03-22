import { v2 as cloudinary } from 'cloudinary';

let _configured = false;
function ensureConfig() {
  if (!_configured) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
      api_key: process.env.CLOUDINARY_API_KEY!,
      api_secret: process.env.CLOUDINARY_API_SECRET!,
    });
    _configured = true;
  }
}

export { cloudinary };

export async function uploadBase64Image(base64: string, folder: string): Promise<string> {
  ensureConfig();
  const result = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64}`, {
    folder,
    resource_type: 'image',
  });
  return result.secure_url;
}

export async function getUploadSignature(folder: string) {
  ensureConfig();
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );
  return {
    timestamp,
    signature,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder,
  };
}
