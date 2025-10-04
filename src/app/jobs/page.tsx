'use client';

import { JobCard } from '@/components/job-card';
import type { WorkType } from '@/lib/types';
import { Suspense, useEffect, useState, useCallback } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Briefcase } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Job } from '@/lib/types';
import { JobFilters } from '@/components/job-filters';
import { useSearchParams } from 'next/navigation';
import { getJobs } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 16;
const CACHE_KEY_PREFIX = 'jobs_cache_';

function JobFiltersSkeleton() {
    return <div className="h-14 bg-muted rounded-lg w-full animate-pulse" />;
}

function JobListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <JobCard key={i} job={null} />
      ))}
    </div>
  );
}

function PageContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const q = searchParams.get('q');
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const workType = searchParams.get('workType');

  const getCacheKey = useCallback(() => {
    return `${CACHE_KEY_PREFIX}${q || ''}_${country || ''}_${city || ''}_${category || ''}_${workType || ''}`;
  }, [q, country, city, category, workType]);

  const fetchAndSetJobs = useCallback(async (pageNum: number, reset: boolean) => {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    
    const { data: newJobs, totalCount } = await getJobs({
      postType: 'seeking_worker',
      searchQuery: q || undefined,
      country: country || undefined,
      city: city || undefined,
      categoryId: category || undefined,
      workType: workType as WorkType || undefined,
      page: pageNum,
      limit: ITEMS_PER_PAGE,
    });

    setJobs(prev => {
        const updatedJobs = reset ? newJobs : [...prev, ...newJobs];
        try {
            sessionStorage.setItem(getCacheKey(), JSON.stringify({
                items: updatedJobs,
                page: pageNum,
                hasMore: (pageNum * ITEMS_PER_PAGE) < totalCount
            }));
        } catch (e) { console.error("Failed to save to sessionStorage", e); }
        return updatedJobs;
    });
    setHasMore((pageNum * ITEMS_PER_PAGE) < totalCount);
    
    if (pageNum === 1) setLoading(false); else setLoadingMore(false);
  }, [q, country, city, category, workType, getCacheKey]);

  useEffect(() => {
    const cacheKey = getCacheKey();
    try {
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            const { items, page: cachedPage, hasMore: cachedHasMore } = JSON.parse(cachedData);
            setJobs(items);
            setPage(cachedPage);
            setHasMore(cachedHasMore);
            setLoading(false);
            return;
        }
    } catch(e) { console.error("Failed to read from sessionStorage", e); }

    setJobs([]);
    setPage(1);
    setHasMore(true);
    fetchAndSetJobs(1, true);
  }, [q, country, city, category, workType, fetchAndSetJobs, getCacheKey]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAndSetJobs(nextPage, false);
  };
  
  return (
    <>
       <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
           <Suspense fallback={<JobFiltersSkeleton />}>
            <JobFilters />
          </Suspense>
        </div>
       </div>
      <div className="container pt-4 pb-6">
        {loading ? (
          <JobListSkeleton />
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
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
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد عروض عمل تطابق بحثك.</p>
        )}
      </div>
    </>
  );
}

export default function JobsPage() {
  return (
    <>
      <MobilePageHeader title="الوظائف" sticky={false}>
        <Briefcase className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Briefcase}
        title="عروض العمل"
        description="تصفح أحدث عروض العمل المتاحة في مختلف المجالات والقطاعات."
      />
      <Suspense fallback={<div className="container"><JobListSkeleton /></div>}>
        <PageContent />
      </Suspense>
    </>
  )
}
