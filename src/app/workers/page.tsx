import type { Metadata } from 'next';
import { Users } from 'lucide-react';
import { Suspense } from 'react';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { PageContent } from './page-content';

export const metadata: Metadata = {
  title: 'باحثون عن عمل - تصفح ملفات المرشحين',
  description: 'هل تبحث عن موظفين أو عمال؟ استعرض ملفات الباحثين عن عمل في مختلف المجالات والمهن، وتواصل مع الكفاءات التي تحتاجها لمشروعك.',
};

function WorkerListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-muted rounded-lg h-48 animate-pulse" />
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
        <PageContent />
      </Suspense>
    </>
  );
}
