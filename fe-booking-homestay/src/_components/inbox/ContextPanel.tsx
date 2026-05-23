"use client";

import { getImageUrl, getPartner } from "@/_helper/chat.helper";
import { IConversation } from "@/types/chat";
import { Home, User, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

interface Props {
  activeConversation: IConversation;
  userId: number | string;
  open?: boolean;
  onClose?: () => void;
  drawerOnly?: boolean;
}

export default function ContextPanel({
  activeConversation,
  userId,
  open = true,
  onClose,
  drawerOnly = false,
}: Props) {
  const router = useRouter();
  const partner = getPartner(activeConversation, userId);
  const isHost = String(activeConversation.hostId) === String(userId);

  const panelContent = (
    <div className="flex h-full flex-col overflow-y-auto p-5 space-y-6 scrollbar-hide">
      {/* Close button (mobile/tablet drawer) */}
      {onClose && (
        <div
          className={`items-center justify-between ${
            drawerOnly ? "flex" : "flex lg:hidden"
          }`}
        >
          <span className="text-sm elegant-sans text-foreground">
            Thông tin liên hệ
          </span>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full border border-border/60 bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Partner profile */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground hidden lg:block">
          Thông tin liên hệ
        </h3>
        <div className="flex flex-col items-center space-y-3 py-1">
          <div className="relative h-18 w-18 rounded-3xl overflow-hidden border border-border shadow-sm bg-secondary">
            {partner.avatar ? (
              <Image
                src={getImageUrl(partner.avatar) || ""}
                alt={partner.firstName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-extrabold text-primary">
                {partner.firstName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center space-y-0.5">
            <h4 className="text-sm font-extrabold text-foreground">
              {partner.firstName} {partner.lastName}
            </h4>
            <p className="text-[11px] text-muted-foreground">{partner.email}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold text-primary">
            <User className="h-3 w-3" />
            {isHost ? "Khách thuê" : "Chủ Homestay"}
          </span>
        </div>
      </div>

      {/* Homestay context */}
      {activeConversation.room && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            Căn homestay
          </h3>
          <div className="rounded-2xl bg-white/20 dark:bg-white/5 p-3 space-y-3 shadow-sm backdrop-blur-md">
            <div className="relative h-28 w-full rounded-xl overflow-hidden bg-secondary border border-border">
              {activeConversation.room.imageUrl ? (
                <Image
                  src={getImageUrl(activeConversation.room.imageUrl) || ""}
                  alt="Room"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl">
                  🏡
                </div>
              )}
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold line-clamp-2 text-foreground leading-snug">
                {activeConversation.room.name}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Giá:</span>
                <span className="text-xs font-extrabold text-primary">
                  {parseFloat(
                    activeConversation.room.price.toString(),
                  ).toLocaleString("vi-VN")}
                  đ/đêm
                </span>
              </div>
            </div>
            <Button
              onClick={() =>
                router.push(`/room/${activeConversation.room?.id}`)
              }
              variant="outline"
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/40 dark:border-white/10 bg-white/50 dark:bg-white/10 py-2 text-xs font-bold text-foreground hover:bg-white/80 dark:hover:bg-white/20 shadow-sm backdrop-blur-md active:scale-95 transition-all cursor-pointer"
            >
              <Home className="h-3.5 w-3.5 text-primary" /> Xem chi tiết
            </Button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      {/* <div className="space-y-3">
        <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
          Hành động nhanh
        </h3>
        <div className="space-y-2">
          {activeConversation.room && isGuest && (
            <button
              onClick={() => router.push(`/room/${activeConversation.room?.id}`)}
              className="w-full flex items-center justify-between rounded-xl bg-primary p-3 text-xs font-extrabold text-white shadow-md shadow-primary/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              <span>Tiến hành đặt phòng</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => toast.success("Đang phát triển tính năng tạo hợp đồng thuê!")}
            className="w-full flex items-center gap-2.5 rounded-xl border border-white/40 dark:border-white/10 bg-white/30 dark:bg-white/5 p-3 text-xs font-semibold text-foreground hover:bg-white/60 dark:hover:bg-white/10 shadow-inner backdrop-blur-sm transition-all cursor-pointer text-left"
          >
            <FileText className="h-4 w-4 text-primary" />
            Tạo yêu cầu thanh toán
          </button>
          <button
            onClick={() => toast.success("Tính năng gửi ưu đãi giá đang cập nhật!")}
            className="w-full flex items-center gap-2.5 rounded-xl border border-white/40 dark:border-white/10 bg-white/30 dark:bg-white/5 p-3 text-xs font-semibold text-foreground hover:bg-white/60 dark:hover:bg-white/10 shadow-inner backdrop-blur-sm transition-all cursor-pointer text-left"
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            Gửi giảm giá đặc biệt
          </button>
        </div>
      </div> */}
    </div>
  );

  return (
    <>
      {/* Desktop: luôn hiện (lg+) */}
      {!drawerOnly && (
        <div className="hidden lg:flex h-full w-60 xl:w-70 shrink-0 flex-col border-l border-white/30 dark:border-white/10 bg-white/20 dark:bg-black/20 backdrop-blur-2xl shadow-[-8px_0_30px_-15px_rgba(0,0,0,0.1)]">
          {panelContent}
        </div>
      )}

      {/* Mobile/Tablet: drawer slide-in từ phải */}
      {open && (
        <div
          className={`${
            drawerOnly ? "absolute" : "fixed lg:hidden"
          } inset-0 z-50 flex`}
        >
          {/* Overlay */}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="w-70 sm:w-[320px] h-full bg-white/40 dark:bg-black/40 backdrop-blur-3xl border-l border-white/30 dark:border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.3)] overflow-hidden animate-in slide-in-from-right duration-300">
            {panelContent}
          </div>
        </div>
      )}
    </>
  );
}
