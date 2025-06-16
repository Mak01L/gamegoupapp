import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://gamgoup.space'
  
  const robots = `User-agent: *
Allow: /
Allow: /rooms
Allow: /rooms/create
Allow: /dashboard
Allow: /auth
Allow: /privacy
Allow: /terms
Allow: /contact
Disallow: /api/
Disallow: /room/
Disallow: /profile/

Sitemap: ${baseUrl}/sitemap.xml

# Optimizado para crawlers de AdSense
User-agent: Googlebot
Allow: /
Allow: /ads.txt

User-agent: AdsBot-Google
Allow: /
Allow: /ads.txt`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
    },
  })
}
