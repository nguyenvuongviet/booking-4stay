"use client";

import { Button } from "@/_components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/_components/ui/dialog";
import { Input } from "@/_components/ui/input";
import { getLoyaltyLevels } from "@/services/admin/loyaltyApi";
import {
  create_admin_promotion,
  update_admin_promotion,
} from "@/services/admin/promotionsApi";
import { BlogPost, getPosts } from "@/services/blogApi";
import { getLocation } from "@/services/locationApi";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Promotion {
  id: number;
  code: string;
  name: string;
  promotionType: string;
  discountType: string;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublic: boolean;
  provinceId?: number;
  targetLevelId?: number;
  blogPosts?: any[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editData?: Promotion | null;
}

const PROMO_TYPES = [
  { value: "SEASONAL", label: "Seasonal (Theo mùa/sự kiện)" },
  { value: "WELCOME", label: "Welcome (Cho thành viên mới)" },
  { value: "LOYALTY", label: "Loyalty (Theo hạng thành viên)" },
  { value: "BLOG", label: "Blog (Gắn trong bài viết)" },
  { value: "THANKYOU", label: "Thankyou (Sau checkout)" },
];

const DISCOUNT_TYPES = [
  { value: "PERCENTAGE", label: "Phần trăm (%)" },
  { value: "FIXED_AMOUNT", label: "Số tiền cố định (đ)" },
];

export default function PromotionForm({
  open,
  onClose,
  onSaved,
  editData,
}: Props) {
  const isEdit = !!editData;

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [promotionType, setPromotionType] = useState("SEASONAL");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number | string>("");
  const [maxDiscount, setMaxDiscount] = useState<number | string>("");
  const [minOrderValue, setMinOrderValue] = useState<number | string>(0);
  const [targetLevelId, setTargetLevelId] = useState<number | string>("");
  const [provinceId, setProvinceId] = useState<number | string>("");
  const [usageLimit, setUsageLimit] = useState<number | string>("");
  const [perUserLimit, setPerUserLimit] = useState<number | string>(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [selectedBlogIds, setSelectedBlogIds] = useState<number[]>([]);

  // Metadata states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load provinces, blogs, and membership levels
  useEffect(() => {
    if (open) {
      getLocation({ pageSize: 100 }).then((res) => {
        if (res?.items) setProvinces(res.items);
      });
      getPosts({ pageSize: 100 }).then((res) => {
        if (res?.items) setBlogs(res.items);
      });
      getLoyaltyLevels().then((res) => {
        if (res) setLevels(res);
      });
    }
  }, [open]);

  // Set defaults / edit data
  useEffect(() => {
    if (editData) {
      setCode(editData.code);
      setName(editData.name);
      setPromotionType(editData.promotionType);
      setDiscountType(editData.discountType);
      setDiscountValue(editData.discountValue);
      setMaxDiscount(editData.maxDiscount ?? "");
      setMinOrderValue(editData.minOrderValue);
      setTargetLevelId(editData.targetLevelId ?? "");
      setProvinceId(editData.provinceId ?? "");
      setUsageLimit(editData.usageLimit);
      setPerUserLimit(editData.perUserLimit ?? 1);

      // format to YYYY-MM-DDThh:mm
      const toDatetimeLocal = (isoStr: string) => {
        const d = new Date(isoStr);
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      setStartDate(toDatetimeLocal(editData.startDate));
      setEndDate(toDatetimeLocal(editData.endDate));
      setIsPublic(editData.isPublic);
      setIsActive(editData.isActive);
      setSelectedBlogIds(editData.blogPosts?.map((b) => b.id) || []);
    } else {
      setCode("");
      setName("");
      setPromotionType("SEASONAL");
      setDiscountType("PERCENTAGE");
      setDiscountValue("");
      setMaxDiscount("");
      setMinOrderValue(0);
      setTargetLevelId("");
      setProvinceId("");
      setUsageLimit("");
      setPerUserLimit(1);

      const now = new Date();
      const inOneMonth = new Date();
      inOneMonth.setMonth(now.getMonth() + 1);

      const toDatetimeLocal = (d: Date) => {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T00:00`;
      };

      setStartDate(toDatetimeLocal(now));
      setEndDate(toDatetimeLocal(inOneMonth));
      setIsPublic(true);
      setIsActive(true);
      setSelectedBlogIds([]);
    }
  }, [editData, open]);

  const handleSave = async () => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) return toast.error("Vui lòng nhập mã giảm giá");
    if (trimmedCode.length < 3)
      return toast.error("Mã giảm giá phải có ít nhất 3 ký tự");
    if (!name.trim()) return toast.error("Vui lòng nhập tên chương trình");
    if (name.trim().length < 3)
      return toast.error("Tên chương trình phải có ít nhất 3 ký tự");
    if (!discountValue) return toast.error("Vui lòng nhập giá trị giảm");
    if (!usageLimit) return toast.error("Vui lòng nhập giới hạn lượt dùng");
    if (!startDate || !endDate)
      return toast.error("Vui lòng chọn thời gian hiệu lực");
    if (new Date(startDate) >= new Date(endDate)) {
      return toast.error("Ngày kết thúc phải sau ngày bắt đầu");
    }

    setLoading(true);
    try {
      const payload = {
        code: trimmedCode,
        name: name.trim(),
        promotionType,
        discountType,
        discountValue: Number(discountValue),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        minOrderValue: Number(minOrderValue),
        targetLevelId: targetLevelId ? Number(targetLevelId) : null,
        provinceId: provinceId ? Number(provinceId) : null,
        usageLimit: Number(usageLimit),
        perUserLimit: perUserLimit ? Number(perUserLimit) : undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isPublic,
        isActive,
        blogPostIds: selectedBlogIds,
      };

      if (isEdit && editData) {
        const { code: _, ...updatePayload } = payload;
        await update_admin_promotion(editData.id, updatePayload);
        toast.success("Cập nhật mã giảm giá thành công!");
      } else {
        await create_admin_promotion(payload);
        toast.success("Tạo mã giảm giá mới thành công!");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Không thể lưu mã giảm giá, vui lòng thử lại!";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBlogToggle = (id: number) => {
    setSelectedBlogIds((prev) =>
      prev.includes(id) ? prev.filter((bid) => bid !== id) : [...prev, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[calc(100%-2rem)] sm:w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {isEdit ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
          </DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin để phát hành coupon giảm giá cho khách hàng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
          {/* Code */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Mã coupon (Viết liền, in hoa)
            </label>
            <Input
              placeholder="VD: WELCOME10, DEALHE2026..."
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().replace(/\s/g, ""))
              }
              disabled={isEdit}
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Tên chương trình khuyến mãi
            </label>
            <Input
              placeholder="VD: Giảm 10% cho thành viên mới"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Promotion Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Loại chương trình</label>
            <select
              value={promotionType}
              onChange={(e) => setPromotionType(e.target.value)}
              className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {PROMO_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Level */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Đối tượng thành viên</label>
            <select
              value={targetLevelId}
              onChange={(e) => setTargetLevelId(e.target.value)}
              className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Tất cả thành viên</option>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  Hạng {l.name}
                </option>
              ))}
            </select>
          </div>

          {/* Discount Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Hình thức giảm giá</label>
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {DISCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Discount Value */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Giá trị giảm ({discountType === "PERCENTAGE" ? "%" : "đ"})
            </label>
            <Input
              type="number"
              min="0"
              placeholder={
                discountType === "PERCENTAGE" ? "VD: 10" : "VD: 100000"
              }
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>

          {/* Max Discount */}
          {discountType === "PERCENTAGE" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Số tiền giảm tối đa (đ - Để trống nếu không giới hạn)
              </label>
              <Input
                type="number"
                min="0"
                placeholder="VD: 500000"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
              />
            </div>
          )}

          {/* Min Order Value */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Giá trị đơn hàng tối thiểu (đ)
            </label>
            <Input
              type="number"
              min="0"
              placeholder="VD: 1000000"
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
            />
          </div>

          {/* Province ID */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Giới hạn khu vực (Tỉnh thành - Không bắt buộc)
            </label>
            <select
              value={provinceId}
              onChange={(e) => setProvinceId(e.target.value)}
              className="w-full h-10 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Tất cả khu vực</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Usage Limit */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Tổng giới hạn lượt sử dụng
            </label>
            <Input
              type="number"
              min="1"
              placeholder="VD: 100"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
            />
          </div>

          {/* Per User Limit */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Giới hạn số lần dùng mỗi User
            </label>
            <Input
              type="number"
              min="1"
              placeholder="VD: 1"
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Thời gian bắt đầu</label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Thời gian kết thúc</label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-6 items-center py-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4.5 h-4.5 accent-primary rounded border-slate-300"
              />
              Công khai (Hiển thị cho User chọn ở Checkout)
            </label>

            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4.5 h-4.5 accent-primary rounded border-slate-300"
              />
              Kích hoạt ngay
            </label>
          </div>

          {/* Blog posts association list */}
          {promotionType === "BLOG" && blogs.length > 0 && (
            <div className="md:col-span-2 space-y-2 border-t pt-4">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block">
                Gắn mã này vào bài viết Blog nào?
              </label>
              <div className="max-h-40 overflow-y-auto border rounded-lg p-2 grid gap-1.5 bg-slate-50/50 dark:bg-slate-900/50">
                {blogs.map((b) => (
                  <label
                    key={b.id}
                    className="flex items-center gap-2 text-xs font-medium cursor-pointer p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBlogIds.includes(b.id)}
                      onChange={() => handleBlogToggle(b.id)}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    <span className="truncate">{b.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 border-t pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-4 cursor-pointer"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="px-5 text-white cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Tạo mới"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
