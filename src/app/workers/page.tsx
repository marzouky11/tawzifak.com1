
import { JobCard } from '@/components/job-card';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Users } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { WorkersPageContent } from './workers-page-content';

function WorkerListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
         <JobCard key={i} job={null} />
      ))}
    </div>
  );
}

export default function WorkersPage() {
    return (
        <>
            <MobilePageHeader title="باحثون عن عمل" sticky={false}>
                <Users className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Users}
                title="باحثون عن عمل"
                description="استعرض ملفات الباحثين عن عمل واعثر على الكفاءات التي تحتاجها."
            />
            <Suspense fallback={<div className="container"><WorkerListSkeleton/></div>}>
                <WorkersPageContent />
            </Suspense>
        </>
    )
}
