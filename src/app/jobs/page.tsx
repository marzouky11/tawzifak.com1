
'use client';

import { JobCard } from '@/components/job-card';
import { getJobs } from '@/lib/data';
import { JobFilters } from '@/components/job-filters';
import type { WorkType } from '@/lib/types';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Briefcase, Loader2 } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import type { Job } from '@/lib/types';

const ITEMS_PER_PAGE = 16;
const sectionColor = '#0D47A1';

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

export default function JobsPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const workType = searchParams.get('workType');
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const fetchInitialJobs = async () => {
      setLoading(true);
      const { data, totalCount } = await getJobs({
        postType: 'seeking_worker',
        searchQuery: q || undefined,
        country: country || undefined,
        city: city || undefined,
        categoryId: category || undefined,
        workType: workType as WorkType || undefined,
        page: 1,
        limit: ITEMS_PER_PAGE,
      });
      setJobs(data);
      setPage(1);
      setHasMore(totalCount > ITEMS_PER_PAGE);
      setLoading(false);
    };

    fetchInitialJobs();
  }, [q, country, city, category, workType]);

  const loadMoreJobs = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data, totalCount } = await getJobs({
        postType: 'seeking_worker',
        searchQuery: q || undefined,
        country: country || undefined,
        city: city || undefined,
        categoryId: category || undefined,
        workType: workType as WorkType || undefined,
        page: nextPage,
        limit: ITEMS_PER_PAGE,
    });
    
    setJobs(prev => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(jobs.length + data.length < totalCount);
    setLoadingMore(false);
  };

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
                <Button onClick={loadMoreJobs} disabled={loadingMore} size="lg" className="active:scale-95 transition-transform" style={{ backgroundColor: sectionColor }}>
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
