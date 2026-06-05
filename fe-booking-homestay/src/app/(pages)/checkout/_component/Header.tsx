import { useLang } from "@/context/lang-context";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Header() {
  const { t } = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const loc = searchParams.get("location") || "";
  const ad = searchParams.get("adults") || "1";
  const ch = searchParams.get("children") || "0";
  const ci = searchParams.get("checkIn") || "";
  const co = searchParams.get("checkOut") || "";

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <button
          onClick={() =>
            router.push(
              `/room/${roomId}?location=${loc}&adults=${ad}&children=${ch}&checkIn=${ci}&checkOut=${co}`,
            )
          }
          className="px-4 flex items-center gap-2 text-gray-900 hover:text-primary cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="elegant-sans text-lg">{t("Back")}</span>
        </button>
      </div>
    </header>
  );
}
