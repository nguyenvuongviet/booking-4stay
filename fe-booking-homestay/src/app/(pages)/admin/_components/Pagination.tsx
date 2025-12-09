"use client";

import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex justify-between items-center pt-4">
      <p className="text-sm text-gray-500">
        Page {page} / {pageCount}
      </p>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={prev}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled={page === pageCount}
          onClick={next}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
