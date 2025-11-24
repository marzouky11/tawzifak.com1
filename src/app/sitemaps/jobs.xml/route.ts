

import { getJobOffers } from '@/lib/data';

export const dynamic = 'force-dynamic';

const baseUrl = 'https://www.tawzifak.com';

function generateSitemap(jobs: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${jobs
       .map(({ id, createdAt }) => {
         // createdAt could be a Firestore Timestamp
         const lastModified = createdAt?.toDate ? createdAt.toDate() : new Date();
         return `
       <url>
           <loc>${`${baseUrl}/jobs/${id}`}</loc>
           <lastmod>${lastModified.toISOString().split('T')[0]}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.8</priority>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export async function GET() {
  try {
    const { data: jobs } = await getJobOffers({ count: 9999 });
    const sitemap = generateSitemap(jobs);

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error("Error generating jobs sitemap:", error);
    return new Response('Error generating jobs sitemap', { status: 500 });
  }
}
