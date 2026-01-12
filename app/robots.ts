import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio/', '/artist/', '/_t/'],
      },
    ],
    sitemap: 'https://brolabentertainment.com/sitemap.xml',
  }
}
