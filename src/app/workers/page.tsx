
'use client';

import { JobCard } from '@/components/job-card';
import { getJobs } from '@/lib/data';
import { JobFilters } from '@/components/job-filters';
import type { WorkType, Job } from '@/lib/types';
import { Suspense, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Users, Loader2 } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 16;
const sectionColor = '#424242';

function JobFiltersSkeleton() {
    return <div className="h-14 bg-muted rounded-lg w-full animate-pulse" />;
}

function WorkerListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
         <JobCard key={i} job={null} />
      ))}
    </div>
  );
}

export default function WorkersPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const workType = searchParams.get('workType');

  const [allWorkers, setAllWorkers] = useState<Job[]>([]);
  const [displayedWorkers, setDisplayedWorkers] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [q, country, city, category, workType]);

  useEffect(() => {
    const fetchInitialWorkers = async () => {
      setLoading(true);
      const { data } = await getJobs({
        postType: 'seeking_job',
        searchQuery: q || undefined,
        country: country || undefined,
        city: city || undefined,
        categoryId: category || undefined,
        workType: workType as WorkType || undefined,
      });
      setAllWorkers(data);
      setDisplayedWorkers(data.slice(0, ITEMS_PER_PAGE));
      setHasMore(data.length > ITEMS_PER_PAGE);
      setLoading(false);
    };

    fetchInitialWorkers();
  }, [q, country, city, category, workType]);

  const loadMoreWorkers = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedWorkers.length;
      const nextWorkers = allWorkers.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      setDisplayedWorkers([...displayedWorkers, ...nextWorkers]);
      if (currentLength + ITEMS_PER_PAGE >= allWorkers.length) {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 500);
  };
  
  return (
    <>
      <MobilePageHeader title="باحثون عن عمل" sticky={false}>
        <Users className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Users}
        title="باحثون عن عمل"
        description="استعرض ملفات الباحثين عن عمل واعثر على الكفاءات التي تحتاجها."
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
          <WorkerListSkeleton />
        ) : displayedWorkers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedWorkers.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <Button onClick={loadMoreWorkers} disabled={loadingMore} size="lg" className="active:scale-95 transition-transform" style={{ backgroundColor: sectionColor }}>
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
          <p className="col-span-full text-center text-muted-foreground py-10">لا يوجد باحثون عن عمل يطابقون بحثك.</p>
        )}
      </div>
    </>
  );
}
