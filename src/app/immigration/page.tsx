
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

  const [allPosts, setAllPosts] = useState<ImmigrationPost[]>([]);
  const [displayedPosts, setDisplayedPosts] = useState<ImmigrationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [q]);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      setLoading(true);
      const { data } = await getImmigrationPosts({
        searchQuery: q || undefined,
      });
      setAllPosts(data);
      setDisplayedPosts(data.slice(0, ITEMS_PER_PAGE));
      setHasMore(data.length > ITEMS_PER_PAGE);
      setLoading(false);
    };

    fetchInitialPosts();
  }, [q]);

  const loadMorePosts = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedPosts.length;
      const nextPosts = allPosts.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      setDisplayedPosts([...displayedPosts, ...nextPosts]);
      if (currentLength + ITEMS_PER_PAGE >= allPosts.length) {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 500);
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
        ) : displayedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedPosts.map((post) => <ImmigrationCard key={post.id} post={post} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button onClick={loadMorePosts} disabled={loadingMore} size="lg" className="active:scale-95 transition-transform" variant="outline">
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
