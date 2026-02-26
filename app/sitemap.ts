import type { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
        url: `${process.env.DOMAIN}`,
        lastModified: new Date(),
        priority: 1,
    },
    {
        url: `${process.env.DOMAIN}/cases`,
        lastModified: new Date(),
        priority: 1,
    },
    {
        url: `${process.env.DOMAIN}/services`,
        lastModified: new Date(),
        priority: 1,
    },
    {
        url: `${process.env.DOMAIN}/blog`,
        lastModified: new Date(),
        priority: 1,
    },
    {
        url: `${process.env.DOMAIN}/contact`,
        lastModified: new Date(),
        priority: 1,
    }
  ]
}