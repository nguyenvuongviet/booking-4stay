import { toast } from "@/components/ui/use-toast";

/**
 * Xóa 1 resource với confirm + toast
 * @param label Tên resource để hiển thị trong confirm, ví dụ "người dùng", "phòng", "đặt phòng"
 * @param deleteFn Hàm service gọi API xoá (phải trả Promise)
 * @param onSuccess Callback sau khi xoá thành công
 */
export async function handleDeleteEntity(
  label: string,
  deleteFn: () => Promise<any>,
  onSuccess?: () => void
) {
  const confirm = window.confirm(
    `Bạn có chắc chắn muốn xóa ${label} này không?`
  );
  if (!confirm) return;

  try {
    await deleteFn();
    toast({
      variant: "success",
      title: `Đã xóa ${label} thành công.`,
    });
    onSuccess?.();
  } catch (err: any) {
    toast({
      variant: "destructive",
      title: `Xóa ${label} thất bại`,
      description:
        err?.response?.data?.message || err?.message || "Vui lòng thử lại.",
    });
  }
}
