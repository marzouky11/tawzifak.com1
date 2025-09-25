
'use client';

import { JobCard } from '@/components/job-card';
import { getJobs } from '@/lib/data';
import { JobFilters } from '@/components/job-filters';
import type { WorkType, Job } from '@/lib/types';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaginationControls } from '@/components/pagination-controls';

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

export function WorkersPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const country = searchParams.get('country');
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const workType = searchParams.get('workType');
  const page = searchParams.get('page') ?? '1';

  const [allWorkers, setAllWorkers] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [q, country, city, category, workType, page]);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      const { data, totalCount } = await getJobs({
        postType: 'seeking_job',
        searchQuery: q || undefined,
        country: country || undefined,
        city: city || undefined,
        categoryId: category || undefined,
        workType: workType as WorkType || undefined,
      });
      setAllWorkers(data);
      setTotalCount(totalCount);
      setLoading(false);
    };

    fetchWorkers();
  }, [q, country, city, category, workType]);

  const currentPage = Number(page);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedWorkers = allWorkers.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );
  
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
        ) : paginatedWorkers.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedWorkers.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
            {totalPages > 1 && (
                <PaginationControls totalPages={totalPages} currentPage={currentPage} />
            )}
          </>
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">لا يوجد باحثون عن عمل يطابقون بحثك.</p>
        )}
      </div>
    </>
  );
}
