import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { Check, CreditCard, DollarSign } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { PaymentMethod as PaymentMenthodType } from "@/types/paymentmethod";

interface Props {
    paymentMethod: PaymentMenthodType;
    setPaymentMethod: (v: PaymentMenthodType) => void;
}

export default function PaymentMethod(props: Props) {
    const { paymentMethod, setPaymentMethod } = props;
    const { t } = useLang();
    
    
    return (
        <Card className="p-6">
            <h2 className="text-2xl mb-4 elegant-heading">{t("Payment menthod")}</h2>
            <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                    setPaymentMethod(value as PaymentMenthodType)
                }
            >
                <div className="space-y-3">
                    {/* Cash Payment */}
                    <label
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === "CASH"
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
                                <p className="font-medium text-gray-900">
                                    {t("Cash Payment")}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t(
                                        "Pay 30% deposit via transfer, the remaining in cash when checking in"
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
                    {/* Vnpay */}
                    <label
                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === "VNPAY"
                            ? "border-primary bg-primary-100"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        <RadioGroupItem value="VNPAY" id="VNPAY" />
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {t("VNPay (Bank transfer/ Card/ QR code)")}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {t(
                                        "Secure and fast online payment via VNPay. Supports major banks and e-wallets."
                                    )}
                                    {/* Thanh toán trực tuyến an toàn và nhanh chóng qua VNPay. Hỗ trợ các ngân hàng lớn và ví điện tử. */}
                                </p>
                            </div>
                        </div>
                        {paymentMethod === "VNPAY" && (
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

            {/* Vnpay Info */}
            {paymentMethod === "VNPAY" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
                    <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-700" />
                        {/* VNPAY – Thanh toán nhanh & an toàn */}
                        {t("vnpay_title")}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                        {t("vnpay_intro_1")} <strong>{t("qr")}</strong> {t("or")}{" "}
                        <strong>{t("cards")}</strong>. {t("vnpay_intro_2")}
                        {/* VNPAY hỗ trợ thanh toán trực tuyến qua{" "}
                    <strong>mã QR</strong> hoặc{" "}
                    <strong>
                      thẻ ngân hàng nội địa/quốc tế (Visa, MasterCard)
                    </strong>
                    . Bạn có thể lựa chọn một trong hai cách sau: */}
                    </p>

                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        <li>
                            <strong>{t("scan_qr")}:</strong> {t("scan_qr_desc")}
                            {/* <strong>Quét mã QR:</strong> Sử dụng ứng dụng ngân hàng
                      (Mobile Banking) hoặc ví VNPAY để quét mã và xác nhận
                      thanh toán nhanh chóng. */}
                        </li>
                        <li>
                            <strong>{t("card_payment")}:</strong>{" "}
                            {t("card_payment_desc")}
                            {/* <strong>Thanh toán bằng thẻ:</strong> Nhập thông tin thẻ
                      ngân hàng hoặc thẻ tín dụng để hoàn tất giao dịch trực
                      tuyến. */}
                        </li>
                    </ul>

                    <p className="text-sm text-gray-700">
                        {t("after_confirm")}{" "}
                        <strong>{t("Confirm and Payment")}</strong>,
                        {t("vnpay_redirect")}
                        {/* Sau khi nhấn <strong>"Confirm booking"</strong>, bạn sẽ được
                    chuyển đến cổng thanh toán VNPAY để hoàn tất giao dịch an
                    toàn. Sau khi thanh toán thành công, hệ thống sẽ tự động xác
                    nhận đơn đặt phòng của bạn. */}
                    </p>

                    <p className="text-xs text-gray-500 italic">
                        * {t("secure_notice")}
                        {/* * Mọi giao dịch đều được mã hóa và bảo mật theo tiêu chuẩn
                    VNPAY. */}
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
                        <li>
                            {t("cash_rule_1")}
                        </li>
                        <li>
                            {t("cash_rule_2_1")}{" "}
                            <strong>{t("temporary_reserved")}</strong>{" "}
                            {t("cash_rule_2_2")}
                        </li>
                        <li>
                            {t("cash_rule_3")}
                        </li>
                    </ul>

                    <p className="text-sm text-gray-700">
                        {/* {t("cash_after_confirm")} */}
                    </p>

                    <p className="text-xs text-gray-500 italic">
                        * {t("cash_note")}
                    </p>
                </div>
            )}
        </Card>
    );
};