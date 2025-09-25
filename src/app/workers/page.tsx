
'use client';

import { JobCard } from '@/components/job-card';
import { Suspense, useEffect, useState } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Users } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { JobFilters } from '@/components/job-filters';
import type { WorkType, Job } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getJobs } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 16;

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

function PageContent() {
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
    const fetchWorkers = async () => {
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

    fetchWorkers();
  }, [q, country, city, category, workType]);

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
        const currentLength = displayedWorkers.length;
        const nextItems = allWorkers.slice(currentLength, currentLength + ITEMS_PER_PAGE);
        setDisplayedWorkers([...displayedWorkers, ...nextItems]);
        if (currentLength + ITEMS_PER_PAGE >= allWorkers.length) {
          setHasMore(false);
        }
        setLoadingMore(false);
    }, 500);
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
          <WorkerListSkeleton />
        ) : displayedWorkers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedWorkers.map((job) => <JobCard key={job.id} job={job} />)}
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
          <p className="col-span-full text-center text-muted-foreground py-10">لا يوجد باحثون عن عمل يطابقون بحثك.</p>
        )}
      </div>
    </>
  );
}


export default function WorkersPage() {
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
            <Suspense fallback={<div className="container"><WorkerListSkeleton/></div>}>
                <PageContent />
            </Suspense>
        </>
    )
}
