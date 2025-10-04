'use client';

import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { getTestimonials as getDbTestimonials } from '@/lib/data';
import { Loader2, MessageSquare } from 'lucide-react';
import { TestimonialCard } from './testimonial-card';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Testimonial } from '@/lib/types';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'آراء المستخدمين - ماذا يقولون عن منصة توظيفك',
  description: 'اكتشف آراء وتجارب المستخدمين مع منصة توظيفك. نحن نقدر جميع الملاحظات ونسعى دائمًا لتحسين خدماتنا بناءً على تجاربكم.',
};

const TESTIMONIALS_PER_PAGE = 8;
const CACHE_KEY = 'testimonials_cache';

export default function TestimonialsPage() {
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

  return (
    <>
      <MobilePageHeader title="آراء المستخدمين">
        <MessageSquare className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      
      <DesktopPageHeader
        icon={MessageSquare}
        title="آراء المستخدمين"
        description="نحن نقدر جميع الآراء ونسعى دائمًا لتحسين خدماتنا بناءً على ملاحظاتكم."
      />
        
      <div className="container mx-auto max-w-7xl px-4 pb-28">
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-3">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-3 w-[70px]" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
        ) : (
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
        )}
      </div>
    </>
  );
}
