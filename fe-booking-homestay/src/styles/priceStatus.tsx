import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { PriceStatus } from "../types/priceStatus";

export const PRICE_STATUS_CONFIG: Record<
  PriceStatus,
  {
    color: string;
    Icon?: React.ComponentType<{ className?: string }>;
  }
> = {
  low: {
    color: "text-green-600",
    Icon: ArrowDown,
  },
  high: {
    color: "text-red-500",
    Icon: ArrowUp,
  },
  normal: {
    color: "text-muted-foreground",
  },
};