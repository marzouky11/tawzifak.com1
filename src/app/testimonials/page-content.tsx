'use client';

import { getTestimonials as getDbTestimonials } from '@/lib/data';
import { TestimonialCard } from './testimonial-card';
import type { Testimonial } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const TESTIMONIALS_PER_PAGE = 8;
const CACHE_KEY = 'testimonials_cache';

export function PageContent() {
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchTestimonials = useCallback(async () => {
      setLoading(true);
      const data = await getDbTestimonials();
      setAllTestimonials(data);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch (e) { console.error("Failed to save to sessionStorage", e); }
      setLoading(false);
  }, []);
  
  useEffect(() => {
    try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
            setAllTestimonials(JSON.parse(cachedData));
            setLoading(false);
        } else {
            fetchTestimonials();
        }
    } catch (e) {
        console.error("Failed to read from sessionStorage", e);
        fetchTestimonials();
    }
  }, [fetchTestimonials]);

  const loadMoreTestimonials = () => {
    setPage(prevPage => prevPage + 1);
  };
  
  const displayedTestimonials = useMemo(() => {
    return allTestimonials.slice(0, page * TESTIMONIALS_PER_PAGE);
  }, [allTestimonials, page]);

  const hasMore = useMemo(() => {
    return displayedTestimonials.length < allTestimonials.length;
  }, [displayedTestimonials, allTestimonials]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-[100px] bg-muted rounded animate-pulse" />
                <div className="h-3 w-[70px] bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-[80px] bg-muted rounded animate-pulse" />
            <div className="h-16 w-full bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {displayedTestimonials.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-8">
          <Button onClick={loadMoreTestimonials} size="lg" className="active:scale-95 transition-transform" variant="outline">
            تحميل المزيد
          </Button>
        </div>
      )}
    </>
  );
}
