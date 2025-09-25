
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import React from "react";

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

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    if (isMobile) {
      // Mobile: Show current page, next page, and ellipsis.
      pageNumbers.push(
        <Button key={currentPage} variant="default" size="icon" style={{ backgroundColor: themeColor, borderColor: themeColor }} className="pointer-events-none">
          {currentPage}
        </Button>
      );
      if (currentPage < totalPages) {
         pageNumbers.push(
          <Button key={currentPage + 1} variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)}>
            {currentPage + 1}
          </Button>
        );
      }
      if (currentPage + 1 < totalPages) {
         pageNumbers.push(<span key="end-ellipsis" className="px-1 text-muted-foreground">...</span>);
      }
      return pageNumbers;
    }


    // Desktop logic
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <Button
          key={1}
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <span key="start-ellipsis" className="px-2">
            ...
          </span>
        );
      }
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
          <span key="end-ellipsis" className="px-2">
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
