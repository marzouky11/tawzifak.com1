
import { Plane } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { ImmigrationCard } from '@/components/immigration-card';
import { ImmigrationPageContent } from './immigration-page-content';

function ImmigrationListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <ImmigrationCard key={i} post={null} />
      ))}
    </div>
  );
}

export default function ImmigrationPage() {
    return (
        <>
            <MobilePageHeader title="فرص الهجرة" sticky={false}>
                <Plane className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Plane}
                title="فرص الهجرة حول العالم"
                description="استكشف أحدث إعلانات الهجرة للعمل، الدراسة، أو التدريب في مختلف الدول."
            />
            <Suspense fallback={<div className="container"><ImmigrationListSkeleton /></div>}>
                <ImmigrationPageContent />
            </Suspense>
        </>
    )
}
