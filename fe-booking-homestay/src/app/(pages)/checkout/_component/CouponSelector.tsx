"use client";

import { Card } from "@/_components/ui/card";
import {
  formatDiscount,
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
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  Ticket,
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
    <Card className="p-5 space-y-4 border border-border/60 shadow-xs rounded-2xl bg-card">
      <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
        <Ticket size={20} className="text-primary" />
        Mã Giảm Giá (Coupon)
      </h3>

      {/* Input + Apply */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="coupon-input"
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="NHẬP MÃ GIẢM GIÁ"
            className="w-full px-4 py-2.5 bg-background border border-border/80 focus:border-primary/50 rounded-xl text-sm font-semibold uppercase tracking-widest placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-foreground shadow-xs"
            disabled={!!appliedCode}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
        </div>
        {appliedCode ? (
          <button
            onClick={handleClear}
            className="px-5 py-2.5 text-sm rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 active:scale-95 transition-all font-semibold cursor-pointer"
          >
            Huỷ bỏ
          </button>
        ) : (
          <button
            onClick={() => handleApply()}
            disabled={loading || !inputCode.trim()}
            className="px-5 py-2.5 text-sm rounded-xl bg-primary text-white hover:bg-primary/95 active:scale-95 transition-all font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 shadow-md shadow-primary/10 cursor-pointer"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              "Áp dụng"
            )}
          </button>
        )}
      </div>

      {/* Applied status */}
      {appliedCode && validation?.valid && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 text-sm bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 p-3.5 rounded-xl font-medium"
        >
          <span className="text-base leading-none">✅</span>
          <div>
            Áp dụng thành công mã{" "}
            <strong className="font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-700">
              {appliedCode}
            </strong>{" "}
            — Giảm{" "}
            <strong className="underline text-emerald-700 font-extrabold">
              {validation.couponDiscount.toLocaleString()}đ
            </strong>{" "}
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
        <div className="pt-2 border-t border-border/40">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm font-semibold text-primary hover:text-primary/90 flex items-center gap-1.5 py-1 transition-colors cursor-pointer group"
          >
            {showSuggestions ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
            <span>
              Xem {sortedSuggestions.length} mã có thể áp dụng cho đơn này
            </span>
          </button>

          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin"
              >
                {sortedSuggestions.map((promo) => {
                  return (
                    <div
                      key={promo.id}
                      onClick={() => handleSelectSuggestion(promo)}
                      className="relative flex items-center justify-between p-3.5 border border-border/60 hover:border-primary/30 hover:bg-primary/5 hover:shadow-xs rounded-xl bg-card active:scale-[0.99] transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                            {promo.code}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-md">
                            Giảm {formatDiscount(promo)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-foreground mt-2 line-clamp-1 group-hover:text-primary transition-colors duration-200">
                          {promo.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[10px] text-muted-foreground">
                          <span className="font-medium">
                            {formatMinSpend(promo)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Calendar size={10} />
                            HSD: {formatExpiryDate(promo.endDate)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 pl-2 shrink-0">
                        <span className="text-xs font-bold">Dùng</span>
                        <ChevronRight size={14} className="stroke-3" />
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
