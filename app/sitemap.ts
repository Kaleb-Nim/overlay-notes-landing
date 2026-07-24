import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteConfig.baseUrl, lastModified: new Date() }];
}
