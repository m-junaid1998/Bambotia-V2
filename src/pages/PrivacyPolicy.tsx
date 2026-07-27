import PageShell from "@/components/PageShell";

const PrivacyPolicy = () => (
  <PageShell
    eyebrow="LEGAL"
    title="Privacy Policy"
    subtitle="Last updated: May 2026"
    seoTitle="Privacy Policy | BAMBOTIA"
    seoDescription="How BAMBOTIA collects, uses and protects your personal information. Your data, your rights, our commitments."
  >
    <p>
      BAMBOTIA ("we", "us") respects your privacy. This policy explains what
      personal information we collect, how we use it, and the choices you have.
    </p>
    <h2>Information We Collect</h2>
    <ul>
      <li>Contact details you provide (name, email, phone, address).</li>
      <li>Order and payment information necessary to fulfil purchases.</li>
      <li>Usage data such as pages visited, collected via cookies.</li>
    </ul>
    <h2>How We Use Your Information</h2>
    <ul>
      <li>To process orders, payments, and shipping.</li>
      <li>To provide customer support and respond to inquiries.</li>
    </ul>
    <h2>Data Sharing</h2>
    <p>
      We never sell your data. We share it only with trusted partners required
      to fulfil your order (couriers, payment processors) under strict
      confidentiality.
    </p>
    <h2>Your Rights</h2>
    <p>
      You may request access, correction, or deletion of your data at any time
      by emailing <a href="mailto:bambotiia@gmail.com">bambotiia@gmail.com</a>.
    </p>
  </PageShell>
);

export default PrivacyPolicy;