"use client";

import { Button } from "@/_components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function LocationPagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 pt-3.5 sm:pt-6 border-t mt-4 sm:mt-8">
      <p className="text-[11px] sm:text-sm text-muted-foreground font-medium order-2 sm:order-1 mt-1 sm:mt-0">
        Hiển thị trang{" "}
        <span className="text-foreground font-bold">{currentPage}</span> trên{" "}
        <span className="text-foreground font-bold">{totalPages}</span> trang (
        {totalItems} kết quả)
      </p>

      <div className="flex items-center gap-0.5 sm:gap-1.5 order-1 sm:order-2">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-9 sm:w-9 rounded-md sm:rounded-xl hidden sm:flex"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <ChevronsLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-9 sm:w-9 rounded-md sm:rounded-xl"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <div className="flex items-center gap-0.5 sm:gap-1 mx-0.5 sm:mx-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum = currentPage;
            if (currentPage <= 3) pageNum = i + 1;
            else if (currentPage >= totalPages - 2)
              pageNum = totalPages - 4 + i;
            else pageNum = currentPage - 2 + i;

            if (pageNum <= 0 || pageNum > totalPages) return null;

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "ghost"}
                size="icon"
                className={`h-7 w-7 sm:h-9 sm:w-9 rounded-md sm:rounded-xl text-[11px] sm:text-sm font-bold transition-all ${
                  currentPage === pageNum
                    ? "shadow-lg shadow-primary/20 scale-105 sm:scale-110"
                    : "hover:bg-primary/10 hover:text-primary"
                }`}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-9 sm:w-9 rounded-md sm:rounded-xl"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 sm:h-9 sm:w-9 rounded-md sm:rounded-xl hidden sm:flex"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <ChevronsRight className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
