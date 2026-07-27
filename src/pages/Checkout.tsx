import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Banknote, ChevronRight, Info, Loader2, Lock, Minus, Plus, ShieldCheck, Truck} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { useOrder } from "@/hooks/useOrder";
import type { OrderConfirmationState } from "@/pages/OrderConfirmation";
import type { OrderItem } from "@/types";
import { getApiErrorMessage } from "@/api/types";

const FREE_SHIPPING_THRESHOLD = 3000;
const SHIPPING_FEE = 200;

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required").max(80),
  phone: z.string().trim().regex(/^(?:\+92\s?|0)3\d{9}$/, "Use 03XXXXXXXXX or +92 3XXXXXXXXX"),
  country: z.string().trim().min(2, "Country is required").max(80),
  city: z.string().trim().min(2, "City is required").max(60),
  postalcode: z.string().trim().max(10).optional().or(z.literal("")),
  area: z.string().trim().min(2, "Area / Town is required").max(80),
  address: z.string().trim().min(8, "Please enter a complete address").max(250),
  notes: z.string().trim().max(400).optional().or(z.literal("")),
});

type FormState = z.infer<typeof checkoutSchema>;

const initialForm: FormState = {
  fullName: "",
  phone: "",
  country: "Pakistan",
  city: "",
  postalcode: "",
  area: "",
  address: "",
  notes: "",
};

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartData,
    addToCart,
    removeFromCart,
    clearCart,
    isCreating,
    isDeleting,
  } = useCart();

  const { createOrder, isCreatingOrder: submitting } = useOrder();

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});

  const cartTotal = useMemo(
    () =>
      cartData?.itemsPrice ||
      cartItems.reduce(
        (acc, item) => acc + (item.product?.salePrice || 0) * item.qty,
        0,
      ),
    [cartData, cartItems],
  );
  const cartCount = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.qty, 0),
    [cartItems],
  );

  const isGlobalLoading = submitting || isCreating || isDeleting;

  const shipping = useMemo(
    () =>
      cartTotal >= FREE_SHIPPING_THRESHOLD || cartTotal === 0
        ? 0
        : SHIPPING_FEE,
    [cartTotal],
  );
  const grandTotal = cartTotal + shipping;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleIncrement = async (
    productId: string,
    currentQty: number,
    name: string,
  ) => {
    if (isGlobalLoading) return;
    await addToCart({
      product: productId,
      qty: currentQty + 1,
      productName: name,
      isDirectUpdate: true,
    });
  };

  const handleDecrement = async (
    productId: string,
    currentQty: number,
    name: string,
  ) => {
    if (isGlobalLoading) return;
    if (currentQty <= 1) {
      await removeFromCart(productId, name);
    } else {
      await addToCart({
        product: productId,
        qty: currentQty - 1,
        productName: name,
        isDirectUpdate: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGlobalLoading) return;

    if (cartItems.length === 0) {
      toast.error("Your bag is empty");
      return;
    }

    const result = checkoutSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormState;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      const backendPayload = {
        orderItems: cartItems.map((item) => ({
          name: item.product?.name || "Product",
          qty: item.qty,
          image: item.product?.images?.[0] || "",
          price: item.product?.salePrice || 0,
          product: item.product?._id,
        })),
        customerInfo: {
          fullName: form.fullName,
          phone: form.phone,
          city: form.city,
          postalCode: form.postalcode || "",
          areaTown: form.area,
          address: form.address,
          orderNotes: form.notes || "",
        },
        paymentMethod: "Cash on Delivery",
        itemsPrice: cartTotal,
        shippingPrice: shipping,
        totalPrice: grandTotal,
      };
      const response = await createOrder(backendPayload);
      if (response && response.success) {
        const orderData = response.data;

        const confirmationState: OrderConfirmationState = {
          orderNumber: orderData.orderNumber,
          placedAt: orderData.createdAt || Date.now(),
          customer: {
            fullName: orderData.customerInfo.fullName,
            phone: orderData.customerInfo.phone,
            city: orderData.customerInfo.city,
            area: orderData.customerInfo.areaTown,
            address: orderData.customerInfo.address,
            notes: orderData.customerInfo.orderNotes,
          },
          items: orderData.orderItems.map((item: OrderItem) => ({
            productId: item.product,
            name: item.name,
            price: item.price,
            currency: "PKR",
            image: item.image,
            quantity: item.qty,
          })),
          subtotal: orderData.itemsPrice,
          shipping: orderData.shippingPrice,
          total: orderData.totalPrice,
          paymentMethod: orderData.paymentMethod,
          estimatedDelivery: "3 to 5 business days across Pakistan",
        };

        await clearCart();

        navigate("/order-confirmation", {
          state: confirmationState,
          replace: true,
        });
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      toast.error(getApiErrorMessage(error, "Something went wrong placing your order. Please try again."));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-accent transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">Checkout</span>
          </nav>

          <div className="text-center mb-10 px-4">
            <p className="text-xs tracking-[0.3em] text-accent mb-3 uppercase font-medium">
              Secure Checkout
            </p>
            <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-wide">
              Complete Your Order
            </h1>
            <div className="flex items-start justify-center gap-1.5 max-w-xs md:max-w-md mx-auto text-muted-foreground">
              <Lock className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
              <p className="text-xs md:text-sm text-left sm:text-center leading-relaxed">
                Your information is safe and used only for delivery
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} id="checkout-form">
            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8">
              <div className="space-y-6">
                <section className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl md:text-2xl text-foreground font-medium">
                      Customer Information
                    </h2>
                    <span className="text-[10px] tracking-[0.2em] text-accent font-medium">
                      STEP 1
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label htmlFor="fullName" className="required">
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        autoComplete="name"
                        disabled={isGlobalLoading}
                        value={form.fullName}
                        onChange={(e) => update("fullName", e.target.value)}
                        placeholder="Enter Full Name"
                        className="mt-1.5 h-11 rounded-xl"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone" className="required">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        disabled={isGlobalLoading}
                        value={form.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+92 3XXXXXXXXX"
                        className="mt-1.5 h-11 rounded-xl"
                      />
                      {errors.phone && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="country" className="required">
                        Country
                      </Label>
                      <Input
                        id="country"
                        disabled
                        value={form.country}
                        className="mt-1.5 h-11 bg-muted/50 cursor-not-allowed rounded-xl"
                      />
                    </div>

                    <div>
                      <Label htmlFor="city" className="required">
                        City
                      </Label>
                      <Input
                        id="city"
                        autoComplete="address-level2"
                        disabled={isGlobalLoading}
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        placeholder="Enter City"
                        className="mt-1.5 h-11 rounded-xl"
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="postalcode">Postal Code</Label>
                      <Input
                        id="postalcode"
                        disabled={isGlobalLoading}
                        value={form.postalcode}
                        onChange={(e) => update("postalcode", e.target.value)}
                        placeholder="Postal Code (Optional)"
                        className="mt-1.5 h-11 rounded-xl"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="area" className="required">
                        Area / Town
                      </Label>
                      <Input
                        id="area"
                        disabled={isGlobalLoading}
                        value={form.area}
                        onChange={(e) => update("area", e.target.value)}
                        placeholder="Enter Your Area/Town"
                        className="mt-1.5 h-11 rounded-xl"
                      />
                      {errors.area && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.area}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="address" className="required">
                        Complete Delivery Address
                      </Label>
                      <Textarea
                        id="address"
                        disabled={isGlobalLoading}
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        placeholder="House #, Street, Landmark..."
                        className="mt-1.5 min-h-[90px] rounded-xl"
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive mt-1">
                          {errors.address}
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="notes">
                        Order Notes{" "}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Textarea
                        id="notes"
                        disabled={isGlobalLoading}
                        value={form.notes}
                        onChange={(e) => update("notes", e.target.value)}
                        placeholder="Any special instructions for delivery"
                        className="mt-1.5 min-h-[70px] rounded-xl"
                      />
                    </div>
                  </div>
                </section>

                <section className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl md:text-2xl text-foreground font-medium">
                      Shipping Method
                    </h2>
                    <span className="text-[10px] tracking-[0.2em] text-accent font-medium">
                      STEP 2
                    </span>
                  </div>

                  <div className="border border-accent/40 bg-accent/5 rounded-xl p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-foreground">
                          Standard Delivery
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Estimated delivery: 3–5 business days across Pakistan
                      </p>
                      <p className="text-xs text-accent mt-2 font-medium">
                        Free shipping on orders over PKR{" "}
                        {FREE_SHIPPING_THRESHOLD.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-serif text-xl md:text-2xl text-foreground font-medium">
                      Payment Method
                    </h2>
                    <span className="text-[10px] tracking-[0.2em] text-accent font-medium">
                      STEP 3
                    </span>
                  </div>

                  <div className="flex items-start gap-4 p-5 border-2 border-accent rounded-xl bg-accent/5">
                    <div className="w-11 h-11 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5 text-accent" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 items-start">
                        <p className="font-serif sm:font-sans text-base sm:text-lg font-medium text-foreground leading-tight">
                          Cash on Delivery (COD)
                        </p>

                        <span className="text-[10px] tracking-widest px-2.5 py-0.5 rounded-full bg-[#c2a677]/20 text-[#ffff] border border-[#c2a677]/30 font-bold uppercase shrink-0">
                          RECOMMENDED
                        </span>
                      </div>

                      <p className="text-xs md:text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">
                        Pay in cash when your order arrives at your doorstep.
                      </p>
                      <div className="flex items-start justify-start gap-2 mt-4 text-xs font-semibold text-foreground/90 tracking-wide">
                        <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          100% secure — inspect before payment
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className="lg:sticky lg:top-24 h-fit">
                <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-6 md:p-7 shadow-sm">
                  <h2 className="font-serif text-xl text-foreground mb-4 font-medium">
                    Order Summary
                  </h2>

                  {cartItems.length > 0 && (
                    <div className="mb-5 flex items-start gap-2.5 bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-medium tracking-wide leading-relaxed">
                      <Info className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 text-emerald-500 mt-0.5" />
                      <span>
                        Free delivery on all premium orders above{" "}
                        <strong>PKR 3,000</strong>.
                      </span>
                    </div>
                  )}

                  {cartItems.length === 0 && !submitting ? (
                    <p className="text-sm text-muted-foreground py-6 text-center">
                      Your bag is empty.{" "}
                      <Link to="/" className="text-accent hover:underline">
                        Continue shopping
                      </Link>
                    </p>
                  ) : (
                    <>
                      <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1 scrollbar-premium">
                        {cartItems.map((item) => (
                          <div
                            key={item.product?._id}
                            className="flex gap-4 items-center"
                          >
                            <img
                              src={
                                item.product?.images?.[0] ||
                                "/placeholder-product.webp"
                              }
                              alt={item.product?.name}
                              className="w-16 h-16 object-cover rounded-xl bg-muted border border-border shadow-2xs shrink-0"
                            />
                            <div className="flex flex-col flex-1 min-w-0">
                              <p className="text-sm text-foreground line-clamp-2 font-medium tracking-wide">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 font-medium">
                                PKR{" "}
                                {(
                                  item.product?.salePrice || 0
                                ).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center border border-border rounded-xl h-fit bg-background overflow-hidden shrink-0">
                              <button
                                onClick={() =>
                                  handleDecrement(
                                    item.product?._id,
                                    item.qty,
                                    item.product?.name,
                                  )
                                }
                                className="p-1.5 hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
                                aria-label="Decrease quantity"
                                type="button"
                                disabled={isGlobalLoading}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs w-6 text-center font-semibold font-mono">
                                {item.qty}
                              </span>
                              <button
                                onClick={() =>
                                  handleIncrement(
                                    item.product?._id,
                                    item.qty,
                                    item.product?.name,
                                  )
                                }
                                className="p-1.5 hover:bg-muted transition-colors disabled:opacity-40 cursor-pointer"
                                aria-label="Increase quantity"
                                type="button"
                                disabled={isGlobalLoading}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator className="my-5" />

                      <div className="space-y-2.5 text-sm">
                        <div className="flex justify-between items-center text-muted-foreground">
                          <span>
                            Subtotal ({cartCount}{" "}
                            {cartCount === 1 ? "item" : "items"})
                          </span>
                          <span className="text-foreground font-medium font-mono">
                            PKR {cartTotal}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-muted-foreground">
                          <span className="text-sm">Delivery Charges</span>
                          <span
                            className={`font-mono ${
                              shipping === 0
                                ? "text-emerald-500 dark:text-emerald-400 font-bold text-sm tracking-wider"
                                : "text-foreground font-semibold text-base"
                            }`}
                          >
                            {shipping === 0
                              ? "FREE"
                              : `PKR ${shipping.toLocaleString()}`}
                          </span>
                        </div>
                      </div>

                      <Separator className="my-5" />

                      <div className="flex justify-between items-baseline mb-6">
                        <span className="text-sm tracking-[0.15em] font-semibold text-foreground">
                          TOTAL AMOUNT
                        </span>
                        <span className="text-xl font-bold text-accent font-mono tracking-tight">
                          PKR {grandTotal}
                        </span>
                      </div>

                      <PlaceOrderButton
                        submitting={isGlobalLoading}
                        total={grandTotal}
                        disabled={cartItems.length === 0}
                      />
                    </>
                  )}
                </div>
              </aside>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const PlaceOrderButton = ({
  submitting,
  total,
  disabled,
}: {
  submitting: boolean;
  total: number;
  disabled?: boolean;
}) => (
  <Button
    type="submit"
    disabled={submitting || disabled}
    className="w-full h-13 py-4 text-xs tracking-[0.18em] font-semibold bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg transition-all rounded-xl cursor-pointer uppercase disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {submitting ? (
      <span className="flex items-center gap-2 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> PLACING ORDER...
      </span>
    ) : (
      <span className="flex items-center gap-2 justify-center">
        <Lock className="w-3.5 h-3.5" /> PLACE ORDER • PKR{" "}
        {total.toLocaleString()}
      </span>
    )}
  </Button>
);

export default Checkout;
