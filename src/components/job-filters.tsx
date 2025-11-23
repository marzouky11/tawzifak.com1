
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function JobFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 items-center">
      <div className="relative w-full flex-grow">
        <Input
          placeholder="ابحث بالمنصب، المدينة، الدولة، أو أي كلمة مفتاحية..."
          className="h-14 text-base rounded-xl pl-4 pr-16 border-2 bg-background shadow-inner focus-visible:ring-primary/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button type="submit" size="icon" variant="ghost" className="rounded-full h-10 w-10">
            <Search className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
    </form>
  );
      }
            
