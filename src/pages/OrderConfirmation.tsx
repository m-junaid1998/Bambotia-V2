import { useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  User,
  Banknote,
  Package,
  MessageCircle,
} from "lucide-react";

import { Separator } from "@/components/ui/separator";

export interface OrderConfirmationState {
  orderNumber: string;
  placedAt: string | number;
  customer: {
    fullName: string;
    phone: string;
    city: string;
    area: string;
    address: string;
    notes?: string;
  };
  items: Array<{
    productId: string;
    name: string;
    price: number;
    currency: string;
    image: string;
    quantity: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  estimatedDelivery: string;
}

const OrderConfirmation = () => {
  const location = useLocation();
  const state = location.state as OrderConfirmationState | null;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // CRITICAL FIX: Agar state undefined ya null ho (e.g. direct page refresh),
  // toh crash hone ke bajaye safely homepage ya shop par redirect kardein.
  if (!state) {
    return <Navigate to="/" replace />;
  }

  const {
    orderNumber,
    customer,
    items,
    subtotal,
    shipping,
    total,
    paymentMethod,
    estimatedDelivery,
    placedAt,
  } = state;

  // Safe Date parsing logic
  const formatOrderDate = (dateVal: string | number) => {
    try {
      const parsedDate = typeof dateVal === "string" && !isNaN(Number(dateVal)) ? Number(dateVal) : dateVal;
      return new Date(parsedDate).toLocaleDateString("en-PK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "---";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Success Header Area */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/15 mb-5">
              <CheckCircle2 className="w-10 h-10 text-accent" />
            </div>
            <p className="text-xs tracking-[0.3em] text-accent mb-3 uppercase font-medium">
              Order Confirmed
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-3 tracking-wide">
              Thank you for your order!
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              We&apos;ve received your order and will call shortly to confirm. A
              summary is shown below.
            </p>
          </div>

          {/* Quick Order Overview Info Metadata Panel */}
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 md:p-8 shadow-sm mb-6">
            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1 font-medium">
                  ORDER NUMBER
                </p>
                <p className="font-mono text-lg text-accent font-semibold tracking-wide">
                  {orderNumber}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1 font-medium">
                  ORDER DATE
                </p>
                <p className="text-sm text-foreground font-medium">
                  {placedAt ? formatOrderDate(placedAt) : "---"}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1 font-medium">
                  PAYMENT METHOD
                </p>
                <p className="text-sm text-foreground inline-flex items-center gap-1.5 font-medium">
                  <Banknote className="w-4 h-4 text-accent" /> {paymentMethod || "Cash on Delivery"}
                </p>
              </div>
            </div>
          </div>

          {/* Two-Column Grid Setup Split */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            
            {/* Column Left: Logistics & Shipping Information Panel */}
            <section className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 md:p-8 shadow-sm h-fit">
              <h2 className="font-serif text-xl text-foreground mb-5 inline-flex items-center gap-2 tracking-wide font-medium">
                <Truck className="w-5 h-5 text-accent" /> Delivery Details
              </h2>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3 items-start">
                  <User className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{customer?.fullName || "---"}</span>
                </li>
                <li className="flex gap-3 items-start">
                  <Phone className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground font-mono">{customer?.phone || "---"}</span>
                </li>
                <li className="flex gap-3 items-start">
                  <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-foreground leading-relaxed">
                    {customer?.address || ""}
                    {customer?.area ? `, ${customer.area}` : ""}
                    {customer?.city ? `, ${customer.city}` : ""}
                  </span>
                </li>
                {customer?.notes && (
                  <li className="flex gap-3 items-start bg-muted/40 p-3 rounded-xl border border-border/60 mt-2">
                    <MessageCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground italic text-xs leading-relaxed">
                      &ldquo;{customer.notes}&rdquo;
                    </span>
                  </li>
                )}
              </ul>
              
              <Separator className="my-5" />
              
              <div className="flex items-start gap-3 text-sm">
                <Package className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-foreground font-medium">
                    Estimated Delivery Timeline
                  </p>
                  <p className="text-accent text-xs font-medium mt-0.5">
                    {estimatedDelivery || "3 to 5 business days across Pakistan"}
                  </p>
                </div>
              </div>
            </section>

            {/* Column Right: Interactive Shopping Invoice Summary List */}
            <section className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="font-serif text-xl text-foreground mb-5 tracking-wide font-medium">
                  Order Summary
                </h2>
                <div className="space-y-4 max-h-[260px] overflow-y-auto pr-2 scrollbar-premium">
                  {items && items.length > 0 ? (
                    items.map((item, idx) => (
                      <div key={item.productId || idx} className="flex gap-4 items-center">
                        <img
                          src={item.image || "/placeholder-product.webp"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-xl bg-muted border border-border shrink-0 shadow-2xs"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground line-clamp-2 font-medium tracking-wide">
                            {item.name || "Product"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                            Qty: {item.quantity || 1}
                          </p>
                        </div>
                        <p className="text-sm text-foreground font-semibold whitespace-nowrap ml-2 font-mono">
                          {item.currency || "PKR"}{" "}
                          {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No item details available</p>
                  )}
                </div>
              </div>

              <div>
                <Separator className="my-5" />
                
                {/* Mathematical Price Metadata Metrics Elements Row */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-medium font-mono">
                      PKR {subtotal?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Delivery Charges</span>
                    <span
                      className={
                        shipping === 0
                          ? "text-accent font-semibold text-xs tracking-wider"
                          : "text-foreground font-medium font-mono"
                      }
                    >
                      {shipping === 0 ? "FREE" : `PKR ${shipping.toLocaleString()}`}
                    </span>
                  </div>
                </div>
                
                <Separator className="my-5" />
                
                <div className="flex justify-between items-baseline">
                  <span className="text-sm tracking-[0.15em] font-semibold text-foreground">
                    TOTAL AMOUNT
                  </span>
                  <span className="text-xl font-bold text-accent font-mono tracking-tight">
                    PKR {total?.toLocaleString() || "0"}
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Action Route Navigation CTA Elements */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center h-12 px-10 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 transition-all text-xs font-semibold tracking-widest uppercase shadow-xs cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmation;