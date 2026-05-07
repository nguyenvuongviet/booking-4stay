"use client";

import { Button } from "@/_components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  const prev = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const next = () => {
    if (page < pageCount) onPageChange(page + 1);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (pageCount <= maxVisible) {
      for (let i = 1; i <= pageCount; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");

      const start = Math.max(2, page - 1);
      const end = Math.min(pageCount - 1, page + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (page < pageCount - 2) pages.push("...");
      pages.push(pageCount);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100 mt-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Trang <span className="text-gray-900">{page}</span> / {pageCount}
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-gray-200 hover:border-primary hover:text-primary transition-all"
          disabled={page === 1}
          onClick={prev}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-2 text-gray-400 text-sm">
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={page === p ? "default" : "ghost"}
                size="sm"
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                  page === p
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => onPageChange(Number(p))}
              >
                {p}
              </Button>
            ),
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg border-gray-200 hover:border-primary hover:text-primary transition-all"
          disabled={page === pageCount}
          onClick={next}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
