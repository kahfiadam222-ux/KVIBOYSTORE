import { MAX_UPLOAD_BYTES } from "./image-presets";

export type CompressImageOptions = {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
  /** Prefer WebP output when the browser supports it (default: true). */
  preferWebp?: boolean;
};

export type CompressImageResult = {
  dataUrl: string;
  width: number;
  height: number;
  bytes: number;
  mimeType: string;
};

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "File harus berupa gambar (JPG, PNG, WebP, dll).";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `Ukuran file terlalu besar. Maksimal ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.`;
  }
  return null;
}

function estimateDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.round((base64.length * 3) / 4);
}

function fitWithinBox(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let w = width;
  let h = height;

  if (w > maxWidth) {
    h = Math.round((h * maxWidth) / w);
    w = maxWidth;
  }
  if (h > maxHeight) {
    w = Math.round((w * maxHeight) / h);
    h = maxHeight;
  }

  return { width: w, height: h };
}

function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (canvas.toBlob) {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Gagal mengompresi gambar."));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Gagal membaca gambar."));
          reader.readAsDataURL(blob);
        },
        mimeType,
        quality
      );
      return;
    }

    const legacy = canvas.toDataURL(mimeType, quality);
    if (!legacy || legacy.length < 32) {
      reject(new Error("Gagal mengompresi gambar."));
      return;
    }
    resolve(legacy);
  });
}

/**
 * Compresses an image file to a high-quality data URL (WebP when supported).
 * Used across profile avatars, cover images, product images, and banners.
 */
export async function compressImage(
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality = 0.88,
  options?: Omit<CompressImageOptions, "maxWidth" | "maxHeight" | "quality">
): Promise<string> {
  const result = await compressImageDetailed(file, {
    maxWidth,
    maxHeight,
    quality,
    ...options,
  });
  return result.dataUrl;
}

export function compressImageDetailed(
  file: File,
  options: CompressImageOptions
): Promise<CompressImageResult> {
  const { maxWidth, maxHeight, quality = 0.88, preferWebp = true } = options;

  const validationError = validateImageFile(file);
  if (validationError) {
    return Promise.reject(new Error(validationError));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = async () => {
        try {
          const { width, height } = fitWithinBox(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Browser tidak mendukung kompresi gambar."));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          const mimeCandidates = preferWebp
            ? ["image/webp", "image/jpeg"]
            : ["image/jpeg"];

          let dataUrl: string | null = null;
          let mimeType = "image/jpeg";

          for (const mime of mimeCandidates) {
            try {
              const candidate = await canvasToDataUrl(canvas, mime, quality);
              if (candidate && candidate.length > 32) {
                dataUrl = candidate;
                mimeType = mime;
                break;
              }
            } catch {
              // try next format
            }
          }

          if (!dataUrl) {
            reject(new Error("Gagal mengompresi gambar."));
            return;
          }

          resolve({
            dataUrl,
            width,
            height,
            bytes: estimateDataUrlBytes(dataUrl),
            mimeType,
          });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar."));
    };
    reader.onerror = () => reject(new Error("Gagal membaca file."));
  });
}