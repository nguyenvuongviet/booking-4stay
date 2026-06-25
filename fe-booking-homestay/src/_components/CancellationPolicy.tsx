"use client";

import { AppConfigKey } from "@/constants/app.constant";
import { publicConfigApi } from "@/services/publicConfigApi";
import { format, subDays } from "date-fns";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  checkInDate?: Date;
  className?: string;
  onLoad?: (config: any) => void;
  collapsible?: boolean;
}

export function CancellationPolicy({
  checkInDate,
  className = "",
  onLoad,
  collapsible = false,
}: Props) {
  const [policy, setPolicy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const configs = await publicConfigApi.getPublicConfigs();
        const policyConfig = configs.find(
          (c: any) => c.key === AppConfigKey.CANCELLATION_POLICY,
        );
        if (policyConfig) {
          const sorted = [...policyConfig.value].sort(
            (a, b) => b.daysBefore - a.daysBefore,
          );
          setPolicy(sorted);
          onLoad?.(policyConfig);
        }
      } catch (error) {
        console.error("Failed to fetch policy", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicy();
  }, []);

  if (loading)
    return <div className="h-10 animate-pulse bg-muted rounded-lg" />;
  if (policy.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {collapsible ? (
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between cursor-pointer hover:text-primary transition-colors text-sm font-semibold select-none py-1 group"
        >
          <span className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <span>Chính sách hủy phòng</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-normal group-hover:text-primary transition-colors">
            {isExpanded ? "Thu gọn" : "Xem chi tiết"}
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </span>
        </div>
      ) : (
        <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
          <ShieldCheck className="w-5 h-5 text-green-600" />
          Chính sách hủy phòng & hoàn tiền
        </h3>
      )}

      {collapsible && !isExpanded && policy.length > 0 && (
        <div className="text-[11px] text-muted-foreground pl-6 leading-relaxed -mt-1 animate-in fade-in duration-200">
          {(() => {
            const firstRule = policy[0];
            if (checkInDate) {
              const deadlineDate = subDays(checkInDate, firstRule.daysBefore);
              return `Hoàn ${firstRule.refundPercent * 100}% nếu hủy trước ngày ${format(deadlineDate, "dd/MM/yyyy")}`;
            }
            return `Hoàn ${firstRule.refundPercent * 100}% nếu hủy trước ${firstRule.daysBefore} ngày`;
          })()}
        </div>
      )}

      {(!collapsible || isExpanded) && (
        <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative pt-1 pb-4">
            <div className="absolute top-1 left-0 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
              {policy.map((rule, idx) => (
                <div
                  key={idx}
                  className={`h-full ${
                    rule.refundPercent === 1
                      ? "bg-green-500"
                      : rule.refundPercent > 0
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${100 / policy.length}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-3">
              {policy.map((rule, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center text-[10px] text-center px-1"
                  style={{ width: `${100 / policy.length}%` }}
                >
                  <div className="font-bold mb-0.5">
                    {rule.refundPercent * 100}% Hoàn
                  </div>
                  <div className="text-muted-foreground leading-tight">
                    {idx === 0
                      ? `> ${rule.daysBefore} ngày`
                      : idx === policy.length - 1
                        ? `< ${policy[idx - 1].daysBefore} ngày`
                        : `${rule.daysBefore}-${policy[idx - 1].daysBefore - 1} ngày`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t pt-3">
            {policy.map((rule, index) => {
              const isFullRefund = rule.refundPercent === 1;
              const isNoRefund = rule.refundPercent === 0;

              let deadlineText = "";
              if (checkInDate) {
                const deadlineDate = subDays(checkInDate, rule.daysBefore);
                deadlineText = ` (trước ${format(deadlineDate, "dd/MM/yyyy")})`;
              }

              let description = "";
              if (index === 0) {
                description = `Hủy trước ${rule.daysBefore} ngày hoặc sớm hơn${deadlineText}`;
              } else {
                const prevRule = policy[index - 1];
                description = `Hủy trong khoảng ${rule.daysBefore} - ${prevRule.daysBefore - 1} ngày trước khi nhận phòng${deadlineText}`;
              }

              if (isNoRefund) {
                description = `Hủy trong vòng ${policy[index - 1].daysBefore - 1} ngày trước khi nhận phòng hoặc muộn hơn`;
              }

              return (
                <div key={index} className="flex gap-2.5 items-start group">
                  <div
                    className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${isFullRefund ? "bg-green-500" : isNoRefund ? "bg-red-500" : "bg-amber-500"}`}
                  />
                  <div className="text-xs">
                    <span className="text-muted-foreground font-medium">
                      {description}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span
                      className={`font-bold ${isFullRefund ? "text-green-700" : isNoRefund ? "text-red-700" : "text-amber-700"}`}
                    >
                      Hoàn tiền {rule.refundPercent * 100}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/50 flex gap-2 items-start">
            <AlertTriangle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-blue-800 leading-relaxed italic">
              Thời gian hủy phòng tính theo múi giờ Homestay. Việc hoàn tiền có
              thể mất 3-5 ngày làm việc tùy vào ngân hàng của bạn.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
