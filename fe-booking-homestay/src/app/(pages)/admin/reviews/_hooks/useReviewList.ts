"use client";

import { deleteReview, getReviews } from "@/services/admin/reviewsApi";
import { Review } from "@/types/review";
import { useEffect, useMemo, useState } from "react";

export function useReviewList() {
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<Review[]>([]);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortType, setSortType] = useState<"newest" | "oldest">("newest");

  const pageSize = 6;
  const [page, setPage] = useState(1);

  async function load() {
    setLoading(true);
    try {
      const data = await getReviews();
      setRaw(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function removeReview(id: number) {
    await deleteReview(id);
    await load();
  }

  const filtered = useMemo(() => {
    let data = [...raw];

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(s) ||
          r.comment?.toLowerCase().includes(s)
      );
    }

    if (ratingFilter !== null) {
      data = data.filter((r) => Math.round(Number(r.rating)) === ratingFilter);
    }

    data.sort((a, b) =>
      sortType === "newest"
        ? +new Date(b.createdAt) - +new Date(a.createdAt)
        : +new Date(a.createdAt) - +new Date(b.createdAt)
    );

    return data;
  }, [raw, search, ratingFilter, sortType]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    loading,
    raw,
    filtered,
    paged,
    page,
    pageCount,
    setPage,
    search,
    setSearch,
    ratingFilter,
    setRatingFilter,
    sortType,
    setSortType,
    removeReview,
    refresh: load,
  };
}
