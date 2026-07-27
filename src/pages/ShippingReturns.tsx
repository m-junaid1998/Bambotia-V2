import PageShell from "@/components/PageShell";

const ShippingReturns = () => (
  <PageShell
    eyebrow="LOGISTICS"
    title="Shipping & Returns"
    subtitle="Everything you need to know about delivery and our return policy."
    seoTitle="Shipping & Returns | BAMBOTIA"
    seoDescription="BAMBOTIA shipping & returns: 2–4 day Pakistan delivery."
  >
    <h2>Shipping</h2>
    <ul>
      <li><strong>Within Pakistan:</strong> 2–4 business days. Free over PKR 10,000.</li>
      <li>Orders are dispatched within 24 hours of confirmation.</li>
      <li>You'll receive a tracking link by email as soon as your order ships.</li>
    </ul>
    <h2>Returns</h2>
    <ul>
      <li>Eligible for return within <strong>14 days</strong> of delivery.</li>
      <li>Items must be unused, in original packaging with all tags attached.</li>
      <li>Cosmetics and pierced jewellery are non-returnable for hygiene reasons.</li>
      <li>Refunds are processed within 5–7 business days of receipt.</li>
    </ul>
    <h2>Exchanges</h2>
    <p>
      To exchange a piece, please email <a href="mailto:bambotiia@gmail.com">bambotiia@gmail.com</a>{" "}
      with your order number and the item you'd like instead. Our team will guide you through the rest.
    </p>
  </PageShell>
);

export default ShippingReturns;