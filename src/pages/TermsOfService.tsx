import PageShell from "@/components/PageShell";

const TermsOfService = () => (
  <PageShell
    eyebrow="LEGAL"
    title="Terms of Service"
    subtitle="Last updated: May 2026"
    seoTitle="Terms of Service | BAMBOTIA"
    seoDescription="The terms governing your use of bambotia.com — orders, pricing, intellectual property and liability."
  >
    <p>
      By accessing or using bambotia.com, you agree to be bound by these terms.
      Please read them carefully.
    </p>
    <h2>Use of Site</h2>
    <p>
      You agree to use this site only for lawful purposes. You may not use it in
      any way that could damage, disable, or impair the site, or interfere with
      any other party's use.
    </p>
    <h2>Orders & Pricing</h2>
    <ul>
      <li>All prices are in PKR and inclusive of applicable taxes unless stated otherwise.</li>
      <li>We reserve the right to refuse or cancel any order at our discretion.</li>
      <li>Promotional codes cannot be combined and may be withdrawn at any time.</li>
    </ul>
    <h2>Intellectual Property</h2>
    <p>
      All content on this site — including imagery, text, and product designs —
      is the property of BAMBOTIA and may not be reproduced without written
      permission.
    </p>
    <h2>Liability</h2>
    <p>
      BAMBOTIA shall not be liable for any indirect or consequential loss
      arising from the use of this site or its products.
    </p>
    <h2>Contact</h2>
    <p>
      Questions about these terms? Email{" "}
      <a href="mailto:bambotiia@gmail.com">bambotiia@gmail.com</a>.
    </p>
  </PageShell>
);

export default TermsOfService;