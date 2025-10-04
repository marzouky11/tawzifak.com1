'use client';

import { useEffect, useState, useCallback } from 'react';
import { ImmigrationCard } from '@/components/immigration-card';
import { ImmigrationFilters } from '@/components/immigration-filters';
import type { ImmigrationPost } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { getImmigrationPosts } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const ITEMS_PER_PAGE = 16;
const CACHE_KEY_PREFIX = 'immigration_cache_';

export function PageContent() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<ImmigrationPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const q = searchParams.get('q');

  const getCacheKey = useCallback(() => {
    return `${CACHE_KEY_PREFIX}${q || ''}`;
  }, [q]);

  const fetchAndSetPosts = useCallback(async (pageNum: number, reset: boolean) => {
    if(pageNum === 1) setLoading(true); else setLoadingMore(true);

    const { data: newPosts, totalCount } = await getImmigrationPosts({
      searchQuery: q || undefined,
      page: pageNum,
      limit: ITEMS_PER_PAGE,
    });

    setPosts(prev => {
        const updatedPosts = reset ? newPosts : [...prev, ...newPosts];
        try {
            sessionStorage.setItem(getCacheKey(), JSON.stringify({
                items: updatedPosts,
                page: pageNum,
                hasMore: (pageNum * ITEMS_PER_PAGE) < totalCount
            }));
        } catch (e) { console.error("Failed to save to sessionStorage", e); }
        return updatedPosts;
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
            setPosts(items);
            setPage(cachedPage);
            setHasMore(cachedHasMore);
            setLoading(false);
            return;
        }
    } catch(e) { console.error("Failed to read from sessionStorage", e); }

    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchAndSetPosts(1, true);
  }, [q, fetchAndSetPosts, getCacheKey]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAndSetPosts(nextPage, false);
  };

  return (
    <>
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
          <ImmigrationFilters />
        </div>
      </div>

      <div className="container pt-4 pb-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {posts.map((post) => <ImmigrationCard key={post.id} post={post} />)}
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
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد فرص هجرة تطابق بحثك.</p>
        )}
      </div>
    </>
  );
          }
