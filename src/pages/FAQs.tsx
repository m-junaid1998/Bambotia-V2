import PageShell from "@/components/PageShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Are BAMBOTIA pieces authentic and ethically sourced?",
    a: "Yes. Every piece is crafted in our partner ateliers using ethically sourced materials. Gemstones come with certificates of authenticity on request.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major debit/credit cards, bank transfer, and Cash on Delivery within Pakistan.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship worldwide via DHL Express. Duties and taxes are calculated at checkout where possible.",
  },
  {
    q: "How do I care for my jewellery?",
    a: "Store pieces individually in their pouch, avoid contact with perfumes and water, and gently polish with the included cloth.",
  },
  {
    q: "Can I cancel or modify my order?",
    a: "Orders can be modified or cancelled within 2 hours of placement. After dispatch, please use our return policy.",
  },
  {
    q: "Do you offer custom or bridal pieces?",
    a: "Yes — our bespoke atelier creates one-of-a-kind bridal sets. Email care@bambotia.com to start a consultation.",
  },
];

const FAQs = () => (
  <PageShell
    eyebrow="HELP CENTER"
    title="Frequently Asked Questions"
    subtitle="Quick answers to the things our clients ask most."
    seoTitle="FAQs | BAMBOTIA Help Center"
    seoDescription="Answers to common questions about BAMBOTIA orders, shipping, payment, jewellery care, bespoke pieces and returns."
  >
    <div className="not-prose">
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`item-${i}`} className="border-border">
            <AccordionTrigger className="text-left text-foreground hover:text-accent hover:no-underline">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </PageShell>
);

export default FAQs;