
import { Landmark } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { CompetitionCard } from '@/components/competition-card';
import { CompetitionPageContent } from './competition-page-content';

function CompetitionListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <CompetitionCard key={i} competition={null} />
      ))}
    </div>
  );
}

export default function CompetitionsPage() {
    return (
        <>
            <MobilePageHeader title="المباريات العمومية" sticky={false}>
                <Landmark className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Landmark}
                title="المباريات العمومية"
                description="تصفح أحدث إعلانات التوظيف والمباريات في القطاع العام."
            />
            <Suspense fallback={<div className="container"><CompetitionListSkeleton /></div>}>
                <CompetitionPageContent />
            </Suspense>
        </>
    )
}
