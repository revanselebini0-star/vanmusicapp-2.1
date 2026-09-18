export interface ThemeColors {
  hex: string;
  rgb: string;
  lightHex: string;
  darkHex: string;
  glow: string;
  surfaceGlow: string;
  bgGradient: string;
}

export const DEFAULT_THEME: ThemeColors = {
  hex: '#1ed760',
  rgb: '30, 215, 96',
  lightHex: '#1fdf64',
  darkHex: '#169c46',
  glow: 'rgba(30, 215, 96, 0.35)',
  surfaceGlow:
    'radial-gradient(ellipse at 50% -15%, rgba(30, 215, 96, 0.35) 0%, rgba(30, 215, 96, 0.08) 55%, transparent 75%)',
  bgGradient:
    'linear-gradient(180deg, rgba(30, 215, 96, 0.38) 0%, rgba(18, 18, 18, 0.92) 360px, #121212 100%)',
};

// In-memory cache for extracted colors
const colorCache = new Map<string, ThemeColors>();

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = (h % 360) / 360;
  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function componentToHex(c: number): string {
  const hex = Math.min(255, Math.max(0, Math.round(c))).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function buildThemeFromRgb(r: number, g: number, b: number): ThemeColors {
  const [h, s, l] = rgbToHsl(r, g, b);

  // Boost saturation slightly if it's too washed, keep lightness in an optimal 45-60% range for UI readability
  const tunedS = Math.min(0.95, Math.max(0.65, s * 1.15));
  const tunedL = Math.min(0.58, Math.max(0.42, l));
  const [tunedR, tunedG, tunedB] = hslToRgb(h, tunedS, tunedL);

  const hex = rgbToHex(tunedR, tunedG, tunedB);
  const rgb = `${tunedR}, ${tunedG}, ${tunedB}`;

  const [lr, lg, lb] = hslToRgb(h, tunedS, Math.min(0.7, tunedL + 0.12));
  const [dr, dg, db] = hslToRgb(h, tunedS, Math.max(0.3, tunedL - 0.14));

  const lightHex = rgbToHex(lr, lg, lb);
  const darkHex = rgbToHex(dr, dg, db);

  return {
    hex,
    rgb,
    lightHex,
    darkHex,
    glow: `rgba(${rgb}, 0.35)`,
    surfaceGlow: `radial-gradient(ellipse at 50% -15%, rgba(${rgb}, 0.38) 0%, rgba(${rgb}, 0.08) 55%, transparent 75%)`,
    bgGradient: `linear-gradient(180deg, rgba(${rgb}, 0.42) 0%, rgba(18, 18, 18, 0.92) 360px, #121212 100%)`,
  };
}

// Fallback generator when image canvas cannot be read
function fallbackThemeFromString(str: string): ThemeColors {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const [r, g, b] = hslToRgb(hue, 0.8, 0.5);
  return buildThemeFromRgb(r, g, b);
}

/**
 * Extract dominant vibrant color from an image URL
 */
export async function extractThemeFromImage(
  imageUrl: string,
  fallbackSeed = ''
): Promise<ThemeColors> {
  if (!imageUrl) {
    return fallbackSeed ? fallbackThemeFromString(fallbackSeed) : DEFAULT_THEME;
  }

  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      const fallback = fallbackSeed
        ? fallbackThemeFromString(fallbackSeed)
        : DEFAULT_THEME;
      colorCache.set(imageUrl, fallback);
      resolve(fallback);
    }, 2500);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const size = 48; // fast sample
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('No 2d context');
        }

        ctx.drawImage(img, 0, 0, size, size);
        const imgData = ctx.getImageData(0, 0, size, size).data;

        // Bucket colors by hue (36 buckets: 10 deg each)
        const buckets: {
          count: number;
          rSum: number;
          gSum: number;
          bSum: number;
          totalSat: number;
        }[] = Array.from({ length: 36 }, () => ({
          count: 0,
          rSum: 0,
          gSum: 0,
          bSum: 0,
          totalSat: 0,
        }));

        let totalValidPixels = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a < 128) continue; // transparent

          const [h, s, l] = rgbToHsl(r, g, b);

          // Skip pure black/pure white and totally unsaturated gray
          if (l < 0.12 || l > 0.9) continue;
          if (s < 0.18) continue;

          const bucketIdx = Math.min(35, Math.floor(h / 10));
          const weight = 1 + s * 2; // prioritize vibrant colors over dull colors

          buckets[bucketIdx].count += weight;
          buckets[bucketIdx].rSum += r * weight;
          buckets[bucketIdx].gSum += g * weight;
          buckets[bucketIdx].bSum += b * weight;
          buckets[bucketIdx].totalSat += s * weight;
          totalValidPixels++;
        }

        // Find the best bucket with the highest (count * average_saturation)
        let bestBucketIdx = -1;
        let bestScore = -1;

        for (let i = 0; i < buckets.length; i++) {
          if (buckets[i].count > 0) {
            const avgSat = buckets[i].totalSat / buckets[i].count;
            const score = buckets[i].count * Math.pow(avgSat, 1.5);
            if (score > bestScore) {
              bestScore = score;
              bestBucketIdx = i;
            }
          }
        }

        if (bestBucketIdx !== -1 && buckets[bestBucketIdx].count > 0) {
          const b = buckets[bestBucketIdx];
          const r = Math.round(b.rSum / b.count);
          const g = Math.round(b.gSum / b.count);
          const blue = Math.round(b.bSum / b.count);

          const theme = buildThemeFromRgb(r, g, blue);
          colorCache.set(imageUrl, theme);
          resolve(theme);
          return;
        }

        // If no saturated bucket found (e.g. black and white image)
        const fallback = fallbackSeed
          ? fallbackThemeFromString(fallbackSeed)
          : DEFAULT_THEME;
        colorCache.set(imageUrl, fallback);
        resolve(fallback);
      } catch (err) {
        console.warn('Canvas color extraction error, using fallback:', err);
        const fallback = fallbackSeed
          ? fallbackThemeFromString(fallbackSeed)
          : DEFAULT_THEME;
        colorCache.set(imageUrl, fallback);
        resolve(fallback);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      const fallback = fallbackSeed
        ? fallbackThemeFromString(fallbackSeed)
        : DEFAULT_THEME;
      colorCache.set(imageUrl, fallback);
      resolve(fallback);
    };

    img.src = imageUrl;
  });
}

/**
 * Apply extracted theme directly to CSS custom properties on document root
 */
export function applyThemeToCss(theme: ThemeColors): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--accent-color', theme.hex);
  root.style.setProperty('--accent-rgb', theme.rgb);
  root.style.setProperty('--accent-light', theme.lightHex);
  root.style.setProperty('--accent-dark', theme.darkHex);
  root.style.setProperty('--accent-glow', theme.glow);
}
