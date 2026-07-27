import { useMemo, useState, useRef } from "react"; 
import { useOrder } from "@/hooks/useOrder";
import { useReactToPrint } from "react-to-print"; 
import {
  Search,
  Filter,
  Eye,
  ShoppingBag,
  Clock,
  Download,
  CheckSquare,
  Activity,
  Truck,
  PackageCheck,
  XCircle,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import PrintInvoice from "../PrintInvoice";
import { Skeleton } from "@/components/ui/skeleton";
import { ORDER_STATUSES, ORDER_STATUS_META } from "@/utils/helper";
import { PaginationPremium } from "@/components/ui/pagination-premium";
import type { Order, OrderItem } from "@/types";

const ITEMS_PER_PAGE = 5;

const fmtDateTime = (dateStr?: string) =>
  dateStr
    ? new Date(dateStr).toLocaleString("en-PK", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

const StatusBadge = ({ status }: { status: string }) => {
  const normalizedStatus = status?.toLowerCase() || "unknown";
  const metaKey = Object.keys(ORDER_STATUS_META).find((k) => k.toLowerCase() === normalizedStatus) || "";
  const meta = ORDER_STATUS_META[metaKey] || {
    label: status || "Unknown",
    uiClass: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] font-semibold uppercase border rounded-full px-2.5 py-1 ${meta.uiClass}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, isLoading }: { icon: typeof ShoppingBag; label: string; value: string | number | undefined; isLoading?: boolean }) => (
  <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-5 shadow-sm">
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-md bg-accent/15 flex items-center justify-center">
        <Icon className="w-4 h-4 text-accent" />
      </div>
    </div>
    <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-1">{label}</p>
    {isLoading ? <Skeleton className="h-8 w-24 mt-1" /> : <p className="font-serif text-2xl text-foreground">{value ?? 0}</p>}
  </div>
);

const AdminOrders = () => {
  const [panelSettings, setPanelSettings] = useState({
    query: "",
    statusFilter: "all",
    dateFilter: "all",
    currentPage: 1,
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  
  const originalTitleRef = useRef<string>(document.title);
  const printComponentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    onAfterPrint: () => {
      setPrintOrder(null);
      document.title = originalTitleRef.current;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setPanelSettings((prev) => ({
      ...prev,
      [key]: value,
      currentPage: 1,
    }));
  };

  const orderFilters = useMemo(() => {
    const { query, statusFilter, dateFilter, currentPage } = panelSettings;
    return {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      pageSize: ITEMS_PER_PAGE,
      isAllRecord: false,
      ...(query.trim() && { search: query.trim() }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(dateFilter !== "all" && { dateRange: dateFilter }),
    };
  }, [panelSettings]);

  const {
    orders = [],
    stats,
    pagination,
    isFetching: isLoading,
    updateOrderStatus,
    refetchDashboard,
  } = useOrder(orderFilters);

  const activeOrder = useMemo(() => orders.find((o: Order) => o._id === activeId) ?? null, [orders, activeId]);

  const totalItems = pagination?.totalCount || stats?.total || orders.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const paginatedOrders = useMemo(() => {
    if (orders.length > ITEMS_PER_PAGE) {
      const startIndex = (panelSettings.currentPage - 1) * ITEMS_PER_PAGE;
      return orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }
    return orders;
  }, [orders, panelSettings.currentPage]);

  const handleStatusChange = async (id: string, nextStatus: string) => {
    try {
      const res = await updateOrderStatus(id, nextStatus);
      if (res?.success) {
         refetchDashboard();
        toast.success(`Order updated to: ${ORDER_STATUS_META[nextStatus]?.label || nextStatus}`);
      }
    } catch {
      toast.error("Status update failed");
    }
  };

  const triggerPrintAction = (order: Order) => {
    const customerName = order.customerInfo?.fullName || "Customer";
    document.title = `${customerName} Invoice`;
    setPrintOrder(order);
    setTimeout(() => {
      handlePrint();
    }, 100);
  };



  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-0">
      <div>
        <p className="text-[10px] tracking-[0.4em] text-accent mb-2">FULFILLMENT</p>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground">Orders</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="TOTAL ORDERS" value={stats?.total} isLoading={isLoading} />
        <StatCard icon={Clock} label="PENDING" value={stats?.pending} isLoading={isLoading} />
        <StatCard icon={CheckSquare} label="CONFIRMED" value={stats?.confirmed} isLoading={isLoading} />
        <StatCard icon={Activity} label="PROCESSING" value={stats?.processing} isLoading={isLoading} />
        <StatCard icon={Truck} label="SHIPPED" value={stats?.shipped} isLoading={isLoading} />
        <StatCard icon={PackageCheck} label="DELIVERED" value={stats?.delivered} isLoading={isLoading} />
        <StatCard icon={XCircle} label="CANCELLED" value={stats?.cancelled} isLoading={isLoading} />
        <StatCard icon={DollarSign} label="REVENUE" value={stats?.revenue ? `PKR ${stats.revenue.toLocaleString()}` : "PKR 0"} isLoading={isLoading} />
      </div>

      <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search order #, name, phone..."
            className="pl-9 h-11 placeholder:text-xs sm:placeholder:text-sm"
            value={panelSettings.query}
            onChange={(e) => handleFilterChange("query", e.target.value)}
          />
        </div>

        <Select value={panelSettings.dateFilter} onValueChange={(val) => handleFilterChange("dateFilter", val)}>
          <SelectTrigger className="h-11 md:w-44 bg-background">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="All dates" />
          </SelectTrigger>
          <SelectContent>
            {["all", "today", "7days", "30days"].map((v) => (
              <SelectItem key={v} value={v}>
                {v === "all" ? "All dates" : v === "7days" ? "Last 7 Days" : v === "30days" ? "Last 30 Days" : "Today"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={panelSettings.statusFilter} onValueChange={(val) => handleFilterChange("statusFilter", val)}>
          <SelectTrigger className="h-11 md:w-44 bg-background">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {ORDER_STATUS_META[s]?.label || s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-background/90 border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-[10px] tracking-[0.2em] text-muted-foreground select-none">
                {["ORDER", "CUSTOMER", "PHONE NUMBER", "ITEMS", "TOTAL", "STATUS", "ACTIONS"].map((h) => (
                  <th key={h} className={`px-4 py-4 font-medium ${h === "ACTIONS" ? "text-center" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [...Array(ITEMS_PER_PAGE)].map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="border-t border-border/60">
                    <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-4 py-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-4 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-4 py-4 flex justify-center gap-2">
                      <Skeleton className="h-9 w-9 rounded-full" /><Skeleton className="h-9 w-9 rounded-full" />
                    </td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-sm text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 justify-center max-w-sm mx-auto">
                      <AlertCircle className="h-6 w-6 text-muted-foreground/60" />
                      <p className="font-medium mt-1">No matching system records found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o: Order) => (
                  <tr key={o._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <button onClick={() => setActiveId(o._id)} className="font-mono text-xs font-semibold text-accent hover:underline focus:outline-none">
                        {o.orderNumber || String(o._id).substring(0, 8).toUpperCase()}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{o.customerInfo?.fullName || "Guest Account"}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{o.customerInfo?.phone || "N/A"}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {(o.orderItems || []).reduce((s: number, i: OrderItem) => s + (i.qty || 0), 0)}
                    </td>
                    <td className="px-4 py-3 text-foreground font-semibold">PKR {(o.totalPrice || 0).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 rounded-full border-border/60 hover:bg-muted"
                          onClick={() => triggerPrintAction(o)}
                          title="Download/Print Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-border/60 hover:bg-muted" onClick={() => setActiveId(o._id)} title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalItems > 0 && (
          <div className="bg-background border-t border-border/40">
            <PaginationPremium
              currentPage={panelSettings.currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setPanelSettings((prev) => ({ ...prev, currentPage: page }))}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

    
        {printOrder && (
          <div ref={printComponentRef}>
            <PrintInvoice
              orderNumber={printOrder.orderNumber || printOrder._id.substring(0, 8).toUpperCase()}
              customer={{
                fullName: printOrder.customerInfo?.fullName || "Customer",
                phone: printOrder.customerInfo?.phone || "N/A",
                address: printOrder.customerInfo?.address || "",
                areaTown: printOrder.customerInfo?.areaTown || "",
                city: printOrder.customerInfo?.city || "",
              }}
              items={(printOrder.orderItems || []).map((i: OrderItem) => ({
                productId: i.product || i.productId || "",
                name: i.name,
                image: i.image,
                quantity: i.qty,
                price: i.price,
              }))}
              subtotal={printOrder.itemsPrice}
              shipping={printOrder.shippingPrice}
              total={printOrder.totalPrice}
              paymentMethod={printOrder.paymentMethod || "Cash on Delivery"}
              placedAt={printOrder.createdAt}
              status={printOrder.status}
            />
          </div>
        )}


      <Sheet open={!!activeId} onOpenChange={(open) => !open && setActiveId(null)}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto scrollbar-premium bg-background text-foreground">
          {activeOrder && (
            <>
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl">
                  Order {activeOrder.orderNumber || activeOrder._id.substring(0, 8).toUpperCase()}
                </SheetTitle>
                <SheetDescription>Placed {fmtDateTime(activeOrder.createdAt)}</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between gap-3 bg-muted/20 p-3 rounded-xl border border-border/40">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase">Current Status</span>
                    <StatusBadge status={activeOrder.status} />
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-[9px] font-bold text-muted-foreground tracking-wider uppercase mb-1">Update Pipeline</span>
                    <Select
                      value={ORDER_STATUSES.find(s => s.toLowerCase() === activeOrder.status?.toLowerCase()) || activeOrder.status}
                      onValueChange={(val) => handleStatusChange(activeOrder._id, val)}
                    >
                      <SelectTrigger className="h-9 w-44 bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {ORDER_STATUS_META[s]?.label || s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-muted/20 border border-border rounded-xl p-4">
                  <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-2">DELIVERY DETAILS</p>
                  <p className="text-foreground font-semibold">{activeOrder.customerInfo?.fullName || "Guest Account"}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Phone: {activeOrder.customerInfo?.phone || "N/A"}</p>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {activeOrder.customerInfo?.address || "N/A"},{" "}
                    {activeOrder.customerInfo?.areaTown ? `${activeOrder.customerInfo.areaTown}, ` : ""}
                    {activeOrder.customerInfo?.city || ""}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] tracking-[0.3em] text-muted-foreground mb-3">ITEMS LOG</p>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {(activeOrder.orderItems || []).map((i: OrderItem, idx: number) => (
                      <div key={idx} className="flex gap-3 items-center border-b border-border/40 pb-3 last:border-0 last:pb-0">
                        <img src={i.image} alt={i.name} className="w-14 h-14 object-cover rounded-md border shrink-0 bg-muted" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">{i.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Qty {i.qty} &times; PKR {i.price.toLocaleString()}</p>
                        </div>
                        <p className="text-sm font-semibold text-foreground shrink-0">PKR {(i.price * i.qty).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />
                <div className="space-y-2 text-sm bg-muted/10 p-4 rounded-xl border border-border/40">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">PKR {(activeOrder.itemsPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    {activeOrder.shippingPrice ? (
                      <span className="font-medium">PKR {activeOrder.shippingPrice.toLocaleString()}</span>
                    ) : (
                      <span className="text-emerald-600 font-bold text-xs tracking-wider border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-md">FREE</span>
                    )}
                  </div>
                  <div className="flex justify-between font-bold pt-3 border-t border-border/60 mt-2 text-base">
                    <span>Grand Total</span>
                    <span className="text-accent">PKR {(activeOrder.totalPrice || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AdminOrders;
