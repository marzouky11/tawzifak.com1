
import type { Metadata } from 'next';
import { JobCard } from '@/components/job-card';
import { getJobs } from '@/lib/data';
import { JobFilters } from '@/components/job-filters';
import type { WorkType } from '@/lib/types';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Users } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { PaginationControls } from '@/components/pagination-controls';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'باحثون عن عمل',
  description: 'تصفح ملفات المرشحين والمهنيين المستعدين للانضمام إلى فريقك في مختلف التخصصات والمجالات.',
  robots: {
    index: false,
    follow: false,
  },
};

const ITEMS_PER_PAGE = 16;

function JobFiltersSkeleton() {
    return <div className="h-14 bg-muted rounded-lg w-full animate-pulse" />;
}

function WorkerListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
         <JobCard key={i} job={null} />
      ))}
    </div>
  );
}

async function WorkerList({ jobs }: { jobs: any[] }) {
  if (jobs.length > 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {jobs.map((job) => <JobCard key={job.id} job={job} />)}
      </div>
    );
  }
  return <p className="col-span-full text-center text-muted-foreground py-10">لا يوجد باحثون عن عمل يطابقون بحثك.</p>;
}

export default async function WorkersPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {

  const page = Number(searchParams?.page || '1');

  const { data: jobs, totalCount } = await getJobs({
    postType: 'seeking_job',
    searchQuery: typeof searchParams?.q === 'string' ? searchParams.q : undefined,
    country: typeof searchParams?.country === 'string' ? searchParams.country : undefined,
    city: typeof searchParams?.city === 'string' ? searchParams.city : undefined,
    categoryId: typeof searchParams?.category === 'string' ? searchParams.category : undefined,
    workType: typeof searchParams?.workType === 'string' ? searchParams.workType as WorkType : undefined,
    page: page,
    limit: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

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
       <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm md:top-20">
        <div className="container py-3">
           <Suspense fallback={<JobFiltersSkeleton />}>
            <JobFilters />
          </Suspense>
        </div>
       </div>
      <div className="container pt-4 pb-6">
        <Suspense fallback={<WorkerListSkeleton />}>
          <WorkerList jobs={jobs} />
        </Suspense>
        <PaginationControls totalPages={totalPages} currentPage={page} themeColor="#424242" />
      </div>
    </>
  );
}
