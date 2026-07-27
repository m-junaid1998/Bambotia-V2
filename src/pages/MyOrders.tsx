import { useOrder } from "@/hooks/useOrder";
import { ShoppingBag, Calendar, Loader2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Order, OrderItem } from "@/types";

const getStatusStyles = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "confirmed":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "processing":
      return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
    case "shipped":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "delivered":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "cancelled":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

const MyOrders = () => {
  const navigate = useNavigate();
  const { myOrders, isFetchingMyOrders } = useOrder();

  if (isFetchingMyOrders) {
    return (
      <div className="w-full min-h-screen bg-[#0B1512] flex flex-col items-center justify-center text-[#E2E8F0]">
        <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin mb-2" />
        <p className="text-xs tracking-widest text-muted-foreground uppercase">
          Loading your orders...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0B1512] text-[#E2E8F0] px-4 pt-24 pb-16 sm:px-6 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1F3A30]/40 pb-6">
          <div>
            <span className="text-[10px] tracking-[0.3em] text-[#C5A880] uppercase font-semibold">
              Dashboard
            </span>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground tracking-wide mt-1">
              My Orders
            </h1>
          </div>
          <div className="bg-[#0F1E19] border border-[#1F3A30]/40 rounded-sm px-4 py-2 text-xs sm:text-base text-muted-foreground">
            Total Purchase Logs:{" "}
            <span className="text-[#C5A880] font-mono font-bold ml-1">
              {myOrders?.length || 0}
            </span>
          </div>
        </div>

        {!myOrders || myOrders.length === 0 ? (
          <div className="text-center py-16 bg-[#0F1E19]/40 border border-[#1F3A30]/20 rounded-sm space-y-5">
            <div className="w-16 h-16 rounded-full bg-[#132620] border border-[#1F3A30]/40 flex items-center justify-center mx-auto text-muted-foreground">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading font-bold text-lg text-foreground tracking-wide">
                No Orders Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                You haven't placed any exclusive orders yet. Discover our
                premium collections now.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-[#C5A880] text-[#0B1512] text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#D4BC9C] transition-all shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {myOrders.map((order: Order) => (
              <div
                key={order._id}
                className="bg-[#0F1E19]/80 backdrop-blur-md border border-[#1F3A30]/40 rounded-sm p-4 sm:p-6 shadow-xl transition-all duration-300 hover:border-[#1F3A30]"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1F3A30]/30 pb-4">
                  <div className="space-y-1 text-xs sm:text-base">
                    <p className="flex items-center gap-2  text-muted-foreground">
                      <span className="uppercase tracking-widest">
                        Order ID
                      </span>

                      <span className="text-gray-100  font-mono font-bold tracking-wider bg-destructive px-1 py-0.5  rounded-xl">
                        {order.orderNumber}
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5  text-[#C5A880]/90">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          dateStyle: "full",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full border ${getStatusStyles(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-[#1F3A30]/20 my-4">
                  {order.orderItems?.map((item: OrderItem) => (
                    <div
                      key={item._id}
                      className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0 group"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-sm overflow-hidden bg-black/20 border border-[#1F3A30]/20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-base font-medium text-foreground tracking-wide ">
                          {item.name}
                        </h4>
                        <p className="text-xs sm:text-base text-muted-foreground mt-1">
                          Qty:{" "}
                          <span className="text-foreground font-mono font-medium">
                            {item.qty}
                          </span>
                        </p>
                        <p className="text-xs sm:text-base text-muted-foreground mt-1">
                          Price:{" "}
                          <span className="text-[#C5A880] font-mono">
                            PKR {item.price.toLocaleString()}
                          </span>
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs sm:text-base font-semibold font-mono text-foreground">
                          PKR {(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4 pt-4 border-t border-[#1F3A30]/30 bg-[#132620]/20 -mx-4 -mb-4 p-4 sm:-mx-6 sm:-mb-6 rounded-b-sm">
             
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-base text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                      <span className="truncate max-w-[280px] sm:max-w-none text-foreground">
                        {order.customerInfo?.address},{" "}
                        {order.customerInfo?.city}
                      </span>
                    </div>
                  </div>

                  {order.customerInfo?.orderNotes && (
                    <p className="text-[12px] sm:text-base text-amber-400/80 italic pl-4 -mt-2">
                      Note: "{order.customerInfo.orderNotes}"
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-3 border-t border-[#1F3A30]/10 w-full">
               
                    <div className="flex items-center gap-2 bg-[#0B1512]/50 px-3 py-1.5 rounded-sm border border-[#1F3A30]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] tracking-wider uppercase text-foreground/80 font-medium">
                       Cash On Delivery
                      </span>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2 sm:text-right w-full sm:w-auto min-w-[260px]">
                  
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full">
                        <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase font-bold">
                          Delivery Charges
                        </p>
                        <div className="flex items-center gap-1.5 min-w-[100px] justify-end">
                          <span className="text-base sm:text-lg font-black font-mono tracking-tight">
                            {order?.shippingPrice === 0 ? (
                              <span className="text-emerald-400 tracking-[0.10em]  uppercase">
                                Free
                              </span>
                            ) : (
                              <span className="text-[#E2E8F0]">
                                PKR {order?.shippingPrice?.toLocaleString()}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-1 border-t border-[#1F3A30]/10 w-full">
                        <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase font-bold">
                          Net Total
                        </p>
                        <div className="flex items-center gap-1.5 min-w-[100px] justify-end">
                          <span className="text-base sm:text-lg font-black font-mono text-[#C5A880] tracking-tight">
                            PKR {order?.totalPrice?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
