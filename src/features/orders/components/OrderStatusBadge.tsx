import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/features/orders/order-status";
import type { OrderStatus } from "@/lib/types";

const VARIANTS: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  PENDING: "secondary",
  PAID: "default",
  SHIPPED: "outline",
  DELIVERED: "default",
  CANCELLED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}
