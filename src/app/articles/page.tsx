'use client';

import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { getArticles as getDbArticles } from '@/lib/data';
import { getArticles as getStaticArticles } from '@/lib/articles';
import { Newspaper } from 'lucide-react';
import { ArticleCard } from './article-card';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Article } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ARTICLES_PER_PAGE = 8;
const CACHE_KEY = 'articles_cache';

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
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const staticArticles = useMemo(() => getStaticArticles(), []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    const dbArticles = await getDbArticles();
    const combined = [...staticArticles, ...dbArticles].sort((a, b) => {
      const dateA = a.createdAt ? a.createdAt.toMillis() : (a.date ? new Date(a.date).getTime() : 0);
      const dateB = b.createdAt ? b.createdAt.toMillis() : (b.date ? new Date(b.date).getTime() : 0);
      return dateB - dateA;
    });
    
    setAllArticles(combined);
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(combined));
    } catch (e) { console.error("Failed to save to sessionStorage", e); }
    setLoading(false);
  }, [staticArticles]);

  useEffect(() => {
    try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
            setAllArticles(JSON.parse(cachedData));
            setLoading(false);
        } else {
            fetchArticles();
        }
    } catch (e) {
        console.error("Failed to read from sessionStorage", e);
        fetchArticles();
    }
  }, [fetchArticles]);
  
  const loadMoreArticles = () => {
    setPage(prevPage => prevPage + 1);
  };

  const displayedArticles = useMemo(() => {
    return allArticles.slice(0, page * ARTICLES_PER_PAGE);
  }, [allArticles, page]);

  useEffect(() => {
    if (displayedArticles.length >= allArticles.length && allArticles.length > 0) {
      setHasMore(false);
    } else if (allArticles.length > 0) {
      setHasMore(true);
    }
  }, [displayedArticles, allArticles]);

  return (
    <>
      <MobilePageHeader title="مقالات" href="/">
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
                <Button onClick={loadMoreArticles} size="lg" className="active:scale-95 transition-transform" variant="outline">
                    تحميل المزيد
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
