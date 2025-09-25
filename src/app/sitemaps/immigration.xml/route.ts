
import { getImmigrationPosts } from '@/lib/data';

export const dynamic = 'force-dynamic';

const baseUrl = 'https://www.tawzifak.com';

function generateSitemap(posts: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${posts
       .map(({ id, createdAt }) => {
         const lastModified = createdAt?.toDate ? createdAt.toDate() : new Date();
         return `
       <url>
           <loc>${`${baseUrl}/immigration/${id}`}</loc>
           <lastmod>${lastModified.toISOString().split('T')[0]}</lastmod>
           <changefreq>daily</changefreq>
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
    const { data: posts } = await getImmigrationPosts({ count: 9999 }); // Fetch all posts
    const sitemap = generateSitemap(posts);

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error("Error generating immigration sitemap:", error);
    return new Response('Error generating immigration sitemap', { status: 500 });
  }
}
