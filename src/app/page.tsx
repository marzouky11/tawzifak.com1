







import type { Metadata } from 'next';
import Link from 'next/link';
import { JobCard } from '@/components/job-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getJobs, getTestimonials, getCompetitions, getImmigrationPosts } from '@/lib/data';
import React, { Suspense } from 'react';
import { Newspaper, Briefcase, Users, ArrowLeft, Landmark, Plane, FileText } from 'lucide-react';
import { HomePageFilters } from './home-page-filters';
import { HomeCarousel } from './home-carousel';
import { HomeExtraSections } from './home-extra-sections';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeHeaderMobile } from './home-header-mobile';
import { CompetitionCard } from '@/components/competition-card';
import { ImmigrationCard } from '@/components/immigration-card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { CategoryIcon } from '@/components/icons';

export const revalidate = 3600; // Revalidate every hour


const appName = 'توظيفك';
const appDescription = "تعرّف أفضل عروض العمل وفرص الهجرة القانونية والمباريات العمومية بسهولة وموثوقية. اعثر على الفرص التي تناسب مهاراتك وطموحاتك المهنية بسرعة وفعالية وابدأ رحلتك نحو مستقبل مهني ناجح.";

export const metadata: Metadata = {
  title: {
    default: "توظيفك – اكتشف أحدث الوظائف وفرص الهجرة والمباريات العمومية",
    template: `%s | ${appName}`
  },
  description: appDescription,
  robots: 'index, follow',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};


function JobFiltersSkeleton() {
    return (
        <div className="flex gap-2 items-center">
            <div className="h-16 bg-muted rounded-2xl w-full animate-pulse flex-grow" />
        </div>
    );
}

function JobSectionSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <JobCard key={i} job={null} />
            ))}
        </div>
    );
}

async function JobOffersSection() {
    const { data: jobOffers } = await getJobs({ postType: 'seeking_worker', count: 8 });
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {jobOffers.map((job, index) => (
                <div key={job.id} className={cn(index >= 4 && 'hidden sm:block')}>
                    <JobCard job={job} />
                </div>
            ))}
        </div>
    );
}

async function CompetitionsSection() {
    const { data: competitions } = await getCompetitions({ count: 8 });
    if (competitions.length === 0) return null;

    return (
      <>
        <SectionHeader 
          icon={Landmark}
          title="المباريات العمومية"
          description="تصفح آخر مباريات التوظيف في القطاع العام."
          href="/competitions"
          iconColor="#14532d"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {competitions.map((comp, index) => (
             <div key={comp.id} className={cn(index >= 4 && 'hidden sm:block')}>
                <CompetitionCard competition={comp} />
            </div>
          ))}
        </div>
      </>
    );
}

async function ImmigrationSection() {
    const { data: immigrationPosts } = await getImmigrationPosts({ count: 8 });
    if (immigrationPosts.length === 0) return null;

    return (
      <>
        <SectionHeader 
          icon={Plane}
          title="فرص الهجرة"
          description="اكتشف أحدث فرص الهجرة للعمل، الدراسة، أو التدريب حول العالم."
          href="/immigration"
          iconColor="#0ea5e9" // sky-500
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {immigrationPosts.map((post, index) => (
             <div key={post.id} className={cn(index >= 4 && 'hidden sm:block')}>
                <ImmigrationCard post={post} />
            </div>
          ))}
        </div>
      </>
    );
}

async function JobSeekersSection() {
    const { data: jobSeekers } = await getJobs({ postType: 'seeking_job', count: 8 });
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {jobSeekers.map((job, index) => (
                <div key={job.id} className={cn(index >= 4 && 'hidden sm:block')}>
                    <JobCard job={job} />
                </div>
            ))}
        </div>
    );
}

async function ExtraSections() {
    const testimonials = await getTestimonials();
    const { totalCount: jobOffersCount } = await getJobs({ postType: 'seeking_worker' });
    const { totalCount: competitionsCount } = await getCompetitions();
    const { totalCount: immigrationCount } = await getImmigrationPosts();
    const { totalCount: jobSeekersCount } = await getJobs({ postType: 'seeking_job' });

    return (
        <HomeExtraSections
            testimonials={testimonials}
            jobOffersCount={jobOffersCount}
            competitionsCount={competitionsCount}
            immigrationCount={immigrationCount}
            jobSeekersCount={jobSeekersCount}
        />
    );
}

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  iconColor?: string;
}

