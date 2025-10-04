'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SectionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
  iconColor?: string;
  children: React.ReactNode;
}

export function Section({ icon: Icon, title, description, href, iconColor, children }: SectionProps) {
  return (
    <section>
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
      {children}
    </section>
  );
      }
