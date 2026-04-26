import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { PaymentMethod } from "@/types/paymentmethod";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { Check, CreditCard, DollarSign } from "lucide-react";

interface Props {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;
}

export default function PaymentMethodSelector(props: Props) {
  const { paymentMethod, setPaymentMethod } = props;
  const { t } = useLang();

  return (
    <Card className="p-6">
      <h2 className="text-2xl mb-4 elegant-heading">{t("Payment menthod")}</h2>
      <RadioGroup
        value={paymentMethod}
        onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
      >
        <div className="space-y-3">
          {/* Cash Payment */}
          <label
            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === "CASH"
                ? "border-primary bg-primary-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <RadioGroupItem value="CASH" id="CASH" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{t("Cash Payment")}</p>
                <p className="text-sm text-gray-600">
                  {t(
                    "Pay 30% deposit via transfer, the remaining in cash when checking in",
                  )}
                </p>
              </div>
            </div>
            {paymentMethod === "CASH" && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </label>
          {/* PayOS */}
          <label
            className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              paymentMethod === "BANK_TRANSFER"
                ? "border-primary bg-primary-100"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <RadioGroupItem value="BANK_TRANSFER" id="BANK_TRANSFER" />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Thanh toán trực tuyến (Cổng PayOS)
                </p>
                <p className="text-sm text-gray-600">
                  Quét mã VietQR tiện lợi, xác nhận tiền tự động 24/7. Hỗ trợ
                  mọi ngân hàng.
                </p>
              </div>
            </div>
            {paymentMethod === "BANK_TRANSFER" && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
          </label>

          {/* Momo */}
          {/* <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "momo"
                        ? "border-primary bg-primary-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="momo" id="momo" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Momo</p>
                        <p className="text-sm text-gray-600">
                          Pay securely with your Momo account
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "momo" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </label> */}
        </div>
      </RadioGroup>

      {/* PayOS Info */}
      {paymentMethod === "BANK_TRANSFER" && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
          <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-700" />
            Thanh Toán Qua PayOS (VietQR)
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Hệ thống hỗ trợ thanh toán trực tuyến qua <strong>mã QR</strong>. Mã
            QR được tự động tạo theo chuẩn VietQR NAPAS, giúp bạn thanh toán
            nhanh chóng.
          </p>

          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>
              Sử dụng tính năng Quét mã QR của bất kỳ App Ngân Hàng nào để quét.
            </li>
            <li>Thông tin số tiền và Số tài khoản điền sẵn chính xác 100%.</li>
          </ul>

          <p className="text-sm text-gray-700">
            Sau khi nhấn xác nhận, bạn sẽ tự động được chuyển sang cổng thanh
            toán của PayOS. Hệ thống tự động ghi nhận ngay sau khi bạn thao tác
            mà không cần chờ đợi.
          </p>
        </div>
      )}

      {/* Money Info */}
      {paymentMethod === "CASH" && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100 space-y-2">
          <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-700" />
            {t("cash_title")}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {t("cash_intro_1")}
            {t("cash_intro_2")}
          </p>

          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            <li>{t("cash_rule_1")}</li>
            <li>
              {t("cash_rule_2_1")} <strong>{t("temporary_reserved")}</strong>{" "}
              {t("cash_rule_2_2")}
            </li>
            <li>{t("cash_rule_3")}</li>
          </ul>

          <p className="text-sm text-gray-700">
            {/* {t("cash_after_confirm")} */}
          </p>

          <p className="text-xs text-gray-500 italic">* {t("cash_note")}</p>
        </div>
      )}
    </Card>
  );
}
