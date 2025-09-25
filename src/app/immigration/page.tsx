
'use client';

import { getImmigrationPosts } from '@/lib/data';
import { Plane, Loader2 } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { ImmigrationCard } from '@/components/immigration-card';
import { ImmigrationFilters } from '@/components/immigration-filters';
import { Button } from '@/components/ui/button';
import type { ImmigrationPost } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 16;
const sectionColor = '#0ea5e9';

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

export default function ImmigrationPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');

  const [posts, setPosts] = useState<ImmigrationPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setLoading(true);
      const { data, totalCount } = await getImmigrationPosts({
        searchQuery: q || undefined,
        page: 1,
        limit: ITEMS_PER_PAGE,
      });
      setPosts(data);
      setPage(1);
      setHasMore(totalCount > ITEMS_PER_PAGE);
      setLoading(false);
    };

    fetchInitialPosts();
  }, [q]);

  const loadMorePosts = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data, totalCount } = await getImmigrationPosts({
      searchQuery: q || undefined,
      page: nextPage,
      limit: ITEMS_PER_PAGE,
    });
    
    setPosts(prev => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(posts.length + data.length < totalCount);
    setLoadingMore(false);
  };

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
                <Button onClick={loadMorePosts} disabled={loadingMore} size="lg" className="active:scale-95 transition-transform" style={{ backgroundColor: sectionColor }}>
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
