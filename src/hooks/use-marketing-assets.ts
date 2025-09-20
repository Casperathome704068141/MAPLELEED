'use client';

import { useEffect, useState } from 'react';
import { getDownloadURL, listAll, ref } from 'firebase/storage';

import { getFirebaseStorage } from '@/lib/firebase';
import { DEFAULT_MARKETING_ASSETS, type MarketingAssets } from '@/lib/marketing-assets';

const dedupe = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

type CategoryKey = keyof MarketingAssets;

function normaliseCategory(identifier: string): CategoryKey {
  const value = identifier.toLowerCase();

  if (value.includes('hero') || value.includes('cover') || value.includes('banner')) {
    return 'hero';
  }

  if (value.includes('study') || value.includes('student') || value.includes('campus') || value.includes('class')) {
    return 'study';
  }

  if (value.includes('travel') || value.includes('flight') || value.includes('journey') || value.includes('airport')) {
    return 'travel';
  }

  if (value.includes('team') || value.includes('advisor') || value.includes('coach') || value.includes('staff')) {
    return 'team';
  }

  return 'gallery';
}

function mergeWithFallbacks(base: MarketingAssets, fallback: MarketingAssets): MarketingAssets {
  return {
    hero: base.hero.length ? dedupe(base.hero) : fallback.hero,
    study: base.study.length ? dedupe(base.study) : fallback.study,
    travel: base.travel.length ? dedupe(base.travel) : fallback.travel,
    team: base.team.length ? dedupe(base.team) : fallback.team,
    gallery: base.gallery.length ? dedupe(base.gallery) : fallback.gallery,
  } satisfies MarketingAssets;
}

export function useMarketingAssets(fallback: MarketingAssets = DEFAULT_MARKETING_ASSETS) {
  const [assets, setAssets] = useState<MarketingAssets>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAssets() {
      setLoading(true);

      try {
        const storage = getFirebaseStorage();
        const rootRef = ref(storage, 'marketing');
        const rootList = await listAll(rootRef);

        const collected: MarketingAssets = {
          hero: [],
          study: [],
          travel: [],
          team: [],
          gallery: [],
        };

        if (rootList.items.length > 0) {
          const rootUrls = await Promise.all(rootList.items.map(item => getDownloadURL(item)));
          rootList.items.forEach((item, index) => {
            const category = normaliseCategory(item.fullPath ?? item.name);
            collected[category].push(rootUrls[index]);
          });
        }

        if (rootList.prefixes.length > 0) {
          const folders = await Promise.all(
            rootList.prefixes.map(async folder => {
              const list = await listAll(folder);
              const urls = await Promise.all(list.items.map(item => getDownloadURL(item)));
              return { name: folder.fullPath ?? folder.name, urls };
            }),
          );

          folders.forEach(folder => {
            const category = normaliseCategory(folder.name);
            folder.urls.forEach(url => {
              const target = collected[category];
              if (!target.includes(url)) {
                target.push(url);
              }
            });
          });
        }

        const merged = mergeWithFallbacks(collected, fallback);

        if (!cancelled) {
          setAssets(merged);
          setError(null);
        }
      } catch (err) {
        console.warn('Unable to load marketing assets from Firebase Storage', err);
        if (!cancelled) {
          setAssets(fallback);
          setError(err instanceof Error ? err : new Error('Failed to load marketing assets'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAssets();

    return () => {
      cancelled = true;
    };
  }, [fallback]);

  return { assets, loading, error } as const;
}

export { DEFAULT_MARKETING_ASSETS } from '@/lib/marketing-assets';
export type { MarketingAssets } from '@/lib/marketing-assets';
