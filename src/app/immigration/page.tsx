
import type { Metadata } from 'next';
import { getImmigrationPosts } from '@/lib/data';
import { Plane } from 'lucide-react';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { ImmigrationCard } from '@/components/immigration-card';
import { ImmigrationFilters } from '@/components/immigration-filters';
import { PaginationControls } from '@/components/pagination-controls';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'فرص الهجرة - آخر إعلانات الهجرة للعمل، الدراسة والتدريب',
  description: 'تصفح أحدث فرص الهجرة والعمل بالخارج في كندا، أوروبا، وأستراليا وغيرها. معلومات محدثة حول برامج الهجرة الموسمية والدائمة للعرب.',
  robots: 'index, follow',
};

const ITEMS_PER_PAGE = 16;

function ImmigrationFiltersSkeleton() {
    return <div className="h-14 bg-muted rounded-xl w-full animate-pulse" />;
}

export default async function ImmigrationPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {

  const page = Number(searchParams?.page || '1');
  const { data: immigrationPosts, totalCount } = await getImmigrationPosts({
    searchQuery: typeof searchParams?.q === 'string' ? searchParams.q : undefined,
    page: page,
    limit: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
       <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
           <Suspense fallback={<ImmigrationFiltersSkeleton />}>
            <ImmigrationFilters />
          </Suspense>
        </div>
      </div>

      <div className="container pt-4 pb-6">
        {immigrationPosts.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {immigrationPosts.map((post) => <ImmigrationCard key={post.id} post={post} />)}
          </div>
        ) : (
          <p className="col-span-full text-center text-muted-foreground py-10">لا توجد فرص هجرة تطابق بحثك.</p>
        )}
        <PaginationControls totalPages={totalPages} currentPage={page} themeColor="#0ea5e9" />
      </div>
    </>
  );
}
