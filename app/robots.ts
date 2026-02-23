import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Block authenticated/private areas from indexing
        disallow: ['/studio/', '/artist/', '/onboarding/', '/sign-in/', '/sign-up/', '/api/'],
      },
    ],
    sitemap: 'https://brolabentertainment.com/sitemap.xml',
  }
}
