
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, Star, Users, MessageSquare, Landmark, Plane, BarChart3, StarIcon } from 'lucide-react';
import { motion, useInView } from "framer-motion";
import type { Testimonial } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { TestimonialCard } from '@/app/testimonials/testimonial-card';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';

// CountUp component for animating numbers
const CountUp = ({ end, duration = 2 }: { end: number, duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;  
    const frameDuration = 1000 / 60;  
    const totalFrames = Math.round(duration * 1000 / frameDuration);  
    const increment = (end - start) / totalFrames;  

    let currentFrame = 0;  
    const timer = setInterval(() => {  
        currentFrame++;  
        start += increment;  
        setCount(Math.floor(start));  
        if (currentFrame === totalFrames) {  
            setCount(end); // Ensure it ends on the exact number  
            clearInterval(timer);  
        }  
    }, frameDuration);  

    return () => clearInterval(timer);

  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

// Stats Section Component
function StatsSection({ stats }: { stats: { jobs: number, competitions: number, immigration: number, seekers: number } }) {
  const statItems = [
    {
      label: "عروض عمل",
      count: stats.jobs,
      icon: Briefcase,
      color: "#0D47A1", // Dark Blue for Job Offers
    },
    {
      label: "فرصة هجرة",
      count: stats.immigration,
      icon: Plane,
      color: "#0ea5e9", // Sky Blue for Immigration
    },
    {
      label: "مباراة عمومية",
      count: stats.competitions,
      icon: Landmark,
      color: "#14532d", // Dark Green for Competitions
    },
    {
      label: "باحث عن عمل",
      count: stats.seekers,
      icon: Users,
      color: "#424242", // Dark Gray for Job Seekers
    }
  ];

  return (
    <section className="relative overflow-hidden bg-muted/50 rounded-2xl">
      <div  
        aria-hidden="true"  
        className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"  
      ></div>
      <div className="container relative mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex justify-center items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            منصتنا بالأرقام
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">نحن ننمو كل يوم بفضل ثقتكم، ونسعى لربط الكفاءات بأفضل الفرص.</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto">
          {statItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              <Card 
                className="p-4 md:p-6 text-center flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl border-transparent border bg-background"
                style={{'--stat-color': item.color} as React.CSSProperties}
              >
                <div 
                    className="p-3 md:p-4 rounded-full"
                    style={{ backgroundColor: `${item.color}1A`, color: item.color }}
                >
                  <item.icon className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <p className="text-sm md:text-lg font-semibold text-foreground">{item.label}</p>
                <div 
                    className="text-3xl md:text-5xl font-bold"
                    style={{ color: item.color }}
                >
                  <CountUp end={item.count} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-150px" });
  const isMobile = useIsMobile();

  const displayCount = isMobile ? 1 : 4;
  const displayedTestimonials = testimonials.slice(0, displayCount);

  return (
    <section ref={ref}>
      <div className="container mx-auto px-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground flex justify-center items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            ماذا يقول مستخدمونا؟
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">آراؤكم هي مصدر إلهامنا ووقودنا للتطور المستمر.</p>
        </motion.div>

        {testimonials.length > 0 ? (  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">  
            {displayedTestimonials.map((testimonial, index) => (  
              <motion.div  
                key={testimonial.id}  
                custom={index}  
                initial={{ opacity: 0, y: 50 }}  
                animate={isInView ? { opacity: 1, y: 0 } : {}}  
                transition={{ duration: 0.5, delay: index * 0.2 }}  
                className={cn(index >= 1 && 'hidden sm:block', index >= 4 && 'hidden lg:block')}
              >  
                <TestimonialCard testimonial={testimonial} />  
              </motion.div>  
            ))}  
          </div>  
        ) : (  
          <Card className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">  
            <MessageSquare className="w-16 h-16 text-muted-foreground/30" />  
            <p className="text-lg">كن أول من يشاركنا رأيه في المنصة!</p>  
          </Card>  
        )}  

        <div className="mt-10 text-center flex flex-col sm:flex-row justify-center items-center gap-4">  
          <Button asChild variant="outline" size="lg" className="active:scale-95 transition-transform">  
            <Link href="/testimonials">عرض كل الآراء</Link>  
          </Button>  
          <Button asChild size="lg" className="active:scale-95 transition-transform">  
            <Link href="/add-testimonial">أضف رأيك</Link>  
          </Button>  
        </div>  
      </div>  
    </section>
  );
}

interface HomeExtraSectionsProps {
  testimonials: Testimonial[];
  stats: {
    jobs: number;
    competitions: number;
    immigration: number;
    seekers: number;
  };
}

// Main component to export
export function HomeExtraSections({ testimonials, stats }: HomeExtraSectionsProps) {
  return (  
    <div className="space-y-12">  
      <StatsSection stats={stats} />  
      <Separator />
      <TestimonialsSection testimonials={testimonials} />  
    </div>  
  );
}
