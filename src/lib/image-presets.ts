/** High-quality upload presets — tuned for retina display while staying practical for DB storage. */
export const IMAGE_PRESETS = {
  product: { maxWidth: 1200, maxHeight: 1200, quality: 0.9 },
  bannerHorizontal: { maxWidth: 1920, maxHeight: 960, quality: 0.88 },
  bannerVertical: { maxWidth: 1200, maxHeight: 1600, quality: 0.88 },
  floatBanner: { maxWidth: 1200, maxHeight: 1600, quality: 0.88 },
  avatar: { maxWidth: 400, maxHeight: 400, quality: 0.9 },
  cover: { maxWidth: 1920, maxHeight: 480, quality: 0.88 },
} as const;

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024; // 12 MB before compression