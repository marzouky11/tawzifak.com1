'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MobilePageHeaderProps {
  title: string;
  children?: React.ReactNode;
  sticky?: boolean;
}

export function MobilePageHeader({ title, children, sticky = true }: MobilePageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      className={cn(
        'md:hidden flex items-center gap-4 p-4 border-b bg-card mb-4',
        sticky && 'sticky top-0 z-40'
      )}
    >
      <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={handleBack}>
        <ArrowRight className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-3 text-lg font-bold text-foreground">
        {children}
        <h1 className="truncate">{title}</h1>
      </div>
    </div>
  );
}
