import type { SyntheticEvent } from 'react';

/**
 * Shared fallback asset for broken / missing image URLs.
 * Phase 16 Plan 16-REVIEW-NOTES IN-05: catches both empty-string src AND
 * broken-CDN-URL (UploadThing / Imgur 404) failure modes at the `<img>` level.
 */
export const NOT_FOUND_IMAGE = '/not-found-image.webp';

/**
 * onError handler for `<img>` tags. Swaps src to NOT_FOUND_IMAGE on load failure.
 * The endsWith guard prevents an infinite error loop if NOT_FOUND_IMAGE itself 404s.
 */
export function handleImageError(e: SyntheticEvent<HTMLImageElement>): void {
    const img = e.currentTarget;
    if (!img.src.endsWith(NOT_FOUND_IMAGE)) {
        img.src = NOT_FOUND_IMAGE;
    }
}
