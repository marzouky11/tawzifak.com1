
'use client';

import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { getTestimonials } from '@/lib/data';
import { Loader2, MessageSquare } from 'lucide-react';
import { TestimonialCard } from './testimonial-card';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Testimonial } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const TESTIMONIALS_PER_PAGE = 8;
const buttonColor = '#3b82f6'; // blue-500

export default function TestimonialsPage() {
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([]);
  const [displayedTestimonials, setDisplayedTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  useEffect(() => {
    async function fetchTestimonials() {
      setLoading(true);
      const data = await getTestimonials();
      setAllTestimonials(data);
      setDisplayedTestimonials(data.slice(0, TESTIMONIALS_PER_PAGE));
      setHasMore(data.length > TESTIMONIALS_PER_PAGE);
      setLoading(false);
    }
    fetchTestimonials();
  }, []);

  const loadMoreTestimonials = () => {
    setLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedTestimonials.length;
      const nextTestimonials = allTestimonials.slice(currentLength, currentLength + TESTIMONIALS_PER_PAGE);
      setDisplayedTestimonials([...displayedTestimonials, ...nextTestimonials]);
      if (currentLength + TESTIMONIALS_PER_PAGE >= allTestimonials.length) {
        setHasMore(false);
      }
      setLoadingMore(false);
    }, 500); // Simulate network delay
  };

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayedTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {hasMore && (
          <div className="text-center mt-8">
            <Button onClick={loadMoreTestimonials} disabled={loadingMore} size="lg" className="active:scale-95 transition-transform" style={{ backgroundColor: buttonColor }}>
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
      </div>
    </>
  );
}
