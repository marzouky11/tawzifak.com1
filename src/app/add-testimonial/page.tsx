
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { AddTestimonialForm } from './add-testimonial-form';
import { Loader2, MessageSquare } from 'lucide-react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';

export default function AddTestimonialPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/add-testimonial');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="إضافة رأي">
        <MessageSquare className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={MessageSquare}
        title="شاركنا رأيك"
        description="نحن نقدر رأيك كثيرًا. ملاحظاتك تساعدنا على تحسين المنصة وتطويرها."
      />
      <div className="container mx-auto max-w-2xl px-4 pb-8">
        <Card>
          <CardContent className="pt-6">
            <AddTestimonialForm />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
