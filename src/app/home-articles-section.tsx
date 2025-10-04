'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Newspaper, ArrowLeft } from 'lucide-react';

export function ArticlesSection() {
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
