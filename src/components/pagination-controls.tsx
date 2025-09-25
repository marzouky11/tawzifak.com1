
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import React, { useEffect } from "react";

interface PaginationControlsProps {
  totalPages: number;
  currentPage: number;
  themeColor?: string;
}

export function PaginationControls({
  totalPages,
  currentPage,
  themeColor = 'hsl(var(--primary))'
}: PaginationControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);
  
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = isMobile ? 2 : 5;
    
    let startPage: number, endPage: number;

    if (totalPages <= maxPagesToShow) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor(maxPagesToShow / 2);
        const maxPagesAfterCurrent = Math.ceil(maxPagesToShow / 2) - 1;
        if (currentPage <= maxPagesBeforeCurrent) {
            startPage = 1;
            endPage = maxPagesToShow;
        } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
            startPage = totalPages - maxPagesToShow + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }
    
    if (startPage > 1) {
        pageNumbers.push(
          <span key="start-ellipsis" className="px-1 text-muted-foreground">
            ...
          </span>
        );
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="icon"
          onClick={() => handlePageChange(i)}
          className={cn(i === currentPage && "pointer-events-none")}
          style={i === currentPage ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages) {
       pageNumbers.push(
          <span key="end-ellipsis" className="px-1 text-muted-foreground">
            ...
          </span>
        );
    }

    return pageNumbers;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="active:scale-95 transition-transform"
      >
        <ChevronRight className="h-4 w-4" />
        <span>السابق</span>
      </Button>

      <div className="flex items-center gap-2">{renderPageNumbers()}</div>
      
      <Button
        variant="default"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{ backgroundColor: themeColor }}
        className="active:scale-95 transition-transform text-primary-foreground"
      >
        <span>التالي</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
