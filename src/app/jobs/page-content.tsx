
'use client';

import { useEffect, useState, useCallback } from 'react';
import { JobCard } from '@/components/job-card';
import { JobFilters } from '@/components/job-filters';
import type { Job, WorkType } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getJobOffers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 16;

export function PageContent() {
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

  const fetchAndSetJobs = useCallback(async (pageNum: number, reset: boolean) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    const { data: newJobs, totalCount } = await getJobOffers({
      searchQuery: q || undefined,
      country: country || undefined,
      city: city || undefined,
      categoryId: category || undefined,
      workType: (workType as WorkType) || undefined,
      page: pageNum,
      limit: ITEMS_PER_PAGE,
    });

    setJobs(prev => (reset ? newJobs : [...prev, ...newJobs]));
    setHasMore((pageNum * ITEMS_PER_PAGE) < totalCount);

    if (pageNum === 1) setLoading(false);
    else setLoadingMore(false);
  }, [q, country, city, category, workType]);

  useEffect(() => {
    setJobs([]);
    setPage(1);
    setHasMore(true);
    fetchAndSetJobs(1, true);
  }, [q, country, city, category, workType, fetchAndSetJobs]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAndSetJobs(nextPage, false);
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
          <JobFilters />
        </div>
      </div>

      <div className="container pt-4 pb-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {jobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  size="lg"
                  variant="outline"
                  className="active:scale-95 transition-transform"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : 'تحميل المزيد'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">
            لا توجد عروض عمل تطابق بحثك.
          </p>
        )}
      </div>
    </>
  );
}
