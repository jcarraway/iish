export interface QualityCheckResult {
  passed: boolean;
  issues: string[];
  suggestions: string[];
}

export async function checkImageQuality(file: File): Promise<QualityCheckResult> {
  const issues: string[] = [];
  const suggestions: string[] = [];

  // File size checks
  if (file.size < 50 * 1024) {
    issues.push('File is very small — may be blank or low quality');
    suggestions.push('Try taking a clearer photo');
  }
  if (file.size > 20 * 1024 * 1024) {
    issues.push('File exceeds 20MB limit');
    suggestions.push('Try a lower resolution or compress the image');
  }

  // Skip pixel checks for PDFs
  if (file.type === 'application/pdf') {
    return { passed: issues.length === 0, issues, suggestions };
  }

  // Image dimension and brightness checks
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const shortSide = Math.min(width, height);

    if (shortSide < 800) {
      issues.push('Image resolution is too low');
      suggestions.push('Move camera closer to the document');
    }

    // Sample brightness using a small canvas
    const canvas = new OffscreenCanvas(
      Math.min(width, 200),
      Math.min(height, 200)
    );
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let totalBrightness = 0;
    const pixelCount = pixels.length / 4;
    for (let i = 0; i < pixels.length; i += 4) {
      totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    }
    const meanBrightness = totalBrightness / pixelCount;

    if (meanBrightness < 40) {
      issues.push('Image appears too dark');
      suggestions.push('Improve lighting conditions');
    } else if (meanBrightness > 240) {
      issues.push('Image appears washed out or overexposed');
      suggestions.push('Reduce glare — avoid direct light on the document');
    }

    bitmap.close();
  } catch {
    // Canvas not available or image cannot be decoded — skip these checks
  }

  return { passed: issues.length === 0, issues, suggestions };
}

export async function createThumbnail(file: File, maxDim = 200): Promise<string> {
  if (file.type === 'application/pdf') {
    // Return a placeholder for PDFs
    return '';
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(maxDim / bitmap.width, maxDim / bitmap.height, 1);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.7 });
  return URL.createObjectURL(blob);
}

export async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import('heic2any')).default;
  const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 }) as Blob;
  const name = file.name.replace(/\.heic$/i, '.jpg');
  return new File([blob], name, { type: 'image/jpeg' });
}
