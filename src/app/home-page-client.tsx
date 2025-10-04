'use client';

import React from 'react';
import { JobCard } from '@/components/job-card';
import { CompetitionCard } from '@/components/competition-card';
import { ImmigrationCard } from '@/components/immigration-card';
import { HomeCarousel } from './home-carousel';
import { HomePageFilters } from './home-page-filters';
import { HomeExtraSections } from './home-extra-sections';
import { Section } from './home-sections';
import { ArticlesSection } from './home-articles-section';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Plane, Landmark, Users } from 'lucide-react';

interface HomePageClientProps {
  initialData: {
    jobOffers: any[];
    jobSeekers: any[];
    competitions: any[];
    immigrationPosts: any[];
    testimonials: any[];
    stats: {
      jobs: number;
      competitions: number;
      immigration: number;
      seekers: number;
    };
  };
  isMobile: boolean;
}

function JobFiltersSkeleton() {
  return (
    <div className="flex gap-2 items-center">
      <div className="h-16 bg-muted rounded-2xl w-full animate-pulse flex-grow" />
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <JobCard key={i} job={null} />
      ))}
    </div>
  );
}

export function HomePageClient({ initialData, isMobile }: HomePageClientProps) {
  const [data, setData] = React.useState(initialData);

  React.useEffect(() => {
    // حفظ البيانات في sessionStorage
    sessionStorage.setItem('homepage-data', JSON.stringify(initialData));
  }, [initialData]);

  return (
    <>
      <div className="container mt-4">
        <HomePageFilters />
      </div>
      
      <div className="container mt-6 md:mt-8 mb-12">
        <div className="space-y-12">
          <HomeCarousel />
            
          <Section 
            icon={Briefcase}
            title="عروض العمل"
            description="اكتشف آخر فرص الشغل التي أضافها أصحاب العمل في مختلف المجالات."
            href="/jobs"
            iconColor="#0D47A1"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.jobOffers.map((job) => (
                <div key={job.id}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          </Section>
            
          {data.immigrationPosts.length > 0 && (
            <>
              <Separator />
              <Section 
                icon={Plane}
                title="فرص الهجرة"
                description="اكتشف أحدث فرص الهجرة للعمل، الدراسة، أو التدريب حول العالم."
                href="/immigration"
                iconColor="#0ea5e9"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.immigrationPosts.map((post) => (
                    <div key={post.id}>
                      <ImmigrationCard post={post} />
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {data.competitions.length > 0 && (
            <>
              <Separator />
              <Section 
                icon={Landmark}
                title="المباريات العمومية"
                description="تصفح آخر مباريات التوظيف في القطاع العام."
                href="/competitions"
                iconColor="#14532d"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.competitions.map((comp, index) => (
                    <div key={comp.id} className={index >= 2 && isMobile ? 'hidden sm:block' : ''}>
                      <CompetitionCard competition={comp} />
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}
            
          <Separator />
          <Section
            icon={Users}
            title="باحثون عن عمل"
            description="تصفح ملفات المرشحين والمهنيين المستعدين للانضمام إلى فريقك."
            href="/workers"
            iconColor="#424242"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.jobSeekers.map((job, index) => (
                <div key={job.id} className={index >= 2 && isMobile ? 'hidden sm:block' : ''}>
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          </Section>
            
          <Separator />
          <ArticlesSection />
            
          <HomeExtraSections
            testimonials={data.testimonials}
            stats={data.stats}
          />
        </div>
      </div>
    </>
  );
  }
