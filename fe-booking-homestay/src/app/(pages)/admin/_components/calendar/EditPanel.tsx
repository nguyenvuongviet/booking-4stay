import { Button } from "@/_components/ui/button";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface EditPanelProps {
  dates: Date[];
  currentPrice: number;
  defaultPrice: number;
  isSoldOut: boolean;
  booking?: { guestName: string } | null;
  onSave: (price: number, soldOut: boolean) => void;
  onClose: () => void;
}

export default function EditPanel({
  dates,
  currentPrice,
  defaultPrice,
  isSoldOut,
  booking,
  onSave,
  onClose,
}: EditPanelProps) {
  const [price, setPrice] = useState<number>(currentPrice);
  const [soldOut, setSoldOut] = useState<boolean>(isSoldOut);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    setPrice(currentPrice);
    setSoldOut(isSoldOut);
  }, [currentPrice, isSoldOut]);

  const handleSave = () => {
    setShowConfirm(true);
  };

  const confirmSave = () => {
    onSave(price, soldOut);
    setShowConfirm(false);
    onClose();
  };

  const label = useMemo(() => {
    if (dates.length === 1) {
      return dates[0].toLocaleDateString();
    }

    return `${dates.length} ngày được chọn`;
  }, [dates]);

  return (
    <div className="h-full py-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="pt-2 text-xl elegant-sans">Chỉnh sửa {label}</h2>

        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Default price */}
        <div>
          <label className="block mb-2">Giá mặc định</label>
          <input
            disabled
            value={defaultPrice.toLocaleString()}
            className="w-full p-2 bg-muted/50 rounded-lg text-md opacity-60"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-2">Giá</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-full p-2 border border-primary/30 rounded-lg"
          />

          {price !== defaultPrice && (
            <p className="text-sm text-blue-400 mt-1">
              ({price > defaultPrice ? "+" : "-"}
              {Math.abs(price - defaultPrice).toLocaleString()})
            </p>
          )}
        </div>

        {/* Sold out */}
        <div className="gap-4 flex flex-col mt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={soldOut}
              className="w-5 h-5"
              onChange={(e) => setSoldOut(e.target.checked)}
            />
            <div>
              <div className="elegant-sans">Hết phòng</div>
              <div className="text-xs text-gray-400">Phòng không còn trống</div>
            </div>
          </label>
          {booking && (
            <div className="mt-1 px-4 py-2 rounded bg-secondary/10 border border-secondary">
              <p className="truncate text-md">
                Được đặt bởi:{" "}
                <span className="elegant-sans text-primary">
                  {booking.guestName}
                </span>
              </p>
              {/* <div className="opacity-80 truncate flex flex-col space-y-0.5 p-2 text-sm">
                <span><Mail className="w-4 h-4 inline mr-1" />: {booking.guestInfo.email}</span>
                <span><Phone className="w-4 h-4 inline mr-1" />: {booking.guestInfo.phoneNumber}</span>
              </div>
              <span className="text-sm">Trạng thái đặt phòng: </span>
              <span className={`elegant-sans text-xs rounded-full px-2 py-1 ${getStatusColorClasses(booking.status)}`}>
                {booking.status}
              </span> */}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mt-6">
        <Button onClick={onClose} variant="destructive" className="flex-1">
          Hủy
        </Button>
        <Button onClick={handleSave} className="flex-1">
          Lưu
        </Button>
      </div>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-card rounded-2xl w-96 shadow-2xl p-6 space-y-2 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg elegant-sans">Xác nhận thay đổi</h3>

              <button
                onClick={() => setShowConfirm(false)}
                className="p-2 hover:bg-primary/10 cursor-pointer rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="text-muted-foreground">
              <p>
                <span>Bạn đang cập nhật: </span>
                <span className="text-foreground">
                  {dates.length === 1
                    ? dates[0].toLocaleDateString()
                    : ` ${dates.length} ngày`}
                </span>
              </p>
            </div>

            <div className="space-y-2 p-3">
              {/* Giá */}
              <div className="flex justify-between">
                <span>Giá</span>
                <span className="elegant-sans text-primary">
                  {price.toLocaleString()} / đêm
                </span>
              </div>

              {/* Trạng thái */}
              {isSoldOut !== soldOut && (
                <div className="flex justify-between">
                  <span>Trạng thái</span>
                  <span
                    className={`elegant-sans ${
                      soldOut ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {soldOut ? "Hết phòng" : "Còn phòng"}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={() => setShowConfirm(false)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button onClick={confirmSave} className="flex-1">
                Xác nhận
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
