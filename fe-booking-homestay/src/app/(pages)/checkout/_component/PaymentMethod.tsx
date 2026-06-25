import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { PaymentMethod } from "@/types/paymentmethod";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { CreditCard, DollarSign } from "lucide-react";

interface Props {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;
}

export default function PaymentMethodSelector(props: Props) {
  const { paymentMethod, setPaymentMethod } = props;
  const { t } = useLang();

  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 elegant-heading">
        {t("Payment menthod")}
      </h2>
      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cash Payment */}
          <label
            htmlFor="CASH"
            className={`group flex items-start p-4 border rounded-2xl cursor-pointer transition-all duration-300 select-none gap-3 h-full ${
              paymentMethod === "CASH"
                ? "border-primary bg-primary/5 shadow-xs scale-[1.01]"
                : "border-border bg-white hover:border-gray-300 hover:bg-gray-50/30 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
            }`}
          >
            <RadioGroupItem value="CASH" id="CASH" className="sr-only" />

            {/* Radio Indicator */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                paymentMethod === "CASH"
                  ? "border-primary"
                  : "border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {paymentMethod === "CASH" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in-50 duration-200" />
              )}
            </div>

            {/* Content text */}
            <div className="space-y-0.5 flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
                {t("Cash Payment")}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                {t(
                  "Pay 30% deposit via transfer, the remaining in cash when checking in",
                )}
              </p>
            </div>

            {/* Icon */}
            <div className="w-9 h-9 bg-green-50 dark:bg-green-950/40 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign className="h-4.5 w-4.5 text-green-600 dark:text-green-400" />
            </div>
          </label>

          {/* PayOS */}
          <label
            htmlFor="BANK_TRANSFER"
            className={`group flex items-start p-4 border rounded-2xl cursor-pointer transition-all duration-300 select-none gap-3 h-full ${
              paymentMethod === "BANK_TRANSFER"
                ? "border-primary bg-primary/5 shadow-xs scale-[1.01]"
                : "border-border bg-white hover:border-gray-300 hover:bg-gray-50/30 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700"
            }`}
          >
            <RadioGroupItem
              value="BANK_TRANSFER"
              id="BANK_TRANSFER"
              className="sr-only"
            />

            {/* Radio Indicator */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                paymentMethod === "BANK_TRANSFER"
                  ? "border-primary"
                  : "border-gray-300 group-hover:border-gray-400"
              }`}
            >
              {paymentMethod === "BANK_TRANSFER" && (
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in-50 duration-200" />
              )}
            </div>

            {/* Content text */}
            <div className="space-y-0.5 flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-slate-100 text-sm sm:text-base leading-snug">
                Thanh toán trực tuyến
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Quét mã VietQR tiện lợi, xác nhận giao dịch tự động 24/7 qua
                cổng PayOS.
              </p>
            </div>

            {/* Icon */}
            <div className="w-9 h-9 bg-blue-50 dark:bg-blue-950/40 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
            </div>
          </label>
        </div>
      </RadioGroup>

      {/* PayOS Info */}
      {paymentMethod === "BANK_TRANSFER" && (
        <div className="mt-6 p-4 sm:p-5 bg-blue-50/60 dark:bg-blue-950/10 rounded-2xl border border-blue-100 dark:border-blue-900/30 space-y-2">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            Thanh Toán Qua PayOS (VietQR)
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            Hệ thống hỗ trợ thanh toán trực tuyến qua <strong>mã QR</strong>. Mã
            QR được tự động tạo theo chuẩn VietQR NAPAS, giúp bạn thanh toán
            nhanh chóng.
          </p>

          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>
              Sử dụng tính năng Quét mã QR của bất kỳ App Ngân Hàng nào để quét.
            </li>
            <li>Thông tin số tiền và Số tài khoản điền sẵn chính xác 100%.</li>
          </ul>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            Sau khi nhấn xác nhận, bạn sẽ tự động được chuyển sang cổng thanh
            toán của PayOS. Hệ thống tự động ghi nhận ngay sau khi bạn thao tác
            mà không cần chờ đợi.
          </p>
        </div>
      )}

      {/* Money Info */}
      {paymentMethod === "CASH" && (
        <div className="mt-6 p-4 sm:p-5 bg-emerald-50/60 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-2">
          <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            {t("cash_title")}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {t("cash_intro_1")}
            {t("cash_intro_2")}
          </p>

          <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
            <li>{t("cash_rule_1")}</li>
            <li>
              {t("cash_rule_2_1")} <strong>{t("temporary_reserved")}</strong>{" "}
              {t("cash_rule_2_2")}
            </li>
            <li>{t("cash_rule_3")}</li>
          </ul>

          <p className="text-sm text-gray-700 dark:text-gray-300">
            {/* {t("cash_after_confirm")} */}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            * {t("cash_note")}
          </p>
        </div>
      )}
    </Card>
  );
}
