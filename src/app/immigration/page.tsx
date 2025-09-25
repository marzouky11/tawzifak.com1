
'use client';

import { Plane } from 'lucide-react';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { ImmigrationCard } from '@/components/immigration-card';
import { ImmigrationFilters } from '@/components/immigration-filters';
import type { ImmigrationPost } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getImmigrationPosts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 16;

function ImmigrationListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <ImmigrationCard key={i} post={null} />
      ))}
    </div>
  );
}

function ImmigrationFiltersSkeleton() {
    return <div className="h-14 bg-muted rounded-xl w-full animate-pulse" />;
}

function PageContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<ImmigrationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const q = searchParams.get('q');

  const fetchAndSetPosts = useCallback(async (pageNum: number, reset: boolean) => {
    if(pageNum === 1) setLoading(true); else setLoadingMore(true);

    const { data: newPosts, totalCount } = await getImmigrationPosts({
      searchQuery: q || undefined,
      page: pageNum,
      limit: ITEMS_PER_PAGE,
    });

    setPosts(prev => reset ? newPosts : [...prev, ...newPosts]);
    setHasMore((pageNum * ITEMS_PER_PAGE) < totalCount);

    if(pageNum === 1) setLoading(false); else setLoadingMore(false);
  }, [q]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(1);
    fetchAndSetPosts(1, true);
  }, [q, fetchAndSetPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAndSetPosts(nextPage, false);
  };

  return (
    <>
       <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
           <Suspense fallback={<ImmigrationFiltersSkeleton />}>
            <ImmigrationFilters />
          </Suspense>
        </div>
      </div>

      <div className="container pt-4 pb-6">
        {loading ? (
          <ImmigrationListSkeleton />
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {posts.map((post) => <ImmigrationCard key={post.id} post={post} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                 <Button onClick={loadMore} disabled={loadingMore} size="lg" variant="outline" className="active:scale-95 transition-transform">
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
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد فرص هجرة تطابق بحثك.</p>
        )}
      </div>
    </>
  );
}

export default function ImmigrationPage() {
    return (
        <>
            <MobilePageHeader title="فرص الهجرة" sticky={false}>
                <Plane className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Plane}
                title="فرص الهجرة حول العالم"
                description="استكشف أحدث إعلانات الهجرة للعمل، الدراسة، أو التدريب في مختلف الدول."
            />
            <Suspense fallback={<div className="container"><ImmigrationListSkeleton /></div>}>
                <PageContent />
            </Suspense>
        </>
    )
}
