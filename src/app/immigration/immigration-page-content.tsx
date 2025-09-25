
'use client';

import { getImmigrationPosts } from '@/lib/data';
import { Suspense, useEffect, useState } from 'react';
import { ImmigrationCard } from '@/components/immigration-card';
import { ImmigrationFilters } from '@/components/immigration-filters';
import type { ImmigrationPost } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { PaginationControls } from '@/components/pagination-controls';

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

export function ImmigrationPageContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q');
  const page = searchParams.get('page') ?? '1';

  const [allPosts, setAllPosts] = useState<ImmigrationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [q, page]);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, totalCount } = await getImmigrationPosts({
        searchQuery: q || undefined,
      });
      setAllPosts(data);
      setTotalCount(totalCount);
      setLoading(false);
    };

    fetchPosts();
  }, [q]);

  const currentPage = Number(page);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const paginatedPosts = allPosts.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
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
        ) : paginatedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedPosts.map((post) => <ImmigrationCard key={post.id} post={post} />)}
            </div>
             {totalPages > 1 && (
                <PaginationControls totalPages={totalPages} currentPage={currentPage} />
            )}
          </>
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد فرص هجرة تطابق بحثك.</p>
        )}
      </div>
    </>
  );
}
