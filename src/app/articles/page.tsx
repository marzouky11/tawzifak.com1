
'use client';

import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { getArticles as getDbArticles } from '@/lib/data';
import { getArticles as getStaticArticles } from '@/lib/articles';
import { Newspaper } from 'lucide-react';
import { ArticleCard } from './article-card';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Article } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ARTICLES_PER_PAGE = 8;
const articleSectionColor = '#00897B';

function ArticlesListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {Array.from({ length: ARTICLES_PER_PAGE }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        </div>
      ))}
    </div>
  );
}

export default function ArticlesPage() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [displayedArticles, setDisplayedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchArticles() {
      setLoading(true);
      const staticArticles = getStaticArticles();
      const dbArticles = await getDbArticles();

      const sortedArticles = [...staticArticles, ...dbArticles].sort((a, b) => {
          const dateA = a.createdAt ? a.createdAt.toMillis() : (a.date ? new Date(a.date).getTime() : 0);
          const dateB = b.createdAt ? b.createdAt.toMillis() : (b.date ? new Date(b.date).getTime() : 0);
          return dateB - dateA;
      });
      
      setAllArticles(sortedArticles);
      setDisplayedArticles(sortedArticles.slice(0, ARTICLES_PER_PAGE));
      setHasMore(sortedArticles.length > ARTICLES_PER_PAGE);
      setLoading(false);
    }
    fetchArticles();
  }, []);

  const loadMoreArticles = () => {
    setLoadingMore(true);
    setTimeout(() => {
        const currentLength = displayedArticles.length;
        const nextArticles = allArticles.slice(currentLength, currentLength + ARTICLES_PER_PAGE);
        setDisplayedArticles([...displayedArticles, ...nextArticles]);
        if (currentLength + ARTICLES_PER_PAGE >= allArticles.length) {
          setHasMore(false);
        }
        setLoadingMore(false);
    }, 500); // Simulate network delay
  };

  return (
    <>
      <MobilePageHeader title="مقالات">
        <Newspaper className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      
      <DesktopPageHeader
        icon={Newspaper}
        title="مقالات لنموك المهني"
        description="نقدم لك مجموعة من المقالات المختارة بعناية لمساعدتك على تطوير مهاراتك، والنجاح في مسيرتك المهنية، ومواكبة آخر تطورات سوق العمل."
      />
        
      <div className="container mx-auto max-w-7xl px-4 pb-8">
        {loading ? (
          <ArticlesListSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayedArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button onClick={loadMoreArticles} disabled={loadingMore} size="lg" className="active:scale-95 transition-transform" style={{ backgroundColor: articleSectionColor }}>
                   {loadingMore ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    'تحميل المزيد'
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