function SectionHeader({ icon: Icon, title, description, href, iconColor }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-full">
            <Icon className="h-8 w-8" style={{ color: iconColor || 'hsl(var(--primary))' }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button asChild variant="outline" className="shrink-0 active:scale-95 transition-transform">
        <Link href={href}>
          عرض الكل
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function ArticlesSection() {
  const articleSectionColor = '#00897B';
  const articlePrimaryLight = `${articleSectionColor}1A`;

  return (
    <section>
      <Card
        className="overflow-hidden border"
        style={{
          '--article-primary': articleSectionColor,
          '--article-primary-light': articlePrimaryLight,
          borderColor: `${articleSectionColor}33`,
          background: `linear-gradient(to bottom right, var(--article-primary-light), hsl(var(--background)))`,
        } as React.CSSProperties}
      >
        <CardContent className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between text-center md:text-right gap-4 md:gap-8">
            <div className="flex-shrink-0">
                 <div className="p-4 rounded-full w-fit mx-auto md:mx-0" style={{ backgroundColor: 'var(--article-primary-light)' }}>
                    <Newspaper className="h-10 w-10 md:h-12 md:w-12" style={{ color: 'var(--article-primary)' }} />
                </div>
            </div>
            <div className="flex-grow">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">مقالات لنموك المهني</h2>
                <p className="text-muted-foreground mt-2 mb-6 max-w-2xl mx-auto md:mx-0">
                    نصائح للتوظيف، كتابة السيرة الذاتية، وفرص الربح من الإنترنت. محتوى موجه للعرب الباحثين عن الاستقرار المهني أو الحرية المالية.
                </p>
            </div>
            <div className="flex-shrink-0">
                <Button asChild size="lg" style={{ backgroundColor: 'var(--article-primary)' }} className="w-full md:w-auto active:scale-95 transition-transform">
                    <Link href="/articles">
                    اكتشف المقالات
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </CardContent>
      </Card>
    </section>
  );
}


export default function HomePage() {
  return (
    <>
      <HomeHeaderMobile />
      
      <div className="container mt-4">
        <Suspense fallback={<JobFiltersSkeleton />}>
          <HomePageFilters />
        </Suspense>
      </div>
      
      <div className="container mt-6 md:mt-8 mb-12">
        <div className="space-y-12">
            <HomeCarousel />

            <section>
                <SectionHeader 
                icon={Briefcase}
                title="عروض العمل"
                description="اكتشف آخر فرص الشغل التي أضافها أصحاب العمل في مختلف المجالات."
                href="/jobs"
                iconColor="#0D47A1"
                />
                <Suspense fallback={<JobSectionSkeleton />}>
                <JobOffersSection />
                </Suspense>
            </section>

            <div>
                <Separator />
                <div className="pt-12">
                    <Suspense>
                        <ImmigrationSection />
                    </Suspense>
                </div>
            </div>

            <div>
                <Separator />
                <div className="pt-12">
                    <Suspense>
                        <CompetitionsSection />
                    </Suspense>
                </div>
            </div>
            
            <div>
                <Separator />
                <div className="pt-12">
                    <section>
                        <SectionHeader
                        icon={Users}
                        title="باحثون عن عمل"
                        description="تصفح ملفات المرشحين والمهنيين المستعدين للانضمام إلى فريقك."
                        href="/workers"
                        iconColor="#424242"
                        />
                        <Suspense fallback={<JobSectionSkeleton />}>
                        <JobSeekersSection />
                        </Suspense>
                    </section>
                </div>
            </div>

            <div>
                <Separator />
                <div className="pt-12">
                    <ArticlesSection />
                </div>
            </div>
            
            <div className="pt-0">
                <Suspense>
                    <ExtraSections />
                </Suspense>
            </div>
        </div>
      </div>
    </>
  );
}






