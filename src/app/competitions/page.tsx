
'use client';

import { Landmark } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { CompetitionCard } from '@/components/competition-card';
import { CompetitionFilters } from '@/components/competition-filters';
import type { Competition } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getCompetitions } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 16;

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
  const q = searchParams.get('q');

  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
  const [displayedCompetitions, setDisplayedCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [q]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(true);
      const { data } = await getCompetitions({
        searchQuery: q || undefined,
      });
      setAllCompetitions(data);
      setDisplayedCompetitions(data.slice(0, ITEMS_PER_PAGE));
      setHasMore(data.length > ITEMS_PER_PAGE);
      setLoading(false);
    };

    fetchCompetitions();
  }, [q]);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
        const currentLength = displayedCompetitions.length;
        const nextItems = allCompetitions.slice(currentLength, currentLength + ITEMS_PER_PAGE);
        setDisplayedCompetitions([...displayedCompetitions, ...nextItems]);
        if (currentLength + ITEMS_PER_PAGE >= allCompetitions.length) {
          setHasMore(false);
        }
        setLoadingMore(false);
    }, 500);
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
        ) : displayedCompetitions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedCompetitions.map((comp) => <CompetitionCard key={comp.id} competition={comp} />)}
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
