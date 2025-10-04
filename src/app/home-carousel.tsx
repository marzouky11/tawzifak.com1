'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const slidesData = [
  {
    key: 'jobs',
    desktopSrc: "/web1.png",
    mobileSrc: "/Sliderphone1.jpg",
    alt: "وظائف مميزة",
    title: "وظائف مميزة بانتظارك",
    description: "استكشف الفرص المناسبة لمهاراتك واهتماماتك",
    buttonText: "استكشف الآن",
    buttonLink: "/jobs",
    buttonClass: "bg-[#0D47A1] hover:bg-[#0D47A1]/90"
  },
  {
    key: 'immigration',
    desktopSrc: "/web2.png",
    mobileSrc: "/Sliderphone2.png",
    alt: "فرص الهجرة",
    title: "فرص الهجرة حول العالم",
    description: "اكتشف أحدث فرص الهجرة للعمل والدراسة",
    buttonText: "استكشف الآن",
    buttonLink: "/immigration",
    buttonClass: "bg-[#0ea5e9] hover:bg-[#0ea5e9]/90"
  },
  {
    key: 'competitions',
    desktopSrc: "/web5.png",
    mobileSrc: "/Sliderphone5.jpg",
    alt: "المباريات العمومية",
    title: "المباريات العمومية",
    description: "اكتشف آخر مباريات التوظيف في القطاع العام",
    buttonText: "استكشف الآن",
    buttonLink: "/competitions",
    buttonClass: "bg-[#14532d] hover:bg-[#14532d]/90"
  },
  {
    key: 'workers',
    desktopSrc: "/web3.png",
    mobileSrc: "/Sliderphone3.png",
    alt: "باحثون عن عمل",
    title: "باحثون عن عمل",
    description: "تصفح ملفات الباحثين عن عمل في مختلف المجالات",
    buttonText: "استكشف الآن",
    buttonLink: "/workers",
    buttonClass: "bg-[#424242] hover:bg-[#424242]/90"
  }
];

export function HomeCarousel() {
  const { user, loading: authLoading } = useAuth();
  const [isMounted, setIsMounted] = React.useState(false);
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slidesData.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (!isMounted || authLoading) {
    return <Skeleton className="w-full h-64 md:h-80 rounded-2xl" />;
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-lg relative h-64 md:h-80">
      {slidesData.map((slide, index) => (
        <div
          key={slide.key}
          className={cn(
            "absolute inset-0 w-full h-full transition-opacity duration-1000",
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <div className="hidden md:block w-full h-full relative">
            <Image
              src={slide.desktopSrc}
              alt={slide.alt}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent flex items-center p-12">
              <div className="w-[45%] text-white space-y-4">
                <h2 className="text-5xl font-bold leading-tight drop-shadow-md">{slide.title}</h2>
                <p className="text-lg text-white/90 drop-shadow-sm">{slide.description}</p>
                <Button
                  asChild
                  size="lg"
                  className={cn(
                    "text-white font-semibold transition-transform hover:scale-105",
                    slide.buttonClass
                  )}
                >
                  <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="md:hidden w-full h-full relative">
            <Image
              src={slide.mobileSrc}
              alt={slide.alt}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
              <div className="text-white space-y-2">
                <h2 className="text-2xl font-bold leading-tight drop-shadow-md">{slide.title}</h2>
                <p className="text-sm text-white/90 drop-shadow-sm">{slide.description}</p>
                <Button
                  asChild
                  size="sm"
                  className={cn("text-white font-semibold mt-2", slide.buttonClass)}
                >
                  <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
          }
