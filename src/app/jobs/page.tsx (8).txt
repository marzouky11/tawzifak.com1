import type { Metadata } from 'next';
import { Briefcase } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { PageContent } from './page-content';

export const metadata: Metadata = {
  title: 'عروض العمل - وظائف جديدة في المغرب',
  description: 'اكتشف أحدث الوظائف الجديدة في المغرب مع فرص عمل محدثة يوميًا. تصفح عروض التوظيف المتوفرة في مختلف المدن المغربية واختر الوظيفة التي تناسب مهاراتك وطموحاتك.',
};

function JobListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
      ))}
    </div>
  );
}

export default function JobsPage() {
  return (
    <>
      <MobilePageHeader title="الوظائف" sticky={false}>
        <Briefcase className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Briefcase}
        title="عروض العمل"
        description="تصفح أحدث عروض العمل المتاحة في مختلف المجالات والقطاعات."
      />
      <Suspense fallback={<div className="container"><JobListSkeleton /></div>}>
        <PageContent />
      </Suspense>
    </>
  );
}
