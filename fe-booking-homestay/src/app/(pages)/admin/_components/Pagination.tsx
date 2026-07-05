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
    <div className="flex flex-row justify-between items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800 mt-3">
      <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">
        Trang <span className="text-gray-900 dark:text-white">{page}</span> /{" "}
        {pageCount}
      </p>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border-gray-200 hover:border-primary hover:text-primary transition-all cursor-pointer"
          disabled={page === 1}
          onClick={prev}
        >
          <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>

        <div className="flex items-center gap-0.5 sm:gap-1">
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="px-1 text-gray-400 text-xs sm:text-sm"
              >
                ...
              </span>
            ) : (
              <Button
                key={p}
                variant={page === p ? "default" : "ghost"}
                size="sm"
                className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${
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
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border-gray-200 hover:border-primary hover:text-primary transition-all cursor-pointer"
          disabled={page === pageCount}
          onClick={next}
        >
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
      </div>
    </div>
  );
}
