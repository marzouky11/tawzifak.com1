client';

import { Landmark } from 'lucide-react';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { CompetitionCard } from '@/components/competition-card';
import { CompetitionFilters } from '@/components/competition-filters';
import type { Competition } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getCompetitions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'المباريات العمومية - آخر إعلانات التوظيف في القطاع العام',
  description: 'تصفح أحدث إعلانات مباريات التوظيف في القطاع العام بالمغرب. فرص في الوزارات، الجماعات المحلية، والمؤسسات العمومية.',
};

const ITEMS_PER_PAGE = 16;
const CACHE_KEY_PREFIX = 'competitions_cache_';

function CompetitionListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <CompetitionCard key={i} competition={null} />
      ))}
    </div>
  );
}

function CompetitionFiltersSkeleton() {
    return <div className="h-14 bg-muted rounded-xl w-full animate-pulse" />;
}

function PageContent() {
  const searchParams = useSearchParams();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const q = searchParams.get('q');
  
  const getCacheKey = useCallback(() => {
    return `${CACHE_KEY_PREFIX}${q || ''}`;
  }, [q]);

  const fetchAndSetCompetitions = useCallback(async (pageNum: number, reset: boolean) => {
    if(pageNum === 1) setLoading(true); else setLoadingMore(true);

    const { data: newCompetitions, totalCount } = await getCompetitions({
      searchQuery: q || undefined,
      page: pageNum,
      limit: ITEMS_PER_PAGE,
    });

    setCompetitions(prev => {
        const updatedCompetitions = reset ? newCompetitions : [...prev, ...newCompetitions];
        try {
            sessionStorage.setItem(getCacheKey(), JSON.stringify({
                items: updatedCompetitions,
                page: pageNum,
                hasMore: (pageNum * ITEMS_PER_PAGE) < totalCount
            }));
        } catch (e) { console.error("Failed to save to sessionStorage", e); }
        return updatedCompetitions;
    });
    setHasMore((pageNum * ITEMS_PER_PAGE) < totalCount);

    if(pageNum === 1) setLoading(false); else setLoadingMore(false);
  }, [q, getCacheKey]);

  useEffect(() => {
    const cacheKey = getCacheKey();
    try {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            const { items, page: cachedPage, hasMore: cachedHasMore } = JSON.parse(cachedData);
            setCompetitions(items);
            setPage(cachedPage);
            setHasMore(cachedHasMore);
            setLoading(false);
            return;
        }
    } catch(e) { console.error("Failed to read from sessionStorage", e); }
    
    setCompetitions([]);
    setPage(1);
    setHasMore(true);
    fetchAndSetCompetitions(1, true);
  }, [q, fetchAndSetCompetitions, getCacheKey]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAndSetCompetitions(nextPage, false);
  };

  return (
    <>
       <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
          <Suspense fallback={<CompetitionFiltersSkeleton />}>
            <CompetitionFilters />
          </Suspense>
        </div>
      </div>
      
      <div className="container pt-4 pb-6">
        {loading ? (
          <CompetitionListSkeleton />
        ) : competitions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {competitions.map((comp) => <CompetitionCard key={comp.id} competition={comp} />)}
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
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد مباريات تطابق بحثك.</p>
        )}
      </div>
    </>
  );
}


export default function CompetitionsPage() {
    return (
        <>
            <MobilePageHeader title="المباريات العمومية" sticky={false}>
                <Landmark className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Landmark}
                title="المباريات العمومية"
                description="تصفح أحدث إعلانات التوظيف والمباريات في القطاع العام."
            />
            <Suspense fallback={<div className="container"><CompetitionListSkeleton /></div>}>
                <PageContent />
            </Suspense>
        </>
    )
}
