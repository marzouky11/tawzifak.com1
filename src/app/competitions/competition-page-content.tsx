
'use client';

import { getCompetitions } from '@/lib/data';
import { Suspense, useEffect, useState } from 'react';
import { CompetitionCard } from '@/components/competition-card';
import { CompetitionFilters } from '@/components/competition-filters';
import type { Competition } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { PaginationControls } from '@/components/pagination-controls';

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

export function CompetitionPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const page = searchParams.get('page') ?? '1';

  const [allCompetitions, setAllCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [q, page]);

  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoading(true);
      const { data, totalCount } = await getCompetitions({
        searchQuery: q || undefined,
      });
      setAllCompetitions(data);
      setTotalCount(totalCount);
      setLoading(false);
    };

    fetchCompetitions();
  }, [q]);

  const currentPage = Number(page);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedCompetitions = allCompetitions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
        ) : paginatedCompetitions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedCompetitions.map((comp) => <CompetitionCard key={comp.id} competition={comp} />)}
            </div>
            {totalPages > 1 && (
                <PaginationControls totalPages={totalPages} currentPage={currentPage} />
            )}
          </>
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد مباريات تطابق بحثك.</p>
        )}
      </div>
    </>
  );
}
