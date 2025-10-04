import type { Metadata } from 'next';
import { getJobs, getTestimonials, getCompetitions, getImmigrationPosts } from '@/lib/data';
import { HomeHeaderMobile } from './home-header-mobile';
import { HomePageClient } from './home-page-client';
import { headers } from 'next/headers';

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

interface HomePageData {
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
}

async function getHomePageData(isMobile: boolean): Promise<HomePageData> {
  const counts = {
    jobOffers: isMobile ? 4 : 8,
    jobSeekers: isMobile ? 2 : 4,
    competitions: isMobile ? 2 : 4,
    immigrationPosts: isMobile ? 4 : 8,
    testimonials: isMobile ? 1 : 4,
  };

  const [  
    jobOffersData,  
    jobSeekersData,  
    competitionsData,  
    immigrationPostsData,  
    testimonialsData,  
  ] = await Promise.all([  
    getJobs({ postType: 'seeking_worker', count: counts.jobOffers }),  
    getJobs({ postType: 'seeking_job', count: counts.jobSeekers }),  
    getCompetitions({ count: counts.competitions }),  
    getImmigrationPosts({ count: counts.immigrationPosts }),  
    getTestimonials(),  
  ]);  

  return {  
    jobOffers: jobOffersData.data,  
    jobSeekers: jobSeekersData.data,  
    competitions: competitionsData.data,  
    immigrationPosts: immigrationPostsData.data,  
    testimonials: testimonialsData.slice(0, counts.testimonials),  
    stats: {  
      jobs: jobOffersData.totalCount,  
      competitions: competitionsData.totalCount,  
      immigration: immigrationPostsData.totalCount,  
      seekers: jobSeekersData.totalCount,  
    }  
  };
}

export default async function HomePage() {
  const userAgent = headers().get('user-agent') || '';
  const isMobile = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const data = await getHomePageData(isMobile);

  return (
    <>
      <HomeHeaderMobile />
      <HomePageClient initialData={data} isMobile={isMobile} />
    </>
  );
}
