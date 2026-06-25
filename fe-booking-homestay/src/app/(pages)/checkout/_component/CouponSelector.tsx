"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import {
  formatDiscountBadge,
  formatExpiryDate,
  formatMinSpend,
  getEstimatedDiscount,
} from "@/lib/utils/promotionUtils";
import {
  get_coupon_suggestions,
  validate_coupon,
} from "@/services/promotionApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Promotion {
  id: number;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  endDate: string;
}

interface CouponValidation {
  valid: boolean;
  couponDiscount: number;
  afterCoupon: number;
  message: string;
}

interface Props {
  rawTotal: number;
  provinceId?: number;
  onApply: (code: string, discount: number) => void;
  onClear: () => void;
  appliedCode?: string;
  initialCode?: string;
}

export default function CouponSelector({
  rawTotal,
  provinceId,
  onApply,
  onClear,
  appliedCode,
  initialCode,
}: Props) {
  const [inputCode, setInputCode] = useState(initialCode || "");
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<CouponValidation | null>(null);
  const [suggestions, setSuggestions] = useState<Promotion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-fill from URL param and auto-apply
  useEffect(() => {
    if (initialCode && !appliedCode) {
      handleApply(initialCode);
    }
  }, [initialCode]);

  // Fetch suggestions
  useEffect(() => {
    if (rawTotal > 0) {
      get_coupon_suggestions(provinceId, rawTotal).then((data) => {
        setSuggestions(data || []);
      });
    }
  }, [rawTotal, provinceId]);

  const handleApply = async (code?: string) => {
    const codeToApply = (code || inputCode).trim().toUpperCase();
    if (!codeToApply) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setLoading(true);
    try {
      const result = await validate_coupon(codeToApply, rawTotal, provinceId);
      setValidation(result);

      if (result.valid) {
        onApply(codeToApply, result.couponDiscount);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Không thể kiểm tra mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputCode("");
    setValidation(null);
    onClear();
  };

  const handleSelectSuggestion = (promo: Promotion) => {
    setInputCode(promo.code);
    setShowSuggestions(false);
    handleApply(promo.code);
  };

  // Sort suggestions: highest discount first
  const sortedSuggestions = [...suggestions].sort((a, b) => {
    return (
      getEstimatedDiscount(b, rawTotal) - getEstimatedDiscount(a, rawTotal)
    );
  });

  return (
    <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-2xl bg-card">
      <h2 className="text-xl sm:text-2xl elegant-heading mb-4 sm:mb-6 flex items-center gap-2">
        <Ticket className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
        Mã Giảm Giá (Coupon)
      </h2>

      {/* Input + Apply */}
      <div className="flex gap-2.5 sm:gap-3">
        <div className="relative flex-1">
          <input
            id="coupon-input"
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="NHẬP MÃ GIẢM GIÁ"
            className="w-full px-3 sm:px-4 bg-input border border-border/80 focus:border-primary/50 rounded-2xl h-11 text-xs sm:text-sm font-semibold uppercase tracking-wider sm:tracking-widest placeholder:font-normal placeholder:tracking-normal placeholder:text-[11px] sm:placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-foreground"
            disabled={!!appliedCode}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
        </div>
        {appliedCode ? (
          <button
            onClick={handleClear}
            className="px-4 sm:px-5 h-11 text-xs sm:text-sm rounded-2xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 hover:border-rose-300 text-rose-600 active:scale-95 transition-all font-semibold cursor-pointer shrink-0 flex items-center gap-1 sm:gap-1.5 shadow-xs shadow-rose-500/5 group"
          >
            <X
              size={14}
              className="stroke-[2.5] text-rose-500 group-hover:scale-110 transition-transform duration-200"
            />
            <span>Huỷ bỏ</span>
          </button>
        ) : (
          <Button
            onClick={() => handleApply()}
            disabled={loading || !inputCode.trim()}
            className="px-4 sm:px-6 h-11 text-xs sm:text-sm rounded-2xl font-semibold shadow-md shadow-primary/10 min-w-20 sm:min-w-25 shrink-0"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Áp dụng"
            )}
          </Button>
        )}
      </div>

      {/* Applied status */}
      {appliedCode && validation?.valid && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 sm:gap-3.5 text-xs sm:text-sm bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 p-3 sm:p-4 rounded-2xl font-medium shadow-xs shadow-emerald-500/5"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
          <div className="flex-1 leading-relaxed self-center text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm">
            Áp dụng thành công mã{" "}
            <span className="font-mono bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-xs font-bold border border-emerald-200 dark:border-emerald-800/60 mx-0.5 sm:mx-1 uppercase tracking-wide">
              {appliedCode}
            </span>{" "}
            — Bạn được giảm{" "}
            <span className="text-emerald-700 dark:text-emerald-300 font-extrabold text-sm sm:text-base bg-emerald-100 dark:bg-emerald-900/40 px-1.5 sm:px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 mx-0.5">
              {validation.couponDiscount.toLocaleString()}đ
            </span>{" "}
            vào giá phòng.
          </div>
        </motion.div>
      )}

      {/* Error message */}
      {validation && !validation.valid && !appliedCode && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 text-sm bg-rose-500/10 text-rose-600 border border-rose-500/20 p-3.5 rounded-xl font-medium"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{validation.message}</span>
        </motion.div>
      )}

      {/* Suggestions toggle */}
      {sortedSuggestions.length > 0 && !appliedCode && (
        <div className="pt-4 border-t border-border/40">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm font-semibold text-primary hover:text-primary/90 flex items-center gap-1.5 py-1 transition-colors cursor-pointer group hover:underline"
          >
            {showSuggestions ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
            <span>
              Xem {sortedSuggestions.length} mã giảm giá có sẵn cho bạn
            </span>
          </button>

          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-1 scrollbar-thin"
              >
                {sortedSuggestions.map((promo) => {
                  return (
                    <div
                      key={promo.id}
                      onClick={() => handleSelectSuggestion(promo)}
                      className="relative flex items-stretch border border-border/60 hover:border-primary/30 hover:bg-primary/5 hover:shadow-xs rounded-2xl bg-card active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden group min-h-24"
                    >
                      {/* Left Stub (Discount highlight) */}
                      <div className="w-20 sm:w-24 bg-primary/5 dark:bg-primary/10 flex flex-col items-center justify-center text-center p-2.5 border-r border-dashed border-border/80 shrink-0 select-none relative">
                        {/* Top half-circle notch */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-card border border-border/60 group-hover:bg-primary/5 transition-colors duration-200 z-10" />
                        {/* Bottom half-circle notch */}
                        <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-card border border-border/60 group-hover:bg-primary/5 transition-colors duration-200 z-10" />

                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                          GIẢM
                        </span>
                        <span className="text-base sm:text-lg font-extrabold text-primary tracking-tight mt-0.5 whitespace-nowrap">
                          {formatDiscountBadge(promo)}
                        </span>
                      </div>

                      {/* Right Body */}
                      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          {/* Code & Max Discount Badges */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all duration-200 shrink-0">
                              {promo.code}
                            </span>
                            {promo.discountType === "PERCENTAGE" &&
                              promo.maxDiscount && (
                                <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                                  Tối đa{" "}
                                  {Number(promo.maxDiscount).toLocaleString()}đ
                                </span>
                              )}
                          </div>
                          {/* Promo Name */}
                          <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-200 leading-snug">
                            {promo.name}
                          </h4>
                        </div>

                        {/* Footer Terms */}
                        <div className="flex items-end justify-between text-[9px] sm:text-[10px] text-muted-foreground pt-1.5 mt-1 border-t border-border/20">
                          <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-medium text-gray-500 dark:text-gray-400 line-clamp-1">
                              {formatMinSpend(promo)}
                            </span>
                            <span className="flex items-center gap-0.5 line-clamp-1">
                              <Calendar size={10} className="shrink-0" />
                              HSD: {formatExpiryDate(promo.endDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 text-primary font-bold opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300 pl-1.5 shrink-0">
                            <span className="text-[10px]">Dùng</span>
                            <ChevronRight size={12} className="stroke-[2.5]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Card>
  );
}
