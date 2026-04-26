"use client";

import { AppConfigKey } from "@/constants/app.constant";
import { publicConfigApi } from "@/services/publicConfigApi";
import { format, subDays } from "date-fns";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  checkInDate?: Date;
  className?: string;
  onLoad?: (config: any) => void;
}

export function CancellationPolicy({
  checkInDate,
  className = "",
  onLoad,
}: Props) {
  const [policy, setPolicy] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    return <div className="h-20 animate-pulse bg-muted rounded-lg" />;
  if (policy.length === 0) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="font-bold text-lg flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-green-600" />
        Chính sách hủy phòng & hoàn tiền
      </h3>

      <div className="relative pt-2 pb-8">
        <div className="absolute top-2 left-0 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden flex">
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
        <div className="flex justify-between mt-4">
          {policy.map((rule, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-[10px] text-center px-1"
              style={{ width: `${100 / policy.length}%` }}
            >
              <div className="font-bold mb-1">
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

      <div className="space-y-3 border-t pt-4">
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
            <div key={index} className="flex gap-3 items-start group">
              <div
                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isFullRefund ? "bg-green-500" : isNoRefund ? "bg-red-500" : "bg-amber-500"}`}
              />
              <div className="text-sm">
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

      <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 flex gap-3 items-start">
        <AlertTriangle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-800 leading-relaxed italic">
          Thời gian hủy phòng tính theo múi giờ Homestay. Việc hoàn tiền có thể
          mất 3-5 ngày làm việc tùy vào ngân hàng của bạn.
        </p>
      </div>
    </div>
  );
}
