"use client";

const QUICK_TEMPLATES_HOST = [
  "Dạ phòng bên em vẫn còn trống vào ngày anh/chị cần ạ!",
  "Thời gian check-in là 14:00 và check-out trước 12:00 ạ.",
  "Anh/chị vui lòng đặt phòng trực tiếp trên 4Stay nhé!",
];

const QUICK_TEMPLATES_GUEST = [
  "Phòng có gần trung tâm hoặc điểm du lịch không ạ?",
  "Homestay có khu vực BBQ không ạ?",
  "4 người lớn 1 trẻ em thì có phụ thu không bạn?",
  "Check-in sớm hoặc check-out muộn tính phí thế nào ạ?",
];

interface Props {
  isHost: boolean;
  onSelect: (template: string) => void;
}

export default function QuickTemplates({ isHost, onSelect }: Props) {
  const templates = isHost ? QUICK_TEMPLATES_HOST : QUICK_TEMPLATES_GUEST;

  return (
    <div className="flex gap-2 overflow-x-auto p-1 beautiful-scrollbar">
      {templates.map((tpl, i) => (
        <button
          key={i}
          onClick={() => onSelect(tpl)}
          className="whitespace-nowrap flex items-center gap-1.5 rounded-full
            border border-slate-200/80 bg-white/70
            px-4 py-2 text-xs font-semibold text-muted-foreground
            transition-all duration-300 ease-out
            hover:-translate-y-0.5 
            hover:border-primary/50 hover:bg-primary/5 hover:text-primary
            hover:shadow-[0_4px_12px_rgba(17,84,160,0.06)]
            active:scale-95
            disabled:pointer-events-none
            disabled:opacity-30
            cursor-pointer
            animate-in fade-in slide-in-from-bottom-2"
        >
          {tpl.length > 36 ? tpl.slice(0, 36) + "…" : tpl}
        </button>
      ))}
    </div>
  );
}
